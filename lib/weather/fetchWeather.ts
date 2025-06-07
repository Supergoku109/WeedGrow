import Constants from 'expo-constants';

export async function fetchWeather(lat: number, lng: number): Promise<any> {
  // Get API key from app.config.js -> extra
  const apiKey = Constants?.expoConfig?.extra?.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    throw new Error('OpenWeatherMap API key is missing. Check your .env and app.config.js');
  }

  const baseUrl = 'https://api.openweathermap.org/data/3.0/onecall';
  const url = `${baseUrl}?lat=${lat}&lon=${lng}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
