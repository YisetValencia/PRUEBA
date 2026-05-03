import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { filter } from 'rxjs/operators';

import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioRead } from '../../models/api.models';
import { UsuarioDialogComponent, UsuarioDialogData } from './usuario-dialog';

@Component({
  selector: 'app-usuario-list',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.scss',
})
export class UsuarioListComponent implements AfterViewInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  readonly displayedColumns = [
    'nombre', 'apellidos', 'telefono', 'tipo_usuario', 'nombre_usuario', 'acciones',
  ];
  readonly dataSource = new MatTableDataSource<UsuarioRead>([]);
  loading = true;

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

  constructor() {
    this.reload();
  }

  filtrar(query: string): void {
    const q = query.trim().toLowerCase();
    this.dataSource.filterPredicate = (row: UsuarioRead) =>
      row.nombre.toLowerCase().includes(q) ||
      row.apellidos.toLowerCase().includes(q) ||
      row.nombre_usuario.toLowerCase().includes(q) ||
      row.tipo_usuario.toLowerCase().includes(q);
    this.dataSource.filter = q || '';
  }

  reload(): void {
    this.loading = true;
    this.usuarioService.list().subscribe({
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
    this.openDialog({ mode: 'create' });
  }

  editar(row: UsuarioRead): void {
    this.openDialog({ mode: 'edit', row });
  }

  private openDialog(data: UsuarioDialogData): void {
    this.dialog
      .open(UsuarioDialogComponent, { width: '520px', data })
      .afterClosed()
      .pipe(filter(Boolean))
      .subscribe(() => this.reload());
  }

  eliminar(row: UsuarioRead): void {
    if (!confirm(`¿Eliminar usuario ${row.nombre_usuario}?`)) return;
    this.usuarioService.delete(row.id_usuario).subscribe({
      next: () => {
        this.snack.open('Usuario eliminado', 'OK', { duration: 3000 });
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