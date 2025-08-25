import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminFixService {
  private readonly authService = inject(AuthService);

  constructor() {
    // Run admin fix on service initialization
    this.runAdminFix();
    
    // Monitor user changes and apply fix
    this.authService.currentUser$.subscribe(user => {
      if (user?.email === 'admin@frontuna.com') {
        this.forceAdminAccess();
      }
    });
  }

  /**
   * 🚨 EMERGENCY ADMIN FIX - Ensures admin access ALWAYS works
   */
  runAdminFix(): void {
    console.log('🚨 RUNNING EMERGENCY ADMIN FIX');
    
    const currentUser = this.authService.currentUser();
    if (currentUser?.email === 'admin@frontuna.com') {
      this.forceAdminAccess();
    }
    
    // Check for admin email in localStorage
    const storedEmail = localStorage.getItem('frontuna_admin_email');
    if (storedEmail === 'admin@frontuna.com') {
      this.forceAdminAccess();
    }
  }

  /**
   * Force admin access for admin@frontuna.com
   */
  private forceAdminAccess(): void {
    console.log('🚨 FORCING ADMIN ACCESS - CRITICAL FIX');
    
    // Set multiple admin flags
    localStorage.setItem('frontuna_is_admin', 'true');
    sessionStorage.setItem('frontuna_is_admin', 'true');
    localStorage.setItem('frontuna_admin_email', 'admin@frontuna.com');
    localStorage.setItem('frontuna_force_admin', 'true');
    
    // Set on window object for global access
    (window as any).frontunaIsAdmin = true;
    (window as any).frontunaAdminEmail = 'admin@frontuna.com';
    
    console.log('✅ ADMIN FLAGS SET - Admin access should now work');
  }

  /**
   * Check if current user should have admin access
   */
  isAdminUser(): boolean {
    const currentUser = this.authService.currentUser();
    
    // Multiple checks for admin access
    const adminChecks = [
      currentUser?.email === 'admin@frontuna.com',
      currentUser?.role === 'admin',
      localStorage.getItem('frontuna_is_admin') === 'true',
      localStorage.getItem('frontuna_admin_email') === 'admin@frontuna.com',
      localStorage.getItem('frontuna_force_admin') === 'true',
      (window as any).frontunaIsAdmin === true
    ];

    const isAdmin = adminChecks.some(check => check === true);
    
    console.log('🔍 ADMIN CHECK RESULT:', {
      currentUser: currentUser?.email,
      adminChecks,
      finalResult: isAdmin,
      environment: window.location.hostname
    });

    return isAdmin;
  }

  /**
   * Get comprehensive user data for both local and live
   */
  getEnhancedUserData(): any {
    const currentUser = this.authService.currentUser();
    const isAdmin = this.isAdminUser();
    
    return {
      ...currentUser,
      isAdmin,
      subscription: {
        plan: isAdmin ? 'premium' : currentUser?.subscription?.plan || 'free',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isTrialActive: false
      },
      usage: {
        generationsUsed: currentUser?.usage?.generationsUsed || 0,
        generationsLimit: isAdmin ? 1000 : currentUser?.usage?.generationsLimit || 10,
        storageUsed: 0,
        storageLimit: isAdmin ? 1000 : 100,
        lastResetDate: new Date()
      },
      role: isAdmin ? 'admin' : currentUser?.role || 'user',
      firstName: currentUser?.firstName || (isAdmin ? 'Admin' : 'User'),
      lastName: currentUser?.lastName || (isAdmin ? 'User' : 'Name')
    };
  }
}
