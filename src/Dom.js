import { getIcon } from './icon.js';
import { getWeatherImage } from './image.js';

/**
 * DOM Module - Handles all DOM manipulation for WeatherFlow app
 */
class DOM {
  // Cache DOM elements
  static elements = {
    // Header
    searchInput: null,
    searchBtn: null,
    tempToggleBtns: null,
    
    // Hero Section
    heroSection: null,
    heroBackground: null,
    currentTemp: null,
    currentCondition: null,
    currentLocation: null,
    windSpeed: null,
    humidity: null,
    uvIndex: null,
    visibility: null,
    
    // Forecast
    forecastGrid: null,
    forecastDate: null,
    
    // Info Cards
    airQualityScore: null,
    airQualityStatus: null,
    airQualityProgress: null,
    airQualityText: null,
    sunrise: null,
    sunset: null,
    
    // Loading
    loadingOverlay: null,
  };

  /**
   * Initialize DOM - cache all elements and attach event listeners
   */
  static init() {
    this.cacheElements();
    this.attachEventListeners();
  }

  /**
   * Cache all DOM elements for quick access
   */
  static cacheElements() {
    // Header
    this.elements.searchInput = document.getElementById('searchInput');
    this.elements.searchBtn = document.getElementById('searchBtn');
    this.elements.tempToggleBtns = document.querySelectorAll('.temp-toggle__btn');
    
    // Hero Section
    this.elements.heroSection = document.getElementById('heroSection');
    this.elements.heroBackground = document.getElementById('heroBackground');
    this.elements.currentTemp = document.getElementById('currentTemp');
    this.elements.currentCondition = document.getElementById('currentCondition');
    this.elements.currentLocation = document.getElementById('currentLocation');
    this.elements.windSpeed = document.getElementById('windSpeed');
    this.elements.humidity = document.getElementById('humidity');
    this.elements.uvIndex = document.getElementById('uvIndex');
    this.elements.visibility = document.getElementById('visibility');
    
    // Forecast
    this.elements.forecastGrid = document.getElementById('forecastGrid');
    this.elements.forecastDate = document.getElementById('forecastDate');
    
    // Info Cards
    this.elements.airQualityScore = document.getElementById('airQualityScore');
    this.elements.airQualityStatus = document.getElementById('airQualityStatus');
    this.elements.airQualityProgress = document.getElementById('airQualityProgress');
    this.elements.airQualityText = document.getElementById('airQualityText');
    this.elements.sunrise = document.getElementById('sunrise');
    this.elements.sunset = document.getElementById('sunset');
    
    // Loading
    this.elements.loadingOverlay = document.getElementById('loadingOverlay');
  }

  /**
   * Attach event listeners
   */
  static attachEventListeners() {
    // Search
    this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
    this.elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });
    
    // Temperature toggle
    this.elements.tempToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTempToggle(e));
    });
  }

  /**
   * Handle search functionality
   */
  static handleSearch() {
    const location = this.elements.searchInput.value.trim();
    if (location) {
      // Dispatch custom event for main app to handle
      const event = new CustomEvent('locationSearch', { detail: { location } });
      document.dispatchEvent(event);
      this.elements.searchInput.value = '';
    }
  }

  /**
   * Handle temperature unit toggle
   */
  static handleTempToggle(e) {
    const unit = e.target.dataset.unit;
    
    // Update active button
    this.elements.tempToggleBtns.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    e.target.classList.add('active');
    e.target.setAttribute('aria-pressed', 'true');
    
    // Dispatch custom event for main app to handle
    const event = new CustomEvent('tempUnitChange', { detail: { unit } });
    document.dispatchEvent(event);
  }

  /**
   * Show loading overlay
   */
  static showLoading() {
    this.elements.loadingOverlay.classList.add('active');
  }

  /**
   * Hide loading overlay
   */
  static hideLoading() {
    this.elements.loadingOverlay.classList.remove('active');
  }

  /**
   * Update current weather hero section
   * @param {Object} currentData - Current weather data
   * @param {string} location - Location name
   */
  static async updateCurrentWeather(currentData, location) {
    const {
      icon,
      condition,
      windSpeed,
      humidity,
      temp,
      uvIndex,
      visibility,
      sunset,
      sunrise
    } = currentData;

    // Update temperature
    this.elements.currentTemp.textContent = `${Math.round(temp)}°C`;
    
    // Update condition
    this.elements.currentCondition.textContent = condition;
    
    // Update location
    this.elements.currentLocation.textContent = location;
    
    // Update weather details
    this.elements.windSpeed.textContent = `${Math.round(windSpeed)} mph`;
    this.elements.humidity.textContent = `${Math.round(humidity)}%`;
    this.elements.uvIndex.textContent = this.getUVIndexLabel(uvIndex);
    this.elements.visibility.textContent = `${Math.round(visibility)} mi`;
    
    // Update sunrise and sunset
    this.elements.sunrise.textContent = this.formatTime(sunrise);
    this.elements.sunset.textContent = this.formatTime(sunset);
    
    // Update hero icon
    const IconComponent = await getIcon(icon);
    this.updateHeroIcon(IconComponent, icon);
    
    // Update background image based on weather condition
    try {
      const imageData = await getWeatherImage(condition);
      if (imageData.results && imageData.results.length > 0) {
        const imageUrl = imageData.results[0].urls.regular;
        this.elements.heroBackground.style.backgroundImage = `url('${imageUrl}')`;
      }
    } catch (error) {
      console.error('Error fetching background image:', error);
    }
  }

  /**
   * Update hero section icon
   */
  static updateHeroIcon(IconComponent, iconName) {
    const iconContainer = document.querySelector('.hero__day-icon');
    if (iconContainer && IconComponent) {
      // Create SVG element from lucide icon
      const svg = this.createIconSVG(IconComponent);
      iconContainer.innerHTML = '';
      iconContainer.appendChild(svg);
    }
  }

  /**
   * Create SVG element from lucide icon component
   */
  static createIconSVG(IconComponent) {
    const div = document.createElement('div');
    div.innerHTML = IconComponent.toString();
    return div.firstElementChild || document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  /**
   * Update forecast cards
   * @param {Array} forecastData - Array of forecast day objects
   * @param {Array} dates - Array of formatted date strings
   */
  static async updateForecast(forecastData, dates) {
    this.elements.forecastGrid.innerHTML = '';
    
    if (!Array.isArray(forecastData) || forecastData.length === 0) {
      this.elements.forecastGrid.innerHTML = '<p>No forecast data available</p>';
      return;
    }

    // Calculate date range
    if (dates && dates.length > 0) {
      const firstDate = dates[0];
      const lastDate = dates[dates.length - 1];
      const dateRange = `${firstDate} - ${lastDate}`;
      this.elements.forecastDate.textContent = dateRange;
    }

    // Create forecast cards
    for (let i = 0; i < Math.min(forecastData.length, 7); i++) {
      const dayData = forecastData[i];
      const date = dates && dates[i] ? dates[i] : `Day ${i + 1}`;
      
      const card = document.createElement('div');
      card.className = 'forecast-card';
      
      try {
        const IconComponent = await getIcon(dayData.icon || 'cloudy');
        
        card.innerHTML = `
          <div class="forecast-card__day">${this.formatDateShort(date)}</div>
          <div class="forecast-card__icon" id="icon-${i}"></div>
          <div class="forecast-card__temp">${Math.round(dayData.temp)}°</div>
          <div class="forecast-card__low">${Math.round(dayData.tempmin || dayData.temp - 5)}°</div>
          <div class="forecast-card__description">${dayData.conditions || 'Clear'}</div>
        `;
        
        this.elements.forecastGrid.appendChild(card);
        
        // Add icon to card
        const iconContainer = card.querySelector(`#icon-${i}`);
        if (IconComponent) {
          const svg = this.createIconSVG(IconComponent);
          iconContainer.appendChild(svg);
        }
      } catch (error) {
        console.error(`Error updating forecast card ${i}:`, error);
      }
    }
  }

  /**
   * Update air quality information
   * @param {number} aqi - Air Quality Index score
   */
  static updateAirQuality(aqi) {
    const score = Math.round(aqi);
    const status = this.getAQIStatus(score);
    const percentage = Math.min((score / 500) * 100, 100);
    
    this.elements.airQualityScore.textContent = score;
    this.elements.airQualityStatus.textContent = status;
    this.elements.airQualityProgress.style.setProperty('--progress-width', `${percentage}%`);
    
    const statusText = this.getAQIDescription(score);
    this.elements.airQualityText.textContent = statusText;
  }

  /**
   * Get AQI status label based on score
   */
  static getAQIStatus(score) {
    if (score <= 50) return 'Good';
    if (score <= 100) return 'Moderate';
    if (score <= 150) return 'Unhealthy for Sensitive Groups';
    if (score <= 200) return 'Unhealthy';
    if (score <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Get AQI description based on score
   */
  static getAQIDescription(score) {
    if (score <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
    if (score <= 100) return 'Air quality is acceptable. However, there may be a risk for some people.';
    if (score <= 150) return 'Members of sensitive groups may experience health effects.';
    if (score <= 200) return 'Some members of the general public may begin to experience health effects.';
    if (score <= 300) return 'Health alerts: The general public is more likely to be affected.';
    return 'Health alert: The risk of health effects is increased for the entire population.';
  }

  /**
   * Get UV Index label
   */
  static getUVIndexLabel(uvIndex) {
    const rounded = Math.round(uvIndex);
    let level = 'Low';
    
    if (rounded >= 3 && rounded < 6) level = 'Moderate';
    if (rounded >= 6 && rounded < 8) level = 'High';
    if (rounded >= 8 && rounded < 11) level = 'Very High';
    if (rounded >= 11) level = 'Extreme';
    
    return `${rounded} ${level}`;
  }

  /**
   * Format time string (HH:MM format)
   */
  static formatTime(timeString) {
    if (!timeString) return '--:--';
    
    // Handle different time formats
    if (timeString.includes(':')) {
      return timeString.split(':').slice(0, 2).join(':');
    }
    
    return '--:--';
  }

  /**
   * Format date to short format (MON, TUE, etc)
   */
  static formatDateShort(dateString) {
    if (!dateString) return 'N/A';
    
    // Extract day of week if it exists (e.g., "Mon, 09, 12" -> "MON")
    const parts = dateString.split(',');
    if (parts.length > 0) {
      return parts[0].toUpperCase().slice(0, 3);
    }
    
    return dateString.slice(0, 3).toUpperCase();
  }

  /**
   * Clear all weather data (reset to loading state)
   */
  static clearWeatherData() {
    this.elements.currentTemp.textContent = '--°';
    this.elements.currentCondition.textContent = '--';
    this.elements.currentLocation.textContent = 'Loading...';
    this.elements.windSpeed.textContent = '--';
    this.elements.humidity.textContent = '--';
    this.elements.uvIndex.textContent = '--';
    this.elements.visibility.textContent = '--';
    this.elements.sunrise.textContent = '--:--';
    this.elements.sunset.textContent = '--:--';
    this.elements.forecastGrid.innerHTML = '';
    this.elements.airQualityScore.textContent = '--';
    this.elements.airQualityStatus.textContent = '--';
    this.elements.airQualityText.textContent = 'Loading...';
  }

  /**
   * Display error message
   */
  static showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: #EF4444;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      z-index: 200;
      animation: slideInDown 0.3s ease-out;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.style.animation = 'slideOutUp 0.3s ease-out';
      setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
  }

  /**
   * Convert temperature between Celsius and Fahrenheit
   */
  static convertTemperature(celsius, toUnit) {
    if (toUnit === 'F') {
      return (celsius * 9/5) + 32;
    }
    return celsius;
  }

  /**
   * Convert wind speed (mph to other units)
   */
  static convertWindSpeed(mph, toUnit) {
    if (toUnit === 'kmh') {
      return mph * 1.609;
    }
    if (toUnit === 'mps') {
      return mph * 0.44704;
    }
    return mph;
  }

  /**
   * Convert visibility (miles to kilometers)
   */
  static convertVisibility(miles, toUnit) {
    if (toUnit === 'km') {
      return miles * 1.609;
    }
    return miles;
  }

  /**
   * Update all temperature values in the UI based on unit
   */
  static updateAllTemperatures(currentData, unit) {
    if (unit === 'F') {
      const fahrenheit = this.convertTemperature(currentData.temp, 'F');
      this.elements.currentTemp.textContent = `${Math.round(fahrenheit)}°F`;
    } else {
      this.elements.currentTemp.textContent = `${Math.round(currentData.temp)}°C`;
    }
  }

  /**
   * Get current temperature unit from toggle
   */
  static getCurrentTempUnit() {
    const activeBtn = document.querySelector('.temp-toggle__btn.active');
    return activeBtn ? activeBtn.dataset.unit : 'C';
  }
}

export default DOM;