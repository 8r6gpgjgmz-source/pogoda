import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Weather {
  private http = inject(HttpClient);

  getWeather(lat: number, lon: number): Observable<any> {
    const url = `https://kamilk38.pl/api/weather/?lat=${lat}&lon=${lon}`;
    return this.http.get<any>(url).pipe(
      catchError(() => of(null))
    );
  }

  getCity(lat: number, lon: number): Observable<any> {
    const url = `https://kamilk38.pl/api/city/?lat=${lat}&lon=${lon}`
    return this.http.get<any>(url).pipe(
      catchError(() => of({ address: { city: 'Nieznana lokalizacja' } }))
    );
  }

  connectWebSocket(lat: number, lon: number): Observable<any> {
    return new Observable(observer => {
      const socket = new WebSocket(`wss://kamilk38.pl/ws/weather/?lat=${lat}&lon=${lon}`);
      socket.onmessage = event => observer.next(JSON.parse(event.data));
      socket.onerror = () => observer.error('WebSocket error');
      socket.onclose = () => observer.complete();
      return () => socket.close();
    });
  }

  getCitiesWeather(): Observable<any[]> {
    return this.http.get<any[]>('https://kamilk38.pl/api/cities-weather/').pipe(
      catchError(() => of([]))
    );
  }
}