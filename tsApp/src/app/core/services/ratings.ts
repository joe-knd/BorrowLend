import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../../shared/models/rating.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Ratings {
  private baseUrl = `${environment.apiUrl}/ratings`;
  private http = inject(HttpClient);

  createRating(
    raterUserId: string,
    data: {
      ratedUserId: string;
      borrowingRecordId: number;
      rating: number;
      comment?: string;
    }
  ): Observable<Rating> {
    const params = new HttpParams().set('raterUserId', raterUserId);
    return this.http.post<Rating>(this.baseUrl, data, { params });
  }

  getRatingsForUser(userId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.baseUrl}/user/${userId}`);
  }
}
