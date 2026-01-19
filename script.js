'use strict';
// Strict mode helps catch common JS mistakes (like using undeclared variables)

const apiKey = 'a87afbcafc20088be7a1c46175ba1cbb';
// Your OpenWeather API key. Keep it secret in real projects.

// ----------------------- DOM SELECTORS -----------------------
const cityInput = document.querySelector('.search-input');
// Input field where user types the city name

const searchBtn = document.querySelector('.search-button');
// Button to trigger search

// Sections to show/hide
const weatherInfoSection = document.querySelector('.weather-info');
const searchCitySection = document.querySelector('.search-city');
const cityNotFoundSection = document.querySelector('.not-found');

// Elements to display weather info
const countryText = document.querySelector('.country-text');
const dateText = document.querySelector('.current-date-txt');
const tempText = document.querySelector('.temp-text');
const conditionText = document.querySelector('.condition-text');
const humidityText = document.querySelector('.humidity-value-txt');
const windText = document.querySelector('.wind-value-txt');
const weatherSummaryImage = document.querySelector('.weather-summary-image');

// Container for 5-day forecast items
const forecastItemsContainer = document.querySelector(
  '.forecast-items-container'
);

// ----------------------- EVENT LISTENERS -----------------------
searchBtn.addEventListener('click', () => {
  // When search button is clicked
  if (cityInput.value.trim() !== '') {
    // Only run if input is not empty
    updateWeatherInfo(cityInput.value); // Call function to fetch weather
    cityInput.value = ''; // Clear input field
    cityInput.blur(); // Remove focus from input field
  }
});

cityInput.addEventListener('keydown', e => {
  // Trigger search when Enter key is pressed
  if (e.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

// ----------------------- FETCH DATA FUNCTION -----------------------
async function getFetchData(endPoint, city) {
  // Fetch data from OpenWeather API
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl); // Await fetch call
  return response.json(); // Convert response to JSON
}

// ----------------------- WEATHER ICON FUNCTION -----------------------
function getWeatherIcon(id) {
  // Returns icon file name based on weather condition code
  if (id >= 200 && id <= 232) return 'thunderstorm.svg';
  if (id >= 300 && id <= 321) return 'drizzle.svg';
  if (id >= 500 && id <= 531) return 'rain.svg';
  if (id >= 600 && id <= 622) return 'snow.svg';
  if (id >= 701 && id <= 781) return 'atmosphere.svg';
  if (id === 800) return 'clear.svg';
  if (id >= 801 && id <= 804) return 'clouds.svg';
}

// ----------------------- GET CURRENT DATE -----------------------
function getCurrentDate() {
  const currentDate = new Date(); // Create new Date object
  const options = {
    weekday: 'short', // Short form of day, e.g., Mon, Tue
    day: '2-digit', // Two-digit day, e.g., 01, 23
    month: 'short', // Short month, e.g., Jan, Oct
  };
  return currentDate.toLocaleDateString('en-GB', options);
  // Formats date using the options above
}

// ----------------------- UPDATE MAIN WEATHER INFO -----------------------
async function updateWeatherInfo(city) {
  const weatherData = await getFetchData('weather', city);
  // Fetch current weather

  if (weatherData.cod !== 200) {
    // If city not found
    showDisplaySection(cityNotFoundSection);
    return;
  }

  console.log(weatherData); // Debugging: see API response

  // ----------------------- DESTRUCTURING WEATHER DATA -----------------------
  const {
    name: country,
    main: { temp, humidity },
    weather: [{ id, main }], // First weather condition
    wind: { speed },
  } = weatherData;

  // ----------------------- DISPLAY WEATHER INFO -----------------------
  countryText.textContent = country; // City/country name
  tempText.textContent = Math.round(temp) + ' °C'; // Temperature
  humidityText.textContent = humidity + '%'; // Humidity
  conditionText.textContent = main; // Weather condition
  windText.textContent = speed + ' M/s'; // Wind speed
  weatherSummaryImage.src = `./assets/weather/${getWeatherIcon(id)}`;
  dateText.textContent = getCurrentDate(); // Current date

  // ----------------------- UPDATE FORECAST -----------------------
  await updateForecastInfo(city); // Fetch and display 4-day forecast
  showDisplaySection(weatherInfoSection); // Show main weather section
}

// ----------------------- UPDATE FORECAST FUNCTION -----------------------
async function updateForecastInfo(city) {
  const forecastData = await getFetchData('forecast', city);
  //console.log(forecastData);
  // Fetch 5-day forecast

  const timeTaken = '12:00:00'; // Only take 12:00 PM reading each day
  const todayDate = new Date().toISOString().split('T')[0];
  forecastItemsContainer.innerHTML = ''; // Clear old forecast

  forecastData.list.forEach(forecastWeather => {
    if (
      forecastWeather.dt_txt.includes(timeTaken) && // Only noon
      !forecastWeather.dt_txt.includes(todayDate) // Skip today
    ) {
      updateForecastItems(forecastWeather); // Add forecast item to container
    }
  });
}

// ----------------------- UPDATE FORECAST ITEMS -----------------------
function updateForecastItems(weatherData) {
  console.log('this is checking data', weatherData); // Debug: check each forecast item

  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp },
  } = weatherData;

  const dateTaken = new Date(date); // Convert string date to Date object
  const dateOption = { day: '2-digit', month: 'short' };
  const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);
  // Format date for display

  // Create forecast HTML template
  const forecastItem = ` 
    <div class="forecast-item">
      <h5 class="forecast-item-date">${dateResult}</h5>
      <img src="./assets/weather/${getWeatherIcon(
        id
      )}" alt="weather-image" class="forecast-item-img" />
      <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
    </div>
  `;

  forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
  // Insert forecast HTML into container
}

// ----------------------- SHOW/HIDE SECTIONS -----------------------
function showDisplaySection(section) {
  [weatherInfoSection, searchCitySection, cityNotFoundSection].forEach(
    sec => (sec.style.display = 'none') // Hide all sections first
  );
  section.style.display = 'flex'; // Show the requested section
}
