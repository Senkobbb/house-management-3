import { Routes } from '@angular/router';

export const CONTRACTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./contract-list/contract-list').then((m) => m.ContractList),
  },
];
