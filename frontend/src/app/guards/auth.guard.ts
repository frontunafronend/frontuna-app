import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

// 🛡️ SIMPLIFIED AUTH GUARD - FIXES REFRESH LOGOUT ISSUE 🛡️
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🛡️ AUTH GUARD - Checking authentication state');

  // 🔧 FIX: Use async token check instead of computed signal to avoid race conditions
  return from(authService.getToken()).pipe(
    map(token => {
      console.log('🔍 Auth Guard - Token check result:', !!token);
      
      if (token) {
        console.log('✅ Auth Guard - Token found, user authenticated');
        return true;
      }
      
      // Check emergency mode as fallback
      const emergencyLogin = (authService as any).emergencyLogin;
      if (emergencyLogin?.isEmergencyMode()) {
        console.log('🚨 Emergency mode active, allowing access');
        return true;
      }
      
      // Check if there's any stored token in localStorage (immediate check)
      const hasStoredToken = localStorage.getItem('frontuna_primary_token') ||
                           localStorage.getItem('frontuna_access_token') ||
                           localStorage.getItem('access_token');
                           
      if (hasStoredToken) {
        console.log('✅ Found stored token, allowing access');
        return true;
      }
      
      console.log('❌ No authentication found, redirecting to login');
      notificationService.showWarning('Please log in to access this page');
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }),
    catchError(error => {
      console.error('❌ Auth Guard error:', error);
      
      // Fallback: check localStorage directly
      const hasStoredToken = localStorage.getItem('frontuna_primary_token') ||
                           localStorage.getItem('frontuna_access_token') ||
                           localStorage.getItem('access_token');
                           
      if (hasStoredToken) {
        console.log('✅ Fallback: Found stored token, allowing access');
        return of(true);
      }
      
      console.log('❌ Fallback failed, redirecting to login');
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return of(false);
    })
  );
};