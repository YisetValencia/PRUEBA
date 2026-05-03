import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReservaCreate, ReservaRead, ReservaUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly base = `${environment.apiUrl}/reserva`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ReservaRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<ReservaRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<ReservaRead> {
    return this.http.get<ReservaRead>(`${this.base}/${id}`);
  }

  create(body: ReservaCreate): Observable<ReservaRead> {
    return this.http.post<ReservaRead>(`${this.base}/`, body);
  }

  update(id: string, body: ReservaUpdate): Observable<ReservaRead> {
    return this.http.patch<ReservaRead>(`${this.base}/${id}`, body); // PATCH — coincide con el router
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}