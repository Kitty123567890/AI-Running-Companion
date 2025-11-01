// 对话详情页面交互逻辑

// API接口定义
const API_ENDPOINTS = {
    getChatDetail: '/api/chat/detail',
    deleteChatRecord: '/api/chat/delete'
};

// DOM元素引用
const elements = {
    backButton: document.getElementById('backButton')
};

// 获取URL参数
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        chatId: params.get('id')
    };
}

// 页面初始化
function initPage() {
    bindEvents();
    const { chatId } = getUrlParams();
    if (chatId) {
        loadChatDetail(chatId);
    } else {
        console.error('未找到对话ID');
        // 可以重定向到对话历史页面
    }
}

// 绑定事件
function bindEvents() {
    // 返回按钮事件
    elements.backButton.addEventListener('click', () => {
        window.location.href = 'chat-history.html';
    });
}

// 加载对话详情（模拟）
function loadChatDetail(chatId) {
    // 实际项目中替换为真实API调用
    console.log(`Loading chat detail for ID: ${chatId} from:`, API_ENDPOINTS.getChatDetail);

    // 模拟数据 - 实际项目中从API获取
    const mockChatDetail = {
        id: chatId,
        title: '赛前准备建议',
        time: '2023-11-25 08:30',
        messages: [
            { role: 'system', content: '明天有马拉松比赛，需要做好赛前准备。建议你今天进行轻度拉伸，保证充足睡眠，赛前2小时进食易消化的碳水化合物。' },
            { role: 'user', content: '谢谢！那比赛当天需要提前多久到达赛场？' },
            { role: 'system', content: '建议提前1.5-2小时到达，以便完成检录、存包和热身。记得穿舒适的跑鞋，佩戴号码布，并根据天气情况调整服装。' },
            { role: 'system', content: '比赛中注意保持均匀呼吸，前5公里不要冲太快。每5公里补充一次水分，感觉不适立即减速并向医疗站求助。' },
            { role: 'user', content: '明白了，谢谢你的建议！' },
            { role: 'system', content: '不客气！祝你比赛顺利，取得好成绩！赛后记得进行冷身和拉伸，补充蛋白质和碳水化合物帮助恢复。' }
        ]
    };

    // 这里可以添加动态渲染对话详情的代码
    // 由于HTML中已有静态示例，此处仅作API演示
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);