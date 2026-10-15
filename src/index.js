import './style.css';

const API_KEY = process.env.WEATHER_API_KEY;

// 1. 获取所有 DOM 元素（包含之前和今天的）
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const currentTemp = document.getElementById('current-temp');
const tempRange = document.getElementById('temp-range');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const airQuality = document.getElementById('air-quality');
const mainHero = document.getElementById('main-hero');
const forecastList = document.getElementById('forecast-list');
// 获取错误提示 DOM 元素
const errorBanner = document.getElementById('error-message');

// 显示错误提示的辅助函数
function showError(message) {
  if (errorBanner) {
    errorBanner.textContent = message;
    errorBanner.style.display = 'block'; // 显示错误条
  }
}

// 隐藏错误提示的辅助函数
function hideError() {
  if (errorBanner) {
    errorBanner.textContent = '';
    errorBanner.style.display = 'none'; // 隐藏错误条
  }
}


// 格式化本地日期与时间
function formatDateTime() {
  const now = new Date();
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return now.toLocaleDateString('zh-CN', options);
}

// 2. 异步请求实时天气数据
async function fetchWeather(city) {
  if (!city.trim()) {
    showError('请输入城市名称！');
    return;
  }

  hideError();

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}&lang=zh_cn`;

  try {
    mainHero.classList.add('loading');
    cityName.textContent = '正在查询...';
    searchBtn.disabled = true;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('未找到该城市，请检查拼写是否正确！');
    }

    const data = await response.json();
    renderWeather(data);
    
    // 实时天气成功后，顺便触发多日预报请求
    fetchForecast(city);
  } catch (error) {
    showError(error.message);
    cityName.textContent = '获取失败';
  } finally {
    mainHero.classList.remove('loading');
    searchBtn.disabled = false;
  }
}

// 渲染实时天气数据到页面 DOM
function renderWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  currentDate.textContent = formatDateTime();
  
  const temp = Math.round(data.main.temp);
  const tempMin = Math.round(data.main.temp_min);
  const tempMax = Math.round(data.main.temp_max);

  currentTemp.textContent = `${temp}°C`;
  tempRange.textContent = `最高: ${tempMax}°C / 最低: ${tempMin}°C`;

  const weather = data.weather[0];
  weatherDescription.textContent = weather.description;
  
  weatherIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${data.wind.speed} m/s`;
  airQuality.textContent = `气压 ${data.main.pressure} hPa`;
}

// 3. 异步请求未来多日预报数据
async function fetchForecast(city) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}&lang=zh_cn`;
  
  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) {
      throw new Error('无法获取多日预报数据');
    }
    const data = await response.json();
    renderForecast(data.list);
  } catch (error) {
    console.error('多日预报加载失败:', error);
  }
}

// 渲染多日预报到页面 DOM
function renderForecast(list) {
  forecastList.innerHTML = ''; // 清空旧的预报卡片

  // 过滤出每天中午 12:00 的数据代表当天天气
  const dailyData = list.filter(item => item.dt_txt.includes('12:00:00'));

  dailyData.forEach(item => {
    const dateObj = new Date(item.dt * 1000);
    const weekday = dateObj.toLocaleDateString('zh-CN', { weekday: 'short' }); 
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="day">${weekday}</div>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="天气图标">
      <div class="temp">${temp}°C</div>
    `;
    forecastList.appendChild(card);
  });
}

// 4. 事件监听绑定
searchBtn.addEventListener('click', () => {
  fetchWeather(cityInput.value);
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    fetchWeather(cityInput.value);
  }
});

// 5. 页面加载默认查询北京
fetchWeather('Beijing');