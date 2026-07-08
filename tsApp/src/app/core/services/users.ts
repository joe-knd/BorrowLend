import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../shared/models/user.model';
import { Rating } from '../../shared/models/rating.model'
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Users {
  private baseUrl = `${environment.apiUrl}/users`;
  private ratingsBaseUrl = `${environment.apiUrl}/ratings`;
  private http = inject(HttpClient);

  login(data: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, data);
  }

  register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, data);
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/email/${email}`);
  }

  getRatingsByUserId(userId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.ratingsBaseUrl}/user/${userId}`);
  }

  changePassword(userId: string, data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${userId}/password`, data);
  }
}
