import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitiesWeather } from './cities-weather';

describe('CitiesWeather', () => {
  let component: CitiesWeather;
  let fixture: ComponentFixture<CitiesWeather>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitiesWeather],
    }).compileComponents();

    fixture = TestBed.createComponent(CitiesWeather);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
