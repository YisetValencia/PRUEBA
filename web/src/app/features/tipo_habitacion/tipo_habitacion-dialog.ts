import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { AuditContextService } from '../../core/audit-context.service';
import { TipoHabitacionService } from '../../core/services/tipo_habitacion.service'; // Ajustar nombre
import { TipoHabitacionRead } from '../../models/api.models'; // Ajustar nombre

export interface TipoHabitacionDialogData {
  mode: 'create' | 'edit';
  row?: TipoHabitacionRead;
}

@Component({
  selector: 'app-tipo_habitacion-dialog',
  standalone: true, // Asegúrate si usas standalone o módulos
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatIconModule,
  ],

  templateUrl: './tipo_habitacion-dialog.html',
  styleUrls: ['./tipo_habitacion-list.scss']
})
export class TipoHabitacionDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(TipoHabitacionService);
  private readonly audit = inject(AuditContextService);
  private readonly dialogRef = inject(MatDialogRef<TipoHabitacionDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<TipoHabitacionDialogData>(MAT_DIALOG_DATA);

  // Formulario con los nuevos campos de capacidad y precio
  readonly form = this.fb.nonNullable.group({
    nombre_tipo: ['', Validators.required],
    descripcion: ['', Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        nombre_tipo: r.nombre_tipo,
        descripcion: r.descripcion,
      });
    }
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
    if (this.data.mode === 'create') {
      this.svc
        .create({
          nombre_tipo: v.nombre_tipo,
          descripcion: v.descripcion,
          id_usuario_crea: uid,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }

    // Caso de Edición
    this.svc
      .update(this.data.row!.id_tipo, { // Ajustar nombre del ID según tu modelo
        nombre_tipo: v.nombre_tipo,
        descripcion: v.descripcion,
        id_usuario_edita: uid,
      })
      .subscribe({
        next: () => this.dialogRef.close(true),
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