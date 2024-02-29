import { Component, OnInit } from '@angular/core';
import { ApiService } from '../fetch-api-data.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  favoritedMovies: any[] = [];
  user: any;
  password: string = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadFavoriteMovies();
    // Fetch user data
    this.user = this.apiService.getUser();
  }

  loadFavoriteMovies(): void {
    // Fetch favorited movies from the ApiService
    this.apiService.getUserFavoriteMovies().subscribe(
      (data: any[]) => {
        this.favoritedMovies = data;
      },
      (error) => {
        console.error('Error loading favorite movies:', error);
      }
    );
  }

  onSubmit(): void {
    // Update user data
    const userData = {
      username: this.user.username,
      // password: this.password
    };

    this.apiService.editUser(userData).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        // Optionally, reset the password field after submission
        this.password = '';
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }
}
