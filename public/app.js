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
  const runSummary = document.getElementById('runSummary');

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
    messages: []
  };

  function loadRunFromStorage() {
    try { return JSON.parse(localStorage.getItem('run') || '{}'); } catch { return {}; }
  }
  function saveRunToStorage() {
    localStorage.setItem('run', JSON.stringify(state.run || {}));
  }

  // UI helpers
  function addMsg(role, text) {
    const el = document.createElement('div');
    el.className = `msg ${role === 'user' ? 'me' : 'coach'}`;
    const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = role === 'user' ? '你' : '教练';
    const body = document.createElement('div'); body.className = 'text'; body.textContent = text;
    el.appendChild(meta); el.appendChild(body);
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function renderRunSummary() {
    const r = state.run || {};
    const rows = [];
    if (r.destination) rows.push(`目的地：${r.destination}`);
    if (r.distance) rows.push(`距离：${r.distance} 公里`);
    if (r.duration) rows.push(`时长：${r.duration} 分钟`);
    if (r.avgHr) rows.push(`平均心率：${r.avgHr} 次/分`);
    if (r.age) rows.push(`年龄：${r.age}`);
    if (r.notes) rows.push(`备注：${r.notes}`);
    if (rows.length === 0) {
      runSummary.textContent = '还没有跑步数据。填写后可获得个性化建议。';
    } else {
      runSummary.innerHTML = rows.map(r => `• ${r}`).join('<br>');
      const tips = window.LocalCoach.analyzeRun(state.run);
      if (tips.length) {
        runSummary.innerHTML += `<br><br><span class="tip">重点建议：</span> ${tips[0]}`;
      }
    }
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
    const sys = `你是一名专业的跑步教练。请结合用户的跑步数据（目的地、距离km、时长min、平均心率bpm、年龄和备注）给出简洁、具体、可执行的中文建议，语气支持且不夸张。单次回复不超过120字。`;
    const ctx = `跑步数据 JSON：${JSON.stringify(run)}`;
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

  // 事件绑定
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

  runForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(runForm);
    state.run = {
      destination: (fd.get('destination') || '').toString().trim(),
      distance: (fd.get('distance') || '').toString().trim(),
      duration: (fd.get('duration') || '').toString().trim(),
      avgHr: (fd.get('avgHr') || '').toString().trim(),
      age: (fd.get('age') || '').toString().trim(),
      notes: (fd.get('notes') || '').toString().trim(),
    };
    saveRunToStorage();
    renderRunSummary();
    const tips = window.LocalCoach.analyzeRun(state.run);
    if (tips.length) {
      addMsg('assistant', `已更新你的跑步记录。${tips[0]}`);
      speak(tips[0]);
    } else {
      addMsg('assistant', '已更新跑步数据。添加距离/时长/心率可获得更具体的建议。');
    }
  });

  clearRunBtn.addEventListener('click', () => {
    state.run = {};
    saveRunToStorage();
    runForm.reset();
    renderRunSummary();
    addMsg('assistant', '已清空跑步数据。');
  });

  // 表单预填
  (function prefill() {
    const r = state.run || {};
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.value = v; };
    set('destination', r.destination);
    set('distance', r.distance);
    set('duration', r.duration);
    set('avgHr', r.avgHr);
    set('age', r.age);
    set('notes', r.notes);
    // 从 localStorage 读取 LLM 配置
    try {
      const cfg = JSON.parse(localStorage.getItem('llmCfg') || '{}');
      if (cfg.apiBase) set('openaiBase', cfg.apiBase);
      if (cfg.model) set('modelName', cfg.model);
    } catch {}
  })();

  // 初始提示
  renderRunSummary();
  addMsg('assistant', '你好！我是你的 AI 跑步教练。填写跑步数据后，随时可以向我询问配速、心率、补水补给或训练建议。');

  // 保存 LLM 配置（不默认保存密钥）
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

