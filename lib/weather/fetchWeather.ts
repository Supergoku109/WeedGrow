export async function fetchWeather(lat: number, lng: number): Promise<any> {
  const env =
    typeof import.meta !== 'undefined' && (import.meta as any).env
      ? (import.meta as any).env
      : process.env;

  const apiKey = env.VITE_OPENWEATHERMAP_API_KEY || env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    throw new Error('OpenWeatherMap API key missing');
  }

  const baseUrl = 'https://api.openweathermap.org/data/3.0/onecall';
  const url = `${baseUrl}?lat=${lat}&lon=${lng}&exclude=minutely,alerts&units=metric&appid=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
