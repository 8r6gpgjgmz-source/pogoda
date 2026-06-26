import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { Weather } from './weather';
import { WEATHER_ICONS } from './weather-codes';
import { WeatherCard } from './weather-card/weather-card';
import { CitiesWeather } from './components/cities-weather/cities-weather';
import { WeatherBackground } from './components/weather-background/weather-background';
import { WeatherExtra } from './components/weather-extra/weather-extra';
import { Favorites } from './components/favorites/favorites';
import { SearchBar } from './components/search-bar/search-bar';
import { AirQuality } from './components/air-quality/air-quality';

@Component({
  selector: 'app-root',
  imports: [WeatherCard, CitiesWeather, WeatherBackground, WeatherExtra, Favorites, SearchBar, AirQuality],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private weatherService = inject(Weather);
  private wsSubscription: Subscription | null = null;

  cityName = signal('Ładowanie...');
  temperature = signal(0);
  description = signal('');
  dateTime = signal('');
  forecast = signal<{ time: string; icon: string; temp: number }[]>([]);
  chartData = signal<{ time: string; temp: number }[]>([]);
  precipitation = signal<number>(0);
  windSpeed = signal<number>(0);
  windDirection = signal<number>(0);
  sunrise = signal<string>('');
  sunset = signal<string>('');
  weatherCode = signal<number>(-1);
  darkMode = signal<boolean>(true);
  uvIndex = signal(0);

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  toggleMode(): void {
    this.darkMode.set(!this.darkMode());
  }

  private weatherDescriptions: Record<number, string> = {
    0: 'Bezchmurnie', 1: 'Przeważnie bezchmurnie', 2: 'Częściowe zachmurzenie',
    3: 'Zachmurzenie', 45: 'Mgła', 48: 'Mgła z szronem', 51: 'Lekka mżawka',
    53: 'Mżawka', 55: 'Intensywna mżawka', 61: 'Lekki deszcz', 63: 'Deszcz',
    65: 'Intensywny deszcz', 71: 'Lekki śnieg', 73: 'Śnieg', 75: 'Intensywny śnieg',
    80: 'Przelotne opady', 81: 'Opady', 82: 'Gwałtowne opady', 95: 'Burza', 99: 'Burza z gradem'
  };

  private weatherIcons = WEATHER_ICONS;

  ngOnInit(): void {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this.fetchWeather(lat, lon);
      },
      () => {
        this.cityName.set('Nie udało się pobrać lokalizacji.');
      }
    );
  }

  onSelectCity(city: { lat: number; lon: number; name: string }): void {
    this.weatherService.getCity(city.lat, city.lon).subscribe(data => {
      const countryCode = data.address.country_code?.toUpperCase();
      const flag = countryCode ? String.fromCodePoint(...[...countryCode].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))) : '';
      this.fetchWeather(city.lat, city.lon, flag ? `${flag} ${city.name}` : city.name);
    });
  }

  useMyLocation(): void {
    this.cityName.set('Ładowanie...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this.fetchWeather(lat, lon);
        this.weatherService.getCity(lat, lon).subscribe(data => {
          const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
          const countryCode = data.address.country_code?.toUpperCase();
          const flag = countryCode ? String.fromCodePoint(...[...countryCode].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))) : '';
          this.cityName.set(flag ? `${flag} ${city}` : city);
        });
      },
      () => {
        this.cityName.set('Nie udało się pobrać lokalizacji.');
      }
    );
  }
  fetchWeather(lat: number, lon: number, cityNameOverride?: string): void {
    const processData = (data: any) => {
      if (!data) {
        this.description.set('Brak połączenia');
        return;
      }
      const times = data.hourly.time;
      const temperatures = data.hourly.temperature_2m;
      const weatherCodes = data.hourly.weathercode;

      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit'
      };
      this.dateTime.set(now.toLocaleDateString('pl-PL', options));
      const pad = (n: number) => n.toString().padStart(2, '0');
      const utcOffsetSeconds = data.utc_offset_seconds ?? 0;
      const localDate = new Date(now.getTime() + (utcOffsetSeconds + now.getTimezoneOffset() * 60) * 1000);
      localDate.setMinutes(0, 0, 0);
      const currentTimeString = `${localDate.getFullYear()}-${pad(localDate.getMonth()+1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:00`;
      const index = times.indexOf(currentTimeString);

      if (index !== -1) {
        this.temperature.set(temperatures[index]);
        const currentCode = weatherCodes[index];
        this.description.set(this.weatherDescriptions[currentCode] ?? 'Brak danych');
        this.weatherCode.set(currentCode);

        const forecastItems = [3, 6, 9]
          .map(offset => index + offset)
          .filter(i => i < times.length && temperatures[i] !== undefined)
          .map(i => ({
            time: new Date(times[i]).getHours() + ':00',
            icon: this.weatherIcons[weatherCodes[i]] ?? '🌡️',
            temp: temperatures[i]
          }));
        this.forecast.set(forecastItems);
        const chartItems = Array.from({ length: 24 }, (_, i) => index + i)
          .filter(i => i < times.length && temperatures[i] !== undefined)
          .map(i => ({
            time: new Date(times[i]).getHours() + ':00',
            temp: temperatures[i]
          }));
        this.chartData.set(chartItems);
        this.precipitation.set(data.hourly.precipitation_probability?.[index] ?? 0);
        this.windSpeed.set(data.hourly.windspeed_10m?.[index] ?? 0);
        this.windDirection.set(data.hourly.winddirection_10m?.[index] ?? 0);
        this.sunrise.set(data.daily?.sunrise?.[0] ?? '');
        this.sunset.set(data.daily?.sunset?.[0] ?? '');
        this.uvIndex.set(Math.round(data.hourly.uv_index?.[index] ?? 0));
      }
    };

    this.wsSubscription?.unsubscribe();
    this.wsSubscription = this.weatherService.connectWebSocket(lat, lon).subscribe({
      next: data => processData(data),
      error: () => this.weatherService.getWeather(lat, lon).subscribe(data => processData(data))
    });

    if (cityNameOverride) {
      this.cityName.set(cityNameOverride);
    } else {
      this.weatherService.getCity(lat, lon).subscribe(data => {
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality;
        const countryCode = data.address.country_code?.toUpperCase();
        const flag = countryCode ? String.fromCodePoint(...[...countryCode].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))) : '';
        this.cityName.set(flag ? `${flag} ${city}` : city);
      });
    }
  }
}