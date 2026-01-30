import { parse, format } from "date-fns";

class GetData {
  static #isInternalConstructing = false;

  constructor(data) {
    if (!GetData.#isInternalConstructing) {
      throw new TypeError("GetData is not directly constructable");
    }
    GetData.#isInternalConstructing = false;
    this.#initializeWithData(data);
  }

  #initializeWithData(data) {
    const dateString = data.datetime;
    const dateObj = parse(dateString, "yyyy-MM-dd", new Date());
    const formattedDate = format(dateObj, "EE, MM, do");
    this.feelsLike = data.feelslike;
    this.icon = data.icon;
    this.temp = data.temp;
    this.date = formattedDate;
    this.description = data.description;
    this.humidity = data.humidity;
    this.windSpeed = data.windspeed;
  }
  static #getDay(apiData, index) {
    const days = apiData.days;
    return days[index];
  }
  static async create(location, index) {
    const apiInput = location;
    const apiData = await this.#getDataLocation(apiInput);
    const data = this.#getDay(apiData, index);
    GetData.#isInternalConstructing = true;
    const instance = new GetData(data);
    return instance;
  }

  static async #getDataLocation(location) {
    const API_KEY = "XMP6X6NBMCE6KJAZBC52YT6TK";
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
}

export { GetData };
