import { Component, output, inject } from '@angular/core';
import { FavoritesService, City } from '../../favorites.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites {
  private favoritesService = inject(FavoritesService);

  favorites = this.favoritesService.favorites;
  selectCity = output<City>();

  removeFavorite(index: number): void {
    this.favoritesService.removeFavorite(index);
  }

  select(city: City): void {
    this.selectCity.emit(city);
  }
}
