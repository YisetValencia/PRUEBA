import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { ServiciosAdicionalesService } from '../../core/services/servicios_adicionales.service';
import { ReservaServiciosService } from '../../core/services/reserva_servicios.service';
import { ServiciosAdicionalesRead, ReservaServiciosRead } from '../../models/api.models';
import { ReservaServiciosDialogComponent, ReservaServiciosDialogData } from './reserva_servicios-dialog';

@Component({
  selector: 'app-reserva_servicios-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './reserva_servicios-list.html',
  styleUrl: './reserva_servicios-list.scss',
})
export class ReservaServiciosListComponent implements AfterViewInit, OnInit {
  private readonly svc = inject(ReservaServiciosService);
  private readonly serviciosSvc = inject(ServiciosAdicionalesService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['servicio', 'cantidad', 'acciones'];
  readonly dataSource = new MatTableDataSource<ReservaServiciosRead>([]);
  loading = true;

  id_reserva = '';

  private readonly servicios = signal<ServiciosAdicionalesRead[]>([]);

  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) {
    if (p) {
      this.paginator = p;
      this.dataSource.paginator = p;
    }
  }

  paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.serviciosSvc.list().subscribe({
      next: (rows) => this.servicios.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  constructor() {
    this.reload();
  }

  nombreServicio(id: string): string {
    return this.servicios().find(s => s.id_servicio === id)?.nombre_servicio ?? id;
  }

  reload(): void {
    this.loading = true;
    // Usa listByReserva si hay id_reserva, si no carga vacío
    if (!this.id_reserva) {
      this.dataSource.data = [];
      this.loading = false;
      return;
    }
    this.svc.listByReserva(this.id_reserva).subscribe({
      next: (rows: ReservaServiciosRead[]) => {
        this.dataSource.data = rows;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 });
      },
    });
  }

  nuevo(): void {
    this.open({ mode: 'create', id_reserva: this.id_reserva });
  }

  editar(row: ReservaServiciosRead): void {
    this.open({ mode: 'edit', id_reserva: row.id_reserva, row });
  }

  private open(data: ReservaServiciosDialogData): void {
    this.dialog
      .open(ReservaServiciosDialogComponent, { width: '480px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: ReservaServiciosRead): void {
    if (!confirm('¿Eliminar este servicio de la reserva?')) return;
    this.svc.delete(row.id_reserva, row.id_servicio).subscribe({
      next: () => {
        this.snack.open('Servicio eliminado', 'OK', { duration: 3000 });
        this.reload();
      },
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}