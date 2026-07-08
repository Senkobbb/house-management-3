import { Routes } from '@angular/router';

export const ROOMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./room-list/room-list').then((m) => m.RoomList),
  },
];
