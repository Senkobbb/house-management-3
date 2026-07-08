import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';
import { forkJoin, finalize } from 'rxjs';
import { BillService } from '../services/bill.service';
import { RoomService } from '../../rooms/services/room.service';
import { Bill, BillPayload, calculateBillTotal } from '../../../shared/models/bill.model';
import { Room } from '../../../shared/models/room.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { BillFormDialog, BillFormDialogData } from '../bill-form-dialog/bill-form-dialog';

@Component({
  selector: 'app-bill-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    CurrencyPipe,
  ],
  templateUrl: './bill-list.html',
})
export class BillList implements OnInit {
  private readonly billService = inject(BillService);
  private readonly roomService = inject(RoomService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly bills = signal<Bill[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(false);
  readonly displayedColumns = ['room', 'period', 'total', 'paymentStatus', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({ bills: this.billService.getAll(), rooms: this.roomService.getAll() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ bills, rooms }) => {
        this.bills.set(bills);
        this.rooms.set(rooms);
      });
  }

  roomName(roomId: string): string {
    return this.rooms().find((room) => room.id === roomId)?.name ?? '—';
  }

  total(bill: Bill): number {
    return calculateBillTotal(bill);
  }

  openCreateDialog(): void {
    this.openForm(null);
  }

  openEditDialog(bill: Bill): void {
    this.openForm(bill);
  }

  markAsPaid(bill: Bill): void {
    this.billService.markAsPaid(bill.id).subscribe(() => {
      this.notification.success('Đã cập nhật trạng thái thanh toán.');
      this.loadData();
    });
  }

  confirmDelete(bill: Bill): void {
    const data: ConfirmDialogData = {
      title: 'Xóa hóa đơn',
      message: 'Bạn có chắc muốn xóa hóa đơn này?',
      confirmLabel: 'Xóa',
    };

    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.billService.delete(bill.id).subscribe(() => {
            this.notification.success('Đã xóa hóa đơn.');
            this.loadData();
          });
        }
      });
  }

  private openForm(bill: Bill | null): void {
    const data: BillFormDialogData = { bill, rooms: this.rooms() };

    this.dialog
      .open(BillFormDialog, { data, width: '560px' })
      .afterClosed()
      .subscribe((payload: BillPayload | null) => {
        if (!payload) {
          return;
        }

        const request$ = bill
          ? this.billService.update(bill.id, payload)
          : this.billService.create(payload);

        request$.subscribe(() => {
          this.notification.success(bill ? 'Đã cập nhật hóa đơn.' : 'Đã tạo hóa đơn.');
          this.loadData();
        });
      });
  }
}
