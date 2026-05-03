import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HabitacionCreate, HabitacionRead, HabitacionUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class HabitacionService {
  private readonly base = `${environment.apiUrl}/habitaciones`;  // plural — coincide con el router de FastAPI

  constructor(private readonly http: HttpClient) {}

  list(): Observable<HabitacionRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<HabitacionRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<HabitacionRead> {
    return this.http.get<HabitacionRead>(`${this.base}/${id}`);
  }

  create(body: HabitacionCreate): Observable<HabitacionRead> {
    return this.http.post<HabitacionRead>(`${this.base}/`, body);
  }

  update(id: string, body: HabitacionUpdate): Observable<HabitacionRead> {
    return this.http.put<HabitacionRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }

  // Alterna disponible/ocupada — PATCH /habitaciones/{id}/cambiar-disponible
  cambiarDisponible(id: string): Observable<HabitacionRead> {
    return this.http.patch<HabitacionRead>(`${this.base}/${id}/cambiar-disponible`, {});
  }
}