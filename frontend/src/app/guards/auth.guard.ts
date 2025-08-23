import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

// 🛡️ FIXED AUTH GUARD - PREVENTS REDIRECT TO LOGIN ON REFRESH 🛡️
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🛡️ AUTH GUARD - Checking authentication for:', state.url);

  // 🔧 FIX: Immediate synchronous check to prevent redirect on refresh
  // Check multiple token locations immediately without async calls
  const hasToken = localStorage.getItem('frontuna_primary_token') ||
                  localStorage.getItem('frontuna_access_token') ||
                  localStorage.getItem('access_token') ||
                  sessionStorage.getItem('frontuna_session_token') ||
                  localStorage.getItem('frontuna_backup1_token') ||
                  localStorage.getItem('frontuna_emergency_token');

  // Check emergency mode
  const isEmergencyMode = localStorage.getItem('frontuna_emergency_mode') === 'true' ||
                         sessionStorage.getItem('frontuna_emergency_mode') === 'true';

  // Check if user data exists (indicates active session)
  const hasUserData = localStorage.getItem('frontuna_emergency_user') ||
                     sessionStorage.getItem('frontuna_emergency_user');

  // 🎯 MAIN FIX: If we have ANY indication of authentication, allow access
  if (hasToken || isEmergencyMode || hasUserData) {
    console.log('✅ Auth Guard - Authentication found, staying on current page:', state.url);
    console.log('🔍 Auth indicators:', { 
      hasToken: !!hasToken, 
      isEmergencyMode, 
      hasUserData: !!hasUserData 
    });
    
    // Ensure auth service knows user is authenticated
    if (hasToken || hasUserData) {
      try {
        // Trigger auth service to update its state if needed
        const currentUser = authService.currentUser();
        if (!currentUser && hasUserData) {
          console.log('🔄 Updating auth service state from stored user data');
          // The auth service constructor should handle this automatically
        }
      } catch (error) {
        console.log('⚠️ Minor error updating auth state, but allowing access:', error);
      }
    }
    
    return of(true);
  }

  // Only redirect to login if we have absolutely no authentication indicators
  console.log('❌ No authentication found, redirecting to login');
  notificationService.showWarning('Please log in to access this page');
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return of(false);
};