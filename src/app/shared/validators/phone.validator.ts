import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

export const vietnamesePhoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as string | null;

  if (!value) {
    return null;
  }

  return VN_PHONE_REGEX.test(value) ? null : { invalidPhone: true };
};
