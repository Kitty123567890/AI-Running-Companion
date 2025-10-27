// App bootstrap for AI Running Companion
// - Voice input via Web Speech API (when available)
// - Voice output via speechSynthesis
// - Local rule-based coach (analysis.js)
// - Optional OpenAI API integration if API key is provided

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
    const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = role === 'user' ? 'You' : 'Coach';
    const body = document.createElement('div'); body.className = 'text'; body.textContent = text;
    el.appendChild(meta); el.appendChild(body);
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function renderRunSummary() {
    const r = state.run || {};
    const rows = [];
    if (r.destination) rows.push(`Destination: ${r.destination}`);
    if (r.distance) rows.push(`Distance: ${r.distance} km`);
    if (r.duration) rows.push(`Duration: ${r.duration} min`);
    if (r.avgHr) rows.push(`Avg HR: ${r.avgHr} bpm`);
    if (r.age) rows.push(`Age: ${r.age}`);
    if (r.notes) rows.push(`Notes: ${r.notes}`);
    if (rows.length === 0) {
      runSummary.textContent = 'No run details yet. Add some to get tailored coaching.';
    } else {
      runSummary.innerHTML = rows.map(r => `• ${r}`).join('<br>');
      const tips = window.LocalCoach.analyzeRun(state.run);
      if (tips.length) {
        runSummary.innerHTML += `<br><br><span class="tip">Top tip:</span> ${tips[0]}`;
      }
    }
  }

  function speak(text) {
    if (!voiceToggle.checked) return;
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1; u.lang = navigator.language || 'en-US';
    state.speaking = true;
    u.onend = () => { state.speaking = false; };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const rec = new SR();
    rec.lang = navigator.language || 'en-US';
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
    const useCloud = useOpenAI.checked && openaiKeyInput.value.trim();
    if (useCloud) {
      try {
        const reply = await fetchOpenAI(userText, state.run, openaiKeyInput.value.trim());
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

  async function fetchOpenAI(userText, run, apiKey) {
    // Caution: Using API keys in the browser exposes them to users.
    // For demos only. Consider proxying via your own backend.
    const sys = `You are an expert running coach. Use the user's run data (destination, distance in km, duration in minutes, avg heart rate in bpm, age, and notes) to give concise, practical suggestions. Be supportive and specific. Keep replies under 120 words.`;
    const ctx = `Run Data JSON: ${JSON.stringify(run)}`;
    const messages = [
      { role: 'system', content: sys },
      { role: 'user', content: `${ctx}\n\nUser: ${userText}` }
    ];
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
      })
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim();
  }

  // Event bindings
  chatForm.addEventListener('submit', (e) => { e.preventDefault(); submitMessage(); });
  micBtn.addEventListener('click', () => {
    if (!state.recognition) state.recognition = initRecognition();
    if (!state.recognition) {
      addMsg('assistant', 'Speech recognition not supported in this browser.');
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
      addMsg('assistant', `Updated your run. ${tips[0]}`);
      speak(tips[0]);
    } else {
      addMsg('assistant', 'Run details updated. Add distance/time/HR for tailored tips.');
    }
  });

  clearRunBtn.addEventListener('click', () => {
    state.run = {};
    saveRunToStorage();
    runForm.reset();
    renderRunSummary();
    addMsg('assistant', 'Cleared run details.');
  });

  // Prefill form from storage
  (function prefill() {
    const r = state.run || {};
    const set = (id, v) => { const el = document.getElementById(id); if (el && v != null) el.value = v; };
    set('destination', r.destination);
    set('distance', r.distance);
    set('duration', r.duration);
    set('avgHr', r.avgHr);
    set('age', r.age);
    set('notes', r.notes);
  })();

  // Initial render
  renderRunSummary();
  addMsg('assistant', 'Hi! I’m your AI running companion. Add your run details and ask me anything about pace, heart rate, fueling, or training.');
})();

