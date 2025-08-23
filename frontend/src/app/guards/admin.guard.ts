import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '@app/services/auth/auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

// 🏆 ULTIMATE ADMIN GUARD - USES SAME PATTERN AS HEADER (NEVER LOGS OUT ON REFRESH) 🏆
export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🛡️ ULTIMATE ADMIN GUARD - Using header pattern for bulletproof admin check');

  // 🚨 USE THE SAME PATTERN AS THE HEADER - COMPUTED SIGNAL APPROACH 🚨
  // This is EXACTLY how the header stays logged in on refresh!
  const currentUser = authService.currentUser(); // This is the computed signal!
  const isAdmin = authService.isAdmin(); // This also uses computed internally
  
  console.log('🔍 Admin Guard - Current user from computed signal:', currentUser?.email || 'null');
  console.log('🔍 Admin Guard - Is admin:', isAdmin);

  if (currentUser && isAdmin) {
    console.log('✅ Admin Guard - Admin user authenticated, allowing access');
    return of(true); // Return observable of true
  } else if (currentUser && !isAdmin) {
    console.log('❌ Admin Guard - User authenticated but not admin, denying access');
    notificationService.showError('Access denied - Admin privileges required');
    router.navigate(['/dashboard']);
    return of(false);
  } else {
    console.log('❌ Admin Guard - No user found, redirecting to login');
    
    // Check if we're in emergency mode before redirecting
    if (authService['emergencyLogin']?.isEmergencyMode()) {
      const emergencyUser = authService['emergencyLogin']?.getEmergencyUser();
      if (emergencyUser && emergencyUser.role === 'admin') {
        console.log('🚨 Emergency admin mode detected, allowing access');
        return of(true);
      }
    }
    
    notificationService.showError('Please log in to access this page');
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return of(false); // Return observable of false
  }
};