import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { forkJoin, finalize } from 'rxjs';
import { TenantService } from '../services/tenant.service';
import { RoomService } from '../../rooms/services/room.service';
import { Tenant, TenantPayload } from '../../../shared/models/tenant.model';
import { Room } from '../../../shared/models/room.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { TenantFormDialog, TenantFormDialogData } from '../tenant-form-dialog/tenant-form-dialog';

@Component({
  selector: 'app-tenant-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatProgressBarModule, DatePipe],
  templateUrl: './tenant-list.html',
})
export class TenantList implements OnInit {
  private readonly tenantService = inject(TenantService);
  private readonly roomService = inject(RoomService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly tenants = signal<Tenant[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly loading = signal(false);
  readonly displayedColumns = ['name', 'phone', 'email', 'idCardNumber', 'room', 'moveInDate', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({ tenants: this.tenantService.getAll(), rooms: this.roomService.getAll() })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ tenants, rooms }) => {
        this.tenants.set(tenants);
        this.rooms.set(rooms);
      });
  }

  roomName(roomId: string | null): string {
    if (!roomId) {
      return 'Chưa xếp phòng';
    }
    return this.rooms().find((room) => room.id === roomId)?.name ?? '—';
  }

  openCreateDialog(): void {
    this.openForm(null);
  }

  openEditDialog(tenant: Tenant): void {
    this.openForm(tenant);
  }

  confirmDelete(tenant: Tenant): void {
    const data: ConfirmDialogData = {
      title: 'Xóa khách thuê',
      message: `Bạn có chắc muốn xóa khách thuê "${tenant.name}"?`,
      confirmLabel: 'Xóa',
    };

    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.tenantService.delete(tenant.id).subscribe(() => {
            this.notification.success('Đã xóa khách thuê.');
            this.loadData();
          });
        }
      });
  }

  private openForm(tenant: Tenant | null): void {
    const data: TenantFormDialogData = { tenant, rooms: this.rooms() };

    this.dialog
      .open(TenantFormDialog, { data, width: '520px' })
      .afterClosed()
      .subscribe((payload: TenantPayload | null) => {
        if (!payload) {
          return;
        }

        const request$ = tenant
          ? this.tenantService.update(tenant.id, payload)
          : this.tenantService.create(payload);

        request$.subscribe(() => {
          this.notification.success(tenant ? 'Đã cập nhật khách thuê.' : 'Đã thêm khách thuê.');
          this.loadData();
        });
      });
  }
}
