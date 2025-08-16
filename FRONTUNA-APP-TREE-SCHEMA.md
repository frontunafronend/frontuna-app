# 🌳 Frontuna App - Complete Tree Schema

## 📁 Project Structure

```
frontuna-app/
├── 📁 frontend/ (Angular 17 Application)
│   ├── 📄 package.json
│   ├── 📄 angular.json
│   ├── 📄 tsconfig.json
│   ├── 📄 README.md
│   │
│   ├── 📁 src/
│   │   ├── 📄 main.ts                    # App bootstrap
│   │   ├── 📄 index.html                 # Main HTML template
│   │   ├── 📄 styles.scss                # Global styles
│   │   ├── 📄 favicon.ico               # App favicon
│   │   ├── 📄 manifest.json             # PWA manifest
│   │   ├── 📄 browserconfig.xml         # Browser configuration
│   │   │
│   │   ├── 📁 app/                      # Main application code
│   │   │   ├── 📄 app.component.ts       # Root component
│   │   │   ├── 📄 app.component.html     # Root template
│   │   │   ├── 📄 app.component.scss     # Root styles
│   │   │   ├── 📄 app.config.ts          # App configuration & providers
│   │   │   ├── 📄 app.routes.ts          # Routing configuration
│   │   │   │
│   │   │   ├── 📁 components/            # Reusable UI components
│   │   │   │   ├── 📁 layout/           # Layout components
│   │   │   │   │   ├── 📁 header/
│   │   │   │   │   │   └── 📄 header.component.ts    # Main navigation
│   │   │   │   │   ├── 📁 footer/
│   │   │   │   │   │   └── 📄 footer.component.ts    # Footer section
│   │   │   │   │   └── 📁 sidebar/
│   │   │   │   │       └── 📄 sidebar.component.ts   # Dashboard sidebar
│   │   │   │   │
│   │   │   │   └── 📁 shared/           # Shared utility components
│   │   │   │       ├── 📄 enhanced-preview.component.ts      # Component preview
│   │   │   │       ├── 📁 monaco-editor/
│   │   │   │       │   └── 📄 monaco-editor.component.ts     # Code editor
│   │   │   │       ├── 📁 enhanced-preview/
│   │   │   │       │   └── 📄 enhanced-preview.component.ts  # Advanced preview
│   │   │   │       ├── 📁 dashboard-nav/
│   │   │   │       │   └── 📄 dashboard-nav.component.ts     # Dashboard navigation
│   │   │   │       └── 📁 monaco-playground/
│   │   │   │           └── 📄 monaco-playground.component.ts # Code playground
│   │   │   │
│   │   │   ├── 📁 pages/                # Feature pages/routes
│   │   │   │   ├── 📁 auth/            # Authentication pages
│   │   │   │   │   ├── 📄 login.component.ts         # Login page
│   │   │   │   │   ├── 📄 signup.component.ts        # Registration page
│   │   │   │   │   ├── 📁 login/
│   │   │   │   │   │   └── 📄 login.component.ts
│   │   │   │   │   └── 📁 signup/
│   │   │   │   │       └── 📄 signup.component.ts
│   │   │   │   │
│   │   │   │   ├── 📁 home/            # Landing page
│   │   │   │   │   └── 📄 home.component.ts           # Homepage with hero, features
│   │   │   │   │
│   │   │   │   ├── 📁 dashboard/       # Main app dashboard
│   │   │   │   │   ├── 📄 dashboard.component.ts      # Dashboard overview
│   │   │   │   │   ├── 📄 component-detail.component.ts # Component details
│   │   │   │   │   ├── 📄 generator.component.ts      # Legacy generator
│   │   │   │   │   ├── 📄 templates.component.ts      # Template management
│   │   │   │   │   ├── 📄 history.component.ts        # Generation history
│   │   │   │   │   ├── 📄 export.component.ts         # Export functionality
│   │   │   │   │   ├── 📁 dashboard-layout/
│   │   │   │   │   │   └── 📄 dashboard-layout.component.ts # Dashboard shell
│   │   │   │   │   ├── 📁 generate/
│   │   │   │   │   │   └── 📄 generate.component.ts    # Component generator
│   │   │   │   │   ├── 📁 components/
│   │   │   │   │   │   └── 📄 components.component.ts  # Components library
│   │   │   │   │   ├── 📁 templates/
│   │   │   │   │   │   └── 📄 templates.component.ts
│   │   │   │   │   ├── 📁 history/
│   │   │   │   │   │   └── 📄 history.component.ts
│   │   │   │   │   └── 📁 export/
│   │   │   │   │       └── 📄 export.component.ts
│   │   │   │   │
│   │   │   │   ├── 📁 billing/         # Subscription & billing
│   │   │   │   │   └── 📄 billing.component.ts        # Billing dashboard
│   │   │   │   │
│   │   │   │   ├── 📁 settings/        # User settings
│   │   │   │   │   ├── 📄 settings.component.ts       # Settings page
│   │   │   │   │   ├── 📄 settings.component.html     # Settings template
│   │   │   │   │   └── 📄 settings.component.scss     # Settings styles
│   │   │   │   │
│   │   │   │   ├── 📁 library/         # Component library
│   │   │   │   │   └── 📄 library.component.ts        # User's components
│   │   │   │   │
│   │   │   │   ├── 📁 about/           # About page
│   │   │   │   │   └── 📄 about.component.ts          # Company info
│   │   │   │   │
│   │   │   │   ├── 📁 contact/         # Contact page
│   │   │   │   │   └── 📄 contact.component.ts        # Contact form
│   │   │   │   │
│   │   │   │   ├── 📁 admin/           # Admin dashboard
│   │   │   │   │   └── 📄 admin-dashboard.component.ts # Admin panel
│   │   │   │   │
│   │   │   │   ├── 📁 content/         # Content/educational pages
│   │   │   │   │   ├── 📁 how-it-works/
│   │   │   │   │   │   └── 📄 how-it-works.component.ts    # How it works
│   │   │   │   │   ├── 📁 tutorials/
│   │   │   │   │   │   └── 📄 tutorials.component.ts       # Tutorials
│   │   │   │   │   ├── 📁 best-practices/
│   │   │   │   │   │   └── 📄 best-practices.component.ts  # Best practices
│   │   │   │   │   └── 📁 how-to-use/
│   │   │   │   │       └── 📄 how-to-use.component.ts      # Usage guide
│   │   │   │   │
│   │   │   │   └── 📁 legal/           # Legal pages (placeholder)
│   │   │   │
│   │   │   ├── 📁 services/            # Business logic & API services
│   │   │   │   ├── 📁 auth/           # Authentication services
│   │   │   │   │   ├── 📄 auth.service.ts         # Main auth service
│   │   │   │   │   ├── 📄 auth-mock.service.ts    # Mock auth for development
│   │   │   │   │   └── 📄 auth-debug.service.ts   # Auth debugging utilities
│   │   │   │   │
│   │   │   │   ├── 📁 component/      # Component-related services
│   │   │   │   │   ├── 📄 generator.service.ts    # Component generation
│   │   │   │   │   └── 📄 library.service.ts      # Component library management
│   │   │   │   │
│   │   │   │   ├── 📁 component-state/ # State management
│   │   │   │   │   └── 📄 component-state.service.ts # Component state
│   │   │   │   │
│   │   │   │   ├── 📁 notification/   # Notifications
│   │   │   │   │   └── 📄 notification.service.ts # Toast/alert system
│   │   │   │   │
│   │   │   │   ├── 📁 shared/         # Shared utilities
│   │   │   │   │   ├── 📄 encryption.service.ts   # Data encryption
│   │   │   │   │   └── 📄 loading.service.ts      # Loading states
│   │   │   │   │
│   │   │   │   ├── 📁 analytics/      # Analytics services
│   │   │   │   │   └── 📄 google-analytics.service.ts # GA integration
│   │   │   │   │
│   │   │   │   ├── 📁 api/            # API services
│   │   │   │   │   └── 📄 base-api.service.ts     # Base API client
│   │   │   │   │
│   │   │   │   └── 📁 seo/            # SEO services
│   │   │   │       └── 📄 seo.service.ts          # SEO optimization
│   │   │   │
│   │   │   ├── 📁 models/             # TypeScript interfaces & types
│   │   │   │   ├── 📄 auth.model.ts              # User, auth types
│   │   │   │   ├── 📄 component.model.ts         # Component types
│   │   │   │   ├── 📄 api-response.model.ts      # API response types
│   │   │   │   ├── 📄 notification.model.ts      # Notification types
│   │   │   │   └── 📄 analytics.model.ts         # Analytics types
│   │   │   │
│   │   │   ├── 📁 guards/             # Route guards
│   │   │   │   ├── 📄 auth.guard.ts              # Authentication guard
│   │   │   │   └── 📄 admin.guard.ts             # Admin access guard
│   │   │   │
│   │   │   ├── 📁 interceptors/       # HTTP interceptors
│   │   │   │   ├── 📄 auth.interceptor.ts        # Auth token injection
│   │   │   │   ├── 📄 error.interceptor.ts       # Global error handling
│   │   │   │   └── 📄 loading.interceptor.ts     # Loading state management
│   │   │   │
│   │   │   └── 📁 utils/              # Utility functions
│   │   │       └── 📄 component-upgrade.util.ts  # Component utilities
│   │   │
│   │   ├── 📁 assets/                 # Static assets
│   │   │   ├── 📁 images/            # Image assets
│   │   │   │   ├── 📄 cat-mascot.png           # Main mascot
│   │   │   │   ├── 📄 main-cat-first-page.png  # Hero image
│   │   │   │   ├── 📄 README-REPLACE-IMAGES.md # Image replacement guide
│   │   │   │   ├── 📁 logo/          # Logo variants
│   │   │   │   │   ├── 📄 cat-logo.png         # Main logo
│   │   │   │   │   ├── 📄 favicon-16x16.png    # Favicon variants
│   │   │   │   │   ├── 📄 favicon-32x32.png
│   │   │   │   │   ├── 📄 favicon-192x192.png
│   │   │   │   │   ├── 📄 favicon-512x512.png
│   │   │   │   │   ├── 📄 apple-touch-icon.png
│   │   │   │   │   ├── 📄 logo.svg             # SVG logo
│   │   │   │   │   └── 📄 logo-simple.svg      # Simple logo
│   │   │   │   ├── 📁 frameworks/    # Framework logos
│   │   │   │   │   ├── 📄 angular.svg
│   │   │   │   │   ├── 📄 react.svg
│   │   │   │   │   ├── 📄 vue.svg
│   │   │   │   │   └── 📄 svelte.png
│   │   │   │   ├── 📁 team/          # Team member photos
│   │   │   │   │   ├── 📄 alex-chen.jpg
│   │   │   │   │   ├── 📄 david-kim.jpg
│   │   │   │   │   ├── 📄 emma-thompson.jpg
│   │   │   │   │   └── 📄 sarah-rodriguez.jpg
│   │   │   │   ├── 📁 testimonials/  # Testimonial photos
│   │   │   │   │   └── 📄 mike.jpg
│   │   │   │   └── 📁 about/         # About page images
│   │   │   │       └── 📄 story-illustration.svg
│   │   │   │
│   │   │   └── 📁 mock-data/         # Mock data for development
│   │   │
│   │   ├── 📁 environments/          # Environment configurations
│   │   │   ├── 📄 environment.ts                # Development config
│   │   │   └── 📄 environment.prod.ts           # Production config
│   │   │
│   │   └── 📁 types/                 # Global TypeScript definitions
│   │       └── 📄 window-extensions.d.ts        # Window object extensions
│   │
│   └── 📁 node_modules/              # Dependencies (auto-generated)
│
└── 📄 README.md                      # Project documentation
```

## 🏗️ Architecture Overview

### 🎯 **Core Technologies**
- **Frontend**: Angular 17 (Standalone Components)
- **UI Library**: Angular Material
- **Styling**: SCSS + Angular Material Theming
- **State Management**: Angular Signals + Services
- **Authentication**: JWT + Mock Service (Development)
- **Build Tool**: Angular CLI + Webpack
- **Package Manager**: npm

### 🔧 **Key Features**

#### 🔐 **Authentication System**
- **Real Service**: `auth.service.ts` (for production backend)
- **Mock Service**: `auth-mock.service.ts` (for development)
- **Debug Tools**: `auth-debug.service.ts` (for debugging)
- **Guards**: Route protection for authenticated/admin users
- **Interceptors**: Automatic token handling

#### 📱 **Page Structure**
- **Public Pages**: Home, About, Contact, How It Works, Tutorials
- **Auth Pages**: Login, Signup
- **Protected Pages**: Dashboard, Billing, Settings, Library
- **Admin Pages**: Admin Dashboard
- **Content Pages**: Educational content and guides

#### 🎨 **Component Architecture**
- **Layout Components**: Header, Footer, Sidebar
- **Shared Components**: Monaco Editor, Enhanced Preview, Dashboard Nav
- **Page Components**: Feature-specific components
- **Standalone Components**: Modern Angular 17 approach

#### 📊 **Services & State**
- **Authentication**: User login, session management
- **Component Generation**: AI-powered component creation
- **Notifications**: Toast messages and alerts
- **Analytics**: Google Analytics integration
- **Encryption**: Secure data storage
- **Loading States**: Global loading management

#### 🛡️ **Security Features**
- **Route Guards**: Authentication and authorization
- **HTTP Interceptors**: Token injection and error handling
- **Encrypted Storage**: Secure user session storage
- **CORS Handling**: Cross-origin request management

### 🚀 **Development Setup**
1. **Mock Authentication**: Enabled by default (`enableMockData: true`)
2. **Live Reload**: Angular dev server with hot module replacement
3. **TypeScript**: Full type safety with strict mode
4. **Linting**: ESLint + Prettier for code quality
5. **Testing**: Jasmine + Karma for unit tests

### 📦 **Build & Deployment**
- **Development**: `npm run start` (localhost:4200)
- **Production Build**: `npm run build`
- **Linting**: `npm run lint`
- **Testing**: `npm run test`

This architecture provides a scalable, maintainable foundation for the Frontuna component generation platform! 🎉