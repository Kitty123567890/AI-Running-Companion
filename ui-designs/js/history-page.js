// 历史记录 & 成就墙页面交互逻辑
// 后端API接口预留 - 实际实现需替换为真实接口
const API_ENDPOINTS = {
    getRunningHistory: '/api/history',
    getAchievements: '/api/achievements',
    getUserStats: '/api/user/stats'
};

// DOM元素引用
const elements = {
    historyTab: document.getElementById('historyTab'),
    achievementsTab: document.getElementById('achievementsTab'),
    historyContent: document.getElementById('historyContent'),
    achievementsContent: document.getElementById('achievementsContent'),
    backButton: document.getElementById('backButton')
};

// 初始化页面
function initPage() {
    // 绑定事件监听器
    bindEventListeners();
    // 加载数据
    loadHistoryData();
    loadAchievementsData();
    loadUserStats();
}

// 绑定事件监听器
function bindEventListeners() {
    // 选项卡切换
    elements.historyTab.addEventListener('click', () => switchTab('history'));
    elements.achievementsTab.addEventListener('click', () => switchTab('achievements'));
    // 返回按钮
    elements.backButton.addEventListener('click', () => window.location.href = 'home.html');
}

// 切换选项卡
function switchTab(tabName) {
    if (tabName === 'history') {
        elements.historyTab.classList.add('text-primary', 'border-primary');
        elements.historyTab.classList.remove('text-textSecondary');
        elements.achievementsTab.classList.remove('text-primary', 'border-primary');
        elements.achievementsTab.classList.add('text-textSecondary');
        elements.historyContent.classList.remove('hidden');
        elements.achievementsContent.classList.add('hidden');
    } else {
        elements.achievementsTab.classList.add('text-primary', 'border-primary');
        elements.achievementsTab.classList.remove('text-textSecondary');
        elements.historyTab.classList.remove('text-primary', 'border-primary');
        elements.historyTab.classList.add('text-textSecondary');
        elements.achievementsContent.classList.remove('hidden');
        elements.historyContent.classList.add('hidden');
    }
}

// 加载历史记录数据
async function loadHistoryData() {
    try {
        // 模拟API调用
        console.log('Fetching running history from:', API_ENDPOINTS.getRunningHistory);
        // const response = await fetch(API_ENDPOINTS.getRunningHistory);
        // const data = await response.json();
        // renderHistory(data);

        // 模拟数据渲染
        renderHistory(mockHistoryData);
    } catch (error) {
        console.error('Failed to load running history:', error);
    }
}

// 加载成就数据
async function loadAchievementsData() {
    try {
        // 模拟API调用
        console.log('Fetching achievements from:', API_ENDPOINTS.getAchievements);
        // const response = await fetch(API_ENDPOINTS.getAchievements);
        // const data = await response.json();
        // renderAchievements(data);

        // 模拟数据渲染
        renderAchievements(mockAchievementsData);
    } catch (error) {
        console.error('Failed to load achievements:', error);
    }
}

// 加载用户统计数据
async function loadUserStats() {
    try {
        // 模拟API调用
        console.log('Fetching user stats from:', API_ENDPOINTS.getUserStats);
        // const response = await fetch(API_ENDPOINTS.getUserStats);
        // const data = await response.json();
        // updateUserStats(data);

        // 模拟数据更新
        updateUserStats(mockUserStats);
    } catch (error) {
        console.error('Failed to load user stats:', error);
    }
}

// 渲染历史记录
function renderHistory(data) {
    const historyContent = elements.historyContent;
    historyContent.innerHTML = '';

    // 按月份分组数据
    const groupedData = groupByMonth(data);

    // 渲染每个月份组
    Object.keys(groupedData).forEach(month => {
        const monthGroup = document.createElement('div');
        monthGroup.className = 'mb-8';
        monthGroup.innerHTML = `
            <h2 class="text-textTertiary text-sm font-medium mb-4">${month}</h2>
            <div class="space-y-3">${renderHistoryItems(groupedData[month])}</div>
        `;
        historyContent.appendChild(monthGroup);
    });
}

// 按月份分组历史数据
function groupByMonth(data) {
    const groups = {};
    data.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
        if (!groups[monthKey]) groups[monthKey] = [];
        groups[monthKey].push(item);
    });
    return groups;
}

// 渲染历史记录项
function renderHistoryItems(items) {
    return items.map(item => {
        const date = new Date(item.date);
        const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;
        return `
            <div class="glass-card rounded-xl p-4 card-hover history-item">
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center">
                        <i class="fa fa-calendar-o text-primary mr-2"></i>
                        <span class="text-sm">${formattedDate}</span>
                    </div>
                    <span class="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">${item.distance}km</span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center text-sm mt-3">
                    <div>
                        <p class="text-textTertiary text-xs mb-1">时长</p>
                        <p>${item.duration}分钟</p>
                    </div>
                    <div>
                        <p class="text-textTertiary text-xs mb-1">配速</p>
                        <p>${item.pace}</p>
                    </div>
                    <div>
                        <p class="text-textTertiary text-xs mb-1">消耗</p>
                        <p>${item.calories}千卡</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染成就墙
function renderAchievements(achievements) {
    // 更新成就统计
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const progressPercent = (unlockedCount / totalCount) * 100;

    document.querySelector('#achievementsContent .text-4xl').innerHTML = 
        `${unlockedCount}<span class="text-base text-textSecondary font-normal">/${totalCount}</span>`;
    document.querySelector('#achievementsContent .bg-primary').style.width = `${progressPercent}%`;

    // 渲染成就卡片
    const achievementsGrid = document.querySelector('#achievementsContent .grid');
    achievementsGrid.innerHTML = achievements.map(achievement => `
        <div class="achievement-card ${achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked'} glass-card rounded-xl p-4 flex flex-col items-center text-center card-hover">
            <div class="w-16 h-16 rounded-full ${achievement.unlocked ? 'bg-primary/20' : 'bg-white/10'} flex items-center justify-center mb-3">
                <i class="fa fa-${achievement.icon} text-2xl ${achievement.unlocked ? 'text-primary' : 'text-textTertiary'}"></i>
            </div>
            <h3 class="text-sm font-medium mb-1 ${!achievement.unlocked ? 'text-textSecondary' : ''}">${achievement.name}</h3>
            <p class="text-xs text-textTertiary">${achievement.description}</p>
        </div>
    `).join('');
}

// 更新用户统计数据
function updateUserStats(stats) {
    const statsElements = document.querySelectorAll('footer .text-center .text-lg.font-semibold.text-primary');
    if (statsElements.length === 3) {
        statsElements[0].textContent = stats.totalDistance + 'km';
        statsElements[1].textContent = stats.totalRuns + '次';
        statsElements[2].textContent = stats.totalCalories.toLocaleString() + '千卡';
    } else {
        console.error('未能找到所有统计元素，找到 ' + statsElements.length + ' 个元素');
    }
}

// 模拟数据
const mockHistoryData = [
    { date: '2023-11-25', distance: '5.2', duration: '32', pace: '6\'12\"', calories: '320' },
    { date: '2023-11-23', distance: '3.8', duration: '22', pace: '5\'48\"', calories: '245' },
    { date: '2023-11-20', distance: '4.5', duration: '28', pace: '6\'08\"', calories: '290' },
    { date: '2023-10-30', distance: '6.5', duration: '40', pace: '6\'10\"', calories: '410' },
    { date: '2023-10-28', distance: '3.2', duration: '18', pace: '5\'45\"', calories: '205' }
];

const mockAchievementsData = [
    { id: 1, name: '初露锋芒', description: '完成首次跑步', icon: 'trophy', unlocked: true },
    { id: 2, name: '燃烧卡路里', description: '累计消耗1000千卡', icon: 'fire', unlocked: true },
    { id: 3, name: '坚持不懈', description: '连续跑步5天', icon: 'calendar-check-o', unlocked: true },
    { id: 4, name: '马拉松精神', description: '单次跑步21km', icon: 'flag', unlocked: false },
    { id: 5, name: '耐力王者', description: '单次跑步60分钟', icon: 'clock-o', unlocked: false },
    { id: 6, name: '速度达人', description: '配速达到5分钟/公里', icon: 'line-chart', unlocked: false },
    { id: 7, name: '周末跑者', description: '周末完成3次跑步', icon: 'sun-o', unlocked: true },
    { id: 8, name: '里程突破', description: '累计跑步100km', icon: 'map-signs', unlocked: true },
    { id: 9, name: '夜跑达人', description: '完成5次夜跑', icon: 'moon-o', unlocked: true },
    { id: 10, name: '早起鸟儿', description: '连续3天7点前跑步', icon: 'coffee', unlocked: true },
    { id: 11, name: '雨战勇士', description: '雨天完成跑步', icon: 'cloud-rain', unlocked: false },
    { id: 12, name: '团队精神', description: '与好友一起跑步', icon: 'users', unlocked: false }
];

const mockUserStats = {
    totalDistance: '128.5',
    totalRuns: 42,
    totalCalories: 8560
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initPage);