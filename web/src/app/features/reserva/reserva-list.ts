  import { CurrencyPipe, DatePipe, SlicePipe } from '@angular/common';
  import { HttpErrorResponse } from '@angular/common/http';
  import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
  import { MatButtonModule } from '@angular/material/button';
  import { MatDialog } from '@angular/material/dialog';
  import { MatIconModule } from '@angular/material/icon';
  import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
  import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
  import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
  import { MatTableDataSource, MatTableModule } from '@angular/material/table';
  import { MatChipsModule } from '@angular/material/chips';
  import { filter } from 'rxjs/operators';

  import { ReservaService } from '../../core/services/reserva.service';
  import { ReservaRead } from '../../models/api.models';
  import { ReservaDialogComponent, ReservaDialogData } from './reserva-dialog';

  @Component({
    selector: 'app-reserva-list',
    imports: [
      CurrencyPipe,
      DatePipe,
      SlicePipe,
      MatTableModule,
      MatPaginatorModule,
      MatButtonModule,
      MatIconModule,
      MatProgressSpinnerModule,
      MatSnackBarModule,
      MatChipsModule,
    ],
    templateUrl: './reserva-list.html',
    styleUrls: ['./reserva-list.scss'],
  })
  export class ReservaListComponent implements AfterViewInit {
    private readonly svc: ReservaService = inject(ReservaService);
    private readonly dialog = inject(MatDialog);
    private readonly snack = inject(MatSnackBar);

    // Columnas para reservas (diferente a servicios)
    readonly displayedColumns = [
      'id_reserva', 
      'habitacion', 
      'fecha_entrada', 
      'fecha_salida', 
      'noches', 
      'numero_de_personas', 
      'costo_total', 
      'estado_reserva', 
      'acciones'
    ];
    
    readonly dataSource = new MatTableDataSource<ReservaRead>([]);
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
        next: (rows: ReservaRead[]) => {
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
        .open(ReservaDialogComponent, { width: '600px', data })  // Ancho mayor para reservas
        .afterClosed()
        .pipe(filter(Boolean))
        .subscribe(() => this.reload());
    }

    eliminar(row: ReservaRead): void {
      if (!confirm(`¿Eliminar reserva ${row.id_reserva}?`)) return;
      this.svc.delete(row.id_reserva).subscribe({
        next: () => {
          this.snack.open('Reserva eliminada', 'OK', { duration: 3000 });
          this.reload();
        },
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
    }

    // Función para obtener color según estado (opcional, mejora visual)
    getEstadoColor(estado: string): string {
      switch(estado?.toLowerCase()) {
        case 'confirmada': return 'primary';
        case 'pendiente': return 'warn';
        case 'cancelada': return '';
        case 'finalizada': return 'accent';
        default: return '';
      }
    }

    private msg(err: HttpErrorResponse): string {
      const d = err.error?.detail;
      if (typeof d === 'string') return d;
      if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
      return err.message;
    }
  }