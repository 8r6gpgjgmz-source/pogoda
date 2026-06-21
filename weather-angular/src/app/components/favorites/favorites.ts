import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {
  cityInput = signal<string>('');
  favorites = signal<{ name: string; lat: number; lon: number }[]>([]);
  selectCity = output<{ lat: number; lon: number; name: string }>();
  searchResults = signal<{ name: string; lat: number; lon: number }[]>([]);

  constructor() {
    const saved = localStorage.getItem('favorites');
    if (saved) this.favorites.set(JSON.parse(saved));
  }

  addFavorite(): void {
    const name = this.cityInput().trim();
    if (!name) return;
  
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=5`)
      .then(r => r.json())
      .then(results => {
        this.searchResults.set(results.map((r: any) => ({
          name: r.display_name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon)
        })));
      })
      .catch(() => {
        this.searchResults.set([]);
      });
  }

  pickResult(city: { name: string; lat: number; lon: number }): void {
    const shortName = city.name.split(',')[0].trim();
    const cityWithShortName = { ...city, name: shortName };
    const updated = [...this.favorites(), cityWithShortName];
    this.favorites.set(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    this.cityInput.set('');
    this.searchResults.set([]);
  }

  removeFavorite(index: number): void {
    const updated = this.favorites().filter((_, i) => i !== index);
    this.favorites.set(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  }

  select(city: { name: string; lat: number; lon: number }): void {
    this.selectCity.emit(city);
  }
}