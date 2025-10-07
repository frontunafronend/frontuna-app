import { Injectable, signal, computed } from '@angular/core';

/**
 * 🛡️ AI PAGE STRUCTURE GUARD SERVICE
 * 
 * This service supervises AI-generated code to ensure complete page structures
 * are created when users request full pages (like Bootstrap home pages).
 * 
 * It validates that the AI provides:
 * - Complete HTML structure
 * - Proper Bootstrap layout
 * - Navigation, hero sections, content areas, footers
 * - Responsive design elements
 */

export interface PageStructureRequirement {
  type: 'bootstrap-home' | 'landing-page' | 'dashboard' | 'profile-page';
  requiredElements: string[];
  optionalElements: string[];
  bootstrapVersion: '4' | '5';
  responsiveBreakpoints: string[];
}

export interface PageValidationResult {
  isValid: boolean;
  missingElements: string[];
  suggestions: string[];
  completenessScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class AIPageStructureGuardService {
  
  // 🎯 BOOTSTRAP HOME PAGE REQUIREMENTS
  private readonly BOOTSTRAP_HOME_REQUIREMENTS: PageStructureRequirement = {
    type: 'bootstrap-home',
    requiredElements: [
      'navbar',
      'hero-section',
      'main-content',
      'footer',
      'container',
      'row',
      'col'
    ],
    optionalElements: [
      'carousel',
      'testimonials',
      'features-section',
      'cta-section',
      'breadcrumb'
    ],
    bootstrapVersion: '5',
    responsiveBreakpoints: ['col-sm', 'col-md', 'col-lg', 'col-xl']
  };

  // 🔍 VALIDATION PATTERNS
  private readonly VALIDATION_PATTERNS = {
    navbar: /(<nav[^>]*navbar[^>]*>|<div[^>]*navbar[^>]*>)/i,
    heroSection: /(<section[^>]*hero[^>]*>|<div[^>]*hero[^>]*>|<header[^>]*jumbotron[^>]*>)/i,
    mainContent: /(<main[^>]*>|<section[^>]*main[^>]*>|<div[^>]*main-content[^>]*>)/i,
    footer: /<footer[^>]*>/i,
    container: /(container|container-fluid)/i,
    row: /class="[^"]*row[^"]*"/i,
    col: /class="[^"]*col[^"]*"/i,
    responsive: /(col-sm|col-md|col-lg|col-xl)/i,
    bootstrapGrid: /(row|col-)/i
  };

  /**
   * 🔍 VALIDATE BOOTSTRAP HOME PAGE STRUCTURE
   */
  validateBootstrapHomePage(html: string, typescript: string): PageValidationResult {
    console.log('🛡️ AI Guard: Validating Bootstrap home page structure...');
    
    const missingElements: string[] = [];
    const suggestions: string[] = [];
    let completenessScore = 0;
    
    // Check required elements
    const requirements = this.BOOTSTRAP_HOME_REQUIREMENTS;
    
    // 1. Check for Navigation
    if (!this.VALIDATION_PATTERNS.navbar.test(html)) {
      missingElements.push('Navigation Bar');
      suggestions.push('Add a Bootstrap navbar with brand, navigation links, and responsive toggle');
    } else {
      completenessScore += 20;
    }
    
    // 2. Check for Hero Section
    if (!this.VALIDATION_PATTERNS.heroSection.test(html)) {
      missingElements.push('Hero Section');
      suggestions.push('Add a hero section with compelling headline, description, and call-to-action');
    } else {
      completenessScore += 20;
    }
    
    // 3. Check for Main Content Area
    if (!this.VALIDATION_PATTERNS.mainContent.test(html)) {
      missingElements.push('Main Content Area');
      suggestions.push('Wrap your cards/content in a proper <main> or main content section');
    } else {
      completenessScore += 20;
    }
    
    // 4. Check for Footer
    if (!this.VALIDATION_PATTERNS.footer.test(html)) {
      missingElements.push('Footer');
      suggestions.push('Add a footer with company info, links, and copyright');
    } else {
      completenessScore += 15;
    }
    
    // 5. Check for Bootstrap Grid System
    if (!this.VALIDATION_PATTERNS.container.test(html)) {
      missingElements.push('Bootstrap Container');
      suggestions.push('Use Bootstrap container/container-fluid for proper layout');
    } else {
      completenessScore += 10;
    }
    
    if (!this.VALIDATION_PATTERNS.row.test(html)) {
      missingElements.push('Bootstrap Row');
      suggestions.push('Use Bootstrap row class for proper grid layout');
    } else {
      completenessScore += 5;
    }
    
    if (!this.VALIDATION_PATTERNS.col.test(html)) {
      missingElements.push('Bootstrap Columns');
      suggestions.push('Use Bootstrap column classes (col, col-sm, col-md, etc.)');
    } else {
      completenessScore += 5;
    }
    
    // 6. Check for Responsive Design
    if (!this.VALIDATION_PATTERNS.responsive.test(html)) {
      missingElements.push('Responsive Breakpoints');
      suggestions.push('Add responsive column classes (col-sm-6, col-md-4, col-lg-3)');
    } else {
      completenessScore += 5;
    }
    
    const isValid = missingElements.length === 0;
    
    console.log(`🛡️ AI Guard: Page completeness score: ${completenessScore}/100`);
    console.log(`🛡️ AI Guard: Missing elements:`, missingElements);
    
    return {
      isValid,
      missingElements,
      suggestions,
      completenessScore
    };
  }

  /**
   * 🏗️ GENERATE COMPLETE BOOTSTRAP HOME PAGE TEMPLATE
   */
  generateCompleteBootstrapHomePage(cardContent: string): string {
    console.log('🏗️ AI Guard: Generating complete Bootstrap home page...');
    
    return `
<!-- 🏠 COMPLETE BOOTSTRAP HOME PAGE -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bootstrap Home Page</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>

  <!-- 🧭 NAVIGATION BAR -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand" href="#">
        <i class="fas fa-home me-2"></i>Your Company
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link active" href="#home">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#about">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#services">Services</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#contact">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- 🦸 HERO SECTION -->
  <section class="hero-section bg-gradient text-white py-5" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <div class="container">
      <div class="row align-items-center min-vh-50">
        <div class="col-lg-6">
          <h1 class="display-4 fw-bold mb-4">Welcome to Our Platform</h1>
          <p class="lead mb-4">Discover amazing features and connect with our community. Experience the best user profiles and services.</p>
          <div class="d-flex gap-3">
            <button class="btn btn-light btn-lg">Get Started</button>
            <button class="btn btn-outline-light btn-lg">Learn More</button>
          </div>
        </div>
        <div class="col-lg-6 text-center">
          <i class="fas fa-users fa-10x opacity-75"></i>
        </div>
      </div>
    </div>
  </section>

  <!-- 📋 MAIN CONTENT SECTION -->
  <main class="main-content py-5">
    <div class="container">
      
      <!-- Section Header -->
      <div class="row mb-5">
        <div class="col-12 text-center">
          <h2 class="display-5 fw-bold mb-3">Meet Our Team</h2>
          <p class="lead text-muted">Get to know the amazing people behind our success</p>
          <hr class="w-25 mx-auto">
        </div>
      </div>

      <!-- User Profile Cards Section -->
      <div class="row g-4 justify-content-center">
        ${cardContent}
      </div>

      <!-- Call to Action Section -->
      <div class="row mt-5">
        <div class="col-12 text-center">
          <div class="bg-light p-5 rounded">
            <h3 class="mb-3">Ready to Join Our Team?</h3>
            <p class="mb-4">We're always looking for talented individuals to join our growing company.</p>
            <button class="btn btn-primary btn-lg">Apply Now</button>
          </div>
        </div>
      </div>

    </div>
  </main>

  <!-- 🦶 FOOTER -->
  <footer class="bg-dark text-white py-5 mt-5">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 mb-4">
          <h5 class="mb-3">Your Company</h5>
          <p class="text-muted">Building amazing experiences for our users worldwide.</p>
          <div class="d-flex gap-3">
            <a href="#" class="text-white"><i class="fab fa-facebook fa-lg"></i></a>
            <a href="#" class="text-white"><i class="fab fa-twitter fa-lg"></i></a>
            <a href="#" class="text-white"><i class="fab fa-linkedin fa-lg"></i></a>
            <a href="#" class="text-white"><i class="fab fa-instagram fa-lg"></i></a>
          </div>
        </div>
        <div class="col-lg-2 col-md-6 mb-4">
          <h6 class="mb-3">Company</h6>
          <ul class="list-unstyled">
            <li><a href="#" class="text-muted text-decoration-none">About</a></li>
            <li><a href="#" class="text-muted text-decoration-none">Careers</a></li>
            <li><a href="#" class="text-muted text-decoration-none">Press</a></li>
            <li><a href="#" class="text-muted text-decoration-none">Blog</a></li>
          </ul>
        </div>
        <div class="col-lg-2 col-md-6 mb-4">
          <h6 class="mb-3">Support</h6>
          <ul class="list-unstyled">
            <li><a href="#" class="text-muted text-decoration-none">Help Center</a></li>
            <li><a href="#" class="text-muted text-decoration-none">Contact</a></li>
            <li><a href="#" class="text-muted text-decoration-none">Privacy</a></li>
            <li><a href="#" class="text-muted text-decoration-none">Terms</a></li>
          </ul>
        </div>
        <div class="col-lg-4 mb-4">
          <h6 class="mb-3">Newsletter</h6>
          <p class="text-muted">Stay updated with our latest news and offers.</p>
          <div class="input-group">
            <input type="email" class="form-control" placeholder="Enter your email">
            <button class="btn btn-primary" type="button">Subscribe</button>
          </div>
        </div>
      </div>
      <hr class="my-4">
      <div class="row align-items-center">
        <div class="col-md-6">
          <p class="text-muted mb-0">&copy; 2024 Your Company. All rights reserved.</p>
        </div>
        <div class="col-md-6 text-md-end">
          <p class="text-muted mb-0">Made with <i class="fas fa-heart text-danger"></i> by Your Team</p>
        </div>
      </div>
    </div>
  </footer>

  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  }

  /**
   * 🔧 ENHANCE CARD CONTENT FOR BOOTSTRAP LAYOUT
   */
  enhanceCardContentForBootstrap(originalCardContent: string): string {
    console.log('🔧 AI Guard: Enhancing card content for Bootstrap layout...');
    
    // Wrap each card in proper Bootstrap column classes
    const enhancedContent = originalCardContent.replace(
      /<div class="col"([^>]*)>/g,
      '<div class="col-lg-3 col-md-6 col-sm-12 mb-4"$1>'
    );
    
    // Add max-width and styling to cards
    const styledContent = enhancedContent.replace(
      /<mat-card class="user-card">/g,
      '<mat-card class="user-card h-100 shadow-sm" style="max-width: 300px; margin: 0 auto;">'
    );
    
    return styledContent;
  }

  /**
   * 📊 GENERATE IMPROVEMENT SUGGESTIONS
   */
  generateImprovementSuggestions(validationResult: PageValidationResult): string[] {
    const suggestions: string[] = [...validationResult.suggestions];
    
    if (validationResult.completenessScore < 50) {
      suggestions.push('Consider using a Bootstrap starter template for better structure');
      suggestions.push('Add proper semantic HTML elements (header, main, section, footer)');
    }
    
    if (validationResult.completenessScore < 75) {
      suggestions.push('Enhance user experience with smooth scrolling and animations');
      suggestions.push('Add loading states and error handling for better UX');
    }
    
    suggestions.push('Consider adding accessibility features (ARIA labels, alt text)');
    suggestions.push('Optimize for mobile-first responsive design');
    
    return suggestions;
  }

  /**
   * 🎯 MAIN GUARD FUNCTION - Called by AI Chat Service
   */
  guardPageStructure(html: string, typescript: string, userRequest: string): {
    needsImprovement: boolean;
    improvedHtml?: string;
    suggestions: string[];
    completenessScore: number;
  } {
    console.log('🛡️ AI Guard: Analyzing page structure for user request:', userRequest);
    
    // Enhanced Bootstrap home page detection
    const isBootstrapHomeRequest = /bootstrap.*home.*page|home.*page.*bootstrap|bootstrap.*layout|bootstrap.*container|wrapped.*page.*home|homepage.*bootstrap|bootstrap.*index|bootstrap.*mock|mock.*bootstrap|bootstrap.*skeleton|skeleton.*bootstrap/i.test(userRequest);
    const hasContainerRequest = /container|wrapped|homepage|home.*page|mock.*home|home.*mock/i.test(userRequest);
    
    // Check if HTML only contains table/cards without proper page structure
    const hasOnlyTableOrCards = (html.includes('mat-table') || html.includes('mat-card')) && 
                                !html.includes('<nav') && 
                                !html.includes('<header') && 
                                !html.includes('<footer');
    
    if (isBootstrapHomeRequest || (hasContainerRequest && hasOnlyTableOrCards)) {
      console.log('🛡️ AI Guard: Detected Bootstrap home page request or incomplete structure');
      console.log('🔍 Detection details:');
      console.log('  - isBootstrapHomeRequest:', isBootstrapHomeRequest);
      console.log('  - hasContainerRequest:', hasContainerRequest);
      console.log('  - hasOnlyTableOrCards:', hasOnlyTableOrCards);
      console.log('  - Original HTML length:', html.length);
      
      const validation = this.validateBootstrapHomePage(html, typescript);
      
      if (!validation.isValid || validation.completenessScore < 80) {
        console.log('🛡️ AI Guard: Bootstrap home page needs improvement');
        console.log(`📊 Current completeness: ${validation.completenessScore}/100`);
        
        const enhancedCardContent = this.enhanceCardContentForBootstrap(html);
        const completeHomePage = this.generateCompleteBootstrapHomePage(enhancedCardContent);
        
        console.log('✅ AI Guard: Generated complete Bootstrap home page');
        console.log('📏 Enhanced HTML length:', completeHomePage.length);
        console.log('🔍 Enhanced HTML preview:', completeHomePage.substring(0, 200) + '...');
        
        return {
          needsImprovement: true,
          improvedHtml: completeHomePage,
          suggestions: this.generateImprovementSuggestions(validation),
          completenessScore: validation.completenessScore
        };
      }
    }
    
    return {
      needsImprovement: false,
      suggestions: [],
      completenessScore: 100
    };
  }
}
