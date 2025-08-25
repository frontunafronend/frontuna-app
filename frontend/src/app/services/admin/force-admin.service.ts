import { Injectable, signal, computed } from '@angular/core';

/**
 * 🚨 EMERGENCY ADMIN SERVICE - FORCE ADMIN DETECTION
 * This service GUARANTEES admin access for critical admin users
 * It bypasses ALL other authentication and FORCES admin access
 */
@Injectable({
  providedIn: 'root'
})
export class ForceAdminService {
  // 🚨 CRITICAL ADMIN EMAILS - ALWAYS SHOW ADMIN BUTTON
  private readonly CRITICAL_ADMIN_EMAILS = [
    'admin@frontuna.com',
    'amir@frontuna.com', // Add your email here
    'support@frontuna.com'
  ];

  // 🚨 FORCE ADMIN MODE - ALWAYS TRUE FOR CRITICAL USERS
  private readonly _forceAdminMode = signal<boolean>(false);
  private readonly _currentAdminEmail = signal<string | null>(null);

  // Public computed properties
  public readonly forceAdminMode = this._forceAdminMode.asReadonly();
  public readonly currentAdminEmail = this._currentAdminEmail.asReadonly();

  constructor() {
    console.log('🚨 FORCE ADMIN SERVICE INITIALIZED - EMERGENCY ADMIN DETECTION ACTIVE');
    
    // Check if we need to force admin mode
    this.checkForceAdminMode();
    
    // Monitor localStorage for admin indicators
    this.monitorAdminIndicators();
  }

  /**
   * 🚨 CHECK IF USER SHOULD BE FORCED TO ADMIN MODE
   */
  private checkForceAdminMode(): void {
    console.log('🚨 CHECKING FORCE ADMIN MODE...');
    
    // Check all possible locations for admin email
    const locations = [
      localStorage.getItem('frontuna_emergency_user'),
      sessionStorage.getItem('frontuna_emergency_user'),
      localStorage.getItem('frontuna_user'),
      sessionStorage.getItem('frontuna_user'),
      localStorage.getItem('currentUser'),
      sessionStorage.getItem('currentUser')
    ];

    let foundAdminEmail: string | null = null;

    for (const location of locations) {
      if (location) {
        try {
          const userData = JSON.parse(location);
          if (userData && userData.email) {
            console.log('🔍 Checking email from storage:', userData.email);
            
            if (this.CRITICAL_ADMIN_EMAILS.includes(userData.email.toLowerCase())) {
              foundAdminEmail = userData.email;
              console.log('🚨 CRITICAL ADMIN EMAIL FOUND:', foundAdminEmail);
              break;
            }
          }
        } catch (error) {
          // Ignore JSON parse errors
        }
      }
    }

    // Also check URL parameters for admin mode
    const urlParams = new URLSearchParams(window.location.search);
    const forceAdmin = urlParams.get('forceAdmin');
    
    if (forceAdmin === 'true' || foundAdminEmail) {
      console.log('🚨 ACTIVATING FORCE ADMIN MODE');
      this._forceAdminMode.set(true);
      this._currentAdminEmail.set(foundAdminEmail || 'force-admin@frontuna.com');
      
      // Store force admin mode in localStorage
      localStorage.setItem('frontuna_force_admin_mode', 'true');
      localStorage.setItem('frontuna_force_admin_email', foundAdminEmail || 'force-admin@frontuna.com');
    }
  }

  /**
   * 🚨 MONITOR STORAGE FOR ADMIN INDICATORS
   */
  private monitorAdminIndicators(): void {
    // Check every 2 seconds for admin indicators
    setInterval(() => {
      this.checkForceAdminMode();
    }, 2000);

    // Listen for storage changes
    window.addEventListener('storage', () => {
      this.checkForceAdminMode();
    });
  }

  /**
   * 🚨 FORCE CHECK IF EMAIL IS ADMIN
   */
  public isForceAdmin(email?: string): boolean {
    if (!email) return this._forceAdminMode();
    
    const isForceAdmin = this.CRITICAL_ADMIN_EMAILS.includes(email.toLowerCase());
    
    if (isForceAdmin) {
      console.log('🚨 FORCE ADMIN DETECTED FOR EMAIL:', email);
      this._forceAdminMode.set(true);
      this._currentAdminEmail.set(email);
    }
    
    return isForceAdmin || this._forceAdminMode();
  }

  /**
   * 🚨 EMERGENCY ADMIN ACTIVATION
   */
  public emergencyActivateAdmin(email: string): void {
    console.log('🚨 EMERGENCY ADMIN ACTIVATION FOR:', email);
    
    this._forceAdminMode.set(true);
    this._currentAdminEmail.set(email);
    
    // Store in localStorage
    localStorage.setItem('frontuna_force_admin_mode', 'true');
    localStorage.setItem('frontuna_force_admin_email', email);
    
    // Create emergency admin user
    const emergencyAdmin = {
      id: 'emergency-admin',
      email: email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      subscription: {
        plan: 'premium',
        status: 'active'
      },
      usage: {
        generationsUsed: 0,
        generationsLimit: 1000
      }
    };
    
    localStorage.setItem('frontuna_emergency_user', JSON.stringify(emergencyAdmin));
    
    // Reload page to apply changes
    window.location.reload();
  }

  /**
   * 🚨 DEACTIVATE FORCE ADMIN MODE
   */
  public deactivateForceAdmin(): void {
    console.log('🚨 DEACTIVATING FORCE ADMIN MODE');
    
    this._forceAdminMode.set(false);
    this._currentAdminEmail.set(null);
    
    localStorage.removeItem('frontuna_force_admin_mode');
    localStorage.removeItem('frontuna_force_admin_email');
  }

  /**
   * 🚨 GET ADMIN STATUS FOR ANY EMAIL
   */
  public getAdminStatus(email?: string): {
    isAdmin: boolean;
    method: string;
    confidence: 'high' | 'medium' | 'low';
  } {
    if (!email) {
      return { isAdmin: false, method: 'no_email', confidence: 'low' };
    }

    // Check force admin
    if (this.isForceAdmin(email)) {
      return { isAdmin: true, method: 'force_admin', confidence: 'high' };
    }

    // Check critical emails
    if (this.CRITICAL_ADMIN_EMAILS.includes(email.toLowerCase())) {
      return { isAdmin: true, method: 'critical_email', confidence: 'high' };
    }

    // Check email patterns
    if (email.toLowerCase().includes('admin')) {
      return { isAdmin: true, method: 'email_pattern', confidence: 'medium' };
    }

    return { isAdmin: false, method: 'not_admin', confidence: 'high' };
  }
}
