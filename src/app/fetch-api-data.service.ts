import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

const apiUrl = 'https://fathomless-coast-10170-8a6e0563517f.herokuapp.com/';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private token: string | null = null;

  constructor(private http: HttpClient) { }

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
          this.token = response.token;
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
  getUser(userName: string): Observable<any> {
    return this.http.get(apiUrl + `users/${userName}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Add a movie to favorite Movies
  addToFavorites(useremail: string, movieName: string): Observable<any> {
    return this.http.post(apiUrl + `users/${useremail}/movies/${movieName}`, {}, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Edit user
  editUser(userEmail: string, userData: any): Observable<any> {
    return this.http.put(apiUrl + `users/${userEmail}`, userData, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user
  deleteUser(userEmail: string): Observable<any> {
    return this.http.delete(apiUrl + `users/${userEmail}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a movie from the favorite movies
  deleteFavoriteMovie(userEmail: string, movieName: string): Observable<any> {
    return this.http.delete(apiUrl + `users/${userEmail}/movies/${movieName}`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return { headers };
  }

  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('Some error occurred:', error.error.message);
    } else {
      console.error(`Error Status code ${error.status}, Error body is: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }
}
