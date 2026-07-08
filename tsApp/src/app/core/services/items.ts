import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../../shared/models/item.model';
import { PaginatedItems } from '../../shared/models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Items {
  private baseUrl = `${environment.apiUrl}/items`;
  private http = inject(HttpClient);

  createItem(formData: FormData): Observable<Item> {
    return this.http.post<Item>(this.baseUrl, formData);
  }

  getById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }

  getAll(params: {
    searchQuery?: string;
    status?: string;
    ownerId?: string;
    pageNumber?: number;
    pageSize?: number;
    cacheBuster?: number;
  }): Observable<PaginatedItems> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http.get<PaginatedItems>(this.baseUrl, { params: httpParams });
  }

  getAvailable(params: {
    excludeOwnerId?: string;
    searchQuery?: string;
    pageNumber?: number;
    pageSize?: number;
    cacheBuster?: number;
  }): Observable<PaginatedItems> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value);
      }
    });

    return this.http.get<PaginatedItems>(`${this.baseUrl}/available`, {
      params: httpParams
    });
  }

  getOwnedBy(ownerId: string, pageNumber = 1, pageSize = 10): Observable<PaginatedItems> {
    const normalizedOwnerId = ownerId.trim();
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('_ts', Date.now());

    return this.http.get<PaginatedItems>(`${this.baseUrl}/owned-by/${encodeURIComponent(normalizedOwnerId)}`, {
      params
    });
  }

  updateItem(id: number, formData: FormData): Observable<Item> {
    return this.http.put<Item>(`${this.baseUrl}/${id}`, formData);
  }

  deleteItem(id: number, ownerId: string): Observable<void> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { params });
  }

  toggleDisable(id: number, ownerId: string): Observable<Item> {
    const params = new HttpParams().set('ownerId', ownerId);
    return this.http.post<Item>(`${this.baseUrl}/${id}/toggle-disable`, {}, { params });
  }
}
