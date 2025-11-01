// 跑步状态管理
let isRunning = false;
let startTime = null;
let timer = null;
let distance = 0;
let calories = 0;

// DOM元素
let startBtn, statusText, timeDisplay, distanceDisplay, paceDisplay, caloriesDisplay;

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

// 格式化配速
function formatPace(pace) {
    if (pace === Infinity || isNaN(pace)) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
}

// 更新跑步数据
function updateRunningData() {
    if (!isRunning) return;

    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    timeDisplay.textContent = formatTime(elapsedSeconds);

    // 模拟距离 (每30秒增加0.1公里)
    distance = (elapsedSeconds / 300).toFixed(2);
    distanceDisplay.textContent = distance;

    // 模拟配速 (6-8分钟/公里)
    const pace = 6 + Math.random() * 2;
    paceDisplay.textContent = formatPace(pace);

    // 模拟卡路里 (每公里消耗60卡路里)
    calories = Math.floor(distance * 60);
    caloriesDisplay.textContent = calories;
}

// 切换跑步状态
function toggleRunning() {
    isRunning = !isRunning;

    if (isRunning) {
        // 开始跑步
        startTime = Date.now();
        statusText.textContent = '跑步中...';
        startBtn.innerHTML = '<i class="fa fa-pause mr-2"></i>暂停跑步';
        startBtn.classList.remove('bg-primary');
        startBtn.classList.add('bg-red-500');
        timer = setInterval(updateRunningData, 1000);
        // 隐藏结束跑步按钮
        document.getElementById('endBtn').classList.add('hidden');
    } else {
        // 暂停跑步
        clearInterval(timer);
        statusText.textContent = '已暂停';
        startBtn.innerHTML = '<i class="fa fa-play mr-2"></i>继续跑步';
        startBtn.classList.remove('bg-red-500');
        startBtn.classList.add('bg-primary');
        // 显示结束跑步按钮
        document.getElementById('endBtn').classList.remove('hidden');
    }
}

// 结束跑步
function endRunning() {
    // 结束跑步逻辑
    isRunning = false;
    clearInterval(timer);
    statusText.textContent = '跑步结束';
    // 隐藏结束按钮
    document.getElementById('endBtn').classList.add('hidden');
    // 重置按钮为开始状态
    startBtn.innerHTML = '<i class="fa fa-play mr-2"></i>开始跑步';
    startBtn.classList.remove('bg-red-500');
    startBtn.classList.add('bg-primary');
    // 重置数据
    distance = 0;
    calories = 0;
    timeDisplay.textContent = '0:00';
    distanceDisplay.textContent = '0.00';
    paceDisplay.textContent = '--:--';
    caloriesDisplay.textContent = '0';
    // 跳转到跑步总结页
    window.location.href = 'summary.html';
}

// API接口占位
const api = {
    // 获取用户历史数据
    fetchHistory: () => {
        // 实际实现将调用后端API
        return new Promise(resolve => {
            setTimeout(() => resolve([]), 500);
        });
    },
    // 保存跑步记录
    saveRun: (data) => {
        // 实际实现将调用后端API
        return new Promise(resolve => {
            setTimeout(() => resolve({ success: true, id: Date.now() }), 500);
        });
    },
    // 获取实时天气
    fetchWeather: () => {
        // 实际实现将调用后端API
        return new Promise(resolve => {
            setTimeout(() => resolve({ temp: 22, condition: '晴朗' }), 500);
        });
    }
};

// 初始化
function init() {
    // 获取DOM元素
    startBtn = document.getElementById('startBtn');
    statusText = document.getElementById('statusText');
    timeDisplay = document.getElementById('time');
    distanceDisplay = document.getElementById('distance');
    paceDisplay = document.getElementById('pace');
    caloriesDisplay = document.getElementById('calories');

    // 添加事件监听器
    startBtn.addEventListener('click', toggleRunning);
    document.getElementById('endBtn').addEventListener('click', endRunning);

    // 预加载数据
    api.fetchHistory();
    api.fetchWeather();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);