import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./bill-list/bill-list').then((m) => m.BillList),
  },
];
