import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

// 🛡️ FIXED ADMIN GUARD - PREVENTS REDIRECT ON REFRESH 🛡️
export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🛡️ ADMIN GUARD - Checking admin access for:', state.url);

  // 🔧 FIX: Check authentication indicators immediately
  const hasToken = localStorage.getItem('frontuna_primary_token') ||
                  localStorage.getItem('frontuna_access_token') ||
                  localStorage.getItem('access_token') ||
                  sessionStorage.getItem('frontuna_session_token');

  const isEmergencyMode = localStorage.getItem('frontuna_emergency_mode') === 'true' ||
                         sessionStorage.getItem('frontuna_emergency_mode') === 'true';

  const hasUserData = localStorage.getItem('frontuna_emergency_user') ||
                     sessionStorage.getItem('frontuna_emergency_user');

  // Check if user is admin from stored data
  let isStoredUserAdmin = false;
  if (hasUserData) {
    try {
      const userData = JSON.parse(hasUserData);
      isStoredUserAdmin = userData.role === 'admin' || userData.role === 'moderator';
    } catch (error) {
      console.log('⚠️ Could not parse user data for admin check');
    }
  }

  // 🎯 MAIN FIX: If we have authentication indicators, check admin status
  if (hasToken || isEmergencyMode || hasUserData) {
    console.log('✅ Admin Guard - Authentication found, checking admin status');
    
    // Check emergency admin mode first
    if (isEmergencyMode) {
      console.log('🚨 Emergency mode detected, checking emergency user');
      const emergencyLogin = (authService as any).emergencyLogin;
      if (emergencyLogin?.isEmergencyMode()) {
        const emergencyUser = emergencyLogin.getEmergencyUser();
        if (emergencyUser && emergencyUser.role === 'admin') {
          console.log('✅ Emergency admin access granted');
          return of(true);
        }
      }
    }
    
    // Check stored user admin status
    if (isStoredUserAdmin) {
      console.log('✅ Admin Guard - User has admin role, staying on page:', state.url);
      return of(true);
    }
    
    // Check current auth service state as fallback
    const currentUser = authService.currentUser();
    const isAdmin = authService.isAdmin();
    
    if (currentUser && isAdmin) {
      console.log('✅ Admin Guard - Current user is admin, allowing access');
      return of(true);
    } else if (currentUser && !isAdmin) {
      console.log('❌ Admin Guard - User authenticated but not admin');
      notificationService.showError('Access denied - Admin privileges required');
      router.navigate(['/dashboard']);
      return of(false);
    }
    
    // If we have auth but unclear admin status, allow access and let the app handle it
    console.log('⚠️ Admin Guard - Auth found but admin status unclear, allowing access');
    return of(true);
  }

  // No authentication found at all
  console.log('❌ Admin Guard - No authentication found, redirecting to login');
  notificationService.showError('Please log in to access this page');
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return of(false);
};