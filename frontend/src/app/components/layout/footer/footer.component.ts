import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="row">
          <!-- Brand & Description -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-brand">
              <div class="brand-header">
                <img src="assets/images/logo/cat-logo.svg" 
                     alt="Happy Cat with Fish Logo" 
                     class="footer-logo"
                     (error)="onLogoError($event)"
                     width="45"
                     height="45"
                     loading="lazy" />
                <h5 class="brand-title">Frontuna.com</h5>
              </div>
              <p class="brand-description">
                AI-powered frontend component generator. Create beautiful, functional components 
                from natural language prompts in seconds.
              </p>
              <div class="social-links">
                <a href="https://github.com/frontuna-ai" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   mat-icon-button>
                  <mat-icon>github</mat-icon>
                </a>
                <a href="https://twitter.com/frontuna_ai" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   mat-icon-button>
                  <mat-icon>twitter</mat-icon>
                </a>
                <a href="https://discord.gg/frontuna" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   mat-icon-button>
                  <mat-icon>discord</mat-icon>
                </a>
                <a href="https://linkedin.com/company/frontuna-ai" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   mat-icon-button>
                  <mat-icon>linkedin</mat-icon>
                </a>
              </div>
            </div>
          </div>

          <!-- Product Links -->
          <div class="col-lg-2 col-md-6 col-sm-6 mb-4">
            <h6 class="footer-heading">Product</h6>
            <ul class="footer-links">
              <li><a routerLink="/how-it-works">How It Works</a></li>
              <li><a routerLink="/best-practices">Best Practices</a></li>
              <li><a routerLink="/tutorials">Tutorials</a></li>
              <li><a routerLink="/blog">Blog</a></li>
              <li><a href="https://docs.frontuna.com" target="_blank">Documentation</a></li>
            </ul>
          </div>

          <!-- Company Links -->
          <div class="col-lg-2 col-md-6 col-sm-6 mb-4">
            <h6 class="footer-heading">Company</h6>
            <ul class="footer-links">
              <li><a routerLink="/about">About Us</a></li>
              <li><a routerLink="/contact">Contact</a></li>
              <li><a href="mailto:careers@frontuna.com">Careers</a></li>
              <li><a href="mailto:press@frontuna.com">Press Kit</a></li>
              <li><a href="mailto:partnerships@frontuna.com">Partnerships</a></li>
            </ul>
          </div>

          <!-- Support Links -->
          <div class="col-lg-2 col-md-6 col-sm-6 mb-4">
            <h6 class="footer-heading">Support</h6>
            <ul class="footer-links">
              <li><a href="https://help.frontuna.com" target="_blank">Help Center</a></li>
              <li><a href="mailto:support@frontuna.com">Contact Support</a></li>
              <li><a href="https://status.frontuna.com" target="_blank">System Status</a></li>
              <li><a href="https://community.frontuna.com" target="_blank">Community</a></li>
              <li><a routerLink="/feedback">Feature Requests</a></li>
            </ul>
          </div>

          <!-- Legal Links -->
          <div class="col-lg-2 col-md-6 col-sm-6 mb-4">
            <h6 class="footer-heading">Legal</h6>
            <ul class="footer-links">
              <li><a routerLink="/legal/privacy">Privacy Policy</a></li>
              <li><a routerLink="/legal/terms">Terms of Service</a></li>
              <li><a routerLink="/legal/cookies">Cookie Policy</a></li>
              <li><a routerLink="/legal/data">Data Processing</a></li>
              <li><a routerLink="/legal/security">Security</a></li>
            </ul>
          </div>
        </div>

        <hr class="footer-divider">

        <!-- Bottom Section -->
        <div class="footer-bottom">
          <div class="row align-items-center">
            <div class="col-md-6">
              <p class="copyright-text mb-0">
                © {{ currentYear }} Frontuna.com. All rights reserved.
              </p>
            </div>
            <div class="col-md-6">
              <div class="footer-badges d-flex justify-content-md-end justify-content-center">
                <div class="badge-item">
                  <img src="assets/images/badges/soc2-badge.svg" 
                       alt="SOC 2 Compliant" 
                       class="compliance-badge" />
                </div>
                <div class="badge-item">
                  <img src="assets/images/badges/gdpr-badge.svg" 
                       alt="GDPR Compliant" 
                       class="compliance-badge" />
                </div>
                <div class="badge-item">
                  <img src="assets/images/badges/iso-badge.svg" 
                       alt="ISO 27001 Certified" 
                       class="compliance-badge" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 0 1rem;
      margin-top: auto;
    }

    .brand-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      min-height: 45px; /* Ensure consistent height even if image fails */
    }

    .brand-header.logo-failed {
      /* Style when logo fails to load */
      justify-content: center;
    }

    .brand-header.logo-failed .brand-title {
      font-size: 1.8rem;
      text-align: center;
    }

    .footer-logo {
      height: 45px;
      width: 45px;
      max-width: 45px;
      object-fit: contain;
      border-radius: 8px;
      transition: transform 0.3s ease, filter 0.3s ease;
      /* Enhanced filter for better visibility on dark background */
      filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2));
      /* Ensure SVG displays properly */
      display: block;
    }

    .footer-logo:hover {
      transform: scale(1.05);
    }

    .footer-logo.error {
      display: none;
    }

    .brand-title {
      font-weight: 700;
      margin: 0;
      font-size: 1.4rem;
      background: linear-gradient(45deg, #ffc107, #ff9800);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 4px rgba(255,193,7,0.2);
    }

    .brand-description {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .social-links {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .social-links a {
      color: rgba(255, 255, 255, 0.8);
      transition: color 0.3s ease, transform 0.3s ease;
    }

    .social-links a:hover {
      color: white;
      transform: translateY(-2px);
    }

    .footer-heading {
      font-weight: 600;
      margin-bottom: 1rem;
      color: white;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.5rem;
    }

    .footer-links a {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: color 0.3s ease;
      font-size: 0.9rem;
    }

    .footer-links a:hover {
      color: white;
    }

    .footer-divider {
      border-color: rgba(255, 255, 255, 0.2);
      margin: 2rem 0 1rem;
    }

    .footer-bottom {
      padding: 1rem 0;
    }

    .copyright-text {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    .footer-badges {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .badge-item {
      opacity: 0.8;
      transition: opacity 0.3s ease;
    }

    .badge-item:hover {
      opacity: 1;
    }

    .compliance-badge {
      height: 32px;
      width: auto;
      filter: brightness(0) invert(1);
    }

    @media (max-width: 768px) {
      .footer {
        padding: 2rem 0 1rem;
      }

      .footer-badges {
        justify-content: center !important;
        margin-top: 1rem;
      }

      .social-links {
        justify-content: center;
      }

      .brand-description {
        text-align: center;
      }
    }

    @media (max-width: 576px) {
      .footer-badges {
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .compliance-badge {
        height: 28px;
      }
    }
  `]
})
export class FooterComponent {
  public readonly currentYear = new Date().getFullYear();

  onLogoError(event: Event): void {
    console.warn('Footer cat logo failed to load, trying fallback');
    const img = event.target as HTMLImageElement;
    
    // Try different fallback paths in order of preference
    if (img.src.includes('cat-logo.svg')) {
      console.log('Footer SVG failed, trying PNG');
      img.src = 'assets/images/logo/cat-logo.png'; // Try PNG fallback
    } else if (img.src.includes('cat-logo.png')) {
      console.log('Footer PNG failed, trying absolute SVG path');
      img.src = '/assets/images/logo/cat-logo.svg'; // Try absolute SVG path
    } else if (img.src.includes('/assets/images/logo/cat-logo.svg')) {
      console.log('Footer absolute SVG failed, trying main logo');
      img.src = 'assets/images/logo/logo.svg'; // Try main logo SVG
    } else {
      // Hide image if all fallbacks fail and show text logo
      console.error('All image fallbacks failed for footer cat logo');
      img.classList.add('error');
      const brandHeader = img.closest('.brand-header');
      if (brandHeader) {
        brandHeader.classList.add('logo-failed');
        // Show a simple emoji as final fallback
        const logoContainer = brandHeader.querySelector('.footer-logo');
        if (logoContainer) {
          logoContainer.outerHTML = '<span style="font-size: 2rem; color: white;">🐱</span>';
        }
      }
    }
  }
}