// 轻触唤醒功能
document.getElementById('initial-page').addEventListener('click', () => {
    // 模拟API调用 - 实际项目中替换为真实接口
    const apiStatus = document.getElementById('api-status');
    apiStatus.textContent = '连接中...';
    setTimeout(() => {
        apiStatus.textContent = '已连接';
        // 页面过渡动画 (实际项目中使用Framer Motion)
        document.body.classList.add('opacity-0');
        setTimeout(() => window.location.href = 'home.html', 300);
    }, 1000);
});