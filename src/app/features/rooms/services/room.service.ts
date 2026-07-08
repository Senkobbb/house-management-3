import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Room, RoomPayload } from '../../../shared/models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rooms`;

  private readonly roomsSubject = new BehaviorSubject<Room[]>([]);
  readonly rooms$ = this.roomsSubject.asObservable();

  getAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.baseUrl).pipe(tap((rooms) => this.roomsSubject.next(rooms)));
  }

  getById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/${id}`);
  }

  create(payload: RoomPayload): Observable<Room> {
    return this.http.post<Room>(this.baseUrl, payload).pipe(tap(() => this.getAll().subscribe()));
  }

  update(id: string, payload: RoomPayload): Observable<Room> {
    return this.http.put<Room>(`${this.baseUrl}/${id}`, payload).pipe(tap(() => this.getAll().subscribe()));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this.getAll().subscribe()));
  }
}
