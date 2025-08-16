import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError(error => {
      // Handle 401 Unauthorized - redirect to login
      if (error.status === 401) {
        authService.logout();
        return throwError(() => error);
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        notificationService.showError('Access denied - insufficient permissions');
        return throwError(() => error);
      }

      // Handle 429 Too Many Requests
      if (error.status === 429) {
        notificationService.showWarning('Too many requests - please slow down');
        return throwError(() => error);
      }

      // Handle 500+ Server Errors
      if (error.status >= 500) {
        notificationService.showError('Server error - please try again later');
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};