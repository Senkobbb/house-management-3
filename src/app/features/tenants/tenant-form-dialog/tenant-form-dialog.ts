import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { Tenant, TenantPayload } from '../../../shared/models/tenant.model';
import { Room } from '../../../shared/models/room.model';
import { vietnamesePhoneValidator } from '../../../shared/validators/phone.validator';

export interface TenantFormDialogData {
  tenant: Tenant | null;
  rooms: Room[];
}

@Component({
  selector: 'app-tenant-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
  ],
  templateUrl: './tenant-form-dialog.html',
})
export class TenantFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TenantFormDialog>);
  readonly data = inject<TenantFormDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    name: [this.data.tenant?.name ?? '', [Validators.required, Validators.maxLength(80)]],
    phone: [this.data.tenant?.phone ?? '', [Validators.required, vietnamesePhoneValidator]],
    email: [this.data.tenant?.email ?? '', [Validators.required, Validators.email]],
    idCardNumber: [
      this.data.tenant?.idCardNumber ?? '',
      [Validators.required, Validators.pattern(/^\d{9}$|^\d{12}$/)],
    ],
    roomId: [this.data.tenant?.roomId ?? ('' as string | null)],
    moveInDate: [this.data.tenant?.moveInDate ?? '', Validators.required],
    moveOutDate: [this.data.tenant?.moveOutDate ?? ('' as string | null)],
  });

  get isEditMode(): boolean {
    return this.data.tenant !== null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: TenantPayload = {
      ...raw,
      roomId: raw.roomId || null,
      moveInDate: this.toIso(raw.moveInDate),
      moveOutDate: raw.moveOutDate ? this.toIso(raw.moveOutDate) : null,
    };

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  private toIso(value: string): string {
    return new Date(value).toISOString();
  }
}
