async function getWeatherImage(weatherCondition) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    // Mapping weather conditions to search terms
    const query = ((conditions) =>{
      const lower = conditions.toLowerCase();
      if (lower.includes("thunder") || lower.includes("storm")) return "thunderstorm weather";
      if (lower.includes("rain") || lower.includes("drizzle")) return "rainy weather";
      if (lower.includes("snow") || lower.includes("sleet")) return "snowy weather";
      if (lower.includes("hail")) return "hail weather";
      if (lower.includes("fog") || lower.includes("mist")) return "foggy weather";
      if (lower.includes("clear") || lower.includes("sunny")) return "sunny weather";
      if (lower.includes("partly") || lower.includes("scattered")) return "partly cloudy";
      if (lower.includes("cloud")) return "cloudy sky";
      if (lower.includes("overcast")) return "overcast weather";
      if (lower.includes("wind") || lower.includes("breezy")) return "windy weather";
      if (lower.includes("frost") || lower.includes("freeze")) return "frost weather";
      if (lower.includes("sleet")) return "sleet weather";
      if (lower.includes("freezing")) return "freezing rain";
      if (lower.includes("blizzard")) return "blizzard weather";
      if (lower.includes("dust")) return "dust storm";
      if (lower.includes("hot")) return "hot sunny day";
      if (lower.includes("cold")) return "cold weather";
      if (lower.includes("humid")) return "humid weather";
      return "weather"; // fallback
    })(weatherCondition)
    
    const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${accessKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Request Error, status: ${response.status}`);
          }
        const imgUrl = await response.json()
        return imgUrl
    } catch (error) {
        console.error("Error while fetching data", error);
        throw error;
      }
  }

export { getWeatherImage }
// Usage
//   getWeatherImage("sunny").then(imageUrl => {
//     document.getElementById("weatherImage").src = imageUrl;
//   });