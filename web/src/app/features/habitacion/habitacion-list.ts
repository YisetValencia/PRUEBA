import { CurrencyPipe } from '@angular/common';
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

import { TipoHabitacionService } from '../../core/services/tipo_habitacion.service';
import { HabitacionService } from '../../core/services/habitacion.service';
import { TipoHabitacionRead, HabitacionRead } from '../../models/api.models';
import { HabitacionDialogComponent, HabitacionDialogData } from './habitacion-dialog';

@Component({
  selector: 'app-habitacion-list',
  imports: [
    CurrencyPipe,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './habitacion-list.html',
  styleUrl: './habitacion-list.scss',
})
export class HabitacionListComponent implements OnInit, AfterViewInit {
  private readonly svc = inject(HabitacionService);
  private readonly tipoSvc = inject(TipoHabitacionService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['numero', 'tipo', 'precio', 'disponibilidad', 'acciones'];
  readonly dataSource = new MatTableDataSource<HabitacionRead>([]);
  loading = true;

  private readonly tipos = signal<TipoHabitacionRead[]>([]);

  @ViewChild(MatPaginator) set matPaginator(p: MatPaginator) {
  if (p) {
    this.paginator = p;
    this.dataSource.paginator = p;
  }
}

paginator!: MatPaginator;

  ngOnInit(): void {
    this.tipoSvc.list().subscribe({
      next: (rows) => this.tipos.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
    this.reload();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

 
  nombreTipo(id: string): string {
    return this.tipos().find(t => t.id_tipo === id)?.nombre_tipo ?? id;
  }

  reload(): void {
    this.loading = true;
    this.svc.list().subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.dataSource.paginator = this.paginator;
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

  editar(row: HabitacionRead): void {
    this.open({ mode: 'edit', row });
  }

  private open(data: HabitacionDialogData): void {
    this.dialog
      .open(HabitacionDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: HabitacionRead): void {
    if (!confirm(`¿Eliminar habitación ${row.numero}?`)) return;
    this.svc.delete(row.id_habitacion).subscribe({
      next: () => {
        this.snack.open('Habitación eliminada', 'OK', { duration: 3000 });
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