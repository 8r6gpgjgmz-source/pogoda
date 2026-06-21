import { Component, OnInit, inject, signal } from '@angular/core';
import { Weather } from '../../weather';
import { WEATHER_ICONS } from '../../weather-codes';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-cities-weather',
  imports: [MatCardModule],
  templateUrl: './cities-weather.html',
  styleUrl: './cities-weather.css',
})
export class CitiesWeather implements OnInit {
  private weatherService = inject(Weather);

  cities = signal<{ city: string; temperature: number; weathercode: number }[]>([]);

  private weatherIcons = WEATHER_ICONS;

  ngOnInit(): void {
    this.weatherService.getCitiesWeather().subscribe(data => {
      this.cities.set(data);
    });
  }

  getIcon(code: number): string {
    return this.weatherIcons[code] ?? '🌡️';
  }
}