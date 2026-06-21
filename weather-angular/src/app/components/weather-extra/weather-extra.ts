import { Component, input, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-weather-extra',
  imports: [MatCardModule],
  templateUrl: './weather-extra.html',
  styleUrl: './weather-extra.css',
})
export class WeatherExtra {
  precipitation = input<number>(0);
  windSpeed = input<number>(0);
  windDirection = input<number>(0);
  sunrise = input<string>('');
  sunset = input<string>('');

  windDirectionLabel = computed(() => {
    const d = this.windDirection();
    if (d >= 337.5 || d < 22.5) return 'płn.';
    if (d < 67.5) return 'płn.-wsch.';
    if (d < 112.5) return 'wsch.';
    if (d < 157.5) return 'płd.-wsch.';
    if (d < 202.5) return 'płd.';
    if (d < 247.5) return 'płd.-zach.';
    if (d < 292.5) return 'zach.';
    return 'płn.-zach.';
  });

  formatTime = (iso: string) => iso ? iso.slice(11, 16) : '';
}