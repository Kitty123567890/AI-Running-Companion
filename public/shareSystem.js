/*
  shareSystem.js
  生成分享卡片（图片）并提供分享 / 下载接口
  API:
    ShareSystem.init(options)
    ShareSystem.createCard(type, data) => Promise<Blob>
    ShareSystem.share(type, data, opts) => Promise<void>

  简单实现：使用 <canvas> 渲染卡片，支持 'medal','checkin','ai','run' 类型。
*/
(function(window, document){
  if (!window) return;

  function hexColorForType(t){
    switch(t){
      case 'medal': return ['#fff8e1','#ffe0b2','#ffd54f'];
      case 'checkin': return ['#e8f5e9','#c8e6c9','#66bb6a'];
      case 'ai': return ['#e3f2fd','#bbdefb','#42a5f5'];
      case 'run': return ['#f3e5f5','#e1bee7','#ab47bc'];
      default: return ['#ffffff','#f5f5f5','#cccccc'];
    }
  }

  async function svgToImage(svgString){
    return new Promise((resolve,reject)=>{
      try {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = ()=>{ URL.revokeObjectURL(url); resolve(img); };
        img.onerror = (e)=>{ URL.revokeObjectURL(url); reject(e); };
        img.src = url;
      } catch(e){ reject(e); }
    });
  }

  function drawWrapText(ctx, text, x, y, maxWidth, lineHeight){
    const words = text.split(/\s+/);
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + (line ? ' ' : '') + words[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, x, y);
    return y;
  }

  async function createCard(type, data, opts){
    opts = opts || {};
    const w = opts.width || 1200;
    const h = opts.height || 675; // 16:9
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const colors = hexColorForType(type);
    // background gradient
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, colors[0]); g.addColorStop(0.6, colors[1]); g.addColorStop(1, colors[2]);
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);

    // Title
    ctx.fillStyle = '#222'; ctx.textBaseline = 'top';
    ctx.font = '48px sans-serif';
    const title = opts.title || ({ medal: '获得奖章', checkin: '今日打卡', ai: '教练建议', run: '跑步记录' })[type] || '分享';
    ctx.fillText(title, 48, 48);

    // content area
    ctx.font = '28px sans-serif'; ctx.fillStyle = '#111';
    if (type === 'medal'){
      const def = data.def || {};
      // left: icon
      try {
        if (def.icon) {
          const img = await svgToImage(def.icon);
          const is = Math.min(240, h-220);
          ctx.drawImage(img, 48, 120, is, is);
        }
      } catch(e){}
      // right: text
      ctx.font = '36px sans-serif'; ctx.fillStyle = '#111';
      ctx.fillText(def.title || def.key || '奖章', 320, 140);
      ctx.font = '22px sans-serif'; ctx.fillStyle = '#222';
      drawWrapText(ctx, def.desc || '', 320, 190, w-380, 32);
    } else if (type === 'checkin'){
      const d = data || {};
      ctx.font = '32px sans-serif'; ctx.fillStyle = '#111';
      ctx.fillText(`打卡日期：${d.date || new Date().toLocaleDateString()}`, 48, 120);
      ctx.fillText(`累计距离：${(d.distanceKm!=null?Number(d.distanceKm).toFixed(2):'-')} 公里`, 48, 170);
      ctx.fillText(`用时：${d.durationMin!=null?d.durationMin+' 分钟':'-'}`, 48, 220);
      if (d.note) { ctx.font='22px sans-serif'; drawWrapText(ctx, `备注：${d.note}`, 48, 270, w-96, 30); }
    } else if (type === 'ai'){
      const text = (data && data.text) || '';
      ctx.font = '28px sans-serif'; ctx.fillStyle = '#111';
      drawWrapText(ctx, text, 48, 120, w-96, 36);
    } else if (type === 'run'){
      const r = data || {};
      ctx.font = '32px sans-serif'; ctx.fillStyle = '#111';
      ctx.fillText(`距离：${r.distanceKm!=null?Number(r.distanceKm).toFixed(2)+' km':'-'}`, 48, 120);
      ctx.fillText(`用时：${r.durationMin!=null?r.durationMin+' 分钟':'-'}`, 48, 170);
      ctx.fillText(`平均配速：${r.avgPace?formatPace(r.avgPace):'-'}`, 48, 220);
      if (r.tips) { ctx.font='22px sans-serif'; drawWrapText(ctx, `点评：${r.tips}`, 48, 270, w-96, 30); }
      // Draw simplified route if track provided (array of {lat,lng})
      try {
        const track = r.track || [];
        if (Array.isArray(track) && track.length >= 2) {
          // Define route box area
          const px = 48; const py = 340; const pw = w - 96; const ph = Math.min(250, h - py - 48);
          // Background
          ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(px, py, pw, ph);
          // compute bbox
          let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
          for (const p of track) { if (p.lat < minLat) minLat = p.lat; if (p.lat > maxLat) maxLat = p.lat; if (p.lng < minLng) minLng = p.lng; if (p.lng > maxLng) maxLng = p.lng; }
          if (!isFinite(minLat) || !isFinite(minLng)) {
            // skip
          } else {
            // pad
            const latPad = (maxLat - minLat) * 0.1 || 0.001;
            const lngPad = (maxLng - minLng) * 0.1 || 0.001;
            minLat -= latPad; maxLat += latPad; minLng -= lngPad; maxLng += lngPad;
            // convert function
            const toX = (lng) => px + ((lng - minLng) / (maxLng - minLng)) * pw;
            const toY = (lat) => py + ph - ((lat - minLat) / (maxLat - minLat)) * ph;
            // draw polyline
            ctx.strokeStyle = '#d32f2f'; ctx.lineWidth = 4; ctx.beginPath();
            for (let i=0;i<track.length;i++){ const p = track[i]; const x = toX(p.lng); const y = toY(p.lat); if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }
            ctx.stroke();
            // start/end markers
            const start = track[0]; const end = track[track.length-1];
            ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.arc(toX(start.lng), toY(start.lat), 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#1565c0'; ctx.beginPath(); ctx.arc(toX(end.lng), toY(end.lat), 6, 0, Math.PI*2); ctx.fill();
          }
        }
      } catch(e) { console.warn('draw route error', e); }
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => { resolve(blob); }, 'image/png', 0.92);
    });
  }

  function formatPace(minPerKm){
    if (!isFinite(minPerKm) || minPerKm<=0) return '-';
    const m = Math.floor(minPerKm); const s = Math.round((minPerKm-m)*60).toString().padStart(2,'0');
    return `${m}:${s}/km`;
  }

  async function share(type, data, opts){
    opts = opts || {};
    try {
      // create image blob
      const blob = await createCard(type, data, opts);
      // show modal preview with share/download controls
      try { showPreviewModal(blob, type, opts); } catch (e) { console.warn('preview modal failed', e); }
      // Also try native share in background when supported
      try {
        const file = new File([blob], `${type}_share.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })){
          await navigator.share({ files: [file], title: opts.title || '分享', text: opts.text || '' });
        }
      } catch (e) { /* ignore native share failure */ }
    } catch (e) {
      console.warn('ShareSystem.share error', e);
      throw e;
    }
  }

  // Modal preview implementation
  function ensureModal(){
    if (document.getElementById('share-system-modal')) return;
    const modal = document.createElement('div'); modal.id = 'share-system-modal';
    modal.style.position = 'fixed'; modal.style.left = '0'; modal.style.top = '0'; modal.style.right = '0'; modal.style.bottom = '0';
    modal.style.display = 'none'; modal.style.alignItems = 'center'; modal.style.justifyContent = 'center'; modal.style.zIndex = '12000';
    modal.style.background = 'rgba(0,0,0,0.45)';
    const box = document.createElement('div'); box.style.width='90%'; box.style.maxWidth='900px'; box.style.background='#fff'; box.style.borderRadius='10px'; box.style.padding='12px'; box.style.boxShadow='0 12px 40px rgba(0,0,0,0.3)'; box.style.display='flex'; box.style.flexDirection='column';
    const imgWrap = document.createElement('div'); imgWrap.style.textAlign='center'; imgWrap.style.padding='8px';
    const img = document.createElement('img'); img.id='share-system-preview-img'; img.style.maxWidth='100%'; img.style.borderRadius='6px'; imgWrap.appendChild(img);
    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.justifyContent='flex-end'; actions.style.gap='8px'; actions.style.marginTop='12px';
    const downloadBtn = document.createElement('button'); downloadBtn.textContent='下载图片'; downloadBtn.type='button';
    const shareBtn = document.createElement('button'); shareBtn.textContent='分享...'; shareBtn.type='button';
    const closeBtn = document.createElement('button'); closeBtn.textContent='关闭'; closeBtn.type='button';
    actions.appendChild(downloadBtn); actions.appendChild(shareBtn); actions.appendChild(closeBtn);
    box.appendChild(imgWrap); box.appendChild(actions); modal.appendChild(box); document.body.appendChild(modal);

    downloadBtn.addEventListener('click', ()=>{
      const src = document.getElementById('share-system-preview-img').src; if (!src) return; const a = document.createElement('a'); a.href = src; a.download = 'share.png'; a.click();
    });
    shareBtn.addEventListener('click', async ()=>{
      try {
        const src = document.getElementById('share-system-preview-img').src; if (!src) return;
        const res = await fetch(src); const blob = await res.blob(); const file = new File([blob], 'share.png', { type: blob.type });
        if (navigator.canShare && navigator.canShare({ files: [file] })){
          await navigator.share({ files: [file], title: '分享', text: '' });
        } else {
          alert('当前浏览器不支持原生分享，请下载后手动分享。');
        }
      } catch(e){ console.warn('modal share error', e); alert('分享失败'); }
    });
    closeBtn.addEventListener('click', ()=>{ modal.style.display='none'; });
  }

  function showPreviewModal(blob, type, opts){
    ensureModal();
    const modal = document.getElementById('share-system-modal');
    const img = document.getElementById('share-system-preview-img');
    const url = URL.createObjectURL(blob);
    img.src = url;
    modal.style.display = 'flex';
    // revoke after some time when closed
    const revoke = () => { try{ URL.revokeObjectURL(url); } catch{} };
    // attach on close detection
    const observer = new MutationObserver((mut)=>{ if (modal.style.display==='none') { revoke(); observer.disconnect(); } });
    observer.observe(modal, { attributes: true, attributeFilter: ['style'] });
  }

  // Offer share: create card and open modal offering share
  async function offerShare(type, data, opts){
    try {
      const blob = await createCard(type, data, opts);
      showPreviewModal(blob, type, opts);
    } catch(e){ console.warn('offerShare failed', e); }
  }

  window.ShareSystem = { init: function(){}, createCard, share, offerShare };

})(window, document);
