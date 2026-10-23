
let mapObject = null;
let currentMarker = null;
const tokenKey = "516e2ed5df19346bbe568104e6f82261"; 

document.addEventListener('DOMContentLoaded', () => {
  
    mapObject = L.map('mapContainer').setView([15.5007, 32.5599], 6);

  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(mapObject);

 
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        handleSearch();
    });

   
    setTimeout(() => { mapObject.invalidateSize(); }, 400);
});

async function handleSearch() {
    const cityInput = document.getElementById('cityInput').value.trim();
    if (!cityInput) {
        alert("Please enter a location name.");
        return;
    }

    const spinner = document.getElementById('loadingSpinner');
    const resultPanel = document.getElementById('weatherResultPanel');
    
    
    spinner.classList.remove('hidden');
    resultPanel.classList.add('hidden');

    try {
        
     
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${cityInput}`;
        const geoResponse = await fetch(geocodeUrl);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error("Location not found. Please check spelling.");
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;
        const officialName = geoData[0].display_name.split(',')[0];

      
     
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${tokenKey}&units=metric`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error("Weather data currently unavailable.");
        }
        
        const weatherData = await weatherResponse.json();

        
        const temp = Math.round(weatherData.main.temp);
        const humidity = weatherData.main.humidity;
        const wind = weatherData.wind.speed;
        const condMain = weatherData.weather[0].main;
        const condDesc = weatherData.weather[0].description;
        const iconCode = weatherData.weather[0].icon;

       
        spinner.classList.add('hidden');

        
        renderSideCardInfo(officialName, temp, condMain, humidity, wind);

       
        updateMapAndPopup(parseFloat(lat), parseFloat(lon), officialName, temp, condDesc, humidity, wind, iconCode);

    } catch (error) {
        spinner.classList.add('hidden');
        alert("Error: " + error.message);
    }
}


function renderSideCardInfo(name, temp, condition, humidity, wind) {
    document.getElementById('displayCityName').textContent = name;
    document.getElementById('valTemp').textContent = temp + '°C';
    document.getElementById('valCondition').textContent = condition;
    document.getElementById('valHumidity').textContent = humidity + '%';
    document.getElementById('valWind').textContent = wind + ' m/s';
    
    document.getElementById('weatherResultPanel').classList.remove('hidden');
}

function updateMapAndPopup(lat, lon, cityName, temp, desc, humidity, wind, iconCode) {
    const coords = [lat, lon];
    
    
    mapObject.flyTo(coords, 11, { duration: 1.5 });

   
    if (currentMarker) {
        mapObject.removeLayer(currentMarker);
    }

    
    currentMarker = L.marker(coords).addTo(mapObject);

    
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

   
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

   
    const shareBtn = popupElement.querySelector('#shareBtn');
    shareBtn.addEventListener('click', () => {
        shareWeatherData(cityName, temp, desc);
    });

    
    currentMarker.bindPopup(popupElement, {
        maxWidth: 250,
        className: 'custom-weather-popup',
        autoPanPaddingTopLeft: [20, 60] 
    }).openPopup();
}


function shareWeatherData(city, temp, desc) {
    const text = `The weather in ${city} is ${temp}°C with ${desc}. Checked via WeatherMap SPA!`;
    
    if (navigator.share) {
     
        navigator.share({
            title: 'WeatherMap Update',
            text: text,
            url: window.location.href
        }).catch((err) => console.log('Error sharing:', err));
    } else {
     
        navigator.clipboard.writeText(text).then(() => {
            alert('Weather copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy text.');
        });
    }
}
