import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-air-quality',
  imports: [],
  templateUrl: './air-quality.html',
  styleUrl: './air-quality.css',
})
export class AirQuality {
  uvIndex = input<number>(0);
  isOpen = signal(false);

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  getUvLabel(): string {
    const uv = this.uvIndex();
    if (uv <= 2) return 'Niski';
    if (uv <= 5) return 'Umiarkowany';
    if (uv <= 7) return 'Wysoki';
    if (uv <= 10) return 'Bardzo wysoki';
    return 'Ekstremalny';
  }

  getUvColor(): string {
    const uv = this.uvIndex();
    if (uv <= 2) return '#4caf50';
    if (uv <= 5) return '#ffeb3b';
    if (uv <= 7) return '#ff9800';
    if (uv <= 10) return '#f44336';
    return '#9c27b0';
  }
}