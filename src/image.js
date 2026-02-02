// Fallback images for different weather conditions
const fallbackImages = {
  sunny:
    "https://images.unsplash.com/photo-1495341990814-a8fb08496019?w=1200&h=600&fit=crop",
  cloudy:
    "https://images.unsplash.com/photo-1527482797697-8795b1a55a45?w=1200&h=600&fit=crop",
  rainy:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
  snowy:
    "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&h=600&fit=crop",
  thunderstorm:
    "https://images.unsplash.com/photo-1534274988757-a28bf1ad0e1f?w=1200&h=600&fit=crop",
  foggy:
    "https://images.unsplash.com/photo-1508608541593-76391c2f4eda?w=1200&h=600&fit=crop",
  windy:
    "https://images.unsplash.com/photo-1532274040911-5f86dc4fdac5?w=1200&h=600&fit=crop",
  default:
    "https://images.unsplash.com/photo-1495341990814-a8fb08496019?w=1200&h=600&fit=crop",
};

async function getWeatherImage(weatherCondition) {
  const accessKey = process.env.UPSPLASH_ACCESS_KEY;

  // Mapping weather conditions to search terms
  const query = ((conditions) => {
    const lower = conditions.toLowerCase();
    if (lower.includes("thunder") || lower.includes("storm"))
      return "thunderstorm weather";
    if (lower.includes("rain") || lower.includes("drizzle"))
      return "rainy weather";
    if (lower.includes("snow") || lower.includes("sleet"))
      return "snowy weather";
    if (lower.includes("hail")) return "hail weather";
    if (lower.includes("fog") || lower.includes("mist")) return "foggy weather";
    if (lower.includes("clear") || lower.includes("sunny"))
      return "sunny weather";
    if (lower.includes("partly") || lower.includes("scattered"))
      return "partly cloudy";
    if (lower.includes("cloud")) return "cloudy sky";
    if (lower.includes("overcast")) return "overcast weather";
    if (lower.includes("wind") || lower.includes("breezy"))
      return "windy weather";
    if (lower.includes("frost") || lower.includes("freeze"))
      return "frost weather";
    if (lower.includes("sleet")) return "sleet weather";
    if (lower.includes("freezing")) return "freezing rain";
    if (lower.includes("blizzard")) return "blizzard weather";
    if (lower.includes("dust")) return "dust storm";
    if (lower.includes("hot")) return "hot sunny day";
    if (lower.includes("cold")) return "cold weather";
    if (lower.includes("humid")) return "humid weather";
    return "weather"; // fallback
  })(weatherCondition);

  // Determine fallback based on condition
  let fallbackKey = "default";
  const lowerCondition = weatherCondition.toLowerCase();
  if (lowerCondition.includes("clear") || lowerCondition.includes("sunny"))
    fallbackKey = "sunny";
  else if (lowerCondition.includes("cloud")) fallbackKey = "cloudy";
  else if (
    lowerCondition.includes("rain") ||
    lowerCondition.includes("drizzle")
  )
    fallbackKey = "rainy";
  else if (lowerCondition.includes("snow") || lowerCondition.includes("sleet"))
    fallbackKey = "snowy";
  else if (
    lowerCondition.includes("thunder") ||
    lowerCondition.includes("storm")
  )
    fallbackKey = "thunderstorm";
  else if (lowerCondition.includes("fog") || lowerCondition.includes("mist"))
    fallbackKey = "foggy";
  else if (lowerCondition.includes("wind")) fallbackKey = "windy";

  // If no API key, return fallback immediately
  if (!accessKey) {
    console.warn("No Unsplash API key found, using fallback images");
    return { results: [{ urls: { regular: fallbackImages[fallbackKey] } }] };
  }

  const url = `https://api.unsplash.com/search/photos?query=${query}&client_id=${accessKey}&per_page=1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Request Error, status: ${response.status}`);
    }
    const imgData = await response.json();

    // Check if results exist
    if (imgData.results && imgData.results.length > 0) {
      return imgData;
    } else {
      throw new Error("No images found");
    }
  } catch (error) {
    console.warn(
      "Error fetching from Unsplash, using fallback:",
      error.message,
    );
    // Return fallback image on any error
    return { results: [{ urls: { regular: fallbackImages[fallbackKey] } }] };
  }
}

export { getWeatherImage };
