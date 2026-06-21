import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirQuality } from './air-quality';

describe('AirQuality', () => {
  let component: AirQuality;
  let fixture: ComponentFixture<AirQuality>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirQuality],
    }).compileComponents();

    fixture = TestBed.createComponent(AirQuality);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
