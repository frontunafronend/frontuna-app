/**
 * 🔐 SECURE AUTH INTERCEPTOR
 * Handles authentication headers and token refresh for the new secure backend
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { SecureAuthService } from '@app/services/auth/secure-auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

export const secureAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(SecureAuthService);
  const notificationService = inject(NotificationService);

  // Skip auth header for auth-related requests
  if (req.url.includes('/auth/login') || 
      req.url.includes('/auth/signup') || 
      req.url.includes('/auth/reset-password')) {
    return next(req);
  }

  // Add authorization header if we have a token
  const token = authService.getAccessToken();
  let authReq = req;

  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.status === 401 && token) {
        
        // Don't refresh on auth endpoints to avoid loops
        if (req.url.includes('/auth/')) {
          return throwError(() => error);
        }

        // Attempt token refresh
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original request with new token
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${newToken}`)
            });
            
            return next(retryReq);
          }),
          catchError((refreshError) => {
            console.error('❌ Token refresh failed:', refreshError);
            
            // Only show error message for definitive auth failures, not network errors
            if (refreshError.status === 401 || refreshError.status === 403) {
              if (!req.url.includes('/auth/profile')) {
                notificationService.showError('Session expired. Please log in again.');
              }
            } else {
              console.warn('🔄 Token refresh failed due to network/server error, request will fail but session preserved');
            }
            
            return throwError(() => error);
          })
        );
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        notificationService.showError('Access denied. Insufficient permissions.');
        return throwError(() => error);
      }

      // Handle 429 Too Many Requests
      if (error.status === 429) {
        notificationService.showWarning('Too many requests. Please wait a moment and try again.');
        return throwError(() => error);
      }

      // Handle other errors
      return throwError(() => error);
    })
  );
};
