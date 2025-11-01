// 返回按钮事件
document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = 'running-mode-select.html';
});

// 开始导航按钮事件
document.getElementById('startNavButton').addEventListener('click', () => {
    // 跳转到跑步模式页面
    window.location.href = 'running-mode.html';
});

// 为所有地点卡片添加点击事件
document.querySelectorAll('.glass-card').forEach(card => {
    if (!card.closest('header') && !card.closest('footer') && !card.querySelector('input')) {
        card.addEventListener('click', () => {
            // 这里可以添加选中效果
document.querySelectorAll('.glass-card').forEach(c => {
                c.classList.remove('border-2', 'border-primary');
            });
            card.classList.add('border-2', 'border-primary');
        });
    }
});