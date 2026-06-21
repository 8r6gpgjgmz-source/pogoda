import { Component, input, effect, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import lottie, { AnimationItem } from 'lottie-web';
import sunny from '../../../../public/lottie/sunny.json';
import cloudy from '../../../../public/lottie/cloudy.json';
import rainy from '../../../../public/lottie/rainy.json';
import snowy from '../../../../public/lottie/snowy.json';
import stormy from '../../../../public/lottie/stormy.json';

@Component({
  selector: 'app-weather-icon',
  templateUrl: './weather-icon.html',
  styleUrl: './weather-icon.css',
})
export class WeatherIcon implements OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  weatherCode = input<number>(0);
  size = input<string>('120px');

  private animation: AnimationItem | null = null;

  constructor() {
    effect(() => {
      const code = this.weatherCode();
      this.loadAnimation(code);
    });
  }

  private loadAnimation(code: number): void {
    if (this.animation) {
      this.animation.destroy();
      this.animation = null;
    }

    let animData: any = cloudy;
    if (code === 0) animData = sunny;
    else if (code <= 3) animData = cloudy;
    else if (code >= 61 && code <= 67) animData = rainy;
    else if (code >= 71 && code <= 77) animData = snowy;
    else if (code >= 95) animData = stormy;

    this.animation = lottie.loadAnimation({
      container: this.container.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: animData,
    });
  }

  ngOnDestroy(): void {
    if (this.animation) this.animation.destroy();
  }
}