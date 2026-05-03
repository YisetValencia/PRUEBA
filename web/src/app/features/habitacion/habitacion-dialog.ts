import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { AuditContextService } from '../../core/audit-context.service';
import { TipoHabitacionService } from '../../core/services/tipo_habitacion.service';
import { HabitacionService } from '../../core/services/habitacion.service';
import { TipoHabitacionRead, HabitacionRead } from '../../models/api.models';

export interface HabitacionDialogData {
  mode: 'create' | 'edit';
  row?: HabitacionRead;
}

@Component({
  selector: 'app-habitacion-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  templateUrl: './habitacion-dialog.html',
    styleUrls: ['./habitacion-list.scss'],

})
export class HabitacionDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(HabitacionService);
  private readonly catSvc = inject(TipoHabitacionService);
  private readonly audit = inject(AuditContextService);
  private readonly dialogRef = inject(MatDialogRef<HabitacionDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<HabitacionDialogData>(MAT_DIALOG_DATA);
  readonly tipo_habitacion = signal<TipoHabitacionRead[]>([]);

  readonly form = this.fb.nonNullable.group({
    numero: [
      this.data.mode === 'edit' ? (this.data.row?.numero ?? 0) : 0,
      [Validators.required, Validators.min(1)],
    ],
    id_tipo: [
      this.data.mode === 'edit' ? (this.data.row?.id_tipo ?? '') : '',
      [Validators.required, Validators.minLength(1)],
    ],
    precio: [
      this.data.mode === 'edit' ? (this.data.row?.precio ?? 0) : 0,
      [Validators.required, Validators.min(0)],
    ],
    disponible: [
      this.data.mode === 'edit' ? (this.data.row?.disponible ?? true) : true,
    ],
  });

  ngOnInit(): void {
    this.catSvc.list().subscribe({
      next: (rows) => {
        this.tipo_habitacion.set(rows);
        // Re-setear id_tipo después de cargar opciones para que el select haga match
        if (this.data.mode === 'edit' && this.data.row?.id_tipo) {
          this.form.controls.id_tipo.setValue(this.data.row.id_tipo);
        }
      },
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const uid = this.audit.usuarioId();
    if (!uid) {
      this.snack.open('Seleccione usuario de auditoría en la barra superior.', 'OK');
      return;
    }
    const v = this.form.getRawValue();
    const nombreTipo = this.tipo_habitacion().find(t => t.id_tipo === v.id_tipo)?.nombre_tipo ?? '';

    if (this.data.mode === 'create') {
      this.svc.create({
        numero:          v.numero,
        id_tipo:         v.id_tipo,
        tipo:            nombreTipo,
        precio:          v.precio,
        disponible:      v.disponible,
        id_usuario_crea: uid,
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) =>
          this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    this.svc.update(this.data.row!.id_habitacion, {
      numero:           v.numero,
      id_tipo:          v.id_tipo,
      tipo:             nombreTipo,
      precio:           v.precio,
      disponible:       v.disponible,
      id_usuario_edita: uid,
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