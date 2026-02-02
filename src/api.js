import { parse, format } from "date-fns";

class API {
  static #isInternalConstructing = false;
  static #days = [];
  constructor(data) {
    if (!API.#isInternalConstructing) {
      throw new TypeError("GetData is not directly constructable");
    }
    API.#isInternalConstructing = false;
    this.#initializeWithData(data);
  }

  #initializeWithData(data) {
    const dateString = data.datetime;
    const dateObj = parse(dateString, "yyyy-MM-dd", new Date());
    const formattedDate = format(dateObj, "EE, MM, do");
    this.icon = data.icon;
    this.temp = data.temp;
    this.date = formattedDate;
    this.conditions = data.conditions;
  }
  static #getDay(apiData, index) {
    const days = apiData.days;
    return days[index];
  }
  static async create(location) {
    this.#days = [];
    const apiInput = location;
    const apiData = await this.#getDataLocation(apiInput);
    let i = 1;
    while (i < 8) {
      const data = this.#getDay(apiData, i);
      API.#isInternalConstructing = true;
      const instance = new API(data);
      this.#days.push(instance);
      i++;
    }
  }

  static async getCurrentDayData(location) {
    const response = await this.#getDataLocation(location);
    const dataObj = response.currentConditions;
    const icon = dataObj.icon;
    const condition = dataObj.conditions;
    const windSpeed = dataObj.windspeed;
    const humidity = dataObj.humidity;
    const temp = dataObj.temp;
    const uvIndex = dataObj.uvindex;
    const visibility = dataObj.visibility;
    const sunset = dataObj.sunset;
    const sunrise = dataObj.sunrise;
    return {
      icon,
      condition,
      windSpeed,
      humidity,
      temp,
      uvIndex,
      visibility,
      sunset,
      sunrise,
    };
  }

  static async #getDataLocation(location) {
    const API_KEY = process.env.VISUAL_CROSSING_API_KEY;
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next7days?unitGroup=metric&key=${API_KEY}&contentType=json&include=days,current`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Request Error, status: ${response.status}`);
      }
      const dataObj = await response.json();
      return dataObj;
      // console.log(dataObj)
    } catch (error) {
      console.error("Error while fetching data", error);
      throw error;
    }
  }

  static getTemp() {
    const temp = [];
    this.#days.forEach((element) => {
      temp.push(element.temp);
    });
    return temp;
  }

  static getIcon() {
    const icons = [];
    this.#days.forEach((element) => {
      icons.push(element.icon);
    });
    return icons;
  }

  static getDescription() {
    const description = [];
    this.#days.forEach((element) => {
      description.push(element.conditions);
    });
    return description;
  }

  static getDate() {
    const date = [];
    this.#days.forEach((element) => {
      date.push(element.date);
    });
    return date;
  }

  static getHumidity() {
    const humidity = [];
    this.#days.forEach((element) => {
      humidity.push(element.humidity);
    });
    return humidity;
  }

  static getWindSpeed() {
    const windSpeed = [];
    this.#days.forEach((element) => {
      windSpeed.push(element.windSpeed);
    });
    return windSpeed;
  }

  static getUvIndex() {
    const uvIndex = [];
    this.#days.forEach((element) => {
      uvIndex.push(element.uvIndex);
    });
    return uvIndex;
  }

  static getVisibility() {
    const visibility = [];
    this.#days.forEach((element) => {
      visibility.push(element.visibility);
    });
    return visibility;
  }
}

export { API };
