// 后端API接口示例
const API_ENDPOINTS = {
    getCurrentGoal: '/api/goals/current',
    getGoalRecommendations: '/api/goals/recommendations',
    createGoal: '/api/goals',
    updateGoal: '/api/goals/:id',
    deleteGoal: '/api/goals/:id'
};

// 关闭目标管理面板
document.getElementById('closeGoalSheet').addEventListener('click', () => {
    window.location.href = 'home.html';
});

// 保存目标按钮事件
document.getElementById('saveGoal').addEventListener('click', async () => {
    const distance = document.querySelector('input[type="number"]').value;
    const deadline = document.querySelector('select').value;

    try {
        console.log('Saving goal:', { distance, deadline });
        // 实际项目中替换为真实API调用
        // const response = await fetch(API_ENDPOINTS.createGoal, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ type: 'distance', value: distance, deadline })
        // });
        // if (response.ok) {
        //     alert('目标创建成功！');
        //     window.location.href = 'home.html';
        // }
        alert('目标已保存！\n\n距离: ' + distance + '公里\n期限: ' + deadline);
    } catch (error) {
        console.error('Failed to save goal:', error);
        alert('保存目标失败，请重试');
    }
});

// 模拟获取目标数据
async function fetchGoalData() {
    try {
        // 实际项目中替换为真实API调用
        console.log('Fetching current goal from:', API_ENDPOINTS.getCurrentGoal);
        // const response = await fetch(API_ENDPOINTS.getCurrentGoal);
        // const goal = await response.json();
        // updateGoalUI(goal);
    } catch (error) {
        console.error('Failed to fetch goal data:', error);
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    fetchGoalData();
});