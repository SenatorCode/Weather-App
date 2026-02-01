import { getDay } from "date-fns";
import "./styles.css"
// import { GetData } from "./api"


async function getweather(){
    const API_KEY = process.env.VISUAL_CROSSING_API_KEY;
    const location = "Lagos"
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

const objData = await getweather()
console.log(objData)

console.log(objData.currentConditions)
console.log(objData.days[0])