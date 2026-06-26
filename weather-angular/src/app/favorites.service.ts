import { Injectable, signal } from '@angular/core';

export interface City {
  name: string;
  lat: number;
  lon: number;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  favorites = signal<City[]>([]);

  constructor() {
    const saved = localStorage.getItem('favorites');
    if (saved) this.favorites.set(JSON.parse(saved));
  }

  addFavorite(city: City): void {
    if (this.favorites().some(c => c.name === city.name)) return;
    const updated = [...this.favorites(), city];
    this.favorites.set(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  }

  removeFavorite(index: number): void {
    const updated = this.favorites().filter((_, i) => i !== index);
    this.favorites.set(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  }
}
