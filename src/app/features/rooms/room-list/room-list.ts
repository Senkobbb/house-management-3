import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { RoomService } from '../services/room.service';
import { Room, RoomPayload } from '../../../shared/models/room.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { RoomFormDialog, RoomFormDialogData } from '../room-form-dialog/room-form-dialog';

@Component({
  selector: 'app-room-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    CurrencyPipe,
  ],
  templateUrl: './room-list.html',
})
export class RoomList implements OnInit {
  private readonly roomService = inject(RoomService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(false);
  readonly displayedColumns = ['name', 'floor', 'price', 'maxTenants', 'status', 'actions'];

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading.set(true);
    this.roomService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((rooms) => this.rooms.set(rooms));
  }

  openCreateDialog(): void {
    this.openForm(null);
  }

  openEditDialog(room: Room): void {
    this.openForm(room);
  }

  confirmDelete(room: Room): void {
    const data: ConfirmDialogData = {
      title: 'Xóa phòng',
      message: `Bạn có chắc muốn xóa phòng "${room.name}"?`,
      confirmLabel: 'Xóa',
    };

    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.roomService.delete(room.id).subscribe(() => {
            this.notification.success('Đã xóa phòng thành công.');
            this.loadRooms();
          });
        }
      });
  }

  private openForm(room: Room | null): void {
    const data: RoomFormDialogData = { room };

    this.dialog
      .open(RoomFormDialog, { data, width: '480px' })
      .afterClosed()
      .subscribe((payload: RoomPayload | null) => {
        if (!payload) {
          return;
        }

        const request$ = room
          ? this.roomService.update(room.id, payload)
          : this.roomService.create(payload);

        request$.subscribe(() => {
          this.notification.success(room ? 'Đã cập nhật phòng.' : 'Đã thêm phòng mới.');
          this.loadRooms();
        });
      });
  }
}
