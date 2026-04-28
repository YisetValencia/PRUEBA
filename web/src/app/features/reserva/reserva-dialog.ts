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
import { ReservaService } from '../../core/services/reserva.service';
import { ReservaRead } from '../../models/api.models';

export interface ReservaDialogData {
  mode: 'create' | 'edit';
  row?: ReservaRead;
}

@Component({
  selector: 'app-reserva-dialog',
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
  templateUrl: './reserva-dialog.html',
  styleUrls: ['./reserva-list.scss']
})
export class ReservaDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc: ReservaService = inject(ReservaService);
  private readonly audit = inject(AuditContextService);
  private readonly dialogRef = inject(MatDialogRef<ReservaDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<ReservaDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    id_habitacion: ['', Validators.required],
    fecha_entrada: ['', Validators.required],
    fecha_salida: ['', Validators.required],
    numero_de_personas: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        id_habitacion: r.id_habitacion,
        fecha_entrada: r.fecha_entrada,
        fecha_salida: r.fecha_salida,
        numero_de_personas: r.numero_de_personas,
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
    console.log('UID:', uid);
    console.log('ID RESERVA:', this.data.row?.id_reserva);

    if (!uid) {
      this.snack.open('Seleccione usuario de auditoría en la barra superior.', 'OK');
      return;
    }

    const v = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.svc.create({
        id_habitacion: v.id_habitacion,
        fecha_entrada: v.fecha_entrada,
        fecha_salida: v.fecha_salida,
        numero_de_personas: v.numero_de_personas,
        id_usuario: uid,
        id_usuario_crea: uid,
      }).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
      });
      return;
    }

    // MODO EDITAR
    this.svc.update(this.data.row!.id_reserva, {
      id_habitacion: v.id_habitacion,
      fecha_entrada: v.fecha_entrada,
      fecha_salida: v.fecha_salida,
      numero_de_personas: v.numero_de_personas,
      id_usuario_edita: uid,
    }).subscribe({
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