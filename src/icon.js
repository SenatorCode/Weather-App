import { Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudLightning, Wind, Droplets, Snowflake, CloudFog, CloudHail, AlertTriangle, Moon, CloudMoon, CloudSun, } from "lucide";
async function getIcon(iconName) {
    // Mapping weather conditions to search terms
    const iconMap = {
        "clear-day": Sun,
        "clear-night": Moon,
        "partly-cloudy-day": CloudSun,
        "partly-cloudy-night": CloudMoon,
        "cloudy": Cloud,
        "overcast": Cloud,
        "rain": CloudRain,
        "drizzle": CloudDrizzle,
        "snow": CloudSnow,
        "sleet": CloudSnow,
        "thunderstorm": CloudLightning,
        "storm": CloudLightning,
        "hail": CloudHail,
        "fog": CloudFog,
        "mist": CloudFog,
        "wind": Wind,
        "windy": Wind,
        "breezy": Wind,
        "frost": Snowflake,
        "freeze": Snowflake,
        "freezing": Snowflake,
        "blizzard": CloudSnow,
        "dust": AlertTriangle,
        "hot": Sun,
        "cold": Snowflake,
        "humid": Droplets,
      }
      const IconComponent = iconMap[iconName.toLowerCase()] || Cloud;
      return IconComponent;
  }

export { getIcon }