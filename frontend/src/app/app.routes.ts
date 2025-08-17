import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Frontuna.com - AI-Powered Frontend Component Generator',
    data: { seoIndex: true } // Landing page should be indexed
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About - Frontuna.com'
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact Us - Frontuna.com'
  },
  
  // Authentication routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Login - Frontuna.com'
      },
      {
        path: 'signup',
        loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent),
        title: 'Sign Up - Frontuna.com'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  
  // Protected routes - Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    title: 'Dashboard - Frontuna.com',
    data: { seoIndex: false } // Protected dashboard should not be indexed
  },
  {
    path: 'dashboard/generate',
    loadComponent: () => import('./pages/dashboard/generate/generate.component').then(m => m.GenerateComponent),
    canActivate: [AuthGuard],
    title: 'Generate Component - Frontuna.com'
  },
  {
    path: 'dashboard/templates',
    loadComponent: () => import('./pages/dashboard/templates/templates.component').then(m => m.TemplatesComponent),
    canActivate: [AuthGuard],
    title: 'Templates - Frontuna.com'
  },
  {
    path: 'dashboard/history',
    loadComponent: () => import('./pages/dashboard/history/history.component').then(m => m.HistoryComponent),
    canActivate: [AuthGuard],
    title: 'Generation History - Frontuna.com'
  },
  {
    path: 'dashboard/export',
    loadComponent: () => import('./pages/dashboard/export/export.component').then(m => m.ExportComponent),
    canActivate: [AuthGuard],
    title: 'Export Projects - Frontuna.com'
  },
  {
    path: 'dashboard/components',
    loadComponent: () => import('./pages/dashboard/components/components.component').then(m => m.ComponentsComponent),
    canActivate: [AuthGuard],
    title: 'My Components - Frontuna.com'
  },
  {
    path: 'dashboard/ai-copilot',
    loadComponent: () => import('./pages/dashboard/ai-copilot.component').then(m => m.AICopilotComponent),
    canActivate: [AuthGuard],
    title: 'AI Copilot - Frontuna.com'
  },
  {
    path: 'dashboard/scaffold',
    loadComponent: () => import('./pages/dashboard/scaffold.component').then(m => m.ScaffoldComponent),
    canActivate: [AuthGuard],
    title: 'Scaffold Generator - Frontuna.com'
  },
  {
    path: 'dashboard/playground',
    loadComponent: () => import('./pages/dashboard/component-playground.component').then(m => m.ComponentPlaygroundComponent),
    canActivate: [AuthGuard],
    title: 'Component Playground - Frontuna.com'
  },
  {
    path: 'dashboard/editor',
    loadComponent: () => import('./components/editing/code-editor/code-editor.component').then(m => m.CodeEditorComponent),
    canActivate: [AuthGuard],
    title: 'AI Code Editor - Frontuna.com'
  },
  {
    path: 'dashboard/gallery',
    loadComponent: () => import('./pages/dashboard/gallery/gallery.component').then(m => m.GalleryPageComponent),
    canActivate: [AuthGuard],
    title: 'Component Gallery - Frontuna.com',
    data: { seoIndex: false } // Gallery should not be indexed
  },

  // Library and other protected routes
  {
    path: 'library',
    loadComponent: () => import('./pages/library/library.component').then(m => m.LibraryComponent),
    canActivate: [AuthGuard],
    title: 'Component Library - Frontuna.com'
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [AuthGuard],
    title: 'Settings - Frontuna.com',
    data: { seoIndex: false } // Settings should not be indexed
  },
  {
    path: 'billing',
    loadComponent: () => import('./pages/billing/billing.component').then(m => m.BillingComponent),
    canActivate: [AuthGuard],
    title: 'Billing - Frontuna.com',
    data: { seoIndex: false } // Billing should not be indexed
  },

  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [AdminGuard],
    title: 'Admin Dashboard - Frontuna.com',
    data: { seoIndex: false } // Admin should not be indexed
  },

    // Content pages
  { 
    path: 'how-it-works', 
    loadComponent: () => import('./pages/content/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent),
    title: 'How It Works - Frontuna.com'
  },
  { 
    path: 'how-to-use', 
    loadComponent: () => import('./pages/content/how-to-use/how-to-use.component').then(m => m.HowToUseComponent),
    title: 'How to Use - Frontuna.com'
  },
  {
    path: 'best-practices',
    loadComponent: () => import('./pages/content/best-practices/best-practices.component').then(m => m.BestPracticesComponent),
    title: 'Best Practices - Frontuna.com'
  },
  {
    path: 'tutorials',
    loadComponent: () => import('./pages/content/tutorials/tutorials.component').then(m => m.TutorialsComponent),
    title: 'Tutorials - Frontuna.com'
  },

  // Catch-all route - redirect to home
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];