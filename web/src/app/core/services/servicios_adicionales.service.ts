import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ServiciosAdicionalesCreate, ServiciosAdicionalesRead, ServiciosAdicionalesUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class ServiciosAdicionalesService {
  private readonly base = `${environment.apiUrl}/servicios_adicionales`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ServiciosAdicionalesRead[]> {
    const params = new HttpParams().set('skip', 0).set('limit', 500);
    return this.http.get<ServiciosAdicionalesRead[]>(`${this.base}/`, { params });
  }

  get(id: string): Observable<ServiciosAdicionalesRead> {
    return this.http.get<ServiciosAdicionalesRead>(`${this.base}/${id}`);
  }

  create(body: ServiciosAdicionalesCreate): Observable<ServiciosAdicionalesRead> {
    return this.http.post<ServiciosAdicionalesRead>(`${this.base}/`, body);
  }

  update(id: string, body: ServiciosAdicionalesUpdate): Observable<ServiciosAdicionalesRead> {
    return this.http.put<ServiciosAdicionalesRead>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.base}/${id}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}

