import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const apiUrl = 'https://fathomless-coast-10170-8a6e0563517f.herokuapp.com/';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
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
      catchError(this.handleError)
    );
  }

  // Get all movies
  getAllMovies(): Observable<any> {
    return this.http.get(apiUrl + 'movies').pipe(
      catchError(this.handleError)
    );
  }

  // Get one movie
  getMovie(movieName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/${movieName}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get director
  getDirector(directorName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/directors/${directorName}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get genre
  getGenre(genreName: string): Observable<any> {
    return this.http.get(apiUrl + `movies/genres/${genreName}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get user
  getUser(userName: string): Observable<any> {
    return this.http.get(apiUrl + `users/${userName}`).pipe(
      catchError(this.handleError)
    );
  }

  // Add a movie to favorite Movies
  addToFavorites(useremail: string, movieName: string): Observable<any> {
    return this.http.post(apiUrl + `users/${useremail}/movies/${movieName}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Edit user
  editUser(userEmail: string, userData: any): Observable<any> {
    return this.http.put(apiUrl + `users/${userEmail}`, userData).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user
  deleteUser(userEmail: string): Observable<any> {
    return this.http.delete(apiUrl + `users/${userEmail}`).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a movie from the favorite movies
  deleteFavoriteMovie(userEmail: string, movieName: string): Observable<any> {
    return this.http.delete(apiUrl + `users/${userEmail}/movies/${movieName}`).pipe(
      catchError(this.handleError)
    );
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
