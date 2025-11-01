// 返回首页
document.getElementById('backToHome').addEventListener('click', () => {
    window.location.href = 'home.html';
});

// 自由跑模式点击事件
document.querySelector('.particle-bg').parentElement.addEventListener('click', () => {
    // 跳转到跑步模式页面
    window.location.href = 'running-mode.html';
});

// 目的地跑模式点击事件
document.querySelector('.map-line-bg').parentElement.addEventListener('click', () => {
    // 跳转到目的地输入页面
    window.location.href = 'destination-input.html';
});