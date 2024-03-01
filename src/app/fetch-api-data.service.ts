import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

const apiUrl = 'https://fathomless-coast-10170-8a6e0563517f.herokuapp.com/';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'user';

/**
 * Service for interacting with the API endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private token: string | null = localStorage.getItem(TOKEN_KEY);
  public user: any | null = localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)!) : null;

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Registers a new user.
   * @param userDetails The user details to register.
   * @returns An observable with the registration response.
   */
  userRegistration(userDetails: any): Observable<any> {
    return this.http.post(apiUrl + 'users', userDetails).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Logs in a user.
   * @param credentials The user credentials to log in.
   * @returns An observable with the login response.
   */
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

  /**
   * Retrieves all movies from the API.
   * @returns An observable with the list of movies.
   */
  getAllMovies(): Observable<any> {
    return this.http.get(apiUrl + 'movies', this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves the favorite movies of the logged-in user.
   * @returns An observable with the list of favorite movies.
   */
  getMovie(movieName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/${movieName}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves details of a director by their name.
   * @param directorName The name of the director.
   * @returns An observable with the director details.
   */
  getDirector(directorName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/directors/${directorName}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves details of a genre by its name.
   * @param genreName The name of the genre.
   * @returns An observable with the genre details.
   */
  getGenre(genreName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/genres/${genreName}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves the logged-in user's details.
   * @returns An observable with the user details.
   */
  getUser(): Observable<any> {
    return this.user;
  }

  /**
   * Adds a movie to the user's list of favorite movies.
   * @param movieName The name of the movie to add to favorites.
   * @returns An observable indicating success or failure.
   */
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
  
  /**
   * Updates the user's details.
   * @param userData The updated user data.
   * @returns An observable indicating success or failure.
   */
  editUser(userData: any): Observable<any> {
    return this.http.put(apiUrl + `users/${this.user.email}`, userData, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deletes the user account.
   * @returns An observable indicating success or failure.
   */
  deleteUser(): Observable<any> {
    return this.http.delete(apiUrl + `users/${this.user.email}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Removes a movie from the user's list of favorite movies.
   * @param movieName The name of the movie to remove from favorites.
   * @returns An observable indicating success or failure.
   */
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

  /**
   * Retrieves the user's list of favorite movies.
   * @returns An observable with the list of favorite movies.
   */
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

  /**
   * Handles HTTP error responses.
   * @param error The HTTP error response.
   * @returns An observable with the error handling logic.
   */
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
