import { Component, input, effect, ElementRef, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { WeatherIcon } from '../components/weather-icon/weather-icon';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

@Component({
  selector: 'app-weather-card',
  imports: [MatCardModule, WeatherIcon],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.css',
})
export class WeatherCard {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  cityName = input<string>('');
  temperature = input<number>(0);
  description = input<string>('');
  dateTime = input<string>('');
  forecast = input<{ time: string; icon: string; temp: number }[]>([]);
  chartData = input<{ time: string; temp: number }[]>([]);
  weatherCode = input<number>(0);

  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      const data = this.chartData();
      if (data.length > 0) {
        setTimeout(() => this.renderChart(data), 100);
      }
    });
  }

  private renderChart(data: { time: string; temp: number }[]): void {
    if (!this.chartCanvas) return;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: data.map(d => d.time),
        datasets: [{
          data: data.map(d => d.temp),
          borderColor: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(255, 255, 255, 0.9)',
          pointRadius: 3,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.7)', maxTicksLimit: 6 }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    });
  }
}