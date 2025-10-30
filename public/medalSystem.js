/*
  medalSystem.js
  封装的奖章（勋章）系统，暴露全局对象 window.MedalSystem
  - 定义奖章（key, title, desc, iconSvg）
  - 持久化到 localStorage（按 userId 或默认 local）
  - 渲染面板 & 弹窗提示
  - API: init(options), register(def), award(userId,key,meta), getAwards(userId), hasAward(userId,key), on('award', cb)
  设计目标：独立、轻量、可被 `app.js` 或其他脚本调用而无需在 `app.js` 中加入大量代码。
*/
(function(window, document){
  if (!window) return;
  const STORAGE_PREFIX = 'ai_running_medals_v1:';

  // 默认奖章定义（示例）
  const defaultDefinitions = {
    first_run: {
      key: 'first_run',
      title: '初次出行',
      desc: '完成第一次跑步记录',
      // simple SVG icon (gold medal)
      icon: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="24" r="14" fill="#ffd54a" stroke="#ffb300" stroke-width="2"/><path d="M20 46 L28 34 L36 46" fill="#ffb300" stroke="#bf360c" stroke-width="1"/></svg>'
    },
    total_10km: {
      key: 'total_10km',
      title: '累计 10km',
      desc: '累计跑步距离达到 10 公里',
      icon: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="40" height="40" rx="8" fill="#c8e6c9" stroke="#66bb6a" stroke-width="2"/><text x="32" y="38" font-size="16" text-anchor="middle" fill="#1b5e20">10K</text></svg>'
    },
    streak_7: {
      key: 'streak_7',
      title: '七日打卡',
      desc: '连续打卡 7 天',
      icon: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 8 L40 28 L60 28 L44 40 L52 60 L32 48 L12 60 L20 40 L4 28 L24 28 Z" fill="#90caf9" stroke="#1976d2"/></svg>'
    },
    pb_run: {
      key: 'pb_run',
      title: '个人纪录',
      desc: '获得新的个人最佳成绩',
      icon: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="24" fill="#eee" stroke="#9e9e9e"/><text x="32" y="36" font-size="18" text-anchor="middle" fill="#424242">PB</text></svg>'
    }
  };

  // Styles (injected once)
  const injectStyles = () => {
    if (document.getElementById('medal-system-styles')) return;
    const css = `
    .medal-panel-btn{position:fixed;right:16px;bottom:16px;background:#fff;border:1px solid #ddd;padding:8px;border-radius:28px;box-shadow:0 4px 12px rgba(0,0,0,0.12);cursor:pointer;z-index:9999}
    .medal-panel{position:fixed;right:16px;bottom:64px;width:320px;max-height:60vh;background:#fff;border:1px solid #eee;border-radius:8px;overflow:auto;box-shadow:0 8px 24px rgba(0,0,0,0.14);z-index:9999;padding:12px}
    .medal-item{display:flex;gap:10px;align-items:center;padding:6px;border-bottom:1px solid #f5f5f5}
    .medal-item:last-child{border-bottom:0}
    .medal-icon{width:48px;height:48px;flex:0 0 48px}
    .medal-title{font-weight:600}
    .medal-desc{font-size:12px;color:#666}
    .medal-popup{position:fixed;left:50%;top:20%;transform:translateX(-50%);background:linear-gradient(135deg,#fff8e1,#ffe0b2);padding:12px 16px;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,0.2);z-index:10000;display:flex;gap:12px;align-items:center}
    .medal-popup .medal-icon{width:56px;height:56px}
    `;
    const s = document.createElement('style'); s.id = 'medal-system-styles'; s.textContent = css; document.head.appendChild(s);
  };

  // Storage helpers
  function storageKey(userId){ return STORAGE_PREFIX + (userId ? (String(userId)) : 'local'); }
  function loadAwards(userId){
    try { return JSON.parse(localStorage.getItem(storageKey(userId))||'[]')||[]; } catch { return []; }
  }
  function saveAwards(userId, arr){ try { localStorage.setItem(storageKey(userId), JSON.stringify(arr||[])); } catch {} }

  function createPanel(defs, container){
    const panel = document.createElement('div'); panel.className = 'medal-panel'; panel.style.display = 'none';
    const header = document.createElement('div'); header.style.display='flex'; header.style.justifyContent='space-between'; header.style.alignItems='center'; header.style.marginBottom='6px';
    const hTitle = document.createElement('div'); hTitle.textContent = '我的奖章'; hTitle.style.fontWeight='700'; header.appendChild(hTitle);
    const closeBtn = document.createElement('button'); closeBtn.textContent='关闭'; closeBtn.type='button'; closeBtn.style.cursor='pointer'; closeBtn.addEventListener('click', ()=>panel.style.display='none'); header.appendChild(closeBtn);
    panel.appendChild(header);
    const list = document.createElement('div'); list.id = 'medal-list'; panel.appendChild(list);
    container.appendChild(panel);
    return {panel, list};
  }

  function renderMedalRow(def, awarded){
    const it = document.createElement('div'); it.className='medal-item';
    const iconWrap = document.createElement('div'); iconWrap.className='medal-icon'; iconWrap.innerHTML = def.icon || '';
    const body = document.createElement('div'); body.style.flex='1';
    const t = document.createElement('div'); t.className='medal-title'; t.textContent = def.title || def.key;
    const d = document.createElement('div'); d.className='medal-desc'; d.textContent = def.desc || '';
    body.appendChild(t); body.appendChild(d);
    const badge = document.createElement('div'); badge.style.minWidth='54px'; badge.style.textAlign='right'; badge.style.fontSize='12px'; badge.style.color = awarded ? '#ff6f00' : '#999'; badge.textContent = awarded ? '已获得' : '未获得';
    // share button
    const shareBtn = document.createElement('button'); shareBtn.type='button'; shareBtn.textContent='分享'; shareBtn.title='分享此奖章'; shareBtn.style.marginLeft='8px'; shareBtn.addEventListener('click', ()=>{
      try {
        if (window.ShareSystem && typeof window.ShareSystem.share === 'function') {
          window.ShareSystem.share('medal', { key: def.key, def: def }, { title: `获得奖章：${def.title}`, text: def.desc });
        } else alert('分享系统未加载');
      } catch(e){ console.warn('medal share error', e); }
    });
    const actionsWrap = document.createElement('div'); actionsWrap.style.display='flex'; actionsWrap.style.alignItems='center'; actionsWrap.appendChild(badge); actionsWrap.appendChild(shareBtn);
    it.appendChild(iconWrap); it.appendChild(body); it.appendChild(actionsWrap);
    return it;
  }

  // Popup animation when awarding
  function showAwardPopup(def){
    try {
      const pop = document.createElement('div'); pop.className='medal-popup';
      const icon = document.createElement('div'); icon.className='medal-icon'; icon.innerHTML = def.icon || '';
      const txt = document.createElement('div'); txt.style.fontWeight='700'; txt.textContent = `获得奖章：${def.title}`;
      pop.appendChild(icon); pop.appendChild(txt);
      document.body.appendChild(pop);
      setTimeout(()=>{ pop.style.transition='transform 400ms ease, opacity 400ms ease'; pop.style.transform = 'translateX(-50%) translateY(-10px)'; }, 20);
      setTimeout(()=>{ try{ pop.style.opacity='0'; }catch{} }, 2800);
      setTimeout(()=>{ try{ document.body.removeChild(pop); } catch{} }, 3400);
    } catch (e) { console.warn('showAwardPopup error', e); }
  }

  // The main factory/object
  const MedalSystem = (function(){
    const defs = Object.assign({}, defaultDefinitions);
    const listeners = { award: [] };
    let _container = null; let _panelParts = null; let _userIdForPanel = null;

    function register(def){ if (!def || !def.key) return; defs[def.key] = def; }

    function init(options){
      options = options || {};
      injectStyles();
      const root = options.root || document.body;
      _container = document.createElement('div'); _container.id = 'medal-system-root'; root.appendChild(_container);
      // button
      const btn = document.createElement('button'); btn.className = 'medal-panel-btn'; btn.type='button'; btn.title='打开奖章面板'; btn.innerHTML = '🏅';
      const panelParts = createPanel(defs, _container); _panelParts = panelParts;
      btn.addEventListener('click', ()=>{ panelParts.panel.style.display = (panelParts.panel.style.display==='none'?'block':'none'); renderPanel(_userIdForPanel); });
      _container.appendChild(btn);
      // initial render
      renderPanel(options.userId || null);
    }

    function renderPanel(userId){
      _userIdForPanel = userId || null;
      if (!_panelParts) return;
      const list = _panelParts.list; list.innerHTML = '';
      const awards = loadAwards(userId);
      for (const k of Object.keys(defs)){
        const def = defs[k];
        const awarded = awards.includes(k);
        list.appendChild(renderMedalRow(def, awarded));
      }
    }

    function getAwards(userId){ return loadAwards(userId); }
    function hasAward(userId, key){ const arr = loadAwards(userId); return arr.includes(key); }

    function award(userId, key, meta){
      if (!key) return false;
      const def = defs[key]; if (!def) { console.warn('unknown medal key', key); }
      const arr = loadAwards(userId);
      if (arr.includes(key)) return false; // already awarded
      arr.push(key);
      saveAwards(userId, arr);
      // notify listeners
      listeners.award.forEach(cb=>{ try{ cb({ userId, key, def, meta }); } catch(e){} });
      // popup
      try { showAwardPopup(def || { title: key, icon: '' }); } catch {}
      // offer share after awarding (non-blocking)
      try {
        if (window.ShareSystem && typeof window.ShareSystem.offerShare === 'function') {
          try { window.ShareSystem.offerShare('medal', { def }, { title: `获得奖章：${def.title}`, text: def.desc }); } catch (e) {}
        }
      } catch (e) {}
      // re-render panel if present
      renderPanel(_userIdForPanel);
      return true;
    }

    function on(evt, cb){ if (!listeners[evt]) listeners[evt]=[]; listeners[evt].push(cb); }

    return { register, init, award, getAwards, hasAward, on, _defs: defs };
  })();

  // expose
  window.MedalSystem = MedalSystem;

})(window, document);
