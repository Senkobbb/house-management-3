import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        notificationService.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
      } else if (error.status === 0) {
        notificationService.error('Không thể kết nối tới server.');
      } else {
        const message = error.error?.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.';
        notificationService.error(message);
      }

      return throwError(() => error);
    }),
  );
};
