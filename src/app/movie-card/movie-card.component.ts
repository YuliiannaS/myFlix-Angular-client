import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenreDialogComponent } from '../genre-dialog/genre-dialog.component';
import { DirectorDialogComponent } from '../director-dialog/director-dialog.component';
import { DetailsDialogComponent } from '../details-dialog/details-dialog.component';
import { ApiService } from '../fetch-api-data.service';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss']
})
export class MovieCardComponent implements OnInit {
  movies: any[] = [];

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // Load movies data
    this.loadMovies();
  }

  openGenreDialog(genre: any): void {
    this.dialog.open(GenreDialogComponent, {
      width: '400px',
      data: { genre }
    });
  }

  openDirectorDialog(director: any): void {
    this.dialog.open(DirectorDialogComponent, {
      width: '400px',
      data: { director }
    });
  }

  openDetailsDialog(movie: any): void {
    this.dialog.open(DetailsDialogComponent, {
      width: '400px',
      data: { movie }
    });
  }

  addToFavorites(movie: any): void {
    this.apiService.addToFavorites(movie.title).subscribe(response => {
      console.log('Added to favorites:', response);
      // Update local movies array
      movie.favorite = true;
    }, error => {
      console.error('Error adding to favorites:', error);
    });
  }

  toggleFavorite(movie: any): void {
    if (this.isFavorite(movie)) {
      // Remove from favorites
      this.removeFavorite(movie);
    } else {
      // Add to favorites
      this.addToFavorites(movie);
    }
  }

  private removeFavorite(movie: any): void {
    this.apiService.deleteFavoriteMovie(movie.title).subscribe(response => {
      console.log('Removed from favorites:', response);
      // Update local movies array
      movie.favorite = false;
    }, error => {
      console.error('Error removing from favorites:', error);
    });
  }

  private loadMovies(): void {
    // Fetch movies data from API
    this.apiService.getAllMovies().subscribe(data => {
      this.movies = data;
      // Check and mark favorites
      this.movies.forEach(movie => {
        movie.favorite = this.isFavorite(movie);
      });
    }, error => {
      console.error('Error loading movies:', error);
    });
  }

  private isFavorite(movie: any): boolean {
    // Check if the movie title exists in user's favorites in local storage
    if (this.apiService.user && this.apiService.user.movies) {
      return this.apiService.user.movies.includes(movie.title);
    }
    return false;
  }
}
