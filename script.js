const citySearch = document.getElementById("citySearch");
const buttonContainer = document.getElementById("buttonContainer");

buttonContainer.addEventListener("click", async e => {
    if (e.target.id === "tenDayForecast") {
        forecastDays = 10;
        e.preventDefault();
        displayWeather(citySearch.querySelector('input').value);
    } else if (e.target.id === "currentWeather") {
        forecastDays = 1;
        e.preventDefault();
        displayWeather(citySearch.querySelector('input').value);
    } else {
        e.preventDefault();
        displayElevation(citySearch.querySelector('input').value);
    }
});

async function getLocation(location) {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const cityInfo = {
            name: data.results[0].name,
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude
        }

        return cityInfo;

    } catch (error) {
        throw new Error("Failed to fetch location data");
    }
}

async function getWeather(location) {

    try {
        const { name, latitude, longitude } = await getLocation(location);
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_min,temperature_2m_max,sunrise,sunset&current=temperature_2m,precipitation,rain&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch&forecast_days=${forecastDays}&timezone=auto`);

        if (!weatherResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const weatherData = await weatherResponse.json();

        return weatherData;

    } catch (error) {
        throw new Error("Failed to fetch weather data");
    }
}

async function getElevation(location) {
    try {
        const { name, latitude, longitude } = await getLocation(location);

        const elevationResponse = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`);

        if (!elevationResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const elevationData = await elevationResponse.json();

        return elevationData;

    } catch (error) {
        throw new Error("Failed to fetch elevation data");
    }
}

async function displayElevation(location) {
    try {
        let container = document.getElementById("daily-forecast");
        let cardHTML = "";

        const elevationData = await getElevation(location);

        let cityStart = location[0].toUpperCase();
        let cityEnd = location.slice(1).toLowerCase();
        let formattedLocation = cityStart + cityEnd;

        
        cardHTML += `
        <div class="weather-card">
            <p>The elevation of ${formattedLocation} is ${elevationData.elevation} meters.</p>
        </div>
        `;

        container.innerHTML = cardHTML;


    } catch (error) {
        let container = document.getElementById("daily-forecast");
        let cardHTML = "";
        let errorMessage = "Unable to display elevation data. Please check the spelling of your requested city. If spelling is correct, please try again later.";

        cardHTML += `
        <div class="error-card">
            <h2 class="error-text">
            ${errorMessage}
            </h2>
        </div>
        `;

        container.innerHTML = cardHTML;
    }



}

async function displayWeather(location) {


    try {
        let container = document.getElementById("daily-forecast");
        let cardHTML = "";

        const weatherData = await getWeather(location);

        for (let i = 0; i < forecastDays; i++) {
            cardHTML += `
        <div class="weather-card">
            <h2 class="text-center">${weatherData.daily.time[i].split('2026-')[1].replace('-', '/')}</h2>
            <p>High: ${weatherData.daily.temperature_2m_max[i]}°F</p>
            <p>Low: ${weatherData.daily.temperature_2m_min[i]}°F</p>
            <p>Sunrise: ${weatherData.daily.sunrise[i].split('T')[1]}</p>
            <p>Sunset: ${weatherData.daily.sunset[i].split('T')[1]}</p>
        </div>
        `;
        }
        console.log(weatherData);
        container.innerHTML = cardHTML;
    } catch (error) {
        let container = document.getElementById("daily-forecast");
        let cardHTML = "";
        let errorMessage = "Unable to display weather data. Please check the spelling of your requested city. If spelling is correct, please try again later.";

        cardHTML += `
        <div class="error-card">
            <h2 class="error-text">
            ${errorMessage}
            </h2>
        </div>
        `;

        container.innerHTML = cardHTML;
    }
}