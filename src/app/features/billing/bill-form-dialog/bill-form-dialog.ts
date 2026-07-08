import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { Bill, BillPayload, PaymentStatus, calculateBillTotal } from '../../../shared/models/bill.model';
import { Room } from '../../../shared/models/room.model';

export interface BillFormDialogData {
  bill: Bill | null;
  rooms: Room[];
}

@Component({
  selector: 'app-bill-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CurrencyPipe,
  ],
  templateUrl: './bill-form-dialog.html',
})
export class BillFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<BillFormDialog>);
  readonly data = inject<BillFormDialogData>(MAT_DIALOG_DATA);

  private readonly now = new Date();

  readonly form = this.fb.nonNullable.group({
    roomId: [this.data.bill?.roomId ?? '', Validators.required],
    month: [
      this.data.bill?.month ?? this.now.getMonth() + 1,
      [Validators.required, Validators.min(1), Validators.max(12)],
    ],
    year: [this.data.bill?.year ?? this.now.getFullYear(), [Validators.required, Validators.min(2000)]],
    rentAmount: [this.data.bill?.rentAmount ?? 0, [Validators.required, Validators.min(0)]],
    electricUsage: [this.data.bill?.electricUsage ?? 0, [Validators.required, Validators.min(0)]],
    electricUnitPrice: [this.data.bill?.electricUnitPrice ?? 3500, [Validators.required, Validators.min(0)]],
    waterUsage: [this.data.bill?.waterUsage ?? 0, [Validators.required, Validators.min(0)]],
    waterUnitPrice: [this.data.bill?.waterUnitPrice ?? 15000, [Validators.required, Validators.min(0)]],
    serviceFee: [this.data.bill?.serviceFee ?? 0, [Validators.required, Validators.min(0)]],
    paymentStatus: [this.data.bill?.paymentStatus ?? ('unpaid' as PaymentStatus), Validators.required],
  });

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  readonly total = computed(() => {
    const value = this.formValue();
    return calculateBillTotal({
      rentAmount: value.rentAmount ?? 0,
      electricUsage: value.electricUsage ?? 0,
      electricUnitPrice: value.electricUnitPrice ?? 0,
      waterUsage: value.waterUsage ?? 0,
      waterUnitPrice: value.waterUnitPrice ?? 0,
      serviceFee: value.serviceFee ?? 0,
    });
  });

  get isEditMode(): boolean {
    return this.data.bill !== null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue() satisfies BillPayload);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
