import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';


import { ServiciosAdicionalesService } from '../../core/services/servicios_adicionales.service';
import { ServiciosAdicionalesRead } from '../../models/api.models';
import { ServiciosAdicionalesDialogComponent, ServiciosAdicionalesDialogData } from './servicios_adicionales-dialog';

@Component({
  selector: 'app-servicios_adicionales-list',
  imports: [
    CurrencyPipe,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './servicios_adicionales-list.html',
  styleUrl: './servicios_adicionales-list.scss',
})
export class ServiciosAdicionalesListComponent implements AfterViewInit {
  private readonly svc = inject(ServiciosAdicionalesService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = ['nombre', 'precio', 'descripcion', 'acciones'];
  readonly dataSource = new MatTableDataSource<ServiciosAdicionalesRead>([]);
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  constructor() {
    this.reload();
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

  editar(row: ServiciosAdicionalesRead): void {
    this.open({ mode: 'edit', row });
  }

  private open(data: ServiciosAdicionalesDialogData): void {
    this.dialog
      .open(ServiciosAdicionalesDialogComponent, { width: '480px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: ServiciosAdicionalesRead): void {
    if (!confirm(`¿Eliminar servicio ${row.nombre_servicio}?`)) return;
    this.svc.delete(row.id_servicio).subscribe({
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