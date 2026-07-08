import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { forkJoin, finalize } from 'rxjs';
import { ContractService } from '../services/contract.service';
import { RoomService } from '../../rooms/services/room.service';
import { TenantService } from '../../tenants/services/tenant.service';
import { Contract, ContractPayload, ContractStatus } from '../../../shared/models/contract.model';
import { Room } from '../../../shared/models/room.model';
import { Tenant } from '../../../shared/models/tenant.model';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ContractFormDialog, ContractFormDialogData } from '../contract-form-dialog/contract-form-dialog';

const STATUS_LABELS: Record<ContractStatus, string> = {
  active: 'Đang hiệu lực',
  ended: 'Đã kết thúc',
  cancelled: 'Đã hủy',
};

@Component({
  selector: 'app-contract-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './contract-list.html',
})
export class ContractList implements OnInit {
  private readonly contractService = inject(ContractService);
  private readonly roomService = inject(RoomService);
  private readonly tenantService = inject(TenantService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly contracts = signal<Contract[]>([]);
  readonly rooms = signal<Room[]>([]);
  readonly tenants = signal<Tenant[]>([]);
  readonly loading = signal(false);
  readonly displayedColumns = ['tenant', 'room', 'deposit', 'startDate', 'endDate', 'status', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      contracts: this.contractService.getAll(),
      rooms: this.roomService.getAll(),
      tenants: this.tenantService.getAll(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ contracts, rooms, tenants }) => {
        this.contracts.set(contracts);
        this.rooms.set(rooms);
        this.tenants.set(tenants);
      });
  }

  tenantName(tenantId: string): string {
    return this.tenants().find((tenant) => tenant.id === tenantId)?.name ?? '—';
  }

  roomName(roomId: string): string {
    return this.rooms().find((room) => room.id === roomId)?.name ?? '—';
  }

  statusLabel(status: ContractStatus): string {
    return STATUS_LABELS[status];
  }

  openCreateDialog(): void {
    this.openForm(null);
  }

  openEditDialog(contract: Contract): void {
    this.openForm(contract);
  }

  confirmDelete(contract: Contract): void {
    const data: ConfirmDialogData = {
      title: 'Xóa hợp đồng',
      message: 'Bạn có chắc muốn xóa hợp đồng này?',
      confirmLabel: 'Xóa',
    };

    this.dialog
      .open(ConfirmDialog, { data })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.contractService.delete(contract.id).subscribe(() => {
            this.notification.success('Đã xóa hợp đồng.');
            this.loadData();
          });
        }
      });
  }

  private openForm(contract: Contract | null): void {
    const data: ContractFormDialogData = {
      contract,
      rooms: this.rooms(),
      tenants: this.tenants(),
    };

    this.dialog
      .open(ContractFormDialog, { data, width: '520px' })
      .afterClosed()
      .subscribe((payload: ContractPayload | null) => {
        if (!payload) {
          return;
        }

        const request$ = contract
          ? this.contractService.update(contract.id, payload)
          : this.contractService.create(payload);

        request$.subscribe(() => {
          this.notification.success(contract ? 'Đã cập nhật hợp đồng.' : 'Đã tạo hợp đồng.');
          this.loadData();
        });
      });
  }
}
