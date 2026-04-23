import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioRead, UsuarioUpdate } from '../../models/api.models';

export interface UsuarioDialogData {
  mode: 'create' | 'edit';
  row?: UsuarioRead;
}

@Component({
  selector: 'app-usuario-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './usuario-dialog.html',
  styleUrl: './usuario-list.scss',
})
export class UsuarioDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly dialogRef = inject(MatDialogRef<UsuarioDialogComponent, boolean>);
  private readonly snack = inject(MatSnackBar);

  readonly data = inject<UsuarioDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    telefono: ['', Validators.required],
    tipo_usuario: ['', Validators.required],
    nombre_usuario: ['', Validators.required],
    clave: ['', Validators.required],
  });

  constructor() {
    if (this.data.mode === 'edit' && this.data.row) {
      const r = this.data.row;
      this.form.patchValue({
        nombre: r.nombre,
        apellidos: r.apellidos,
        telefono: r.telefono,
        tipo_usuario: r.tipo_usuario,
        nombre_usuario: r.nombre_usuario,
        clave: r.clave,
      });
    }
    if (this.data.mode === 'create') {
      this.form.controls.clave.setValidators([Validators.required, Validators.minLength(4)]);
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
    const v = this.form.getRawValue();
    if (this.data.mode === 'create') {
      this.usuarioService
        .create({
          nombre: v.nombre,
          apellidos: v.apellidos,
          telefono: v.telefono,
          tipo_usuario: v.tipo_usuario,
          nombre_usuario: v.nombre_usuario,
          clave: v.clave,
        })
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (err: HttpErrorResponse) =>
            this.snack.open(this.msg(err), 'Cerrar', { duration: 6000 }),
        });
      return;
    }
    const id = this.data.row!.id_usuario;
    const body: UsuarioUpdate = {
      nombre: v.nombre,
      apellidos: v.apellidos,
      telefono: v.telefono,
      tipo_usuario: v.tipo_usuario,
      nombre_usuario: v.nombre_usuario,
      clave: v.clave,
    };
    if (v.clave?.trim()) {
      body.clave = v.clave;
    }
    this.usuarioService.update(id, body).subscribe({
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