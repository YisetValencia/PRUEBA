import { Routes } from '@angular/router';

import { auditUserGuard } from './core/audit-user.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [auditUserGuard],
    loadComponent: () => import('./features/shell/main-layout').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuarios/usuario-list').then((m) => m.UsuarioListComponent),
      },
      /*{
        path: 'habitacion',
        loadComponent: () =>
          import('./features/habitacion/habitacion-list').then((m) => m.HabitacionListComponent),
      },
      {
        path: 'reserva',
        loadComponent: () =>
          import('./features/reserva/reserva-list').then((m) => m.ReservaListComponent),
      },
      {
        path: 'reserva_servicios',
        loadComponent: () =>
          import('./features/reserva_servicios/reserva_servicios-list').then((m) => m.ReservaServiciosListComponent),
      },*/
      {
        path: 'servicios_adicionales',
        loadComponent: () =>
          import('./features/servicios_adicionales/servicios_adicionales-list').then(
            (m) => m.ServiciosAdicionalesListComponent,
          ),
      },
      {
        path: 'tipo_habitacion',
        loadComponent: () =>
          import('./features/tipo_habitacion/tipo_habitacion-list').then(
            (m) => m.TipoHabitacionListComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
