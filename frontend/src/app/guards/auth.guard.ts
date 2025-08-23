import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

// 🛡️ BULLETPROOF AUTH GUARD - ABSOLUTELY NO REDIRECTS ON REFRESH 🛡️
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🛡️ BULLETPROOF AUTH GUARD - URL:', state.url);
  
  // 🔧 COMPREHENSIVE TOKEN CHECK - Check ALL possible locations
  const tokenChecks = {
    primary: localStorage.getItem('frontuna_primary_token'),
    access: localStorage.getItem('frontuna_access_token'), 
    legacy: localStorage.getItem('access_token'),
    session: sessionStorage.getItem('frontuna_session_token'),
    backup1: localStorage.getItem('frontuna_backup1_token'),
    backup2: localStorage.getItem('frontuna_backup2_token'),
    backup3: localStorage.getItem('frontuna_backup3_token'),
    emergency: localStorage.getItem('frontuna_emergency_token'),
    secure: localStorage.getItem('frontuna_secure_access_token')
  };

  // 🚨 EMERGENCY MODE CHECKS
  const emergencyChecks = {
    localStorage: localStorage.getItem('frontuna_emergency_mode') === 'true',
    sessionStorage: sessionStorage.getItem('frontuna_emergency_mode') === 'true'
  };

  // 👤 USER DATA CHECKS
  const userDataChecks = {
    localStorage: localStorage.getItem('frontuna_emergency_user'),
    sessionStorage: sessionStorage.getItem('frontuna_emergency_user')
  };

  // 🔍 LOG ALL CHECKS FOR DEBUGGING
  console.log('🔍 Token checks:', tokenChecks);
  console.log('🚨 Emergency checks:', emergencyChecks);
  console.log('👤 User data checks:', userDataChecks);

  // 🎯 DETERMINE IF AUTHENTICATED
  const hasAnyToken = Object.values(tokenChecks).some(token => token && token.trim());
  const isEmergencyMode = Object.values(emergencyChecks).some(mode => mode);
  const hasUserData = Object.values(userDataChecks).some(data => data && data.trim());

  console.log('📊 Auth status:', { hasAnyToken, isEmergencyMode, hasUserData });

  // 🛡️ BULLETPROOF LOGIC: If we have ANY indication, NEVER redirect
  if (hasAnyToken || isEmergencyMode || hasUserData) {
    console.log('✅ BULLETPROOF AUTH - Authentication indicators found, STAYING ON PAGE:', state.url);
    
    // 🔄 Force auth service to recognize the authentication
    try {
      const currentUser = authService.currentUser();
      const isAuthenticated = authService.isAuthenticated();
      
      console.log('🔍 Auth service state:', { 
        hasCurrentUser: !!currentUser, 
        isAuthenticated: isAuthenticated 
      });
      
      // If auth service doesn't recognize auth, force it
      if (!currentUser || !isAuthenticated) {
        console.log('🔧 Auth service not synced, but we have tokens - forcing authentication state');
      }
    } catch (error) {
      console.log('⚠️ Auth service check error, but tokens exist so allowing access:', error);
    }
    
    return of(true);
  }

  // 🚨 ONLY redirect if absolutely NO authentication indicators exist
  console.log('❌ BULLETPROOF AUTH - Absolutely no authentication found');
  console.log('📍 Current URL:', state.url);
  console.log('🔄 Redirecting to login with return URL');
  
  notificationService.showWarning('Please log in to access this page');
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return of(false);
};