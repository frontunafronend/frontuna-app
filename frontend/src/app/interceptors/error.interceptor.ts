import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { SecureAuthService } from '@app/services/auth/secure-auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(SecureAuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError(error => {
      // Handle 401 Unauthorized - but be more intelligent about it
      if (error.status === 401) {
        console.log('🔒 Received 401 error for:', req.url);
        
        // Only logout for specific auth-related endpoints, not all 401s
        const isAuthEndpoint = req.url.includes('/auth/') || req.url.includes('/profile');
        const isLoginEndpoint = req.url.includes('/login') || req.url.includes('/signup');
        
        // Don't logout on login/signup failures - those are expected
        if (isLoginEndpoint) {
          console.log('⚠️ Login/signup failed - not logging out');
          return throwError(() => error);
        }
        
        // 🔧 FIX: NEVER auto-logout on 401 to prevent refresh redirects
        // Let the user manually logout if needed
        console.log('⚠️ 401 error detected, but NOT auto-logging out to prevent refresh issues');
        
        if (isAuthEndpoint) {
          notificationService.showWarning('Authentication issue detected. Please try refreshing or logging in again.');
        } else {
          notificationService.showWarning('Session may have expired - please refresh if needed');
        }
        
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