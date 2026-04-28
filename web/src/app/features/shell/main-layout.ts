import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavContainer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuditContextService } from '../../core/audit-context.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioRead } from '../../models/api.models';

const SIDEBAR_KEY = 'shell_sidebar_collapsed';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayoutComponent implements OnInit, AfterViewInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  @ViewChild('sidenavShell') private sidenavShell?: MatSidenavContainer;

  readonly audit = inject(AuditContextService);
  readonly usuarios = signal<UsuarioRead[]>([]);

  readonly currentUserName = computed(() =>
    this.usuarios().find(u => u.id_usuario === this.audit.usuarioId())?.nombre_usuario ?? ''
  );

  readonly sidebarCollapsed = signal(
    typeof localStorage !== 'undefined' && localStorage.getItem(SIDEBAR_KEY) === '1',
  );

  readonly nav = [
    { path: 'usuarios', label: 'Usuarios', icon: 'people' },
    { path: 'servicios_adicionales', label: 'Servicios', icon: 'add_business' },
    { path: 'tipo_habitacion', label: 'TipoHabitacion', icon: 'bed' },
    { path: 'habitacion', label: 'Habitacion', icon: 'bed' },
    { path: 'reserva', label: 'Reservas', icon: 'event' },
  ];

  ngOnInit(): void {
    this.usuarioService.list().subscribe({
      next: (rows) => this.usuarios.set(rows),
      error: (err: HttpErrorResponse) =>
        this.snack.open(this.msg(err), 'Cerrar', { duration: 5000 }),
    });
  }

  ngAfterViewInit(): void {
    this.syncContentMarginsWithDrawer();


  }

  private syncContentMarginsWithDrawer(): void {
    const shell = this.sidenavShell;
    if (!shell) return;
    shell.updateContentMargins();
  }

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
    queueMicrotask(() => this.syncContentMarginsWithDrawer());
    window.setTimeout(() => this.syncContentMarginsWithDrawer(), 80);
    window.setTimeout(() => this.syncContentMarginsWithDrawer(), 360);
  }

  onUsuarioAudit(id: string): void {
    this.audit.select(id);
  }

  logout(): void {
    this.audit.clear();
    void this.router.navigateByUrl('/login');
  }

  private msg(err: HttpErrorResponse): string {
    const d = err.error?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join('; ');
    return err.message;
  }
}