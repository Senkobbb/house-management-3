import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Room, RoomPayload, RoomStatus } from '../../../shared/models/room.model';

export interface RoomFormDialogData {
  room: Room | null;
}

@Component({
  selector: 'app-room-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './room-form-dialog.html',
})
export class RoomFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RoomFormDialog>);
  readonly data = inject<RoomFormDialogData>(MAT_DIALOG_DATA);

  readonly statuses: { value: RoomStatus; label: string }[] = [
    { value: 'vacant', label: 'Trống' },
    { value: 'occupied', label: 'Đã thuê' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: [this.data.room?.name ?? '', [Validators.required, Validators.maxLength(50)]],
    floor: [this.data.room?.floor ?? 1, [Validators.required, Validators.min(0)]],
    price: [this.data.room?.price ?? 0, [Validators.required, Validators.min(0)]],
    maxTenants: [this.data.room?.maxTenants ?? 1, [Validators.required, Validators.min(1)]],
    status: [this.data.room?.status ?? ('vacant' as RoomStatus), Validators.required],
  });

  get isEditMode(): boolean {
    return this.data.room !== null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue() satisfies RoomPayload);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
