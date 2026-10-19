// المتغيرات العامة
let mapObject = null;
let currentMarker = null;
const tokenKey = "516e2ed5df19346bbe568104e6f82261"; // مفتاح الأوبن ويذر الخاص بك

// Phase 1: DOM Setup & Map Init
document.addEventListener('DOMContentLoaded', () => {
    // 1. تهيئة الخريطة (سنتر الخرطوم، تكبير 6 كما في السلايد 5)
    mapObject = L.map('mapContainer').setView([15.5007, 32.5599], 6);

    // إضافة طبقة الخريطة
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(mapObject);

    // 2. ربط حدث الإرسال للنموذج (بدون onclick - السلايد 6)
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // منع إعادة تحميل الصفحة
        handleSearch();
    });

    // إعادة حساب أبعاد الخريطة في حال تغير حجم الشاشة
    setTimeout(() => { mapObject.invalidateSize(); }, 400);
});

// الدالة الرئيسية للبحث
async function handleSearch() {
    const cityInput = document.getElementById('cityInput').value.trim();
    if (!cityInput) {
        alert("Please enter a location name.");
        return;
    }

    const spinner = document.getElementById('loadingSpinner');
    const resultPanel = document.getElementById('weatherResultPanel');
    
    // إظهار مؤشر التحميل وإخفاء النتائج القديمة
    spinner.classList.remove('hidden');
    resultPanel.classList.add('hidden');

    try {
        // ========================================================
        // Phase 2: Asynchronous Geocoding (جلب الإحداثيات أولاً)
        // ========================================================
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${cityInput}`;
        const geoResponse = await fetch(geocodeUrl);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error("Location not found. Please check spelling.");
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        const officialName = geoData[0].display_name.split(',')[0]; // اسم المدينة الأول فقط

        // ========================================================
        // Phase 3: OpenWeather Fetch (جلب الطقس باستخدام الإحداثيات)
        // ========================================================
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${tokenKey}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error("Weather data currently unavailable.");
        }
        
        const weatherData = await weatherResponse.json();

        // استخراج البيانات
        const temp = Math.round(weatherData.main.temp);
        const humidity = weatherData.main.humidity;
        const wind = weatherData.wind.speed;
        const condMain = weatherData.weather[0].main;
        const condDesc = weatherData.weather[0].description;
        const iconCode = weatherData.weather[0].icon;

        // إخفاء مؤشر التحميل
        spinner.classList.add('hidden');

        // تحديث الكرت الجانبي
        renderSideCardInfo(officialName, temp, condMain, humidity, wind);

        // ========================================================
        // Phase 4 & 5: Map Center, Marker & InfoWindow Render
        // ========================================================
        updateMapAndPopup(parseFloat(lat), parseFloat(lon), officialName, temp, condDesc, humidity, wind, iconCode);

    } catch (error) {
        spinner.classList.add('hidden');
        alert("Error: " + error.message);
    }
}

// دالة تحديث الكرت الجانبي
function renderSideCardInfo(name, temp, condition, humidity, wind) {
    document.getElementById('displayCityName').textContent = name;
    document.getElementById('valTemp').textContent = temp + '°C';
    document.getElementById('valCondition').textContent = condition;
    document.getElementById('valHumidity').textContent = humidity + '%';
    document.getElementById('valWind').textContent = wind + ' m/s';
    
    document.getElementById('weatherResultPanel').classList.remove('hidden');
}

// دالة تحديث الخريطة والنافذة المنبثقة (InfoWindow)
function updateMapAndPopup(lat, lon, cityName, temp, desc, humidity, wind, iconCode) {
    const coords = [lat, lon];
    
    // تحريك الخريطة بسلاسة (animate)
    mapObject.flyTo(coords, 11, { duration: 1.5 });

    // حذف الدبوس القديم إذا وجد
    if (currentMarker) {
        mapObject.removeLayer(currentMarker);
    }

    // إنشاء الدبوس الجديد
    currentMarker = L.marker(coords).addTo(mapObject);

    // رابط أيقونة الطقس الرسمية
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    // بناء هيكل النافذة (HTML) بدون أي onclick
    const popupElement = document.createElement('div');
    popupElement.innerHTML = `
        <div class="popup-city-name">${cityName}</div>
        <div class="popup-weather-main">
            <img src="${iconUrl}" alt="Weather Icon">
            <span class="popup-temp">${temp}°C</span>
        </div>
        <div class="popup-desc">${desc}</div>
        <div class="popup-stats">
            <span>💧 Humidity: ${humidity}%</span>
            <span>💨 Wind: ${wind} m/s</span>
        </div>
        <button id="shareBtn" class="popup-share-btn">Share Weather</button>
    `;

    // إضافة حدث الضغط لزر المشاركة (Strict Separation of Concerns - السلايد 6)
    const shareBtn = popupElement.querySelector('#shareBtn');
    shareBtn.addEventListener('click', () => {
        shareWeatherData(cityName, temp, desc);
    });

    // ربط النافذة بالدبوس وفتحها
    currentMarker.bindPopup(popupElement, {
        maxWidth: 250,
        className: 'custom-weather-popup',
        autoPanPaddingTopLeft: [20, 60] // تحريك الخريطة للأسفل لكي لا تُقطع النافذة
    }).openPopup();
}

// دالة المشاركة (Bonus Feature - السلايد 8)
function shareWeatherData(city, temp, desc) {
    const text = `The weather in ${city} is ${temp}°C with ${desc}. Checked via WeatherMap SPA!`;
    
    if (navigator.share) {
        // استخدام Web Share API (للموبايل)
        navigator.share({
            title: 'WeatherMap Update',
            text: text,
            url: window.location.href
        }).catch((err) => console.log('Error sharing:', err));
    } else {
        // استخدام Clipboard API (للكمبيوتر)
        navigator.clipboard.writeText(text).then(() => {
            alert('Weather copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy text.');
        });
    }
}