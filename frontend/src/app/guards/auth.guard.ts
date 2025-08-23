import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, of } from 'rxjs';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

// 🏆 ULTIMATE AUTH GUARD - USES SAME PATTERN AS HEADER (NEVER LOGS OUT ON REFRESH) 🏆
export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🛡️ ULTIMATE AUTH GUARD - Using header pattern for bulletproof auth check');

  // 🚨 USE THE SAME PATTERN AS THE HEADER - COMPUTED SIGNAL APPROACH 🚨
  // This is EXACTLY how the header stays logged in on refresh!
  const currentUser = authService.currentUser(); // This is the computed signal!
  
  console.log('🔍 Auth Guard - Current user from computed signal:', currentUser?.email || 'null');

  if (currentUser) {
    console.log('✅ Auth Guard - User authenticated, allowing access');
    return of(true); // Return observable of true
  } else {
    console.log('❌ Auth Guard - No user found, redirecting to login');
    
    // Check if we're in emergency mode before redirecting
    if (authService['emergencyLogin']?.isEmergencyMode()) {
      console.log('🚨 Emergency mode detected, allowing access anyway');
      return of(true);
    }
    
    notificationService.showWarning('Please log in to access this page');
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return of(false); // Return observable of false
  }
};