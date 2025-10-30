// App bootstrap for AI Running Companion (Chinese UI)
// - 语音输入：Web Speech API（若可用）
// - 语音播报：speechSynthesis
// - 本地规则教练（analysis.js）
// - 可选：兼容 OpenAI 的 LLM（可配置 API Base/Model/Key）

(function () {
  const chatEl = document.getElementById('chat');
  const chatForm = document.getElementById('chatForm');
  const messageInput = document.getElementById('message');
  const micBtn = document.getElementById('micBtn');
  const clearChatBtn = document.getElementById('clearChat');

  const runForm = document.getElementById('runForm');
  const clearRunBtn = document.getElementById('clearRun');
  const startRunBtn = document.getElementById('startRun');
  const stopRunBtn = document.getElementById('stopRun');
  const destField = document.getElementById('destField');
  const searchPlaceBtn = document.getElementById('searchPlace');
  const mapEl = document.getElementById('map');

  // Metrics display elements
  const statusText = document.getElementById('statusText');
  const posText = document.getElementById('posText');
  const instPaceText = document.getElementById('instPaceText');
  const avgPaceText = document.getElementById('avgPaceText');
  const distText = document.getElementById('distText');
  const timeText = document.getElementById('timeText');
  const toDestRow = document.getElementById('toDestRow');
  const toDestText = document.getElementById('toDestText');

  const voiceToggle = document.getElementById('voiceToggle');
  const useOpenAI = document.getElementById('useOpenAI');
  const openaiKeyInput = document.getElementById('openaiKey');
  const openaiBaseInput = document.getElementById('openaiBase');
  const modelNameInput = document.getElementById('modelName');

  const state = {
    run: loadRunFromStorage(),
    speaking: false,
    recognizing: false,
    recognition: null,
    messages: [],
    running: false,
    watchId: null,
    track: [], // {lat,lng,timestamp}
    startTime: null,
    totalDistanceKm: 0,
    lastCoachAt: 0,
    // map state
    map: null,
    routeLine: null,
    routePlanLine: null,
    posMarker: null,
    destMarker: null,
    startMarker: null,
    weather: { lastAt: 0, tempC: null, windKph: null, weatherCode: null, desc: null },
    // milestones
    lastKmSpoken: 0,
    lastKmAtTime: null,
    lastKmAtDist: 0,
  };

  // Map helpers
  function initMapIfNeeded() {
    if (!mapEl || state.map || typeof L === 'undefined') return;
    const m = L.map(mapEl, { zoomControl: true });
    // Default view prior to GPS lock
    m.setView([31.2304, 121.4737], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(m);
    state.routeLine = L.polyline([], { color: '#47a3ff', weight: 4 }).addTo(m);
    // Clicking the map sets destination
    m.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setDestinationFromMap(lat, lng);
    });
    // Simple control: Recenter and Fit
    const Buttons = L.Control.extend({
      position: 'topleft',
      onAdd: function () {
        const div = L.DomUtil.create('div', 'leaflet-bar');
        const rec = L.DomUtil.create('a', '', div);
        rec.href = '#'; rec.title = '居中到当前位置'; rec.textContent = '居中';
        L.DomEvent.on(rec, 'click', function (e) { L.DomEvent.stop(e); recenterOnRunner(); });
        const fit = L.DomUtil.create('a', '', div);
        fit.href = '#'; fit.title = '全览路线'; fit.textContent = '全览';
        L.DomEvent.on(fit, 'click', function (e) { L.DomEvent.stop(e); fitToRoute(); });
        return div;
      }
    });
    new Buttons().addTo(m);
    state.map = m;
    // Restore destination marker if any
    if (state.run && isFinite(state.run?.destLat) && isFinite(state.run?.destLng)) {
      updateDestMarker(state.run.destLat, state.run.destLng, state.run.destLabel || '目的地');
    }
  }

  function updateRouteOnMap(point) {
    if (!state.map || !state.routeLine) return;
    state.routeLine.addLatLng([point.lat, point.lng]);
    if (!state.startMarker) {
      state.startMarker = L.marker([point.lat, point.lng], { title: '起点' }).addTo(state.map);
    }
    if (!state.posMarker) {
      state.posMarker = L.marker([point.lat, point.lng], { title: '当前位置' }).addTo(state.map);
    } else {
      state.posMarker.setLatLng([point.lat, point.lng]);
    }
    // Follow user when running
    state.map.setView([point.lat, point.lng], Math.max(state.map.getZoom(), 15));
    // Plan/update route if destination exists
    maybePlanRoute();
  }

  function clearRouteOnMap() {
    if (state.routeLine) state.routeLine.setLatLngs([]);
    if (state.posMarker && state.map) { try { state.map.removeLayer(state.posMarker); } catch {} state.posMarker = null; }
    if (state.startMarker && state.map) { try { state.map.removeLayer(state.startMarker); } catch {} state.startMarker = null; }
  }

  function updateDestMarker(lat, lng, label) {
    if (!state.map || typeof L === 'undefined') return;
    if (!state.destMarker) {
      state.destMarker = L.marker([lat, lng], { title: label || '目的地' }).addTo(state.map);
    } else {
      state.destMarker.setLatLng([lat, lng]);
    }
    if (label) { try { state.destMarker.bindPopup(label); } catch {} }
    // Try to plan route once destination is set
    maybePlanRoute();
  }

  function removeDestMarker() {
    if (state.destMarker && state.map) { try { state.map.removeLayer(state.destMarker); } catch {} }
    state.destMarker = null;
    if (state.routePlanLine && state.map) { try { state.map.removeLayer(state.routePlanLine); } catch {} }
    state.routePlanLine = null;
  }

  function setDestinationFromMap(lat, lng) {
    // Switch to destination mode
    const radios = runForm.querySelectorAll('input[name="mode"]');
    radios.forEach(r => { r.checked = (r.value === 'dest'); });
    destField.style.display = '';
    // Fill input field
    const destInput = document.getElementById('destination');
    if (destInput) destInput.value = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    // Update state
    state.run.mode = 'dest';
    state.run.destination = `${lat},${lng}`;
    state.run.destLabel = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    state.run.destLat = lat; state.run.destLng = lng;
    saveRunToStorage();
    updateUi();
    updateDestMarker(lat, lng, state.run.destLabel);
    addMsg('assistant', `已将目的地设置为地图坐标：${state.run.destLabel}`);
  }

  function fitToRoute() {
    if (!state.map || !state.routeLine) return;
    const b = state.routeLine.getBounds();
    if (b && b.isValid && b.isValid()) {
      state.map.fitBounds(b, { padding: [30, 30] });
    } else if (state.posMarker) {
      recenterOnRunner();
    }
  }

  function recenterOnRunner() {
    if (!state.map || !state.posMarker) return;
    const ll = state.posMarker.getLatLng();
    state.map.setView(ll, Math.max(state.map.getZoom(), 16));
  }

  function loadRunFromStorage() {
    try { return JSON.parse(localStorage.getItem('run') || '{}'); } catch { return {}; }
  }
  function saveRunToStorage() {
    localStorage.setItem('run', JSON.stringify(state.run || {}));
  }

  // Helpers
  function addMsg(role, text) {
    const el = document.createElement('div');
    el.className = `msg ${role === 'user' ? 'me' : 'coach'}`;
    const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = role === 'user' ? '你' : '教练';
    const body = document.createElement('div'); body.className = 'text'; body.textContent = text;
    el.appendChild(meta); el.appendChild(body);
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function speak(text) {
    if (!voiceToggle.checked) return;
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.lang = 'zh-CN';
    state.speaking = true;
    u.onend = () => { state.speaking = false; };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onstart = () => { state.recognizing = true; micBtn.textContent = '🛑'; };
    rec.onend = () => { state.recognizing = false; micBtn.textContent = '🎤'; };
    rec.onerror = () => { state.recognizing = false; micBtn.textContent = '🎤'; };
    rec.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final += res[0].transcript;
      }
      if (final.trim()) {
        messageInput.value = final.trim();
        submitMessage();
      }
    };
    return rec;
  }

  // Geo + metrics helpers
  function haversineKm(a, b) {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const la1 = toRad(a.lat), la2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function toRad(x){ return x * Math.PI/180; }
  function fmtPaceMinPerKm(minPerKm){
    if (!isFinite(minPerKm) || minPerKm <= 0) return '-';
    const min = Math.floor(minPerKm);
    const sec = Math.round((minPerKm - min) * 60);
    return `${min}分${sec.toString().padStart(2,'0')}秒/公里`;
  }
  function fmtTime(sec){
    if (!isFinite(sec) || sec < 0) return '-';
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    const s = Math.floor(sec%60);
    return h>0 ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : `${m}:${s.toString().padStart(2,'0')}`;
  }

  // Encourage each kilometer
  function maybeAnnounceKilometer(){
    const kmDone = Math.floor(state.totalDistanceKm || 0);
    const last = state.lastKmSpoken || 0;
    if (kmDone > last && kmDone >= 1){
      const now = Date.now();
      const lastTime = state.lastKmAtTime || state.startTime || now;
      const lastDist = state.lastKmAtDist || 0;
      const deltaMin = (now - lastTime)/60000;
      const deltaDist = Math.max(0, (state.totalDistanceKm || 0) - lastDist);
      let lapPace = (deltaDist > 0.2) ? (deltaMin / deltaDist) : (state.run.instPaceMinPerKm || state.run.avgPaceMinPerKm || null);
      const lapLabel = isFinite(lapPace) ? fmtPaceMinPerKm(lapPace) : '-';
      const phrases = [
        (n, p)=>`已完成第 ${n} 公里，保持！该公里配速 ${p}。`,
        (n)=>`第 ${n} 公里到手，继续稳住节奏！`,
        (n)=>`不错！第 ${n} 公里完成，注意放松肩颈。`,
        (n)=>`第 ${n} 公里，呼吸顺畅，前进！`,
      ];
      const f = phrases[kmDone % phrases.length];
      const msg = f(kmDone, lapLabel);
      addMsg('assistant', msg);
      speak(msg);
      state.lastKmSpoken = kmDone;
      state.lastKmAtTime = now;
      state.lastKmAtDist = state.totalDistanceKm || 0;
    }
  }

  function parseDestInput(s){
    const t = (s||'').trim();
    if (!t) return { label: '', lat: null, lng: null };
    // Try lat,lng
    const m = t.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m){
      const lat = Number(m[1]); const lng = Number(m[2]);
      if (isFinite(lat) && isFinite(lng)) return { label: `${lat},${lng}`, lat, lng };
    }
    return { label: t, lat: null, lng: null };
  }

  function updateUi(){
    const running = state.running;
    statusText.textContent = running ? '进行中' : '未开始';
    if (state.track.length){
      const last = state.track[state.track.length-1];
      posText.textContent = `${last.lat.toFixed(5)}, ${last.lng.toFixed(5)}`;
    } else {
      posText.textContent = '-';
    }
    // Instant pace
    const inst = state.run.instPaceMinPerKm;
    instPaceText.textContent = fmtPaceMinPerKm(inst);
    // Avg pace
    const avg = state.run.avgPaceMinPerKm;
    avgPaceText.textContent = fmtPaceMinPerKm(avg);
    // Distance
    distText.textContent = isFinite(state.totalDistanceKm) ? `${state.totalDistanceKm.toFixed(2)} 公里` : '-';
    // Time
    const elapsed = state.startTime ? ((Date.now() - state.startTime)/1000) : 0;
    timeText.textContent = fmtTime(elapsed);
    // To destination
    if (state.run.mode === 'dest' && state.run.destLat != null && state.run.destLng != null && state.track.length){
      const last = state.track[state.track.length-1];
      const toKm = haversineKm({lat:last.lat,lng:last.lng},{lat:state.run.destLat,lng:state.run.destLng});
      toDestRow.style.display = '';
      toDestText.textContent = `${toKm.toFixed(2)} 公里`;
      state.run.toDestKm = toKm;
    } else {
      toDestRow.style.display = 'none';
      toDestText.textContent = '-';
      state.run.toDestKm = null;
    }
  }

  function handlePosition(pos){
    const { latitude: lat, longitude: lng, speed } = pos.coords;
    const ts = pos.timestamp || Date.now();
    const point = { lat, lng, ts };
    const prev = state.track[state.track.length - 1];
    state.track.push(point);
    if (prev){
      const d = haversineKm(prev, point);
      state.totalDistanceKm += d;
    }
    // Instant pace: prefer native speed m/s if valid, else derive from last segment
    let mPerKm = null;
    if (speed != null && isFinite(speed) && speed > 0){
      const minPerKm = (1000 / speed) / 60; // speed m/s
      mPerKm = minPerKm;
    } else if (prev) {
      const dt = (point.ts - prev.ts)/1000; // s
      const dk = haversineKm(prev, point);
      if (dt > 0 && dk > 0) mPerKm = (dt/60) / dk;
    }
    state.run.instPaceMinPerKm = mPerKm;
    const elapsedMin = state.startTime ? (Date.now() - state.startTime) / 60000 : 0;
    state.run.avgPaceMinPerKm = (state.totalDistanceKm > 0) ? (elapsedMin / state.totalDistanceKm) : null;
    updateUi();
    // Update map
    initMapIfNeeded();
    updateRouteOnMap(point);
    // Weather (throttled)
    maybeFetchWeather(point.lat, point.lng);
    // Kilometer encouragement
    maybeAnnounceKilometer();
    maybeCoachRealtime();
  }

  function startWatching(){
    initMapIfNeeded();
    if (!('geolocation' in navigator)){
      addMsg('assistant','当前设备不支持地理定位。');
      speak('当前设备不支持地理定位');
      return;
    }
    if (state.running) return;
    state.running = true;
    state.track = [];
    state.totalDistanceKm = 0;
    state.startTime = Date.now();
    state.lastKmSpoken = 0; state.lastKmAtTime = state.startTime; state.lastKmAtDist = 0;
    // fresh route visuals
    clearRouteOnMap();
    // keep any previous planned route only when a destination is set; otherwise clear
    if (!(state.run && isFinite(state.run?.destLat) && isFinite(state.run?.destLng))) {
      removeDestMarker();
    }
    startRunBtn.disabled = true;
    stopRunBtn.disabled = false;
    updateUi();
    try {
      state.watchId = navigator.geolocation.watchPosition(
        handlePosition,
        (err)=>{
          addMsg('assistant', `定位失败：${err.message}`);
          speak('定位失败');
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
      addMsg('assistant','已开始跑步。定位初始化中……');
      speak('已开始跑步，定位初始化中');
    } catch(e){
      addMsg('assistant','无法开始定位。');
    }
  }

  function stopWatching(){
    if (state.watchId != null){
      try { navigator.geolocation.clearWatch(state.watchId); } catch {}
      state.watchId = null;
    }
    state.running = false;
    startRunBtn.disabled = false;
    stopRunBtn.disabled = true;
    updateUi();
    // Show full route on finish
    fitToRoute();
    const tips = window.LocalCoach.analyzeRun({...state.run, distance: state.totalDistanceKm, duration: Math.round((Date.now()-state.startTime)/60000)});
    if (tips.length){ addMsg('assistant', `本次结束。${tips[0]}`); speak(tips[0]); }
  }

  // --- Weather ---
  function weatherDescFromCode(code){
    const map = {
      0: '晴', 1: '多云', 2: '多云', 3: '阴',
      45: '雾', 48: '雾', 51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
      56: '小冻雨', 57: '冻雨', 61: '小雨', 63: '中雨', 65: '大雨',
      66: '小冻雨', 67: '冻雨', 71: '小雪', 73: '中雪', 75: '大雪',
      77: '雪粒', 80: '阵雨', 81: '阵雨', 82: '强阵雨', 85: '阵雪', 86: '强阵雪',
      95: '雷雨', 96: '雷雨伴有冰雹', 99: '强雷雨伴有冰雹'
    };
    return map[code] || '天气未知';
  }
  async function fetchWeather(lat, lng){
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('weather http ' + res.status);
      const data = await res.json();
      const cw = data.current_weather || {};
      const tempC = cw.temperature;
      const wind = cw.windspeed; // km/h
      const code = cw.weathercode;
      state.weather = {
        lastAt: Date.now(),
        tempC: isFinite(tempC) ? tempC : null,
        windKph: isFinite(wind) ? wind : null,
        weatherCode: code,
        desc: weatherDescFromCode(code)
      };
    } catch (e) {
      console.warn('weather fetch failed', e);
    }
  }
  function maybeFetchWeather(lat, lng){
    const now = Date.now();
    if (!state.weather.lastAt || now - state.weather.lastAt > 10 * 60 * 1000) {
      fetchWeather(lat, lng);
    }
  }

  // --- Geocoding & Route planning ---
  async function geocodePlace(name){
    const q = (name||'').trim(); if (!q) return null;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('geocode http ' + res.status);
      const arr = await res.json();
      if (!arr || !arr.length) return null;
      const it = arr[0];
      return { lat: Number(it.lat), lng: Number(it.lon), label: it.display_name };
    } catch (e) {
      console.warn('geocode failed', e);
      return null;
    }
  }

  async function planRoute(from, to){
    if (!from || !to || !state.map) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('route http ' + res.status);
      const data = await res.json();
      const route = data.routes && data.routes[0];
      if (!route || !route.geometry) return;
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      if (state.routePlanLine && state.map) {
        try { state.map.removeLayer(state.routePlanLine); } catch {}
      }
      state.routePlanLine = L.polyline(coords, { color: '#3cb371', weight: 4, dashArray: '6,4' }).addTo(state.map);
      // Fit if we don't yet have much track
      if (!state.track.length || state.track.length < 3) {
        const group = L.featureGroup([state.routePlanLine]);
        state.map.fitBounds(group.getBounds(), { padding: [30,30] });
      }
    } catch (e) {
      console.warn('route plan failed', e);
    }
  }

  function maybePlanRoute(){
    if (!state.map) return;
    if (state.run && isFinite(state.run?.destLat) && isFinite(state.run?.destLng)) {
      const last = state.track[state.track.length-1];
      if (last) {
        planRoute({ lat: last.lat, lng: last.lng }, { lat: state.run.destLat, lng: state.run.destLng });
      }
    }
  }

  async function maybeCoachRealtime(){
    const now = Date.now();
    // Speak at most once every 30s, and only after we have at least 200m and 60s
    const elapsedSec = state.startTime ? (now - state.startTime)/1000 : 0;
    if (elapsedSec < 60 || state.totalDistanceKm < 0.2) return;
    if (now - state.lastCoachAt < 30000) return;
    state.lastCoachAt = now;
    const context = {
      mode: state.run.mode,
      instPaceMinPerKm: state.run.instPaceMinPerKm,
      avgPaceMinPerKm: state.run.avgPaceMinPerKm,
      distanceKm: state.totalDistanceKm,
      elapsedSec,
      toDestKm: state.run.toDestKm,
      destLabel: state.run.destLabel || state.run.destination,
      weather: state.weather && {
        temperatureC: state.weather.tempC,
        windKph: state.weather.windKph,
        desc: state.weather.desc
      },
    };
    let advice = '';
    // Prefer cloud LLM if配置开启
    const base = (openaiBaseInput?.value || '').trim();
    const model = (modelNameInput?.value || '').trim();
    const key = (openaiKeyInput?.value || '').trim();
    const useCloud = useOpenAI.checked && (key || base);
    if (useCloud){
      try {
        const sys = '你是中文跑步教练。基于给定的实时数据，用1句话给出具体可执行的建议。避免客套，直达主题。';
        const user = `数据: ${JSON.stringify(context)}`;
        const msg = await fetchOpenAI({ userText: user, run: state.run, apiKey: key, apiBase: base, model });
        advice = msg || '';
      } catch(e){ advice = ''; }
    }
    if (!advice) advice = window.LocalCoach.realtimeAdvice(context);
    if (advice){ addMsg('assistant', advice); speak(advice); }
  }

  async function coachReply(userText) {
    const base = (openaiBaseInput?.value || '').trim();
    const model = (modelNameInput?.value || '').trim();
    const key = (openaiKeyInput?.value || '').trim();
    const useCloud = useOpenAI.checked && (key || base);
    if (useCloud) {
      try {
        const reply = await fetchOpenAI({ userText, run: state.run, apiKey: key, apiBase: base, model });
        return reply || window.LocalCoach.respondToMessage(userText, state.run);
      } catch (err) {
        console.warn('OpenAI error, falling back to local:', err);
        return window.LocalCoach.respondToMessage(userText, state.run);
      }
    }
    return window.LocalCoach.respondToMessage(userText, state.run);
  }

  async function submitMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    addMsg('user', text);
    messageInput.value = '';
    const reply = await coachReply(text);
    addMsg('assistant', reply);
    speak(reply);
  }

  async function fetchOpenAI({ userText, run, apiKey, apiBase, model }) {
    // 注意：浏览器中使用 API Key 存在泄露风险，生产环境请走后端代理。
    const sys = `你是一名专业的跑步教练。你可以结合用户的实时跑步数据（位置、即时配速、平均配速、已跑距离、与目的地距离、年龄/性别、当地天气）提供中文建议，不必等待用户提问。每次建议不超过120字，务求具体可执行。`;
    const ctx = `实时跑步数据 JSON：${JSON.stringify({
      mode: state.run.mode,
      instPaceMinPerKm: state.run.instPaceMinPerKm,
      avgPaceMinPerKm: state.run.avgPaceMinPerKm,
      distanceKm: state.totalDistanceKm,
      toDestKm: state.run.toDestKm,
      age: state.run.age,
      gender: state.run.gender,
      destLabel: state.run.destLabel || state.run.destination,
      weather: state.weather && {
        temperatureC: state.weather.tempC,
        windKph: state.weather.windKph,
        desc: state.weather.desc
      }
    })}`;
    const messages = [
      { role: 'system', content: sys },
      { role: 'user', content: `${ctx}\n\n用户：${userText}` }
    ];
    const base = (apiBase && apiBase.trim()) || 'https://api.openai.com/v1';
    const url = joinUrl(base, '/chat/completions');
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: (model && model.trim()) || 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      })
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim();
  }

  function joinUrl(base, path) {
    const b = base.endsWith('/') ? base.slice(0, -1) : base;
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${b}${p}`;
  }

  // Events: chat
  chatForm.addEventListener('submit', (e) => { e.preventDefault(); submitMessage(); });
  micBtn.addEventListener('click', () => {
    if (!state.recognition) state.recognition = initRecognition();
    if (!state.recognition) {
      addMsg('assistant', '当前浏览器不支持语音识别。');
      return;
    }
    if (state.recognizing) {
      try { state.recognition.stop(); } catch {}
    } else {
      try { state.recognition.start(); } catch {}
    }
  });
  clearChatBtn.addEventListener('click', () => { chatEl.innerHTML = ''; });

  // Events: running controls & form
  runForm.addEventListener('change', (e)=>{
    // Mode toggle show/hide destination field
    const fd = new FormData(runForm);
    const mode = (fd.get('mode')||'free').toString();
    destField.style.display = mode === 'dest' ? '' : 'none';
    // Persist gender/age, mode, destination
    const destRaw = (fd.get('destination')||'').toString();
    const parsedDest = parseDestInput(destRaw);
    state.run.mode = mode;
    state.run.destination = destRaw;
    state.run.destLabel = parsedDest.label;
    state.run.destLat = parsedDest.lat;
    state.run.destLng = parsedDest.lng;
    state.run.gender = (fd.get('gender')||'').toString();
    state.run.age = (fd.get('age')||'').toString();
    saveRunToStorage();
    updateUi();
    // Map destination marker update
    initMapIfNeeded();
    if (mode === 'dest' && parsedDest.lat != null && parsedDest.lng != null) {
      updateDestMarker(parsedDest.lat, parsedDest.lng, parsedDest.label || '目的地');
    } else {
      removeDestMarker();
    }
  });
  startRunBtn.addEventListener('click', startWatching);
  stopRunBtn.addEventListener('click', stopWatching);
  if (searchPlaceBtn) {
    searchPlaceBtn.addEventListener('click', async () => {
      const input = document.getElementById('destination');
      const q = input ? input.value : '';
      if (!q.trim()) { addMsg('assistant','请输入地名或经纬度后再搜索。'); return; }
      addMsg('assistant', `正在搜索：${q} ...`);
      const res = await geocodePlace(q);
      if (!res) { addMsg('assistant', '未找到匹配地点。请尝试更具体的名称。'); return; }
      // Switch to destination mode
      const radios = runForm.querySelectorAll('input[name="mode"]');
      radios.forEach(r => { r.checked = (r.value === 'dest'); });
      destField.style.display = '';
      if (input) input.value = res.label;
      state.run.mode = 'dest';
      state.run.destination = res.label;
      state.run.destLabel = res.label;
      state.run.destLat = res.lat; state.run.destLng = res.lng;
      saveRunToStorage();
      updateUi();
      initMapIfNeeded();
      updateDestMarker(res.lat, res.lng, res.label);
      addMsg('assistant', `已设置目的地：${res.label}`);
      // Plan route from current position if available
      const last = state.track[state.track.length-1];
      if (last) {
        planRoute({ lat: last.lat, lng: last.lng }, { lat: res.lat, lng: res.lng });
      }
    });
  }

  clearRunBtn.addEventListener('click', () => {
    // Only clear session metrics; keep age/gender/mode/destination
    state.track = [];
    state.totalDistanceKm = 0;
    state.startTime = null;
    state.run.instPaceMinPerKm = null;
    state.run.avgPaceMinPerKm = null;
    if (state.watchId != null) { try { navigator.geolocation.clearWatch(state.watchId); } catch {} }
    state.watchId = null;
    state.running = false;
    startRunBtn.disabled = false;
    stopRunBtn.disabled = true;
    updateUi();
    clearRouteOnMap();
    addMsg('assistant', '已清空本次跑步记录。');
  });

  // Prefill from storage
  (function prefill() {
    const r = state.run || {};
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.value = v; };
    // gender/age/destination and mode
    set('gender', r.gender || '');
    set('age', r.age || '');
    set('destination', r.destination || '');
    // mode radios
    const mode = r.mode || 'free';
    const radios = runForm.querySelectorAll('input[name="mode"]');
    radios.forEach(radio => { radio.checked = (radio.value === mode); });
    destField.style.display = mode === 'dest' ? '' : 'none';
    // LLM cfg
    try {
      const cfg = JSON.parse(localStorage.getItem('llmCfg') || '{}');
      if (cfg.apiBase) set('openaiBase', cfg.apiBase);
      if (cfg.model) set('modelName', cfg.model);
    } catch {}
  })();

  // Initial prompts / UI
  updateUi();
  initMapIfNeeded();
  addMsg('assistant', '你好！点击“开始跑步”后，我将实时播报当前位置、即时/平均配速，并在目的地模式下提示剩余距离。也可随时向我发问。');

  // Save LLM cfg (key not stored)
  function saveCfg() {
    const cfg = {
      apiBase: (openaiBaseInput?.value || '').trim(),
      model: (modelNameInput?.value || '').trim(),
    };
    localStorage.setItem('llmCfg', JSON.stringify(cfg));
  }
  if (openaiBaseInput) openaiBaseInput.addEventListener('change', saveCfg);
  if (modelNameInput) modelNameInput.addEventListener('change', saveCfg);
})();



// ========================================
// 元气值和哈特心脏系统集成
// ========================================

// 初始化元气值系统
const energySystem = new EnergySystem();

// UI元素引用
const energyBarFill = document.getElementById('energyBarFill');
const energyValue = document.getElementById('energyValue');
const heartIcon = document.getElementById('heartIcon');
const heartPath = document.getElementById('heartPath');
const heartGradStart = document.getElementById('heartGradStart');
const heartGradEnd = document.getElementById('heartGradEnd');
const energyMessage = document.getElementById('energyMessage');

/**
 * 更新元气值UI显示
 */
function updateEnergyUI() {
  const status = energySystem.getDetailedStatus();
  
  // 更新进度条
  if (energyBarFill) {
    energyBarFill.style.width = status.percent;
    energyBarFill.setAttribute('data-level', status.state);
  }
  
  // 更新数值显示
  if (energyValue) {
    energyValue.textContent = status.percent;
    energyValue.setAttribute('data-level', status.state);
  }
  
  // 更新心脏状态
  if (heartIcon) {
    heartIcon.setAttribute('data-state', status.state);
    heartIcon.style.transform = `scale(${status.scale})`;
  }
  
  // 更新心脏颜色渐变
  if (heartGradStart && heartGradEnd) {
    const gradColors = status.gradient.match(/#[0-9A-Fa-f]{6}/g);
    if (gradColors && gradColors.length >= 2) {
      heartGradStart.style.stopColor = gradColors[0];
      heartGradEnd.style.stopColor = gradColors[1];
    }
  }
  
  // 更新激励消息
  if (energyMessage) {
    energyMessage.textContent = status.message;
    energyMessage.style.color = status.color;
  }
}

/**
 * 集成元气值更新到现有的跑步追踪逻辑
 */
(function integrateEnergySystem() {
  // 保存原始的位置更新处理器
  const originalWatchSuccess = state.handleWatchSuccess || function() {};
  
  // 包装位置更新处理器以包含元气值更新
  state.handleWatchSuccess = function(position) {
    // 调用原始处理
    if (typeof originalWatchSuccess === 'function') {
      originalWatchSuccess(position);
    }
    
    // 计算运动指标用于元气值系统
    const metrics = {
      running: state.running,
      instantPace: calculateInstantaneousPace(),
      targetPace: 6.0, // 可以从用户设置获取
      duration: state.running && state.startTime ? 
        Math.floor((Date.now() - state.startTime) / 1000) : 0,
      heartRate: estimateHeartRate(), // 估算心率
      justStopped: !state.running && state.track.length > 0
    };
    
    // 更新元气值
    energySystem.updateEnergy(metrics);
    
    // 更新UI
    updateEnergyUI();
  };
  
  // 计算即时配速（基于最近的位置点）
  function calculateInstantaneousPace() {
    if (state.track.length < 2) return Infinity;
    
    const recentPoints = state.track.slice(-5); // 最近5个点
    let totalDist = 0;
    let totalTime = 0;
    
    for (let i = 1; i < recentPoints.length; i++) {
      const dist = haversineKm(
        recentPoints[i-1].lat, recentPoints[i-1].lng,
        recentPoints[i].lat, recentPoints[i].lng
      );
      const time = (recentPoints[i].timestamp - recentPoints[i-1].timestamp) / 1000;
      totalDist += dist;
      totalTime += time;
    }
    
    if (totalDist <= 0 || totalTime <= 0) return Infinity;
    
    // 返回分钟/公里
    return (totalTime / 60) / totalDist;
  }
  
  // 估算心率（基于配速和年龄）
  function estimateHeartRate() {
    const pace = calculateInstantaneousPace();
    if (!pace || pace === Infinity) return 75;
    
    const age = parseInt(document.getElementById('age')?.value) || 30;
    const maxHR = 220 - age;
    
    // 根据配速估算心率百分比
    let hrPercent = 0.5; // 默认50%最大心率
    
    if (pace < 4) hrPercent = 0.9;       // 非常快
    else if (pace < 5) hrPercent = 0.85; // 快速
    else if (pace < 6) hrPercent = 0.75; // 中等
    else if (pace < 7) hrPercent = 0.65; // 轻松
    else hrPercent = 0.55;                 // 慢跑
    
    return Math.round(maxHR * hrPercent);
  }
  
  // Haversine公式计算距离
  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
})();

// 在开始跑步时重置元气值
const originalStartRun = startRunBtn?.onclick;
if (startRunBtn) {
  startRunBtn.addEventListener('click', function() {
    energySystem.reset();
    updateEnergyUI();
  });
}

// 定期更新元气值（即使没有新的GPS数据）
setInterval(function() {
  if (state.running || state.track.length > 0) {
    const metrics = {
      running: state.running,
      instantPace: Infinity,
      duration: state.running && state.startTime ? 
        Math.floor((Date.now() - state.startTime) / 1000) : 0,
      justStopped: !state.running && state.track.length > 0
    };
    
    energySystem.updateEnergy(metrics);
    updateEnergyUI();
  }
}, 2000); // 每2秒更新一次

// 完成公里数时的元气奖励
function onKilometerCompleted(km) {
  energySystem.addBoost(5, `完成第${km}公里`);
  updateEnergyUI();
  
  // 语音鼓励
  const message = `完成第${km}公里！${energySystem.getMotivationalMessage()}`;
  if (voiceToggle?.checked) {
    speak(message);
  }
}

// 导出供其他模块使用
window.energySystem = energySystem;
window.updateEnergyUI = updateEnergyUI;

console.log('✅ 元气值和哈特心脏系统已初始化');

