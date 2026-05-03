import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuditContextService } from '../../core/audit-context.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ServiciosAdicionalesService } from '../../core/services/servicios_adicionales.service';
import { ReservaService } from '../../core/services/reserva.service';
import { ReservaServiciosService } from '../../core/services/reserva_servicios.service';
import { HabitacionService } from '../../core/services/habitacion.service';
import {
  UsuarioRead,
  ServiciosAdicionalesRead,
  ReservaRead,
  HabitacionRead,
} from '../../models/api.models';

export interface ReservaDialogData {
  mode: 'create' | 'edit';
  row?: ReservaRead;
}

@Component({
  selector: 'app-reserva-dialog',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './reserva-dialog.html',
  styleUrls: ['./reserva-list.scss'],
})
export class ReservaDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(ReservaService);
  private readonly reservaSvcSvc = inject(ReservaServiciosService);
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly serviciosSvc = inject(ServiciosAdicionalesService);
  private readonly habitacionSvc = inject(HabitacionService);
  private readonly audit = inject(AuditContextService);
  private readonly dialogRef = inject(MatDialogRef<ReservaDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<ReservaDialogData>(MAT_DIALOG_DATA);

  private readonly todosUsuarios = signal<UsuarioRead[]>([]);
  readonly clientesFiltrados = signal<UsuarioRead[]>([]);
  readonly servicios    = signal<ServiciosAdicionalesRead[]>([]);
  readonly habitaciones = signal<HabitacionRead[]>([]);

  readonly clienteSearch = new FormControl('');
  private clienteSeleccionado: UsuarioRead | null = null;

  readonly cantidades = signal<Record<string, number>>({});

  readonly form = this.fb.nonNullable.group({
    id_habitacion: [
      this.data.mode === 'edit' ? (this.data.row?.id_habitacion ?? '') : '',
      Validators.required,
    ],
    fecha_entrada: [
      this.data.mode === 'edit' ? (this.data.row?.fecha_entrada ?? '') : '',
      Validators.required,
    ],
    fecha_salida: [
      this.data.mode === 'edit' ? (this.data.row?.fecha_salida ?? '') : '',
      Validators.required,
    ],
    numero_de_personas: [
      this.data.mode === 'edit' ? (this.data.row?.numero_de_personas ?? 1) : 1,
      [Validators.required, Validators.min(1)],
    ],
  });

  ngOnInit(): void {
    this.usuarioSvc.list().subscribe({
      next: (rows) => {
        this.todosUsuarios.set(rows);
        this.clientesFiltrados.set(rows);
        if (this.data.mode === 'edit' && this.data.row) {
          const cliente = rows.find(u => u.id_usuario === this.data.row!.id_usuario);
          if (cliente) {
            this.clienteSeleccionado = cliente;
            this.clienteSearch.setValue(this.displayCliente(cliente));
          }
        }
      },
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    this.habitacionSvc.list().subscribe({
      next: (rows) => this.habitaciones.set(rows.filter(h => h.disponible)),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    this.serviciosSvc.list().subscribe({
      next: (rows) => this.servicios.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });

    this.clienteSearch.valueChanges.subscribe(val => {
      const q = (typeof val === 'string' ? val : '').toLowerCase();
      this.clientesFiltrados.set(
        this.todosUsuarios().filter(u =>
          u.nombre.toLowerCase().includes(q) ||
          u.apellidos.toLowerCase().includes(q) ||
          u.nombre_usuario.toLowerCase().includes(q)
        )
      );
    });
  }

  displayCliente(u: UsuarioRead | string): string {
    if (!u) return '';
    if (typeof u === 'string') return u;
    return `${u.nombre} ${u.apellidos}`;
  }

  onClienteSelected(event: MatAutocompleteSelectedEvent): void {
    this.clienteSeleccionado = event.option.value as UsuarioRead;
  }

  getCantidad(id: string): number {
    return this.cantidades()[id] ?? 0;
  }

  incrementarServicio(id: string): void {
    this.cantidades.update(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  decrementarServicio(id: string): void {
    this.cantidades.update(c => {
      const actual = c[id] ?? 0;
      if (actual <= 0) return c;
      return { ...c, [id]: actual - 1 };
    });
  }

  // Envía al backend cada servicio con cantidad > 0
  private postServicios(id_reserva: string) {
    const calls = Object.entries(this.cantidades())
      .filter(([, qty]) => qty > 0)
      .map(([id_servicio, cantidad]) =>
        this.reservaSvcSvc.create({ id_reserva, id_servicio, cantidad })
      );
    return calls.length > 0 ? forkJoin(calls) : of([]);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.clienteSeleccionado) {
      this.snack.open('Selecciona un cliente para continuar.', 'OK', { duration: 3000 });
      return;
    }
    const uid = this.audit.usuarioId();
    if (!uid) {
      this.snack.open('Seleccione usuario de auditoría en la barra superior.', 'OK');
      return;
    }
    const v = this.form.getRawValue();

    if (this.data.mode === 'create') {
      // 1. Crear reserva
      // 2. Encadenar POST de cada servicio seleccionado
      // 3. Cerrar dialog
      this.svc.create({
        id_usuario:         this.clienteSeleccionado.id_usuario,
        id_habitacion:      v.id_habitacion,
        fecha_entrada:      v.fecha_entrada,
        fecha_salida:       v.fecha_salida,
        numero_de_personas: v.numero_de_personas,
        id_usuario_crea:    uid,
      }).pipe(
        // Marcar habitación como ocupada
        switchMap(reserva =>
          this.habitacionSvc.cambiarDisponible(v.id_habitacion).pipe(
            switchMap(() => this.postServicios(reserva.id_reserva))
          )
        )
      ).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    this.svc.update(this.data.row!.id_reserva, {
      id_usuario:         this.clienteSeleccionado.id_usuario,
      id_habitacion:      v.id_habitacion,
      fecha_entrada:      v.fecha_entrada,
      fecha_salida:       v.fecha_salida,
      numero_de_personas: v.numero_de_personas,
      id_usuario_edita:   uid,
    }).subscribe({
      next: () => this.dialogRef.close(true),
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