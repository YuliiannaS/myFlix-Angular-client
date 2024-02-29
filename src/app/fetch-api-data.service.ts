import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

const apiUrl = 'https://fathomless-coast-10170-8a6e0563517f.herokuapp.com/';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'user';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private token: string | null = localStorage.getItem(TOKEN_KEY);
  public user: any | null = localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null;

  constructor(private http: HttpClient, private router: Router) { }

  // User Registration
  userRegistration(userDetails: any): Observable<any> {
    return this.http.post(apiUrl + 'users', userDetails).pipe(
      catchError(this.handleError)
    );
  }

  // User Login
  userLogin(credentials: any): Observable<any> {
    return this.http.post(apiUrl + 'login', credentials).pipe(
      catchError(this.handleError),
      // Store the token on successful login
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem(TOKEN_KEY, response.token);
          this.token = response.token;
          localStorage.setItem(USER_KEY, JSON.stringify(response.user)); // Store user object
          this.user = response.user;
        }
      })
    );
  }

  // Get all movies
  getAllMovies(): Observable<any> {
    return this.http.get(apiUrl + 'movies', this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Get one movie
  getMovie(movieName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/${movieName}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Get director
  getDirector(directorName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/directors/${directorName}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Get genre
  getGenre(genreName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/genres/${genreName}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Get user
  getUser(): Observable<any> {
    return this.user;
  }

  // Add a movie to favorite Movies
  addToFavorites(movieName: string): Observable<any> {
    return this.http.post(apiUrl + `users/${this.user.email}/${movieName}`, {}, this.getHeaders()).pipe(
      catchError(error => {
        console.error('Error adding to favorites:', error);
        if (error.error && error.error.text) {
          console.log('Favorite added:', error.error.text);
          if (this.user.movies) {
            this.user.movies.push(movieName);
          } else {
            this.user.movies = [movieName];
          }
          localStorage.setItem(USER_KEY, JSON.stringify(this.user)); // Update user object in local storage
          return of({}); // Return a successful observable
        } else {
          return throwError('Unexpected error occurred'); // Throw error if response format is unexpected
        }
      })
    );
  }
  
  // Edit user
  editUser(userData: any): Observable<any> {
    return this.http.put(apiUrl + `users/${this.user.email}`, userData, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user
  deleteUser(): Observable<any> {
    return this.http.delete(apiUrl + `users/${this.user.email}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a movie from the favorite movies
  deleteFavoriteMovie(movieName: string): Observable<any> {
    return this.http.delete(apiUrl + `users/${this.user.email}/${movieName}`, this.getHeaders()).pipe(
      catchError(error => {
        console.error('Error removing from favorites:', error);
        if (error.error && error.error.text) {
          console.log('Favorite removed:', error.error.text);
          if (this.user.movies) {
            const index = this.user.movies.indexOf(movieName);
            if (index !== -1) {
              this.user.movies.splice(index, 1);
              localStorage.setItem(USER_KEY, JSON.stringify(this.user)); // Update user object in local storage
            }
          }
          return of({}); // Return a successful observable
        } else {
          return throwError('Unexpected error occurred'); // Throw error if response format is unexpected
        }
      }),
      tap(() => {
        console.log('Movie removed from favorites');
      })
    );
  }

  getUserFavoriteMovies(): Observable<any[]> {
    // Check if user is logged in
    if (!this.token) {
      return throwError('User is not logged in');
    }

    // Check if user has favorite movies
    if (this.user && this.user.movies && this.user.movies.length > 0) {
      // Retrieve all movies
      return this.getAllMovies().pipe(
        catchError(() => throwError('Failed to retrieve movies data')),
        // Filter movies to include only favorites
        map((movies: any[]) => movies.filter(movie => this.user.movies.includes(movie.title)))
      );
    } else {
      return throwError('User has no favorite movies');
    }
  }

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    } else {
      this.router.navigate(['/']);
    }
    return { headers };
  }

  private handleError(error: HttpErrorResponse): any {
    if (error.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      this.token = null;
      this.user = null;
      this.router.navigate(['/']);
    } else if (error.status >= 400 && error.status < 500) {
      // Client-side errors, handle as needed
    } else {
      console.error('Full error response:', error);
      return throwError('Something bad happened; please try again later.');
    }
  }
}
