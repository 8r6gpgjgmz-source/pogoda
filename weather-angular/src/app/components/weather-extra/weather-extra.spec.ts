import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherExtra } from './weather-extra';

describe('WeatherExtra', () => {
  let component: WeatherExtra;
  let fixture: ComponentFixture<WeatherExtra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherExtra],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherExtra);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
