import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Bill, BillPayload } from '../../../shared/models/bill.model';

@Injectable({ providedIn: 'root' })
export class BillService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bills`;

  getAll(): Observable<Bill[]> {
    return this.http.get<Bill[]>(this.baseUrl);
  }

  getById(id: string): Observable<Bill> {
    return this.http.get<Bill>(`${this.baseUrl}/${id}`);
  }

  create(payload: BillPayload): Observable<Bill> {
    return this.http.post<Bill>(this.baseUrl, payload);
  }

  update(id: string, payload: BillPayload): Observable<Bill> {
    return this.http.put<Bill>(`${this.baseUrl}/${id}`, payload);
  }

  markAsPaid(id: string): Observable<Bill> {
    return this.http.patch<Bill>(`${this.baseUrl}/${id}/pay`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
