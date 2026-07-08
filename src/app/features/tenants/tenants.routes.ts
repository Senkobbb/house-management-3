import { Routes } from '@angular/router';

export const TENANTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./tenant-list/tenant-list').then((m) => m.TenantList),
  },
];
