import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  template: `
    <div class="billing-layout">
      <div class="billing-header">
        <h1>
          <mat-icon>payment</mat-icon>
          Billing & Subscription
        </h1>
        <p>Manage your subscription and billing information</p>
      </div>

      <div class="billing-content">
        <!-- Current Plan Section -->
        <mat-card class="current-plan-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>account_circle</mat-icon>
              Current Plan
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="plan-info">
              <div class="plan-details">
                <h3>{{ currentPlan() | titlecase }} Plan</h3>
                <p class="plan-status">
                  <mat-icon [style.color]="getStatusColor()">{{ getStatusIcon() }}</mat-icon>
                  {{ currentStatus() | titlecase }}
                </p>
              </div>
              
              <div class="usage-info">
                <div class="usage-item">
                  <label>Component Generations</label>
                  <div class="progress-container">
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="generationProgress()"
                      [color]="generationProgress() > 80 ? 'warn' : 'primary'">
                    </mat-progress-bar>
                    <span class="usage-text">{{ generationsUsed() }}/{{ generationsLimit() === -1 ? '∞' : generationsLimit() }}</span>
                  </div>
                </div>
                
                <div class="usage-item">
                  <label>Storage Used</label>
                  <div class="progress-container">
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="storageProgress()"
                      [color]="storageProgress() > 80 ? 'warn' : 'primary'">
                    </mat-progress-bar>
                    <span class="usage-text">{{ storageUsed() }}MB/{{ storageLimit() === -1 ? '∞' : storageLimit() + 'MB' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Plan Selection -->
        <div class="plans-section">
          <h2>Choose Your Plan</h2>
          <p>Select the plan that best fits your development needs</p>
          
          <div class="plans-grid">
            <mat-card *ngFor="let plan of plans" 
                      class="plan-card"
                      [class.current]="plan.id === currentPlan()"
                      [class.popular]="plan.popular">
              
              @if (plan.popular) {
                <div class="popular-badge">
                  <mat-chip color="accent">Most Popular</mat-chip>
                </div>
              }
              
              <mat-card-header>
                <mat-card-title>{{ plan.name }}</mat-card-title>
                <mat-card-subtitle>{{ plan.description }}</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="plan-price">
                  <span class="price">\${{ plan.price }}</span>
                  <span class="period">/month</span>
                </div>
                
                <div class="plan-features">
                  <div class="feature" *ngFor="let feature of plan.features">
                    <mat-icon>check_circle</mat-icon>
                    <span>{{ feature }}</span>
                  </div>
                </div>
                
                <div class="plan-limits">
                  <div class="limit-item">
                    <strong>{{ plan.limits.generations === -1 ? 'Unlimited' : plan.limits.generations }}</strong>
                    <span>Component Generations</span>
                  </div>
                  <div class="limit-item">
                    <strong>{{ plan.limits.storage === -1 ? 'Unlimited' : plan.limits.storage + 'MB' }}</strong>
                    <span>Storage</span>
                  </div>
                  <div class="limit-item">
                    <strong>{{ plan.limits.components === -1 ? 'Unlimited' : plan.limits.components }}</strong>
                    <span>Saved Components</span>
                  </div>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                @if (plan.id === currentPlan()) {
                  <button mat-stroked-button disabled>
                    <mat-icon>check</mat-icon>
                    Current Plan
                  </button>
                } @else if (isUpgrade(plan.id)) {
                  <button mat-raised-button 
                          color="primary"
                          (click)="upgradeToPlan(plan.id)">
                    <mat-icon>upgrade</mat-icon>
                    Upgrade to {{ plan.name }}
                  </button>
                } @else {
                  <button mat-button 
                          (click)="downgradeToPlan(plan.id)">
                    <mat-icon>downgrade</mat-icon>
                    Change to {{ plan.name }}
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          </div>
        </div>

        <!-- Payment Method & History -->
        <div class="billing-details">
          <mat-card class="payment-method-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>credit_card</mat-icon>
                Payment Method
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="payment-placeholder">
                <mat-icon>credit_card</mat-icon>
                <p>No payment method on file</p>
                <button mat-raised-button color="primary">
                  <mat-icon>add</mat-icon>
                  Add Payment Method
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="billing-history-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>receipt</mat-icon>
                Billing History
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="history-placeholder">
                <mat-icon>receipt_long</mat-icon>
                <p>No billing history yet</p>
                <small>Your invoices will appear here once you upgrade to a paid plan</small>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .billing-layout {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .billing-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .billing-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .billing-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* Current Plan Card */
    .current-plan-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .current-plan-card .mat-mdc-card-header .mat-mdc-card-title,
    .current-plan-card .mat-mdc-card-content {
      color: white;
    }

    .plan-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 32px;
    }

    .plan-details h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .plan-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      opacity: 0.9;
    }

    .usage-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 300px;
    }

    .usage-item label {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
      margin-bottom: 8px;
      display: block;
    }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .progress-container mat-progress-bar {
      flex: 1;
    }

    .usage-text {
      font-size: 14px;
      font-weight: 500;
      min-width: 80px;
      text-align: right;
    }

    /* Plans Section */
    .plans-section {
      margin: 32px 0;
    }

    .plans-section h2 {
      text-align: center;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #333;
    }

    .plans-section p {
      text-align: center;
      color: #666;
      margin-bottom: 32px;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .plan-card {
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .plan-card.current {
      border: 2px solid #667eea;
      transform: scale(1.02);
    }

    .plan-card.popular {
      border: 2px solid #ffc107;
      transform: scale(1.05);
    }

    .popular-badge {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
    }

    .plan-price {
      text-align: center;
      margin: 16px 0 24px 0;
    }

    .plan-price .price {
      font-size: 48px;
      font-weight: 700;
      color: #333;
    }

    .plan-price .period {
      font-size: 16px;
      color: #666;
      font-weight: 400;
    }

    .plan-features {
      margin: 24px 0;
    }

    .plan-features .feature {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .plan-features .feature mat-icon {
      color: #4caf50;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .plan-limits {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 24px 0;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .limit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .limit-item strong {
      color: #333;
      font-weight: 600;
    }

    .limit-item span {
      color: #666;
      font-size: 14px;
    }

    mat-card-actions {
      margin-top: auto;
      padding: 16px;
    }

    mat-card-actions button {
      width: 100%;
    }

    /* Billing Details */
    .billing-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .payment-placeholder,
    .history-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .payment-placeholder mat-icon,
    .history-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #ddd;
    }

    .payment-placeholder p,
    .history-placeholder p {
      margin: 0 0 16px 0;
      font-size: 16px;
    }

    .history-placeholder small {
      color: #999;
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .billing-layout {
        padding: 16px;
      }

      .plan-info {
        flex-direction: column;
        gap: 24px;
      }

      .usage-info {
        min-width: auto;
      }

      .plans-grid {
        grid-template-columns: 1fr;
      }

      .billing-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BillingComponent implements OnInit {
  private readonly authService = inject(AuthService);

  // Mock current user data - replace with actual auth service
  public readonly currentUser = computed(() => this.authService.currentUser());
  public readonly currentPlan = computed(() => this.currentUser()?.subscription?.plan || 'free');
  public readonly currentStatus = computed(() => this.currentUser()?.subscription?.status || 'trial');
  
  // Usage calculations
  public readonly generationsUsed = computed(() => this.currentUser()?.usage?.generationsUsed || 2);
  public readonly generationsLimit = computed(() => {
    const plan = this.currentPlan();
    return this.getPlanLimits(plan).generations;
  });
  public readonly generationProgress = computed(() => {
    const limit = this.generationsLimit();
    if (limit === -1) return 0;
    return Math.round((this.generationsUsed() / limit) * 100);
  });

  public readonly storageUsed = computed(() => this.currentUser()?.usage?.storageUsed || 15);
  public readonly storageLimit = computed(() => {
    const plan = this.currentPlan();
    return this.getPlanLimits(plan).storage;
  });
  public readonly storageProgress = computed(() => {
    const limit = this.storageLimit();
    if (limit === -1) return 0;
    return Math.round((this.storageUsed() / limit) * 100);
  });

  // Available plans
  public readonly plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for trying out Frontuna',
      price: 0,
      popular: false,
      features: [
        'AI-powered component generation',
        'Basic component library',
        'Export to React, Angular, Vue',
        'Community support'
      ],
      limits: {
        generations: 10,
        storage: 100,
        components: 25,
        exports: 5
      }
    },
    {
      id: 'basic',
      name: 'Basic',
      description: 'Great for individual developers',
      price: 9,
      popular: false,
      features: [
        'Everything in Free',
        'Advanced AI features',
        'Priority generation',
        'Email support',
        'More export formats'
      ],
      limits: {
        generations: 100,
        storage: 500,
        components: 100,
        exports: 25
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Ideal for professional developers',
      price: 29,
      popular: true,
      features: [
        'Everything in Basic',
        'Custom templates',
        'Team collaboration (up to 3 members)',
        'API access',
        'Advanced analytics',
        'Priority support'
      ],
      limits: {
        generations: 500,
        storage: 2000,
        components: 500,
        exports: 100
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For teams and organizations',
      price: 99,
      popular: false,
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'White-label options',
        'On-premise deployment'
      ],
      limits: {
        generations: -1,
        storage: -1,
        components: -1,
        exports: -1
      }
    }
  ];

  ngOnInit(): void {
    // Component initialization
    console.log('Billing component initialized');
  }

  // Helper methods
  getPlanLimits(planId: string) {
    const plan = this.plans.find(p => p.id === planId);
    return plan?.limits || { generations: 10, storage: 100, components: 25, exports: 5 };
  }

  getStatusColor(): string {
    const status = this.currentStatus();
    switch (status) {
      case 'active': return '#4caf50';
      case 'trial': return '#ff9800';
      case 'inactive': return '#f44336';
      case 'cancelled': return '#9e9e9e';
      default: return '#2196f3';
    }
  }

  getStatusIcon(): string {
    const status = this.currentStatus();
    switch (status) {
      case 'active': return 'check_circle';
      case 'trial': return 'schedule';
      case 'inactive': return 'error';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  }

  isUpgrade(planId: string): boolean {
    const currentPlan = this.currentPlan();
    const planOrder = ['free', 'basic', 'pro', 'enterprise'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(planId);
    return targetIndex > currentIndex;
  }

  upgradeToPlan(planId: string): void {
    console.log('Upgrading to plan:', planId);
    // TODO: Implement actual upgrade logic with payment processing
    alert(`Upgrade to ${planId} plan functionality will be implemented with payment integration (Stripe, etc.)`);
  }

  downgradeToPlan(planId: string): void {
    console.log('Changing to plan:', planId);
    // TODO: Implement actual plan change logic
    alert(`Plan change to ${planId} functionality will be implemented`);
  }
}