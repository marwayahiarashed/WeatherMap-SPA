WeatherMap SPA Project
Student Name: Marwa Yahia Rashed
Course: Advanced Web Technologies

About The Project:
I created this Single Page Application for my course project. The app allows the user to type a city name. It uses the Nominatim API to get the exact coordinates (latitude and longitude) of the city. Then, it uses these coordinates to fetch live weather data from the OpenWeatherMap API. Everything happens asynchronously without reloading the page.

How It Works (Features):
- The map is initialized using Leaflet.js and OpenStreetMap.
- It uses fetch() and event.preventDefault() to keep it as a Single Page Application.
- The InfoWindow is designed with a dark blue background to match the project requirements. It shows the city name, temperature, humidity, wind speed, and the official OpenWeather icon.
- I added a "Share Weather" button inside the popup as a bonus feature. It uses the Web Share API to share the weather text on mobile.
- The JavaScript code is separated from HTML and CSS completely. I used addEventListener instead of inline onclick.

Technologies Used:
HTML, CSS, Vanilla JavaScript, Leaflet.js Library, Nominatim Geocoding, OpenWeatherMap API.

Live Demo:
https://marwayahiarashed.github.io/WeatherMap-SPA/
