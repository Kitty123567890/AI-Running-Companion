// 社交分享卡片交互逻辑
// 后端API接口预留 - 实际实现需替换为真实接口
const api = {
    // 保存分享卡片
    saveShareCard: (data) => {
        return new Promise((resolve) => {
            // 模拟API调用
            setTimeout(() => {
                resolve({ success: true, message: '卡片保存成功' });
            }, 800);
        });
    },
    // 分享到社交平台
    shareToPlatform: (platform, data) => {
        return new Promise((resolve) => {
            // 模拟API调用
            setTimeout(() => {
                resolve({ success: true, platform, shareUrl: 'https://example.com/share/123' });
            }, 1000);
        });
    },
    // 获取跑步数据
    getRunData: () => {
        return new Promise((resolve) => {
            // 模拟API返回数据
            setTimeout(() => {
                resolve({
                    distance: '5.2',
                    duration: '32',
                    pace: '6\'12\"',
                    calories: '320',
                    achievements: [
                        { icon: 'trophy', color: 'primary' },
                        { icon: 'bolt', color: 'secondary' },
                        { icon: 'medal', color: 'textSecondary' }
                    ]
                });
            }, 500);
        });
    },

    // 初始化分享卡片数据
    initShareCard: function() {
        this.getRunData().then(data => {
            // 更新卡片数据
            document.getElementById('shareDistance').textContent = data.distance + 'km';
            document.getElementById('shareDuration').textContent = data.duration + '分钟';
            document.getElementById('sharePace').textContent = data.pace;

            // 渲染成就徽章
            const achievementsContainer = document.querySelector('.flex.justify-center.gap-3');
            achievementsContainer.innerHTML = '';
            data.achievements.forEach(achievement => {
                const badge = document.createElement('div');
                badge.className = `w-10 h-10 rounded-full bg-${achievement.color}/20 border border-${achievement.color}/30 flex items-center justify-center`;
                badge.innerHTML = `<i class="fa fa-${achievement.icon} text-${achievement.color} text-xs"></i>`;
                achievementsContainer.appendChild(badge);
            });
        });
    }
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    // 返回按钮事件
    document.getElementById('backButton').addEventListener('click', function() {
        window.history.back();
    });

    // 保存按钮事件
    document.getElementById('saveButton').addEventListener('click', function() {
        api.saveShareCard().then(result => {
            if (result.success) {
                alert('保存成功！');
            }
        });
    });

    // 分享按钮事件
    document.getElementById('shareToWechat').addEventListener('click', function() {
        api.shareToPlatform('wechat').then(result => {
            if (result.success) {
                alert('微信分享成功！');
            }
        });
    });

    document.getElementById('shareToWeibo').addEventListener('click', function() {
        api.shareToPlatform('weibo').then(result => {
            if (result.success) {
                alert('微博分享成功！');
            }
        });
    });

    document.getElementById('shareToQQ').addEventListener('click', function() {
        api.shareToPlatform('qq').then(result => {
            if (result.success) {
                alert('QQ分享成功！');
            }
        });
    });

    document.getElementById('saveImage').addEventListener('click', function() {
        alert('图片保存功能即将上线，敬请期待！');
    });

    // 初始化分享卡片
    api.initShareCard();
});