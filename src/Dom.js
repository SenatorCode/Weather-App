import { getWeatherImage } from "./image.js";

class DOM {
  constructor() {
    this.loadingScreen = document.getElementById("loadingScreen");
    this.searchInput = document.querySelector(".search-box input");
    this.tempToggleOptions = document.querySelectorAll(".temp-option");
    this.tempUnit = "C"; // Default is Celsius
    this.emojiMap = this.createEmojiMap();
    this.initEventListeners();
  }

  createEmojiMap() {
    return {
      "clear-day": "☀️",
      "clear-night": "🌙",
      "partly-cloudy-day": "🌤️",
      "partly-cloudy-night": "🌥️",
      cloudy: "☁️",
      overcast: "☁️",
      rain: "🌧️",
      drizzle: "🌦️",
      snow: "❄️",
      sleet: "🌨️",
      thunderstorm: "⛈️",
      storm: "⛈️",
      hail: "🌨️",
      fog: "🌫️",
      mist: "🌫️",
      wind: "💨",
      windy: "💨",
      breezy: "💨",
      frost: "❄️",
      freeze: "❄️",
      freezing: "❄️",
      blizzard: "🌨️",
      dust: "🌪️",
      hot: "🔥",
      cold: "❄️",
      humid: "💧",
    };
  }

  initEventListeners() {
    // Search functionality
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSearch();
      }
    });

    // Temperature toggle
    this.tempToggleOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        this.tempToggleOptions.forEach((opt) => opt.classList.remove("active"));
        e.target.classList.add("active");
        this.tempUnit = e.target.textContent.trim();
        // Re-render with new temperature unit
        window.dispatchEvent(new Event("temperatureToggled"));
      });
    });
  }

  handleSearch() {
    const location = this.searchInput.value.trim();
    if (location) {
      window.dispatchEvent(
        new CustomEvent("searchLocation", { detail: { location } }),
      );
    }
  }

  showLoading() {
    this.loadingScreen.classList.remove("hidden");
  }

  hideLoading() {
    setTimeout(() => {
      this.loadingScreen.classList.add("hidden");
    }, 500);
  }

  convertTemp(celsius, toFahrenheit = true) {
    if (toFahrenheit) {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  }

  getTempDisplay(celsius) {
    if (this.tempUnit === "°F") {
      return this.convertTemp(celsius, true);
    }
    return this.convertTemp(celsius, false);
  }

  async updateHeroSection(currentData, location) {
    const hero = document.querySelector(".hero");
    const weatherStatus = document.querySelector(".weather-status");
    const tempDisplay = document.querySelector(".temp-display");
    const weatherDesc = document.querySelector(".weather-desc");
    const locationDisplay = document.querySelector(".location");
    const weatherDetailsDiv = document.querySelector(".weather-details");

    try {
      // Get icon emoji or Lucide component
      const iconEmoji = this.emojiMap[currentData.icon] || "☀️";
      weatherStatus.innerHTML = `<div class="weather-icon">${iconEmoji}</div>`;

      // Update temperature and description
      const displayTemp = this.getTempDisplay(currentData.temp);
      tempDisplay.textContent = `${displayTemp}°${this.tempUnit}`;
      weatherDesc.textContent = currentData.condition;
      locationDisplay.textContent = `📍 ${location}`;

      // Update weather details
      const windSpeedDisplay =
        currentData.windSpeed > 40
          ? currentData.windSpeed
          : Math.round(currentData.windSpeed * 2.237); // m/s to mph
      weatherDetailsDiv.innerHTML = `
        <div class="detail-item">
          <div class="detail-label">Wind</div>
          <div class="detail-value">${Math.round(windSpeedDisplay)} ${this.tempUnit === "°F" ? "mph" : "km/h"}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Humidity</div>
          <div class="detail-value">${Math.round(currentData.humidity)}%</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">UV Index</div>
          <div class="detail-value">${Math.round(currentData.uvIndex)} ${this.getUVLevel(currentData.uvIndex)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Visibility</div>
          <div class="detail-value">${Math.round(currentData.visibility)} ${this.tempUnit === "°F" ? "mi" : "km"}</div>
        </div>
      `;

      // Update background image
      await this.updateHeroBackground(currentData.condition);

      // Update sunrise and sunset
      this.updateSunriseSunset(currentData.sunrise, currentData.sunset);
    } catch (error) {
      console.error("Error updating hero section:", error);
    }
  }

  getUVLevel(uvIndex) {
    if (uvIndex < 3) return "Low";
    if (uvIndex < 6) return "Moderate";
    if (uvIndex < 8) return "High";
    if (uvIndex < 11) return "Very High";
    return "Extreme";
  }

  async updateHeroBackground(weatherCondition) {
    const gradients = {
      clear:
        "linear-gradient(135deg, rgba(30, 58, 138, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%)",
      cloudy:
        "linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(100, 116, 139, 0.6) 100%)",
      rain: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.7) 100%)",
      snow: "linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(148, 163, 184, 0.7) 100%)",
      thunderstorm:
        "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)",
    };

    const weatherLower = weatherCondition.toLowerCase();
    let gradientKey = "clear";

    if (weatherLower.includes("cloud")) gradientKey = "cloudy";
    else if (weatherLower.includes("rain") || weatherLower.includes("drizzle"))
      gradientKey = "rain";
    else if (weatherLower.includes("snow") || weatherLower.includes("sleet"))
      gradientKey = "snow";
    else if (weatherLower.includes("thunder") || weatherLower.includes("storm"))
      gradientKey = "thunderstorm";

    const gradient = gradients[gradientKey];

    try {
      const imageData = await getWeatherImage(weatherCondition);
      const imageUrl =
        imageData.results[0]?.urls?.regular ||
        "https://images.unsplash.com/photo-1495341990814-a8fb08496019?w=1200&h=600&fit=crop";

      const hero = document.querySelector(".hero");
      hero.style.backgroundImage = `${gradient}, url('${imageUrl}')`;
    } catch (error) {
      console.error("Error fetching weather image:", error);
      const hero = document.querySelector(".hero");
      hero.style.backgroundImage = `${gradient}, url('https://images.unsplash.com/photo-1495341990814-a8fb08496019?w=1200&h=600&fit=crop')`;
    }
  }

  updateSunriseSunset(sunrise, sunset) {
    const sunTimes = document.querySelector(".sunrise-sunset");
    sunTimes.innerHTML = `
      <div class="sun-time">
        <div class="sun-icon-label">🌅</div>
        <div class="sun-label">Sunrise</div>
        <div class="sun-time-value">${this.formatTime(sunrise)}</div>
      </div>
      <div class="sun-time">
        <div class="sun-icon-label">🌇</div>
        <div class="sun-label">Sunset</div>
        <div class="sun-time-value">${this.formatTime(sunset)}</div>
      </div>
    `;
  }

  formatTime(timeString) {
    if (!timeString) return "--:--";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  async updateForecast(forecastData) {
    const forecastGrid = document.querySelector(".forecast-grid");
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    forecastGrid.innerHTML = "";

    for (let i = 0; i < forecastData.length && i < 7; i++) {
      const day = forecastData[i];
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.style.animationDelay = `${0.5 + i * 0.1}s`;

      try {
        // Use emoji instead of Lucide
        const iconEmoji = this.emojiMap[day.icon] || "☀️";
        const tempDisplay = this.getTempDisplay(day.temp);
        const minTempDisplay = this.getTempDisplay(day.tempmin || day.temp - 5);

        card.innerHTML = `
          <div class="day-label">${dayLabels[i]}</div>
          <div class="forecast-icon">${iconEmoji}</div>
          <div class="forecast-temp">${tempDisplay}°</div>
          <div class="forecast-low">${minTempDisplay}°</div>
          <div class="forecast-condition">${day.conditions}</div>
        `;

        forecastGrid.appendChild(card);
      } catch (error) {
        console.error(`Error updating forecast card ${i}:`, error);
      }
    }
  }

  updateAirQuality(aqi) {
    const aqiCard = document.querySelector(".aqi-value");
    const aqiStatus = document.querySelector(".aqi-status");
    const progressFill = document.querySelector(".progress-fill");

    const value = Math.round(aqi);
    aqiCard.textContent = value;

    let status = "Good";
    let statusColor = "#10b981";
    let fillWidth = 20;

    if (value > 50 && value <= 100) {
      status = "Moderate";
      statusColor = "#f59e0b";
      fillWidth = 40;
    } else if (value > 100 && value <= 150) {
      status = "Unhealthy for Sensitive Groups";
      statusColor = "#f97316";
      fillWidth = 60;
    } else if (value > 150 && value <= 200) {
      status = "Unhealthy";
      statusColor = "#ef4444";
      fillWidth = 75;
    } else if (value > 200) {
      status = "Very Unhealthy";
      statusColor = "#991b1b";
      fillWidth = 95;
    }

    aqiStatus.textContent = status;
    aqiStatus.style.color = statusColor;
    progressFill.style.width = fillWidth + "%";
    progressFill.style.background = `linear-gradient(90deg, ${statusColor}, #3b82f6)`;
  }

  updateDateRange() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const options = { month: "short", day: "numeric" };
    const startDate = today.toLocaleDateString("en-US", options);
    const endDate = nextWeek.toLocaleDateString("en-US", options);

    const dateRangeEl = document.querySelector(".date-range");
    dateRangeEl.textContent = `${startDate} - ${endDate}`;
  }

  updateSearchInput(location) {
    this.searchInput.value = location;
  }
}

export { DOM };
