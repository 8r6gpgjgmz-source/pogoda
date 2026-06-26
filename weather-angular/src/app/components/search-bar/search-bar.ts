import { Component, output, signal, inject } from '@angular/core';
import { FavoritesService, City } from '../../favorites.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  private favoritesService = inject(FavoritesService);

  cityInput = signal<string>('');
  searchResults = signal<City[]>([]);
  selectCity = output<City>();
  private debounceTimer: any = null;

  onType(value: string): void {
    this.cityInput.set(value);
    clearTimeout(this.debounceTimer);
    if (value.trim().length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.debounceTimer = setTimeout(() => this.search(), 400);
  }

  search(): void {
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

  pick(city: City): void {
    const shortCity = { ...city, name: city.name.split(',')[0].trim() };
    this.selectCity.emit(shortCity);
    this.cityInput.set('');
    this.searchResults.set([]);
  }

  addToFavorites(city: City, event: Event): void {
    event.stopPropagation();
    const shortCity = { ...city, name: city.name.split(',')[0].trim() };
    this.favoritesService.addFavorite(shortCity);
  }

  isFavorite(city: City): boolean {
    const shortName = city.name.split(',')[0].trim();
    return this.favoritesService.favorites().some(c => c.name === shortName);
  }
}
