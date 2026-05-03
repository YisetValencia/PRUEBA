import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReservaServiciosCreate, ReservaServiciosRead, ReservaServiciosUpdate } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReservaServiciosService {
  private readonly base = `${environment.apiUrl}/reserva-servicios`; // guión — coincide con el router

  constructor(private readonly http: HttpClient) {}

  listByReserva(id_reserva: string): Observable<ReservaServiciosRead[]> {
    return this.http.get<ReservaServiciosRead[]>(`${this.base}/reserva/${id_reserva}`);
  }

  create(body: ReservaServiciosCreate): Observable<ReservaServiciosRead> {
    return this.http.post<ReservaServiciosRead>(`${this.base}/`, body);
  }

  update(id_reserva: string, id_servicio: string, body: ReservaServiciosUpdate): Observable<ReservaServiciosRead> {
    return this.http.patch<ReservaServiciosRead>(`${this.base}/${id_reserva}/${id_servicio}`, body); // PATCH
  }

  delete(id_reserva: string, id_servicio: string): Observable<void> {
    return this.http.delete(`${this.base}/${id_reserva}/${id_servicio}`, { observe: 'response' })
      .pipe(map(() => undefined));
  }
}