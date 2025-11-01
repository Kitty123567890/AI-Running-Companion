// 后端API接口示例
const API_ENDPOINTS = {
    getUserStats: '/api/user/stats',
    getCurrentGoal: '/api/goals/current',
    updateHartEnergy: '/api/hart/energy',
    startRunSession: '/api/runs/start'
};

// 模拟获取用户数据
async function fetchUserData() {
    try {
        // 实际项目中替换为真实API调用
        console.log('Fetching user data from:', API_ENDPOINTS.getUserStats);
        // const response = await fetch(API_ENDPOINTS.getUserStats);
        // const data = await response.json();
        // updateUI(data);
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    fetchUserData();

    // 开始跑步按钮事件
    document.querySelector('button').addEventListener('click', () => {
        console.log('Starting run session via:', API_ENDPOINTS.startRunSession);
        // 跳转到跑步模式选择页面
        window.location.href = 'running-mode-select.html';
    });

    // 当前目标卡片点击事件 - 唤起目标管理
    document.getElementById('currentGoalCard').addEventListener('click', () => {
        console.log('Opening GoalSheet via:', API_ENDPOINTS.getCurrentGoal);
        window.location.href = 'goal-sheet.html';
    });
});