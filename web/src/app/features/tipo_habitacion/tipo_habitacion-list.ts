import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CurrencyPipe } from '@angular/common'; // Para el formato de dinero
import { filter } from 'rxjs/operators';

import { TipoHabitacionService } from '../../core/services/tipo_habitacion.service';
import { TipoHabitacionRead } from '../../models/api.models';
import { TipoHabitacionDialogComponent, TipoHabitacionDialogData } from './tipo_habitacion-dialog';

@Component({
  selector: 'app-tipo_habitacion-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
   
  ],
  templateUrl: './tipo_habitacion-list.html',
  styleUrl: './tipo_habitacion-list.scss',
})
export class TipoHabitacionListComponent implements AfterViewInit {
  private readonly svc = inject(TipoHabitacionService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  // Columnas actualizadas para tu proyecto
  readonly displayedColumns = [
    'nombre',
    'descripcion',
    'acciones',
  ];
  
  readonly dataSource = new MatTableDataSource<TipoHabitacionRead>([]);
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

  editar(row: TipoHabitacionRead): void {
    this.open({ mode: 'edit', row });
  }

  private open(data: TipoHabitacionDialogData): void {
    this.dialog
      .open(TipoHabitacionDialogComponent, { width: '480px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: TipoHabitacionRead): void {
    if (!confirm(`¿Eliminar el tipo de habitación: ${row.nombre_tipo}?`)) return;
    
    // Ajusta id_tipo_habitacion según el nombre real en tu modelo
    this.svc.delete(row.id_tipo).subscribe({
      next: () => {
        this.snack.open('Tipo de habitación eliminado', 'OK', { duration: 3000 });
        this.reload();
      },
      error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}