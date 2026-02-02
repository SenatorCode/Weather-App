import "./styles.css";
import { API } from "./api.js";
import { DOM } from "./Dom.js";

class WeatherApp {
  constructor() {
    this.dom = new DOM();
    this.currentLocation = "San Francisco";
    this.currentWeatherData = null;
    this.forecastData = [];
    this.init();
  }

  async init() {
    this.dom.showLoading();
    this.dom.updateDateRange();

    try {
      await this.loadWeather(this.currentLocation);
    } catch (error) {
      console.error("Error initializing app:", error);
      this.dom.hideLoading();
      this.showError("Failed to load weather data. Please try again.");
    }

    // Event listeners
    window.addEventListener("searchLocation", (e) => {
      this.handleSearch(e.detail.location);
    });

    window.addEventListener("temperatureToggled", () => {
      this.refreshDisplay();
    });
  }

  async loadWeather(location) {
    try {
      // Show loading state
      this.dom.showLoading();

      // Fetch current weather data
      const currentData = await API.getCurrentDayData(location);
      this.currentWeatherData = currentData;

      // Fetch 7-day forecast
      await API.create(location);
      this.extractForecastData();

      // Update UI
      await this.dom.updateHeroSection(currentData, location);
      await this.dom.updateForecast(this.forecastData);

      // Update air quality
      const aqiValue = this.calculateAQI(currentData);
      this.dom.updateAirQuality(aqiValue);

      // Update location
      this.currentLocation = location;
      this.dom.updateSearchInput(location);

      // Hide loading state
      this.dom.hideLoading();
    } catch (error) {
      console.error("Error loading weather:", error);
      this.dom.hideLoading();
      this.showError("Could not find location. Please try another search.");
    }
  }

  extractForecastData() {
    // Get all the data from static getters
    const temps = API.getTemp();
    const icons = API.getIcon();
    const descriptions = API.getDescription();
    const dates = API.getDate();

    this.forecastData = temps.map((temp, index) => ({
      temp: temp,
      icon: icons[index] || "cloudy",
      conditions: descriptions[index] || "Forecast",
      date: dates[index] || "",
      tempmin: temp - 5, // Fallback minimum temperature
    }));
  }

  calculateAQI(weatherData) {
    // Simple AQI calculation based on weather conditions
    let aqiScore = 50;

    if (weatherData.humidity > 80) aqiScore += 10;
    if (weatherData.humidity > 90) aqiScore += 10;

    if (weatherData.visibility < 5) aqiScore += 30;
    if (weatherData.visibility < 3) aqiScore += 20;

    const condition = weatherData.condition.toLowerCase();
    if (condition.includes("dust")) aqiScore += 40;
    if (condition.includes("smoke")) aqiScore += 35;
    if (condition.includes("fog")) aqiScore += 15;

    return Math.min(aqiScore, 500); // Cap at 500
  }

  async handleSearch(location) {
    if (location && location !== this.currentLocation) {
      await this.loadWeather(location);
    }
  }

  refreshDisplay() {
    // Refresh UI with the current data and new temperature unit
    if (this.currentWeatherData) {
      this.dom.updateHeroSection(this.currentWeatherData, this.currentLocation);
      this.dom.updateForecast(this.forecastData);
    }
  }

  showError(message) {
    const container = document.querySelector(".container");
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border: 2px solid #ef4444;
      color: #991b1b;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      animation: slideDown 0.3s ease-out;
      font-weight: 600;
    `;
    errorDiv.textContent = message;

    container.insertBefore(errorDiv, container.firstChild);

    setTimeout(() => {
      errorDiv.style.animation = "slideUp 0.3s ease-out";
      setTimeout(() => errorDiv.remove(), 300);
    }, 4000);
  }
}

// Initialize the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new WeatherApp();
  });
} else {
  new WeatherApp();
}

// Export for use in other modules if needed
export { WeatherApp };
