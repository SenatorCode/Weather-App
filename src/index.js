import './styles.css';
import DOM from './Dom.js';
import { API } from './api.js';

/**
 * WeatherFlow App - Main Controller
 */
class WeatherApp {
  constructor() {
    this.currentLocation = 'San Francisco';
    this.currentTempUnit = 'C';
    this.currentWeatherData = null;
    this.forecastData = [];
    this.dateData = [];
    this.init();
  }

  /**
   * Initialize the app
   */
  async init() {
    try {
      // Initialize DOM module
      DOM.init();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load initial weather data
      await this.loadWeather(this.currentLocation);
    } catch (error) {
      console.error('App initialization error:', error);
      DOM.showError('Failed to initialize app. Please try again.');
    }
  }

  /**
   * Setup custom event listeners
   */
  setupEventListeners() {
    // Location search
    document.addEventListener('locationSearch', (e) => {
      this.currentLocation = e.detail.location;
      this.loadWeather(this.currentLocation);
    });
    
    // Temperature unit change
    document.addEventListener('tempUnitChange', (e) => {
      this.currentTempUnit = e.detail.unit;
      this.updateUIWithUnitChange();
    });
  }

  /**
   * Load weather data for a location
   */
  async loadWeather(location) {
    try {
      DOM.showLoading();
      DOM.clearWeatherData();
      
      // Fetch current weather
      const currentData = await API.getCurrentDayData(location);
      this.currentWeatherData = currentData;
      
      // Update hero section with current weather
      await DOM.updateCurrentWeather(currentData, location);
      
      // Fetch 7-day forecast
      await API.create(location);
      
      // Get forecast data
      const temps = API.getTemp();
      const icons = API.getIcon();
      const descriptions = API.getDescription();
      const dates = API.getDate();
      
      this.forecastData = temps.map((temp, index) => ({
        temp: temp,
        icon: icons[index] || 'cloudy',
        conditions: descriptions[index] || 'Clear',
        tempmin: temp - 5, // Estimate low temp
      }));
      
      this.dateData = dates;
      
      // Update forecast section
      await DOM.updateForecast(this.forecastData, this.dateData);
      
      // Update air quality (placeholder - integrate with your AQI data source)
      this.updateAirQuality();
      
      // Hide loading
      DOM.hideLoading();
    } catch (error) {
      console.error('Error loading weather:', error);
      DOM.hideLoading();
      DOM.showError(`Unable to load weather for "${location}". Please try another location.`);
    }
  }

  /**
   * Update UI when temperature unit changes
   */
  updateUIWithUnitChange() {
    if (!this.currentWeatherData) return;
    
    if (this.currentTempUnit === 'F') {
      const fahrenheit = DOM.convertTemperature(this.currentWeatherData.temp, 'F');
      DOM.elements.currentTemp.textContent = `${Math.round(fahrenheit)}°F`;
      
      // Update wind speed if needed
      const windMph = this.currentWeatherData.windSpeed;
      DOM.elements.windSpeed.textContent = `${Math.round(windMph)} mph`;
    } else {
      DOM.elements.currentTemp.textContent = `${Math.round(this.currentWeatherData.temp)}°C`;
      DOM.elements.windSpeed.textContent = `${Math.round(this.currentWeatherData.windSpeed)} mph`;
    }
  }

  /**
   * Update air quality information
   * Calculate based on current conditions or integrate with AQI API
   */
  updateAirQuality() {
    // Placeholder AQI calculation based on visibility and humidity
    // In production, integrate with a real AQI API
    let aqi = 50;
    
    if (this.currentWeatherData) {
      const visibility = this.currentWeatherData.visibility;
      const humidity = this.currentWeatherData.humidity;
      
      // Simple AQI estimation
      if (visibility < 5) aqi = 150;
      else if (visibility < 10) aqi = 100;
      else if (humidity > 80) aqi = 75;
      else aqi = 42; // Good air quality
    }
    
    DOM.updateAirQuality(aqi);
  }

  /**
   * Handle location search
   */
  async searchLocation(location) {
    if (!location || location.trim() === '') {
      DOM.showError('Please enter a location');
      return;
    }
    
    this.currentLocation = location;
    await this.loadWeather(location);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
  });
} else {
  window.weatherApp = new WeatherApp();
}

export default WeatherApp;