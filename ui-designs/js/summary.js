// API接口预留
const api = {
    // 获取跑步总结数据
    getRunSummary: () => {
        // 实际实现将调用后端API
        return new Promise(resolve => {
            setTimeout(() => resolve({
                distance: 5.2,
                duration: 32,
                pace: "6'12\"",
                calories: 320,
                routeData: [],
                achievements: [
                    {id: 1, name: "速度突破", icon: "fa-bolt", color: "primary"},
                    {id: 2, name: "城市探索者", icon: "fa-map-marker", color: "secondary"}
                ],
                aiAnalysis: "你的步频保持在170步/分钟的理想范围，左右平衡良好。建议下次尝试增加1分钟的间歇跑，有助于提升心肺功能。"
            }), 800);
        });
    },
    // 分享跑步成果
    shareRun: () => {
        // 实际实现将调用分享API
        return new Promise(resolve => {
            setTimeout(() => resolve({success: true, shareUrl: "#"}), 500);
        });
    }
};

// 页面加载时获取跑步数据
document.addEventListener('DOMContentLoaded', () => {
    // 显示加载状态
    document.getElementById('routeMap').innerHTML = '<i class="fa fa-spinner fa-spin text-4xl mb-2 block"></i><p>数据加载中...</p>';

    // 获取并显示跑步总结数据
    api.getRunSummary().then(data => {
        // 更新数据显示
        document.getElementById('runDistance').innerHTML = `${data.distance}<span class="text-lg font-normal text-light/70">km</span>`;
        document.getElementById('runDuration').innerHTML = `${data.duration}<span class="text-lg font-normal text-light/70">分钟</span>`;
        document.getElementById('runPace').innerHTML = `${data.pace}<span class="text-lg font-normal text-light/70"></span>`;
        document.getElementById('runCalories').innerHTML = `${data.calories}<span class="text-lg font-normal text-light/70">kcal</span>`;
        document.getElementById('aiAnalysis').textContent = data.aiAnalysis;

        // 更新路线地图（模拟）
        setTimeout(() => {
            document.getElementById('routeMap').innerHTML = '<i class="fa fa-map text-4xl mb-2 block text-primary/50"></i><p class="text-primary/50">路线已加载</p>';
        }, 1000);

        // 创建庆祝效果
        createConfetti();
    });

    // 分享按钮事件
    document.getElementById('shareButton').addEventListener('click', () => {
        window.location.href = 'share-card.html';
    });

    // 返回首页按钮事件
    document.getElementById('homeButton').addEventListener('click', () => {
        window.location.href = 'home.html';
    });

    // 查看详细分析事件
    document.getElementById('viewMoreAnalysis').addEventListener('click', () => {
        // 实际实现将跳转到详细分析页面
        alert('详细分析功能即将上线');
    });
});

// 创建庆祝彩屑效果
function createConfetti() {
    const container = document.getElementById('hartCelebrate');
    const colors = ['#FF6B8B', '#4A90E2', '#FFD700', '#00C853', '#9C27B0'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'px';
        confetti.style.top = Math.random() * 100 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(confetti);

        // 动画效果
        setTimeout(() => {
            confetti.style.opacity = '1';
            confetti.style.transition = 'all 2s ease';
            confetti.style.transform = `translateY(${Math.random() * 200 + 100}px) rotate(${Math.random() * 360}deg)`;
            confetti.style.opacity = '0';

            // 移除元素
            setTimeout(() => confetti.remove(), 2000);
        }, 100);
    }
}