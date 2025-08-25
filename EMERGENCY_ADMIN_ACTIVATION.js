/**
 * 🚨 EMERGENCY ADMIN ACTIVATION SCRIPT
 * Run this in the browser console to FORCE admin access
 * Works on both LOCAL and LIVE environments
 */

console.log('🚨 EMERGENCY ADMIN ACTIVATION SCRIPT STARTING...');

// 🚨 STEP 1: Clear all existing auth data
localStorage.clear();
sessionStorage.clear();

// 🚨 STEP 2: Create EMERGENCY ADMIN USER
const emergencyAdmin = {
  id: 'emergency-admin-' + Date.now(),
  email: 'admin@frontuna.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  avatar: '',
  company: 'Frontuna',
  subscription: {
    plan: 'premium',
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isTrialActive: false
  },
  usage: {
    generationsUsed: 0,
    generationsLimit: 10000,
    storageUsed: 0,
    storageLimit: 10000,
    lastResetDate: new Date().toISOString()
  },
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      updates: true,
      marketing: false
    },
    ui: {
      enableAnimations: true,
      enableTooltips: true,
      compactMode: false
    }
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 🚨 STEP 3: Store in ALL possible locations
const storageKeys = [
  'frontuna_emergency_user',
  'frontuna_user',
  'currentUser',
  'user',
  'authUser'
];

storageKeys.forEach(key => {
  localStorage.setItem(key, JSON.stringify(emergencyAdmin));
  sessionStorage.setItem(key, JSON.stringify(emergencyAdmin));
});

// 🚨 STEP 4: Create EMERGENCY TOKENS
const emergencyToken = 'emergency_admin_token_' + Date.now();
const tokenKeys = [
  'frontuna_primary_token',
  'frontuna_access_token',
  'access_token',
  'token',
  'authToken',
  'frontuna_emergency_token',
  'frontuna_backup1_token'
];

tokenKeys.forEach(key => {
  localStorage.setItem(key, emergencyToken);
  sessionStorage.setItem(key, emergencyToken);
});

// 🚨 STEP 5: Activate FORCE ADMIN MODE
localStorage.setItem('frontuna_force_admin_mode', 'true');
localStorage.setItem('frontuna_force_admin_email', 'admin@frontuna.com');
sessionStorage.setItem('frontuna_force_admin_mode', 'true');
sessionStorage.setItem('frontuna_force_admin_email', 'admin@frontuna.com');

// 🚨 STEP 6: Set emergency mode flags
localStorage.setItem('frontuna_emergency_mode', 'true');
sessionStorage.setItem('frontuna_emergency_mode', 'true');

// 🚨 STEP 7: Add URL parameter for force admin
const url = new URL(window.location);
url.searchParams.set('forceAdmin', 'true');
url.searchParams.set('adminMode', 'emergency');

console.log('✅ EMERGENCY ADMIN ACTIVATION COMPLETE!');
console.log('👑 Admin User Created:', emergencyAdmin);
console.log('🔑 Emergency Token:', emergencyToken);
console.log('🚨 Force Admin Mode: ACTIVATED');
console.log('');
console.log('🔄 RELOADING PAGE TO APPLY CHANGES...');

// 🚨 STEP 8: Reload with admin parameters
setTimeout(() => {
  window.location.href = url.toString();
}, 1000);
