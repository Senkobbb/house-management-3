import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { Contract, ContractPayload, ContractStatus } from '../../../shared/models/contract.model';
import { Room } from '../../../shared/models/room.model';
import { Tenant } from '../../../shared/models/tenant.model';

export interface ContractFormDialogData {
  contract: Contract | null;
  rooms: Room[];
  tenants: Tenant[];
}

@Component({
  selector: 'app-contract-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
  templateUrl: './contract-form-dialog.html',
})
export class ContractFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ContractFormDialog>);
  readonly data = inject<ContractFormDialogData>(MAT_DIALOG_DATA);

  readonly statuses: { value: ContractStatus; label: string }[] = [
    { value: 'active', label: 'Đang hiệu lực' },
    { value: 'ended', label: 'Đã kết thúc' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  readonly form = this.fb.nonNullable.group({
    tenantId: [this.data.contract?.tenantId ?? '', Validators.required],
    roomId: [this.data.contract?.roomId ?? '', Validators.required],
    deposit: [this.data.contract?.deposit ?? 0, [Validators.required, Validators.min(0)]],
    startDate: [this.data.contract?.startDate ?? '', Validators.required],
    endDate: [this.data.contract?.endDate ?? '', Validators.required],
    status: [this.data.contract?.status ?? ('active' as ContractStatus), Validators.required],
  });

  get isEditMode(): boolean {
    return this.data.contract !== null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ContractPayload = {
      ...raw,
      startDate: new Date(raw.startDate).toISOString(),
      endDate: new Date(raw.endDate).toISOString(),
    };

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
