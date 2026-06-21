import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherBackground } from './weather-background';

describe('WeatherBackground', () => {
  let component: WeatherBackground;
  let fixture: ComponentFixture<WeatherBackground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherBackground],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherBackground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
