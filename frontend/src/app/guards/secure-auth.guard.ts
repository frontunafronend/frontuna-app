/**
 * 🛡️ SECURE AUTH GUARD
 * Properly integrated with the new secure backend authentication system
 * Fixes route protection and user restoration issues
 */

import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { SecureAuthService } from '@app/services/auth/secure-auth.service';
import { NotificationService } from '@app/services/notification/notification.service';

export const SecureAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(SecureAuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🛡️ SecureAuthGuard: Protecting route:', state.url);

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.currentUser();

  console.log('🔍 Auth status:', {
    isAuthenticated: isAuthenticated,
    hasUser: !!currentUser,
    userEmail: currentUser?.email,
    userRole: currentUser?.role
  });

  // If authenticated and has user data, allow access
  if (isAuthenticated && currentUser) {
    console.log('✅ Access granted to:', state.url);
    return true;
  }

  // If has token but no user, try to load profile
  const accessToken = authService.getAccessToken();
  if (accessToken && !currentUser) {
    console.log('🔄 Has token but no user data, loading profile...');
    
    return authService.getUserProfile().pipe(
      map(user => {
        console.log('✅ Profile loaded, access granted to:', state.url);
        return true;
      }),
      catchError(error => {
        console.error('❌ Failed to load profile:', error);
        notificationService.showError('Session expired. Please log in again.');
        router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: state.url } 
        });
        return of(false);
      })
    );
  }

  // No authentication found, redirect to login
  console.log('❌ No authentication found, redirecting to login');
  notificationService.showWarning('Please log in to access this page');
  
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  
  return false;
};

/**
 * Admin-only route guard
 */
export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(SecureAuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  console.log('🛡️ AdminGuard: Checking admin access for:', state.url);

  // First check if authenticated
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.currentUser();

  if (!isAuthenticated || !currentUser) {
    console.log('❌ Not authenticated, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }

  // Check if user is admin
  if (authService.isUserAdmin()) {
    console.log('✅ Admin access granted to:', state.url);
    return true;
  }

  // Not admin, deny access
  console.log('❌ Admin access denied for user:', currentUser.email);
  notificationService.showError('Access denied. Admin privileges required.');
  router.navigate(['/dashboard']);
  return false;
};

/**
 * Role-based guard factory
 */
export function createRoleGuard(allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(SecureAuthService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    console.log('🛡️ RoleGuard: Checking roles', allowedRoles, 'for:', state.url);

    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.currentUser();

    if (!isAuthenticated || !currentUser) {
      console.log('❌ Not authenticated, redirecting to login');
      router.navigate(['/auth/login']);
      return false;
    }

    // Check if user has required role
    if (allowedRoles.includes(currentUser.role)) {
      console.log('✅ Role access granted to:', state.url);
      return true;
    }

    // Role not allowed
    console.log('❌ Role access denied. Required:', allowedRoles, 'User has:', currentUser.role);
    notificationService.showError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    router.navigate(['/dashboard']);
    return false;
  };
}
