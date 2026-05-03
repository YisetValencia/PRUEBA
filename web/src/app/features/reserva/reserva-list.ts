import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { UsuarioService } from '../../core/services/usuario.service';
import { HabitacionService } from '../../core/services/habitacion.service';
import { ReservaService } from '../../core/services/reserva.service';
import { UsuarioRead, HabitacionRead, ReservaRead } from '../../models/api.models';
import { ReservaDialogComponent, ReservaDialogData } from './reserva-dialog';

@Component({
  selector: 'app-reserva-list',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './reserva-list.html',
  styleUrl: './reserva-list.scss',
})
export class ReservaListComponent implements AfterViewInit, OnInit {
  private readonly svc = inject(ReservaService);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly habitacionSvc = inject(HabitacionService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = [
    'cliente', 'habitacion', 'fecha_entrada', 'fecha_salida',
    'noches', 'personas', 'costo_total', 'acciones',
  ];
  readonly dataSource = new MatTableDataSource<ReservaRead>([]);
  loading = true;

  private readonly usuarios = signal<UsuarioRead[]>([]);
  private readonly habitaciones = signal<HabitacionRead[]>([]);

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
    this.usuarioSvc.list().subscribe({
      next: (rows) => this.usuarios.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
    this.habitacionSvc.list().subscribe({
      next: (rows) => this.habitaciones.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  constructor() {
    this.reload();
  }

  nombreUsuario(id: string): string {
    const u = this.usuarios().find(u => u.id_usuario === id);
    return u ? `${u.nombre} ${u.apellidos}` : id;
  }

  nombreHabitacion(id: string): string {
    const h = this.habitaciones().find(h => h.id_habitacion === id);
    return h ? `N° ${h.numero} — ${h.tipo}` : id;
  }

  filtrar(query: string): void {
    const q = query.trim().toLowerCase();
    this.dataSource.filterPredicate = (row: ReservaRead) => {
      const cliente = this.nombreUsuario(row.id_usuario).toLowerCase();
      const habitacion = this.nombreHabitacion(row.id_habitacion).toLowerCase();
      return cliente.includes(q) || habitacion.includes(q);
    };
    this.dataSource.filter = q || ' ';
    if (!q) this.dataSource.filter = '';
  }

  reload(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (rows) => {
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
    this.open({ mode: 'create' });
  }

  editar(row: ReservaRead): void {
    this.open({ mode: 'edit', row });
  }

  private open(data: ReservaDialogData): void {
    this.dialog
      .open(ReservaDialogComponent, { width: '600px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: ReservaRead): void {
    if (!confirm(`¿Eliminar la reserva de ${this.nombreUsuario(row.id_usuario)}?`)) return;
    this.svc.delete(row.id_reserva).subscribe({
      next: () => {
        this.snack.open('Reserva eliminada', 'OK', { duration: 3000 });
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