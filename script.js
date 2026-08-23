const API_KEY = "14863b6e748472aac0485df9a1ff6c50";
const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");

const weatherContainer = document.getElementById("weatherContainer");
const forecastContainer = document.getElementById("forecastContainer");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const dateElement = document.getElementById("date");

const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weatherIcon");
const weatherDescription = document.getElementById("weatherDescription");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");
const uvIndex = document.getElementById("uvIndex");
const uvLevel = document.getElementById("uvLevel");

const visibility = document.getElementById("visibility");

const outlookIcon = document.getElementById("outlookIcon");
const outlookTitle = document.getElementById("outlookTitle");
const outlookText = document.getElementById("outlookText");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");


/* ============================================
   DATE
   ============================================ */

function getCurrentDate() {

    return new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

}


/* ============================================
   WEATHER ICON
   ============================================ */

function getWeatherIcon(condition) {

    const text = condition.toLowerCase();

    if (text.includes("thunder")) return "⛈️";
    if (text.includes("drizzle")) return "🌦️";
    if (text.includes("rain")) return "🌧️";
    if (text.includes("snow")) return "❄️";
    if (text.includes("cloud")) return "☁️";

    if (
        text.includes("mist") ||
        text.includes("fog") ||
        text.includes("haze") ||
        text.includes("smoke")
    ) {
        return "🌫️";
    }

    if (text.includes("clear")) return "☀️";

    return "🌤️";

}


/* ============================================
   UV
   ============================================ */

/*
   Your OpenWeather account does not have
   One Call 3.0 access, so we don't make a
   request that will return 401.

   We display this honestly instead.
*/

function displayUVUnavailable() {

    uvIndex.textContent = "—";
    uvLevel.textContent = "Unavailable";

}


/* ============================================
   WEATHER ADVICE
   ============================================ */

function getWeatherAdvice(condition, temp) {

    const text = condition.toLowerCase();

    if (
        text.includes("thunder") ||
        text.includes("storm")
    ) {

        return {
            icon: "⛈️",
            title: "Stormy skies today",
            text:
                "Best to stay indoors, keep cozy, and let the storm pass."
        };

    }


    if (
        text.includes("rain") ||
        text.includes("drizzle")
    ) {

        return {
            icon: "🌧️",
            title: "Rainy day mood",
            text:
                "Grab your umbrella and let the rain set the pace today."
        };

    }


    if (text.includes("snow")) {

        return {
            icon: "❄️",
            title: "A chilly day ahead",
            text:
                "Layer up, stay warm, and keep your cozy essentials close."
        };

    }


    if (text.includes("cloud")) {

        return {
            icon: "☁️",
            title: "A soft, cloudy day",
            text:
                "A light layer should be perfect for a relaxed day outside."
        };

    }


    if (temp >= 35) {

        return {
            icon: "☀️",
            title: "It's a warm one today",
            text:
                "Stay hydrated, find some shade, and definitely don't skip sunscreen."
        };

    }


    if (temp <= 12) {

        return {
            icon: "🧣",
            title: "A cozy little day",
            text:
                "Bundle up, grab something warm, and enjoy your little window to the sky."
        };

    }


    return {
        icon: "☀️",
        title: "Sunny skies ahead",
        text:
            "A little sunshine goes a long way — don't forget to add sunscreen to your routine."
    };

}


/* ============================================
   TIME
   ============================================ */

function formatTime(timestamp) {

    return new Date(timestamp * 1000)
        .toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit"
        });

}


/* ============================================
   DISPLAY CURRENT WEATHER
   ============================================ */

function displayWeather(data) {

    const condition = data.weather[0].main;
    const description = data.weather[0].description;
    const temp = data.main.temp;


    cityName.textContent = data.name;

    countryName.textContent = data.sys.country;

    dateElement.textContent = getCurrentDate();


    temperature.textContent =
        Math.round(temp);


    feelsLike.textContent =
        Math.round(data.main.feels_like) + "°C";


    humidity.textContent =
        data.main.humidity + "%";


    windSpeed.textContent =
        Math.round(data.wind.speed * 3.6) + " km/h";


    visibility.textContent =
        data.visibility
            ? (data.visibility / 1000).toFixed(1) + " km"
            : "N/A";


    weatherDescription.textContent =
        description;


    weatherIcon.textContent =
        getWeatherIcon(condition);


    sunrise.textContent =
        formatTime(data.sys.sunrise);


    sunset.textContent =
        formatTime(data.sys.sunset);


    const advice =
        getWeatherAdvice(condition, temp);


    outlookIcon.textContent =
        advice.icon;

    outlookTitle.textContent =
        advice.title;

    outlookText.textContent =
        advice.text;


    displayUVUnavailable();

}


/* ============================================
   CURRENT WEATHER BY CITY
   ============================================ */

async function getWeatherByCity(city) {

    showLoading();

    errorMessage.textContent = "";


    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );


        if (!response.ok) {
            throw new Error("City not found");
        }


        const data = await response.json();


        displayWeather(data);


        await getForecast(
            data.coord.lat,
            data.coord.lon
        );


        hideLoading();


    } catch (error) {

        hideLoading();

        errorMessage.textContent =
            "Couldn't find that city. Please check the spelling and try again.";

        console.error(error);

    }

}


/* ============================================
   FIVE DAY FORECAST
   ============================================ */

async function getForecast(latitude, longitude) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );


        if (!response.ok) {
            throw new Error("Forecast unavailable");
        }


        const data = await response.json();


        createForecast(data.list);


    } catch (error) {

        console.error("Forecast error:", error);

        forecastContainer.innerHTML =
            "<p>Forecast unavailable right now.</p>";

    }

}


/* ============================================
   CREATE FORECAST
   ============================================ */

function createForecast(forecastData) {

    forecastContainer.innerHTML = "";


    const dailyData = {};


    forecastData.forEach(function (item) {

        const date =
            new Date(item.dt * 1000);


        const dateKey =
            date.toLocaleDateString("en-CA");


        if (!dailyData[dateKey]) {
            dailyData[dateKey] = item;
        }


        const hour =
            date.getHours();


        if (
            hour >= 11 &&
            hour <= 14
        ) {
            dailyData[dateKey] = item;
        }

    });


    const days =
        Object.values(dailyData).slice(0, 5);


    days.forEach(function (item, index) {

        const date =
            new Date(item.dt * 1000);


        const dayName =
            index === 0
                ? "Today"
                : date.toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "short"
                    }
                );


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <div class="forecast-day">
                ${dayName}
            </div>

            <div class="forecast-icon">
                ${getWeatherIcon(item.weather[0].main)}
            </div>

            <div class="forecast-description">
                ${item.weather[0].description}
            </div>

            <div class="forecast-temperature">

                <span class="max-temp">
                    ${Math.round(item.main.temp)}°
                </span>

                <span class="min-temp">
                    ${Math.round(item.main.feels_like)}°
                </span>

            </div>

        `;


        forecastContainer.appendChild(card);

    });

}


/* ============================================
   CURRENT LOCATION
   ============================================ */

function getWeatherByLocation() {

    if (!navigator.geolocation) {

        errorMessage.textContent =
            "Location services are not supported by your browser.";

        return;

    }


    showLoading();

    errorMessage.textContent = "";


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                const response =
                    await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                    );


                if (!response.ok) {
                    throw new Error(
                        "Location weather unavailable"
                    );
                }


                const data =
                    await response.json();


                displayWeather(data);


                await getForecast(
                    latitude,
                    longitude
                );


                hideLoading();


            } catch (error) {

                hideLoading();

                errorMessage.textContent =
                    "Couldn't get the weather for your location.";

                console.error(error);

            }

        },


        function (error) {

            hideLoading();


            if (error.code === 1) {

                errorMessage.textContent =
                    "Location permission was denied. You can search for a city instead.";

            } else {

                errorMessage.textContent =
                    "Couldn't access your location.";

            }

        }

    );

}


/* ============================================
   LOADING
   ============================================ */

function showLoading() {

    if (loading) {
        loading.style.display = "block";
    }

    if (weatherContainer) {
        weatherContainer.style.opacity = "0.5";
    }

}


function hideLoading() {

    if (loading) {
        loading.style.display = "none";
    }

    if (weatherContainer) {
        weatherContainer.style.opacity = "1";
    }

}


/* ============================================
   SEARCH
   ============================================ */

searchButton.addEventListener(
    "click",
    function () {

        const city =
            cityInput.value.trim();


        if (city === "") {

            errorMessage.textContent =
                "Please enter a city name.";

            return;

        }


        getWeatherByCity(city);

    }
);


/* ============================================
   ENTER KEY
   ============================================ */

cityInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {
            searchButton.click();
        }

    }
);


/* ============================================
   LOCATION BUTTON
   ============================================ */

locationButton.addEventListener(
    "click",
    function () {

        getWeatherByLocation();

    }
);


/* ============================================
   START APP
   ============================================ */

getWeatherByCity("New Delhi");