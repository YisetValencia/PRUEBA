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
import { ServiciosAdicionalesService } from '../../core/services/servicios_adicionales.service';
import { ServiciosAdicionalesRead } from '../../models/api.models';

export interface ServiciosAdicionalesDialogData {
  mode: 'create' | 'edit';
  row?: ServiciosAdicionalesRead;
}

@Component({
  selector: 'app-servicios_adicionales-dialog',
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
  templateUrl: './servicios_adicionales-dialog.html',
  styleUrls: ['./servicios_adicionales-list.scss']
})
export class ServiciosAdicionalesDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly svc = inject(ServiciosAdicionalesService);
  private readonly audit = inject(AuditContextService);
  private readonly dialogRef = inject(MatDialogRef<ServiciosAdicionalesDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<ServiciosAdicionalesDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre_servicio: ['', Validators.required],
    precio:[0, [Validators.required, Validators.min(0)]],
    descripcion: ['', Validators.required],
    
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        nombre_servicio: r.nombre_servicio,
        precio: r.precio,
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
    console.log('UID:', uid);
    console.log('ID SERVICIO:', this.data.row?.id_servicio);
    if (!uid) {
      this.snack.open('Seleccione usuario de auditoría en la barra superior.', 'OK');
      return;
    }
    const v = this.form.getRawValue();
    if (this.data.mode === 'create') {
      this.svc
        .create({
          nombre_servicio: v.nombre_servicio,
          precio: Number(v.precio),
          descripcion: v.descripcion,
          id_usuario_crea: uid,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) => this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }
    this.svc
      .update(this.data.row!.id_servicio, {
        nombre_servicio: v.nombre_servicio,
        precio: v.precio,
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