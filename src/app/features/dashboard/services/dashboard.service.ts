import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { forkJoin } from 'rxjs';
import { RoomService } from '../../rooms/services/room.service';
import { BillService } from '../../billing/services/bill.service';
import { DashboardStats } from '../../../shared/models/dashboard.model';
import { calculateBillTotal } from '../../../shared/models/bill.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly roomService = inject(RoomService);
  private readonly billService = inject(BillService);

  /**
   * Aggregates dashboard statistics from the rooms and bills endpoints.
   * Revenue counts only paid bills in the current month.
   */
  getStats(): Observable<DashboardStats> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return forkJoin({
      rooms: this.roomService.getAll(),
      bills: this.billService.getAll(),
    }).pipe(
      map(({ rooms, bills }) => {
        const occupiedRooms = rooms.filter((room) => room.status === 'occupied').length;
        const monthlyRevenue = bills
          .filter(
            (bill) =>
              bill.paymentStatus === 'paid' &&
              bill.month === currentMonth &&
              bill.year === currentYear,
          )
          .reduce((sum, bill) => sum + calculateBillTotal(bill), 0);

        return {
          totalRooms: rooms.length,
          occupiedRooms,
          vacantRooms: rooms.length - occupiedRooms,
          monthlyRevenue,
        };
      }),
    );
  }
}
