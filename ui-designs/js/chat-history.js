// 对话历史页面交互逻辑

// API接口定义
const API_ENDPOINTS = {
    getChatHistory: '/api/chat/history',
    getChatDetail: '/api/chat/detail'
};

// DOM元素引用
const elements = {
    backButton: document.getElementById('backButton'),
    chatRecords: document.querySelectorAll('.chat-record')
};

// 页面初始化
function initPage() {
    bindEvents();
    loadChatHistory();
}

// 绑定事件
function bindEvents() {
    // 返回按钮事件
    elements.backButton.addEventListener('click', () => {
        window.location.href = 'home.html';
    });

    // 对话记录点击事件
    elements.chatRecords.forEach(record => {
        record.addEventListener('click', () => {
            const chatId = record.dataset.id;
            window.location.href = `chat-detail.html?id=${chatId}`;
        });
    });
}

// 加载对话历史（模拟）
function loadChatHistory() {
    // 实际项目中替换为真实API调用
    console.log('Loading chat history from:', API_ENDPOINTS.getChatHistory);

    // 模拟数据
    const mockChatHistory = [
        { id: 1, title: '赛前准备建议', time: '2023-11-25 08:30', preview: '明天有马拉松比赛，需要做好赛前准备...' },
        { id: 2, title: '跑步姿势纠正', time: '2023-11-20 19:45', preview: '你的跑步姿势需要调整，注意膝盖不要内扣...' },
        { id: 3, title: '赛后恢复计划', time: '2023-11-15 16:20', preview: '长跑后需要进行适当的拉伸和恢复训练...' },
        { id: 4, title: '训练计划制定', time: '2023-11-10 10:15', preview: '根据你的目标，我为你制定了一份8周训练计划...' },
        { id: 5, title: '饮食营养建议', time: '2023-11-05 14:30', preview: '跑步者需要注意蛋白质和碳水的摄入比例...' }
    ];

    // 这里可以添加动态渲染对话历史列表的代码
    // 由于HTML中已有静态示例，此处仅作API演示
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);