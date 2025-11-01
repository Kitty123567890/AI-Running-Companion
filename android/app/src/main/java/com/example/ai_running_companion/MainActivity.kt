package com.example.ai_running_companion

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.google.android.gms.location.*
import com.google.maps.android.compose.*
import com.google.android.gms.maps.CameraUpdateFactory
import kotlinx.coroutines.launch
import java.util.*

class MainActivity : ComponentActivity() {
  private val vm: RunViewModel by viewModels()
  private var tts: TextToSpeech? = null

  private val requestPerms = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { _ ->
    // No-op; UI reflects availability
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    tts = TextToSpeech(this) { }
    setContent { App(vm, speak = { txt -> if (vm.voiceEnabled) tts?.speak(txt, TextToSpeech.QUEUE_FLUSH, null, "coach") }) }
  }

  override fun onStart() {
    super.onStart()
    val needed = arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.RECORD_AUDIO)
    val missing = needed.filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
    if (missing.isNotEmpty()) requestPerms.launch(missing.toTypedArray())
  }

  override fun onDestroy() {
    super.onDestroy()
    tts?.shutdown()
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun App(vm: RunViewModel, speak: (String)->Unit) {
  val state by vm.state.collectAsState()
  val ctx = LocalContext.current
  val scope = rememberCoroutineScope()
  LaunchedEffect(Unit) {
    vm.refreshCheckinUi(ctx)
  }

  MaterialTheme(colorScheme = darkColorScheme()) {
    Surface(Modifier.fillMaxSize().background(Color(0xFF0C0F12))) {
      val scroll = rememberScrollState()
      Column(
        Modifier
          .fillMaxSize()
          .verticalScroll(scroll)
          .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        // Header toggles
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
          Text("AI 跑步教练", style = MaterialTheme.typography.titleLarge)
          Spacer(Modifier.weight(1f))
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text("语音教练"); Switch(checked = state.voiceEnabled, onCheckedChange = { vm.setVoiceEnabled(it) })
          }
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text("使用兼容 OpenAI 的接口"); Switch(checked = state.useLLM, onCheckedChange = { vm.setUseLLM(it) })
          }
        }

        // Energy bar
        Card { Row(Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
          Text("元气值", style = MaterialTheme.typography.titleMedium, color = Color(0xFF9FB3C8))
          Spacer(Modifier.width(12.dp))
          LinearProgressIndicator(progress = { state.energyPercent / 100f }, modifier = Modifier.weight(1f).height(8.dp))
          Spacer(Modifier.width(12.dp))
          Text("${state.energyName} ${state.energyPercent}%")
        } }

        if (state.useLLM) {
          Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              OutlinedTextField(
                value = state.apiBase,
                onValueChange = vm::setApiBase,
                label = { Text("API 基址") },
                singleLine = true,
                modifier = Modifier.weight(1f)
              )
              OutlinedTextField(
                value = state.model,
                onValueChange = vm::setModel,
                label = { Text("模型") },
                singleLine = true,
                modifier = Modifier.weight(1f)
              )
            }
            OutlinedTextField(
              value = state.apiKey,
              onValueChange = vm::setApiKey,
              label = { Text("API 密钥") },
              singleLine = true,
              modifier = Modifier.fillMaxWidth()
            )
          }
        }

        // Run panel
        Card { Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("跑步", style = MaterialTheme.typography.titleMedium, color = Color(0xFF9FB3C8))
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            FilterChip(selected = state.mode == RunMode.Free, onClick = { vm.setMode(RunMode.Free) }, label = { Text("自由跑") })
            FilterChip(selected = state.mode == RunMode.Dest, onClick = { vm.setMode(RunMode.Dest) }, label = { Text("目的地跑") })
          }
          if (state.mode == RunMode.Dest) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              OutlinedTextField(value = state.destInput, onValueChange = vm::setDestInput, label = { Text("名称或经纬度（如 31.23,121.47）") }, modifier = Modifier.weight(1f))
              Button(onClick = { scope.launch { vm.searchDestination() } }) { Text("搜索") }
            }
            Text("提示：可输入地名后点击“搜索”，或直接填入“纬度,经度”。设置后自动规划步行路线。", color = Color(0xFF9FB3C8))
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = state.gender, onValueChange = vm::setGender, label = { Text("性别") }, modifier = Modifier.weight(1f))
            OutlinedTextField(value = state.age, onValueChange = vm::setAge, label = { Text("年龄") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.weight(1f))
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { vm.start(ctx, speak) }, enabled = !state.running) { Text("开始跑步") }
            Button(onClick = { vm.stop(speak) }, enabled = state.running) { Text("停止") }
            OutlinedButton(onClick = { vm.clear() }) { Text("清空") }
          }

          // Metrics
          Text("当前状态：${if (state.running) "进行中" else "未开始"}")
          Text("当前位置：${state.lastLatLng ?: "-"}")
          Text("即时配速：${state.instPaceLabel}")
          Text("平均配速：${state.avgPaceLabel}")
          Text("已跑距离：${"%.2f".format(state.totalDistanceKm)} 公里")
          Text("用时：${state.elapsedLabel}")
          if (state.mode == RunMode.Dest && state.toDestKm != null) {
            Text("距离目的地：${"%.2f".format(state.toDestKm)} 公里")
          }

          // Map
          val camPosState = rememberCameraPositionState()
          val config = LocalConfiguration.current
          val mapHeight = (config.screenHeightDp.dp * 0.45f).coerceAtLeast(320.dp)
          LaunchedEffect(state.current) {
            val cur = state.current ?: return@LaunchedEffect
            camPosState.animate(CameraUpdateFactory.newLatLngZoom(cur, 15f))
          }
          GoogleMap(
            modifier = Modifier
              .fillMaxWidth()
              .height(mapHeight),
            cameraPositionState = camPosState,
            onMapClick = { ll -> vm.setDestination(ll.latitude, ll.longitude, "地图选择") }
          ) {
            state.track.forEach { }
            // Current position marker
            state.current?.let { Marker(state = MarkerState(position = it)) }
            // Track polyline
            if (state.track.size >= 2) {
              Polyline(points = state.track)
            }
            // Destination
            state.destLatLng?.let { Marker(state = MarkerState(position = it), title = "目的地") }
            // Planned route
            if (state.routePlan.isNotEmpty()) {
              Polyline(points = state.routePlan, color = Color(0xFF20D0B7))
            }
          }
        } }

        // Chat panel
        Card {
          Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("教练聊天", style = MaterialTheme.typography.titleMedium, color = Color(0xFF9FB3C8))
            LazyColumn(Modifier.heightIn(min = 200.dp, max = 320.dp)) {
              items(state.messages) { m ->
                val bg = if (m.role == "user") Color(0xFF0E1722) else Color(0xFF0E141B)
                Surface(color = bg, tonalElevation = 1.dp, modifier = Modifier.padding(4.dp)) {
                  Column(Modifier.padding(8.dp)) { Text(m.text) }
                }
              }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
              Button(onClick = { vm.toggleMic(ctx) }) { Text(if (state.recognizing) "🛑" else "🎤") }
              OutlinedTextField(value = state.inputText, onValueChange = vm::setInputText, modifier = Modifier.weight(1f), placeholder = { Text("向教练提问……") })
              Button(onClick = { scope.launch { vm.sendMessage(speak) } }) { Text("发送") }
              OutlinedButton(onClick = { vm.clearChat() }) { Text("清空") }
            }
          }
        }

        // Goals & Check-in panel
        var showGoalDialog by remember { mutableStateOf(false) }
        Card { Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Text("目标与打卡", style = MaterialTheme.typography.titleMedium, color = Color(0xFF9FB3C8))
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Button(onClick = { vm.doCheckin(ctx, "用户手动打卡", speak) }, enabled = !state.checkinDoneToday) { Text("今日打卡") }
            Text(state.checkinStatus, color = Color(0xFF9FB3C8))
          }
          Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Button(onClick = { showGoalDialog = true }) { Text("AI 目标建议") }
          }
        } }

        if (showGoalDialog) {
          var height by remember { mutableStateOf(0) }
          var weight by remember { mutableStateOf(0.0) }
          var purpose by remember { mutableStateOf("健康") }
          var pb by remember { mutableStateOf("") }
          var weeklyKm by remember { mutableStateOf(0) }
          var days by remember { mutableStateOf(3) }
          AlertDialog(
            onDismissRequest = { showGoalDialog = false },
            confirmButton = {
              TextButton(onClick = {
                showGoalDialog = false
                vm.generateGoalAdvice(height, weight, purpose, pb, weeklyKm, days, speak)
              }) { Text("生成建议") }
            },
            dismissButton = { TextButton(onClick = { showGoalDialog = false }) { Text("取消") } },
            title = { Text("AI 目标建议问卷") },
            text = {
              Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = if (height==0) "" else height.toString(), onValueChange = { height = it.toIntOrNull() ?: 0 }, label = { Text("身高(cm)") })
                OutlinedTextField(value = if (weight==0.0) "" else weight.toString(), onValueChange = { weight = it.toDoubleOrNull() ?: 0.0 }, label = { Text("体重(kg)") })
                OutlinedTextField(value = purpose, onValueChange = { purpose = it }, label = { Text("跑步目的") })
                OutlinedTextField(value = pb, onValueChange = { pb = it }, label = { Text("当前PB（如 5K 24:30）") })
                OutlinedTextField(value = if (weeklyKm==0) "" else weeklyKm.toString(), onValueChange = { weeklyKm = it.toIntOrNull() ?: 0 }, label = { Text("周跑量(公里)") })
                OutlinedTextField(value = if (days==0) "" else days.toString(), onValueChange = { days = it.toIntOrNull() ?: 0 }, label = { Text("每周可训练天数") })
              }
            }
          )
        }
      }
    }
  }
}
