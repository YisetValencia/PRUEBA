import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TipoHabitacionCreate, TipoHabitacionRead, TipoHabitacionUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class TipoHabitacionService {
  private readonly base = `${environment.apiUrl}/tipo_habitacion`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<TipoHabitacionRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<TipoHabitacionRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<TipoHabitacionRead> {
    return this.http.get<TipoHabitacionRead>(`${this.base}/${id}`);
  }

  create(body: TipoHabitacionCreate): Observable<TipoHabitacionRead> {
    return this.http.post<TipoHabitacionRead>(`${this.base}/`, body);
  }

  update(id: string, body: TipoHabitacionUpdate): Observable<TipoHabitacionRead> {
    return this.http.put<TipoHabitacionRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}

