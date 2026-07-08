import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BorrowingRecord } from '../../shared/models/borrowing-record.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Borrowings {
  private baseUrl = `${environment.apiUrl}/borrowings`;
  private http = inject(HttpClient);

  borrowItem(
    borrowerId: string,
    data: { itemId: number; dueDate?: string; notes?: string }
  ): Observable<BorrowingRecord> {
    const params = new HttpParams().set('borrowerId', borrowerId);
    return this.http.post<BorrowingRecord>(this.baseUrl, data, { params });
  }

  approveBorrow(id: number, ownerId: string): Observable<BorrowingRecord> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.post<BorrowingRecord>(`${this.baseUrl}/${id}/approve`, {}, { params });
  }

  rejectBorrow(id: number, ownerId: string): Observable<BorrowingRecord> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.post<BorrowingRecord>(`${this.baseUrl}/${id}/reject`, {}, { params });
  }

  requestReturn(id: number, ownerId: string): Observable<BorrowingRecord> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.post<BorrowingRecord>(`${this.baseUrl}/${id}/request-return`, {}, { params });
  }

  initiateReturn(id: number, borrowerId: string, notes?: string): Observable<BorrowingRecord> {
    const params = new HttpParams().set('borrowerId', borrowerId);
    return this.http.post<BorrowingRecord>(`${this.baseUrl}/${id}/initiate-return`, { notes }, { params });
  }

  confirmReturn(id: number, ownerId: string, data: { rating?: number; comment?: string; notes?: string }): Observable<BorrowingRecord> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.post<BorrowingRecord>(`${this.baseUrl}/${id}/confirm-return`, data, { params });
  }

  markLost(id: number, ownerId: string, data: { rating?: number; comment?: string; notes?: string }): Observable<BorrowingRecord> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.post<BorrowingRecord>(`${this.baseUrl}/${id}/lost`, data, { params });
  }

  getById(id: number): Observable<BorrowingRecord> {
    return this.http.get<BorrowingRecord>(`${this.baseUrl}/${id}`);
  }

  getBorrowedBy(userId: string): Observable<BorrowingRecord[]> {
    return this.http.get<BorrowingRecord[]>(`${this.baseUrl}/borrowed-by/${userId}`);
  }

  getLentBy(userId: string): Observable<BorrowingRecord[]> {
    return this.http.get<BorrowingRecord[]>(`${this.baseUrl}/lent-by/${userId}`);
  }
}
