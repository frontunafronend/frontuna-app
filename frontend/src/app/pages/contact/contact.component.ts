import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SeoService } from '@app/services/seo/seo.service';
import { GoogleAnalyticsService } from '@app/services/analytics/google-analytics.service';
import { NotificationService } from '@app/services/notification/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="contact-page">
      <!-- Hero Section -->
      <section class="contact-hero">
        <div class="container">
          <div class="hero-content">
            <h1>Get in Touch</h1>
            <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section class="contact-section">
        <div class="container">
          <div class="row">
            <!-- Contact Form -->
            <div class="col-lg-8">
              <mat-card class="contact-form-card">
                <mat-card-header>
                  <mat-card-title>Send us a Message</mat-card-title>
                  <mat-card-subtitle>Fill out the form below and we'll get back to you within 24 hours</mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>First Name</mat-label>
                        <input matInput 
                               type="text" 
                               formControlName="firstName"
                               placeholder="Your first name">
                        <mat-error *ngIf="contactForm.get('firstName')?.hasError('required')">
                          First name is required
                        </mat-error>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Last Name</mat-label>
                        <input matInput 
                               type="text" 
                               formControlName="lastName"
                               placeholder="Your last name">
                        <mat-error *ngIf="contactForm.get('lastName')?.hasError('required')">
                          Last name is required
                        </mat-error>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Email Address</mat-label>
                      <input matInput 
                             type="email" 
                             formControlName="email"
                             placeholder="your.email@example.com">
                      <mat-icon matPrefix>email</mat-icon>
                      <mat-error *ngIf="contactForm.get('email')?.hasError('required')">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="contactForm.get('email')?.hasError('email')">
                        Please enter a valid email address
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Company (Optional)</mat-label>
                      <input matInput 
                             type="text" 
                             formControlName="company"
                             placeholder="Your company name">
                      <mat-icon matPrefix>business</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Subject</mat-label>
                      <mat-select formControlName="subject">
                        <mat-option *ngFor="let subject of contactSubjects" [value]="subject.value">
                          {{ subject.label }}
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="contactForm.get('subject')?.hasError('required')">
                        Please select a subject
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-100">
                      <mat-label>Message</mat-label>
                      <textarea matInput 
                                formControlName="message"
                                placeholder="Tell us how we can help you..."
                                rows="5"
                                maxlength="2000"></textarea>
                      <mat-hint align="end">{{ messageLength }}/2000</mat-hint>
                      <mat-error *ngIf="contactForm.get('message')?.hasError('required')">
                        Message is required
                      </mat-error>
                      <mat-error *ngIf="contactForm.get('message')?.hasError('minlength')">
                        Message must be at least 10 characters long
                      </mat-error>
                    </mat-form-field>

                    <div class="form-options">
                      <mat-checkbox formControlName="newsletter">
                        Subscribe to our newsletter for updates and tips
                      </mat-checkbox>

                      <mat-checkbox formControlName="privacy" required>
                        I agree to the 
                        <a routerLink="/legal/privacy" target="_blank">Privacy Policy</a>
                      </mat-checkbox>
                      <mat-error *ngIf="contactForm.get('privacy')?.hasError('required') && contactForm.get('privacy')?.touched">
                        You must agree to the privacy policy
                      </mat-error>
                    </div>

                    <div class="form-actions">
                      <button mat-raised-button 
                              color="primary" 
                              type="submit"
                              class="submit-btn"
                              [disabled]="contactForm.invalid || isSubmitting">
                        @if (isSubmitting) {
                          <mat-spinner diameter="20"></mat-spinner>
                          <span>Sending...</span>
                        } @else {
                          <mat-icon>send</mat-icon>
                          <span>Send Message</span>
                        }
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Contact Information -->
            <div class="col-lg-4">
              <div class="contact-info">
                <h2>Other Ways to Reach Us</h2>
                
                <div class="contact-methods">
                  <div class="contact-method">
                    <div class="method-icon">
                      <mat-icon>email</mat-icon>
                    </div>
                    <div class="method-content">
                      <h4>Email Support</h4>
                      <p>support&#64;frontuna.com</p>
                      <small>We typically respond within 4 hours</small>
                    </div>
                  </div>

                  <div class="contact-method">
                    <div class="method-icon">
                      <mat-icon>business</mat-icon>
                    </div>
                    <div class="method-content">
                      <h4>Sales Inquiries</h4>
                      <p>sales&#64;frontuna.com</p>
                      <small>For enterprise and partnership discussions</small>
                    </div>
                  </div>

                  <div class="contact-method">
                    <div class="method-icon">
                      <mat-icon>forum</mat-icon>
                    </div>
                    <div class="method-content">
                      <h4>Community</h4>
                      <p>Join our Discord</p>
                      <small>Get help from other developers</small>
                      <a href="https://discord.gg/frontuna" 
                         target="_blank" 
                         mat-button 
                         color="primary" 
                         class="community-btn">
                        Join Discord
                      </a>
                    </div>
                  </div>

                  <div class="contact-method">
                    <div class="method-icon">
                      <mat-icon>help</mat-icon>
                    </div>
                    <div class="method-content">
                      <h4>Documentation</h4>
                      <p>Self-service help</p>
                      <small>Find answers to common questions</small>
                      <a href="https://docs.frontuna.com" 
                         target="_blank" 
                         mat-button 
                         color="primary" 
                         class="docs-btn">
                        View Docs
                      </a>
                    </div>
                  </div>
                </div>

                <div class="response-time">
                  <h3>Response Times</h3>
                  <div class="response-item">
                    <span class="response-type">General Support</span>
                    <span class="response-time-value">< 4 hours</span>
                  </div>
                  <div class="response-item">
                    <span class="response-type">Bug Reports</span>
                    <span class="response-time-value">< 2 hours</span>
                  </div>
                  <div class="response-item">
                    <span class="response-type">Enterprise Support</span>
                    <span class="response-time-value">< 1 hour</span>
                  </div>
                </div>

                <div class="office-info">
                  <h3>Office</h3>
                  <div class="office-address">
                    <mat-icon>location_on</mat-icon>
                    <div>
                      <p>123 Innovation Drive<br>
                         San Francisco, CA 94107<br>
                         United States</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <div class="container">
          <div class="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </div>
          
          <div class="faq-grid">
            <div class="faq-item" *ngFor="let faq of frequentlyAskedQuestions">
              <h4>{{ faq.question }}</h4>
              <p>{{ faq.answer }}</p>
            </div>
          </div>
          
          <div class="faq-cta">
            <p>Can't find what you're looking for?</p>
                              <a href="https://help.frontuna.com" 
               target="_blank" 
               mat-raised-button 
               color="primary">
              Visit Help Center
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .contact-page {
      overflow-x: hidden;
    }

    .contact-hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 0;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .hero-content p {
      font-size: 1.2rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }

    .contact-section {
      padding: 4rem 0;
      background: #f8f9fa;
    }

    .contact-form-card {
      margin-bottom: 2rem;
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .half-width {
      flex: 1;
    }

    .w-100 {
      width: 100%;
    }

    .form-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-options mat-checkbox {
      font-size: 0.9rem;
    }

    .form-options a {
      color: #667eea;
      text-decoration: none;
    }

    .form-options a:hover {
      text-decoration: underline;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }

    .submit-btn {
      padding: 0.75rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .contact-info {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .contact-info h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 2rem;
    }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .contact-method {
      display: flex;
      gap: 1rem;
    }

    .method-icon {
      width: 50px;
      height: 50px;
      background: #f0f4ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #667eea;
      flex-shrink: 0;
    }

    .method-content {
      flex: 1;
    }

    .method-content h4 {
      font-weight: 600;
      color: #333;
      margin: 0 0 0.25rem 0;
    }

    .method-content p {
      font-weight: 500;
      color: #667eea;
      margin: 0 0 0.25rem 0;
    }

    .method-content small {
      color: #666;
      font-size: 0.85rem;
    }

    .community-btn,
    .docs-btn {
      margin-top: 0.75rem;
      font-size: 0.85rem;
    }

    .response-time,
    .office-info {
      margin-bottom: 2rem;
    }

    .response-time h3,
    .office-info h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .response-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
    }

    .response-item:last-child {
      border-bottom: none;
    }

    .response-type {
      color: #666;
    }

    .response-time-value {
      font-weight: 600;
      color: #4caf50;
    }

    .office-address {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .office-address mat-icon {
      color: #667eea;
      margin-top: 0.25rem;
    }

    .office-address p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }

    .faq-section {
      padding: 4rem 0;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 1rem;
    }

    .section-header p {
      font-size: 1.2rem;
      color: #666;
    }

    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .faq-item {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .faq-item h4 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
    }

    .faq-item p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .faq-cta {
      text-align: center;
    }

    .faq-cta p {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2.5rem;
      }

      .contact-section {
        padding: 2rem 0;
      }

      .form-row {
        flex-direction: column;
        gap: 1.5rem;
      }

      .contact-info {
        margin-top: 2rem;
        position: relative;
        top: auto;
      }

      .faq-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        justify-content: stretch;
      }

      .submit-btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .contact-section {
        padding: 1rem 0;
      }

      .contact-info {
        padding: 1.5rem;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly seoService = inject(SeoService);
  private readonly analyticsService = inject(GoogleAnalyticsService);
  private readonly notificationService = inject(NotificationService);

  public isSubmitting = false;
  public messageLength = 0;

  public contactForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    subject: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    newsletter: [false],
    privacy: [false, [Validators.requiredTrue]]
  });

  public readonly contactSubjects = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'press', label: 'Press & Media' },
    { value: 'other', label: 'Other' }
  ];

  public readonly frequentlyAskedQuestions = [
    {
      question: 'How does the AI component generation work?',
      answer: 'Our AI analyzes your natural language description and generates production-ready components using advanced machine learning models trained on best practices.'
    },
    {
      question: 'What frameworks do you support?',
      answer: 'We currently support React, Angular, Vue.js, Svelte, and vanilla JavaScript. We\'re constantly adding support for new frameworks.'
    },
    {
      question: 'Is there a free tier?',
      answer: 'Yes! Our free tier includes 10 component generations per month, perfect for trying out the platform and small projects.'
    },
    {
      question: 'Can I customize the generated components?',
      answer: 'Absolutely! All generated components are fully editable and come with clean, well-documented code that you can modify as needed.'
    },
    {
      question: 'Do you offer enterprise solutions?',
      answer: 'Yes, we offer enterprise plans with custom limits, priority support, on-premise deployment options, and team collaboration features.'
    },
    {
      question: 'How do you ensure code quality?',
      answer: 'Our AI is trained on best practices and generates code that follows industry standards for accessibility, performance, and maintainability.'
    }
  ];

  ngOnInit(): void {
    this.seoService.setPageSeo({
      title: 'Contact Us - Frontuna.com',
      description: 'Get in touch with the Frontuna.com team for support, questions, partnerships, or feedback. We\'re here to help!',
      keywords: 'contact frontuna.com, support, help, customer service, partnerships',
      url: 'https://frontuna.ai/contact',
      image: 'https://frontuna.ai/assets/images/og-contact.png'
    });

    this.analyticsService.trackPageView({
      page_title: 'Contact - Frontuna.ai',
      page_location: window.location.href
    });

    // Watch message length
    this.contactForm.get('message')?.valueChanges.subscribe(value => {
      this.messageLength = value ? value.length : 0;
    });
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.contactForm.value;

      // TODO: Implement actual contact form submission
      // const response = await this.contactService.submitForm(formValue);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.notificationService.showSuccess(
        'Message sent successfully! We\'ll get back to you within 24 hours.',
        'Thank you!'
      );

      this.contactForm.reset();
      this.messageLength = 0;

      this.analyticsService.trackFormSubmit('contact_form', true);

    } catch (error) {
      console.error('Contact form submission failed:', error);
      
      this.notificationService.showError(
        'Failed to send message. Please try again or contact us directly at support@frontuna.ai',
        'Submission Failed'
      );

      this.analyticsService.trackFormSubmit('contact_form', false);
    } finally {
      this.isSubmitting = false;
    }
  }
}