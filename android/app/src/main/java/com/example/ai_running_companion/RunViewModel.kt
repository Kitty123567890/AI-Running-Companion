package com.example.ai_running_companion

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.location.Location
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.content.SharedPreferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ai_running_companion.LocationUtils.Point
import com.google.android.gms.location.*
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.android.gms.maps.model.LatLng
import android.os.Bundle
import android.speech.RecognitionListener
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.math.floor
import kotlin.math.roundToInt
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

enum class RunMode { Free, Dest }

data class ChatMsg(val role: String, val text: String)

data class RunUiState(
  val running: Boolean = false,
  val voiceEnabled: Boolean = true,
  val useLLM: Boolean = false,
  val apiBase: String = "",
  val apiKey: String = "",
  val model: String = "gpt-4o-mini",
  val mode: RunMode = RunMode.Free,
  val destInput: String = "",
  val gender: String = "",
  val age: String = "",
  val totalDistanceKm: Double = 0.0,
  val instPaceLabel: String = "-",
  val avgPaceLabel: String = "-",
  val elapsedLabel: String = "-",
  val toDestKm: Double? = null,
  val current: LatLng? = null,
  val lastLatLng: String? = null,
  val destLatLng: LatLng? = null,
  val track: List<LatLng> = emptyList(),
  val routePlan: List<LatLng> = emptyList(),
  val messages: List<ChatMsg> = emptyList(),
  val inputText: String = "",
  val recognizing: Boolean = false,
  // Energy system
  val energyPercent: Int = 100,
  val energyName: String = "元气爆棚",
  // Check-in
  val checkinStatus: String = "",
  val checkinDoneToday: Boolean = false
)

class RunViewModel : ViewModel() {
  private val _state = MutableStateFlow(RunUiState())
  val state = _state.asStateFlow()

  var voiceEnabled: Boolean = true
    private set

  private var fused: FusedLocationProviderClient? = null
  private var callback: LocationCallback? = null
  private var startTime: Long? = null
  private var lastKmSpoken: Int = 0
  private var lastKmAtTime: Long? = null
  private var lastKmAtDist: Double = 0.0
  private val points = mutableListOf<Point>()

  private var speechRecognizer: SpeechRecognizer? = null

  // Energy + periodic coaching
  private val energy = EnergySystem()
  private var tickerJob: Job? = null
  private var lastCoachAt: Long = 0L
  private var lastInstPaceMinPerKm: Double? = null
  private var lastEnergyUpdateAt: Long = System.currentTimeMillis()

  // Check-ins
  @Serializable
  data class Checkin(val date: String, val distanceKm: Double? = null, val durationMin: Int? = null, val note: String? = null)
  private val json = Json { ignoreUnknownKeys = true }
  private fun prefs(context: Context): SharedPreferences = context.getSharedPreferences("ai_rc_prefs", Context.MODE_PRIVATE)
  private fun fmtDateKey(ts: Long = System.currentTimeMillis()): String {
    val c = java.util.Calendar.getInstance().apply { timeInMillis = ts }
    val y = c.get(java.util.Calendar.YEAR)
    val m = (c.get(java.util.Calendar.MONTH) + 1).toString().padStart(2, '0')
    val d = c.get(java.util.Calendar.DAY_OF_MONTH).toString().padStart(2, '0')
    return "$y-$m-$d"
  }
  private fun loadCheckins(context: Context): MutableList<Checkin> {
    val s = prefs(context).getString("checkins", null) ?: return mutableListOf()
    return try { json.decodeFromString<List<Checkin>>(s).toMutableList() } catch (_: Exception) { mutableListOf() }
  }
  private fun saveCheckins(context: Context, arr: List<Checkin>) {
    prefs(context).edit().putString("checkins", json.encodeToString(arr)).apply()
  }
  private fun calcStreak(arr: List<Checkin>): Int {
    val set = arr.map { it.date }.toSet()
    var streak = 0
    var cal = java.util.Calendar.getInstance()
    while (set.contains(fmtDateKey(cal.timeInMillis))) {
      streak++
      cal.add(java.util.Calendar.DAY_OF_MONTH, -1)
    }
    return streak
  }
  fun refreshCheckinUi(context: Context) {
    val arr = loadCheckins(context)
    val total = arr.size
    val streak = calcStreak(arr)
    val today = fmtDateKey()
    val doneToday = arr.any { it.date == today }
    val status = if (doneToday) "已打卡｜连续 ${streak} 天｜累计 ${total} 次" else "未打卡｜连续 ${streak} 天｜累计 ${total} 次"
    _state.value = _state.value.copy(checkinStatus = status, checkinDoneToday = doneToday)
  }
  fun doCheckin(context: Context, note: String? = null, speak: (String)->Unit) {
    val arr = loadCheckins(context)
    val today = fmtDateKey()
    if (arr.none { it.date == today }) {
      val durationMin = startTime?.let { (((System.currentTimeMillis() - it) / 1000) / 60).toInt() } ?: 0
      arr.add(Checkin(today, _state.value.totalDistanceKm, durationMin, note))
      saveCheckins(context, arr)
      refreshCheckinUi(context)
      val msg = "已完成今日打卡，继续加油！"
      addMsg("assistant", msg)
      if (voiceEnabled) speak(msg)
    }
  }

  fun setVoiceEnabled(v: Boolean) { voiceEnabled = v; _state.value = _state.value.copy(voiceEnabled = v) }
  fun setUseLLM(v: Boolean) { _state.value = _state.value.copy(useLLM = v) }
  fun setApiBase(v: String) { _state.value = _state.value.copy(apiBase = v) }
  fun setApiKey(v: String) { _state.value = _state.value.copy(apiKey = v) }
  fun setModel(v: String) { _state.value = _state.value.copy(model = v) }
  fun setMode(m: RunMode) { _state.value = _state.value.copy(mode = m) }
  fun setDestInput(s: String) { _state.value = _state.value.copy(destInput = s) }
  fun setGender(s: String) { _state.value = _state.value.copy(gender = s) }
  fun setAge(s: String) { _state.value = _state.value.copy(age = s) }
  fun setInputText(s: String) { _state.value = _state.value.copy(inputText = s) }

  fun clear() {
    points.clear()
    startTime = null
    lastKmSpoken = 0
    lastKmAtTime = null
    lastKmAtDist = 0.0
    lastInstPaceMinPerKm = null
    energy.reset()
    tickerJob?.cancel(); tickerJob = null
    _state.value = _state.value.copy(
      running = false, totalDistanceKm = 0.0, instPaceLabel = "-", avgPaceLabel = "-", elapsedLabel = "-",
      track = emptyList(), routePlan = emptyList(),
      energyPercent = energy.getEnergy(), energyName = energy.getStatus().name
    )
  }

  fun clearChat() { _state.value = _state.value.copy(messages = emptyList()) }

  private fun fmtPace(minPerKm: Double?): String {
    if (minPerKm == null || minPerKm <= 0) return "-"
    val m = floor(minPerKm).toInt(); val s = ((minPerKm - m) * 60).roundToInt()
    return "${m}分${s.toString().padStart(2, '0')}秒/公里"
  }
  private fun fmtTime(sec: Long): String {
    if (sec < 0) return "-"
    val h = sec / 3600; val m = (sec % 3600) / 60; val s = sec % 60
    return if (h > 0) "$h:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}" else "$m:${s.toString().padStart(2,'0')}"
  }

  @SuppressLint("MissingPermission")
  fun start(context: Context, speak: (String)->Unit) {
    if (_state.value.running) return
    fused = LocationServices.getFusedLocationProviderClient(context)
    callback = object : LocationCallback() {
      override fun onLocationResult(result: LocationResult) {
        for (loc in result.locations) handleLocation(loc, speak)
      }
    }
    val req = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 2000L).setMinUpdateIntervalMillis(1000L).build()
    fused?.requestLocationUpdates(req, callback!!, context.mainLooper)
    startTime = System.currentTimeMillis()
    lastKmSpoken = 0
    lastKmAtTime = startTime
    lastKmAtDist = 0.0
    lastEnergyUpdateAt = System.currentTimeMillis()
    _state.value = _state.value.copy(running = true)
    addMsg("assistant", "已开始跑步。定位初始化中……")
    if (voiceEnabled) speak("已开始跑步，定位初始化中")

    // Start periodic energy updates and realtime coaching every 2s/30s
    tickerJob?.cancel()
    tickerJob = viewModelScope.launch {
      while (_state.value.running) {
        delay(2000)
        updateEnergyTick()
        maybeCoachRealtime(speak)
      }
    }
  }

  fun stop(speak: (String)->Unit) {
    fused?.removeLocationUpdates(callback!!)
    _state.value = _state.value.copy(running = false)
    tickerJob?.cancel(); tickerJob = null
    val el = (System.currentTimeMillis() - (startTime ?: System.currentTimeMillis())) / 1000
    // Simple finish tip using Coach
    val tips = Coach.analyze(
      Coach.RunSummary(
        age = _state.value.age.toIntOrNull(),
        avgHr = null,
        distanceKm = _state.value.totalDistanceKm,
        durationMin = el.toDouble() / 60.0,
        avgPaceMinPerKm = null
      )
    )
    tips.firstOrNull()?.let { addMsg("assistant", "本次结束。$it"); if (voiceEnabled) speak(it) }
  }

  private fun addMsg(role: String, text: String) { _state.value = _state.value.copy(messages = _state.value.messages + ChatMsg(role, text)) }

  private fun handleLocation(loc: Location, speak: (String)->Unit) {
    val p = Point(loc.latitude, loc.longitude, System.currentTimeMillis())
    val prev = points.lastOrNull()
    points += p
    var total = _state.value.totalDistanceKm
    if (prev != null) total += LocationUtils.haversineKm(prev, p)
    val elapsedSec = ((System.currentTimeMillis() - (startTime ?: System.currentTimeMillis())) / 1000).coerceAtLeast(0)
    val instPace = when {
      loc.hasSpeed() && loc.speed > 0 -> (1000.0 / loc.speed) / 60.0
      prev != null -> {
        val dt = (p.ts - prev.ts) / 1000.0; val dk = LocationUtils.haversineKm(prev, p)
        if (dt > 0 && dk > 0) (dt / 60.0) / dk else null
      }
      else -> null
    }
    lastInstPaceMinPerKm = instPace
    val avgPace = if (total > 0) (elapsedSec / 60.0) / total else null
    val last = LatLng(p.lat, p.lng)
    val toDest = _state.value.destLatLng?.let { d ->
      val a = Point(last.latitude, last.longitude, p.ts); val b = Point(d.latitude, d.longitude, p.ts)
      LocationUtils.haversineKm(a, b)
    }
    _state.value = _state.value.copy(
      totalDistanceKm = total,
      instPaceLabel = fmtPace(instPace),
      avgPaceLabel = fmtPace(avgPace),
      elapsedLabel = fmtTime(elapsedSec),
      toDestKm = toDest,
      current = last,
      lastLatLng = "${"%.5f".format(last.latitude)}, ${"%.5f".format(last.longitude)}",
      track = _state.value.track + last
    )

    maybePlanRoute()
    maybeAnnounceKilometer(instPace, speak)
    // also refresh energy on location update
    updateEnergyTick()
  }

  private fun maybeAnnounceKilometer(lapPace: Double?, speak: (String)->Unit) {
    val kmDone = _state.value.totalDistanceKm.toInt()
    if (kmDone > lastKmSpoken && kmDone >= 1) {
      val now = System.currentTimeMillis()
      val deltaMin = ((now - (lastKmAtTime ?: now)) / 60000.0)
      val deltaDist = (_state.value.totalDistanceKm - lastKmAtDist).coerceAtLeast(0.0)
      val pace = if (deltaDist > 0.2) (deltaMin / deltaDist) else lapPace
      val label = fmtPace(pace)
      val msg = "已完成第 ${kmDone} 公里，保持！该公里配速 $label。"
      addMsg("assistant", msg)
      if (voiceEnabled) speak(msg)
      lastKmSpoken = kmDone
      lastKmAtTime = now
      lastKmAtDist = _state.value.totalDistanceKm
    }
  }

  fun toggleMic(context: Context) {
    if (!SpeechRecognizer.isRecognitionAvailable(context)) return
    if (_state.value.recognizing) {
      speechRecognizer?.stopListening()
      _state.value = _state.value.copy(recognizing = false)
    } else {
      if (speechRecognizer == null) speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
      val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, "zh-CN")
      }
      _state.value = _state.value.copy(recognizing = true)
      speechRecognizer?.setRecognitionListener(SimpleRecognitionListener(onFinal = { text ->
        _state.value = _state.value.copy(recognizing = false, inputText = text)
      }))
      speechRecognizer?.startListening(intent)
    }
  }

  fun setDestination(lat: Double, lng: Double, label: String?) {
    _state.value = _state.value.copy(destLatLng = LatLng(lat, lng))
    maybePlanRoute()
    addMsg("assistant", "已设置目的地：${label ?: "目的地"}")
  }

  fun maybePlanRoute() {
    val cur = _state.value.current ?: return
    val dest = _state.value.destLatLng ?: return
    viewModelScope.launch {
      val coords = NetClients.planFootRoute(cur.latitude, cur.longitude, dest.latitude, dest.longitude)
      val pts = coords?.map { LatLng(it.first, it.second) } ?: emptyList()
      _state.value = _state.value.copy(routePlan = pts)
    }
  }

  fun parseDestInput(): Triple<String, Double, Double>? {
    val t = _state.value.destInput.trim()
    if (t.isBlank()) return null
    val regex = Regex("^\\s*(-?\\d+(?:\\.\\d+)?)\\s*,\\s*(-?\\d+(?:\\.\\d+)?)\\s*$")
    val m = regex.find(t)
    if (m != null) {
      val lat = m.groupValues[1].toDouble(); val lng = m.groupValues[2].toDouble()
      return Triple("$lat,$lng", lat, lng)
    }
    return null
  }

  fun searchDestination() {
    viewModelScope.launch {
      parseDestInput()?.let { (label, lat, lng) -> setDestination(lat, lng, label); return@launch }
      val r = NetClients.geocodePlace(_state.value.destInput) ?: return@launch
      setDestination(r.second, r.third, r.first)
    }
  }

  suspend fun sendMessage(speak: (String)->Unit) {
    val text = _state.value.inputText.trim()
    if (text.isBlank()) return
    addMsg("user", text)
    _state.value = _state.value.copy(inputText = "")
    // Local coach
    val avgPaceVal: Double? = null // kept simple
    val tips = Coach.analyze(
      Coach.RunSummary(
        age = _state.value.age.toIntOrNull(),
        avgHr = null,
        distanceKm = _state.value.totalDistanceKm.takeIf { it > 0 },
        durationMin = null,
        avgPaceMinPerKm = avgPaceVal
      )
    )
    var reply = if (tips.isNotEmpty()) tips.first() else "告诉我你的距离、时长和心率，我可以给出更有针对性的建议。"

    if (_state.value.useLLM && _state.value.apiBase.isNotBlank()) {
      val sys = "你是一名专业的跑步教练。你可以结合用户的实时跑步数据提供中文建议，每次不超过120字，具体可执行。"
      val ctx = "实时跑步数据 JSON：" +
        mapOf(
          "mode" to _state.value.mode.name.lowercase(),
          "distanceKm" to _state.value.totalDistanceKm,
          "avgPace" to _state.value.avgPaceLabel,
          "toDestKm" to _state.value.toDestKm,
          "age" to _state.value.age,
          "gender" to _state.value.gender
        ).toString()
      val messages = listOf(
        NetClients.ChatMessage("system", sys),
        NetClients.ChatMessage("user", "$ctx\n\n用户：$text")
      )
      NetClients.chatCompletion(_state.value.apiBase, _state.value.model, _state.value.apiKey, messages)?.let { reply = it }
    }

    addMsg("assistant", reply)
    if (voiceEnabled) speak(reply)
  }

  private fun updateEnergyTick() {
    val now = System.currentTimeMillis()
    val dt = (now - lastEnergyUpdateAt) / 1000.0
    lastEnergyUpdateAt = now
    val running = _state.value.running
    val durationSec = startTime?.let { ((now - it) / 1000) } ?: 0
    val updated = energy.update(
      running = running,
      instantPaceMinPerKm = lastInstPaceMinPerKm,
      targetPaceMinPerKm = 6.0,
      durationSec = durationSec,
      heartRate = null,
      justStopped = !running && points.isNotEmpty(),
      dtSeconds = dt
    )
    val st = energy.getStatus()
    _state.value = _state.value.copy(energyPercent = updated, energyName = st.name)
  }

  private fun maybeCoachRealtime(speak: (String)->Unit) {
    val now = System.currentTimeMillis()
    val elapsedSec = startTime?.let { ((now - it) / 1000) } ?: 0
    if (!_state.value.running) return
    if (elapsedSec < 60) return
    if (_state.value.totalDistanceKm < 0.2) return
    if (now - lastCoachAt < 30_000) return
    lastCoachAt = now

    val ip = lastInstPaceMinPerKm
    val ap: Double? = null // keep simple; label already shown
    val toDest = _state.value.toDestKm
    val parts = mutableListOf<String>()
    fun fmt(minPerKm: Double?): String {
      if (minPerKm == null || minPerKm <= 0) return "-"
      val m = floor(minPerKm).toInt(); val s = (((minPerKm - m) * 60).roundToInt())
      return "${m}分${s.toString().padStart(2,'0')}秒/公里"
    }
    ip?.let { parts += "即时 ${fmt(it)}" }
    if (ap != null) parts += "平均 ${fmt(ap)}"
    if (_state.value.mode == RunMode.Dest && toDest != null) parts += "距目的地约 ${"%.2f".format(toDest)} 公里"
    if (ip != null && ap != null) {
      val delta = ip - ap
      when {
        delta <= -0.2 -> parts += "配速略快，注意放松上身。"
        delta >= 0.3 -> parts += "配速偏慢，可小幅提高步频。"
        else -> parts += "节奏稳定，保持呼吸顺畅。"
      }
    } else {
      parts += "保持节奏，注意呼吸与放松。"
    }
    val msg = parts.joinToString("，")
    if (msg.isNotBlank()) { addMsg("assistant", msg); if (voiceEnabled) speak(msg) }
  }

  // ----- AI 目标建议（规则 + 可选LLM） -----
  fun generateGoalAdvice(
    heightCm: Int?, weightKg: Double?, purpose: String?, pb: String?, weeklyKm: Int?, daysPerWeek: Int?,
    speak: (String)->Unit
  ) {
    viewModelScope.launch {
      val bmi = if (heightCm != null && weightKg != null && heightCm > 0 && weightKg > 0) {
        val h = heightCm / 100.0; (weightKg / (h * h))
      } else null
      var advice: String? = null
      if (_state.value.useLLM && _state.value.apiBase.isNotBlank()) {
        val payload = mapOf(
          "heightCm" to heightCm, "weightKg" to weightKg, "bmi" to (bmi?.let { kotlin.math.round(it * 10)/10 }),
          "purpose" to (purpose ?: "健康"), "pb" to (pb ?: ""), "weeklyKm" to (weeklyKm ?: 0), "daysPerWeek" to (daysPerWeek ?: 3),
          "age" to _state.value.age, "gender" to _state.value.gender
        )
        val sys = "你是一名专业跑步教练与体能训练师。基于用户的身高、体重（BMI）、周跑量、可训练天数、跑步目的与PB等信息，给出中文目标建议：包含阶段目标（4-8周）、每周训练结构（质量课与轻松跑分配）、推荐配速区间与注意事项，控制在180字内。"
        val messages = listOf(
          NetClients.ChatMessage("system", sys),
          NetClients.ChatMessage("user", "用户画像 JSON：$payload")
        )
        advice = NetClients.chatCompletion(_state.value.apiBase, _state.value.model, _state.value.apiKey, messages)
      }
      if (advice == null) {
        val cues = mutableListOf<String>()
        bmi?.let {
          when {
            it >= 27 -> cues += "优先控强度，逐步增加跑量"
            it < 18.5 -> cues += "注意营养与力量训练"
          }
        }
        if ((weeklyKm ?: 0) < 20) cues += "先打基础，逐步加到每周20–30km"
        if ((daysPerWeek ?: 0) < 3) cues += "建议每周≥3天跑步"
        val wk = weeklyKm ?: 0
        val days = daysPerWeek ?: 3
        val tip = if (cues.isNotEmpty()) cues.joinToString("，") else "循序渐进，注意恢复"
        advice = "${purpose ?: "健康"}目标建议：4–6周阶段。每周${days}天，1次质量课（节奏或间歇）+ 2–3次轻松跑；周跑量约${kotlin.math.max(15, kotlin.math.min(45, wk + 10))}km；训练配速以可对话强度为主，质量课略快。${tip}。"
      }
      addMsg("assistant", advice)
      if (voiceEnabled) speak(advice)
    }
  }
}

// Minimal speech recognition listener wrapper

class SimpleRecognitionListener(val onFinal: (String)->Unit) : RecognitionListener {
  override fun onReadyForSpeech(params: Bundle?) {}
  override fun onBeginningOfSpeech() {}
  override fun onRmsChanged(rmsdB: Float) {}
  override fun onBufferReceived(buffer: ByteArray?) {}
  override fun onEndOfSpeech() {}
  override fun onError(error: Int) {}
  override fun onPartialResults(partialResults: Bundle?) {}
  override fun onEvent(eventType: Int, params: Bundle?) {}
  override fun onResults(results: Bundle?) {
    val list = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
    val finalText = list?.firstOrNull()?.trim().orEmpty()
    if (finalText.isNotBlank()) onFinal(finalText)
  }
}
