# Frontuna.com - AI-Powered Frontend Component Generator

[![Test Suite](https://github.com/YOUR_USERNAME/frontuna-app/actions/workflows/test.yml/badge.svg)](https://github.com/YOUR_USERNAME/frontuna-app/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/coverage-500%2B%20tests-brightgreen.svg)](https://github.com/YOUR_USERNAME/frontuna-app/actions)
[![Angular](https://img.shields.io/badge/Angular-17-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A complete full-stack SaaS application that generates frontend components using OpenAI API.

## 🚀 Features

- **AI Component Generator**: Generate React, Angular, Vue components from natural language prompts
- **Component Library**: Save, organize, and export generated components
- **Admin Dashboard**: Usage analytics, user management, AI Keeper insights
- **Real-time Preview**: Live component preview with code export
- **SEO Optimized**: Automatic sitemap, meta tags, content pages
- **Analytics**: Google Analytics integration with event tracking
- **ZIP Updater**: Admin can upload component updates without redeploy

## 🏗️ Tech Stack

### Frontend
- **Angular 17** (Standalone Components)
- **Bootstrap 5** + **Angular Material**
- **Font Awesome** icons
- **Chart.js** for analytics
- **Lottie** animations

### Backend
- **Node.js** + **Express**
- **JWT** Authentication
- **OpenAI API** integration
- **WebSocket** for real-time features
- **Cron Jobs** for scheduled tasks

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
```bash
npm run setup
```

2. **Configure environment:**
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/src/environments/environment.example.ts frontend/src/environments/environment.ts

# Add your OpenAI API key to backend/.env
OPENAI_API_KEY=your_key_here
```

3. **Start development servers:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

4. **Open application:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## 📁 Project Structure

```
frontuna-app/
├── frontend/          # Angular 17 app
├── backend/           # Node.js API server
├── shared/            # Shared types & constants
├── docs/              # Documentation
└── scripts/           # Build & utility scripts
```

## 🔧 Development

### Build for Production
```bash
npm run build
```

### 🧪 Testing Suite

Our comprehensive test suite includes **500+ test cases** covering all major components and features:

#### Available Test Commands
```bash
# Run all tests with coverage (recommended)
npm run test

# Run tests with coverage and open report
npm run test:coverage-open

# Run specific test configurations
npm run test:coverage          # Coverage mode (headless)
npm run test:watch             # Watch mode (development)
npm run test:debug             # Debug mode (Chrome browser)
npm run test:ci                # CI mode (headless, single run)

# Coverage-only commands
npm run coverage:open          # Open existing coverage report
```

#### Test Coverage
- ✅ **AI Components**: Scaffold Generator, AI Diff Viewer
- ✅ **Versioning System**: Version History, Comparison Tools
- ✅ **Gallery System**: Component Gallery, Remix Card
- ✅ **Plugin Manager**: Installation, Development, Marketplace
- ✅ **Utilities & Services**: Mock data, helpers, service integration
- ✅ **UI/UX Testing**: Accessibility, responsive design, user interactions
- ✅ **Error Handling**: Network failures, validation errors, edge cases

#### 📊 Code Coverage Reports

Our test suite generates comprehensive coverage reports in multiple formats:

**Coverage Output Directory**: `./coverage/frontuna-frontend/`

| Report Type | File Location | Purpose |
|-------------|---------------|---------|
| 🌐 **HTML Report** | `html-report/index.html` | Interactive browser-viewable report |
| 📄 **Text Summary** | `coverage.txt` | Detailed text-based coverage |
| 🔍 **LCOV Report** | `lcov-report/lcov.info` | Standard format for CI/CD tools |
| 📊 **JSON Data** | `coverage.json` | Machine-readable coverage data |
| 🏷️ **Cobertura XML** | `cobertura-coverage.xml` | XML format for CI systems |

**Coverage Thresholds**:
- ✅ **Statements**: 80% minimum (95% excellent)
- ✅ **Functions**: 80% minimum (95% excellent)  
- ✅ **Branches**: 70% minimum (90% excellent)
- ✅ **Lines**: 80% minimum (95% excellent)

**Quick Access**:
```bash
# Run tests and open coverage report
npm run test:coverage-open

# Just open existing coverage report
npm run coverage:open

# View coverage in terminal
cat coverage/frontuna-frontend/coverage.txt
```

#### 🎭 End-to-End (E2E) Testing

Our E2E test suite uses **Playwright** to test complete user workflows:

**Test Scenarios**:
- 🏗️ **Scaffold Generator**: Complete project generation workflow
- 🎨 **Gallery Remix & Export**: Component remixing and export functionality
- 🔌 **Plugin Manager**: Plugin installation and management

**E2E Commands**:
```bash
# Run all E2E tests (headless)
npm run e2e

# Run with browser UI visible
npm run e2e:headed

# Debug mode with browser dev tools
npm run e2e:debug

# Interactive UI mode
npm run e2e:ui

# View test report
npm run e2e:report

# Install browsers
npm run e2e:install
```

**E2E Features**:
- 🎯 **Real User Scenarios**: Tests complete workflows end-to-end
- 📸 **Screenshot on Failure**: Automatic failure screenshots
- 🎥 **Video Recording**: Video capture for failed tests
- 🖥️ **Multi-Browser**: Chromium, Firefox, WebKit support
- 📱 **Responsive Testing**: Desktop, tablet, mobile viewports
- ♿ **Accessibility Testing**: Basic a11y verification

#### Automated Testing
- 🚀 **GitHub Actions**: Automated unit + E2E test runs on push/PR
- 🎯 **Multi-Node Support**: Unit tests run on Node.js 18.x and 20.x
- 🎭 **E2E on PR**: End-to-end tests run automatically on pull requests
- 📊 **Coverage Artifacts**: Coverage reports uploaded to GitHub Actions
- 💬 **PR Comments**: Automatic test result and coverage summaries

### Deploy
```bash
npm run deploy
```

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Overview](docs/ARCHITECTURE.md)

## 🤖 AI Keeper

The AI Keeper module provides:
- Daily usage pattern analysis
- Weekly improvement suggestions
- Competitor feature monitoring
- Performance optimization tips

## 📈 Analytics

Built-in analytics track:
- Component generation events
- User engagement metrics
- Performance statistics
- Usage patterns

## 🔐 Security

- JWT-based authentication
- Rate limiting
- Input validation
- CORS protection
- Environment-based configuration

## 🎨 UI/UX Features

- Responsive design (mobile-first)
- Smooth animations and transitions
- Interactive tooltips for new users
- Real-time component preview
- Drag-and-drop file uploads

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@frontuna.com or join our Discord community.