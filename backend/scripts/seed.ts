import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

interface SeedResults {
  adminUser: any;
  sampleComponents: any[];
  sampleSubscription: any;
}

async function createAdminUser() {
  console.log('👤 Creating admin user...');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@frontuna.ai';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  
  // Hash password
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin',
      passwordHash
    },
    create: {
      id: uuidv4(),
      email: adminEmail,
      passwordHash,
      role: 'admin'
    }
  });
  
  console.log(`✅ Admin user created/updated: ${adminEmail}`);
  return adminUser;
}

async function createSampleComponents(userId: string) {
  console.log('🧩 Creating sample components...');
  
  const sampleComponents = [
    {
      name: 'Login Form',
      style: 'material',
      framework: 'angular',
      codeTs: `import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login:', this.loginForm.value);
    }
  }
}`,
      codeHtml: `<div class="login-container">
  <mat-card class="login-card">
    <mat-card-header>
      <mat-card-title>Login</mat-card-title>
    </mat-card-header>
    
    <mat-card-content>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" type="password">
          <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>

        <button mat-raised-button color="primary" type="submit" 
                [disabled]="!loginForm.valid" class="full-width">
          Login
        </button>
      </form>
    </mat-card-content>
  </mat-card>
</div>`,
      codeScss: `.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.full-width {
  width: 100%;
  margin-bottom: 1rem;
}

button {
  margin-top: 1rem;
}`,
      meta: {
        description: 'Material Design login form with validation',
        category: 'form',
        status: 'generated',
        prompt: 'Create a modern login form with email and password fields using Angular Material'
      }
    },
    {
      name: 'Dashboard Card',
      style: 'modern',
      framework: 'angular',
      codeTs: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class DashboardCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = '';
  @Input() trend: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() trendValue: string = '';
}`,
      codeHtml: `<div class="dashboard-card" [class.trend-up]="trend === 'up'" 
     [class.trend-down]="trend === 'down'">
  <div class="card-header">
    <div class="card-icon">
      <mat-icon>{{ icon }}</mat-icon>
    </div>
    <div class="card-trend" *ngIf="trendValue">
      <mat-icon class="trend-icon">
        {{ trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat' }}
      </mat-icon>
      <span>{{ trendValue }}</span>
    </div>
  </div>
  
  <div class="card-content">
    <h3 class="card-title">{{ title }}</h3>
    <div class="card-value">{{ value }}</div>
  </div>
</div>`,
      codeScss: `.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-trend {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  
  .trend-icon {
    font-size: 1rem;
    margin-right: 0.25rem;
  }
}

.trend-up {
  .card-trend {
    color: #10b981;
  }
}

.trend-down {
  .card-trend {
    color: #ef4444;
  }
}

.card-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}`,
      meta: {
        description: 'Modern dashboard metric card with trend indicators',
        category: 'card',
        status: 'generated',
        prompt: 'Create a dashboard card component showing metrics with trend indicators'
      }
    },
    {
      name: 'Data Table',
      style: 'material',
      framework: 'angular',
      codeTs: `import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'action';
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  @Output() sortChange = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();
  @Output() actionClick = new EventEmitter<{action: string, row: any}>();

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  onSort(column: TableColumn) {
    if (!column.sortable) return;
    
    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    
    this.sortChange.emit({column: column.key, direction: this.sortDirection});
  }

  onAction(action: string, row: any) {
    this.actionClick.emit({action, row});
  }
}`,
      codeHtml: `<div class="table-container">
  <mat-table [dataSource]="data" class="data-table">
    <ng-container *ngFor="let column of columns" [matColumnDef]="column.key">
      <mat-header-cell *matHeaderCellDef 
                       [class.sortable]="column.sortable"
                       (click)="onSort(column)">
        {{ column.label }}
        <mat-icon *ngIf="column.sortable && sortColumn === column.key" class="sort-icon">
          {{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
        </mat-icon>
      </mat-header-cell>
      
      <mat-cell *matCellDef="let row">
        <ng-container [ngSwitch]="column.type">
          <span *ngSwitchCase="'date'">{{ row[column.key] | date:'short' }}</span>
          <span *ngSwitchCase="'number'">{{ row[column.key] | number }}</span>
          <div *ngSwitchCase="'action'" class="action-buttons">
            <button mat-icon-button color="primary" (click)="onAction('edit', row)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="onAction('delete', row)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          <span *ngSwitchDefault>{{ row[column.key] }}</span>
        </ng-container>
      </mat-cell>
    </ng-container>

    <mat-header-row *matHeaderRowDef="columns.map(c => c.key)"></mat-header-row>
    <mat-row *matRowDef="let row; columns: columns.map(c => c.key)"></mat-row>
  </mat-table>
  
  <div *ngIf="loading" class="loading-overlay">
    <mat-spinner diameter="40"></mat-spinner>
  </div>
  
  <div *ngIf="!loading && data.length === 0" class="no-data">
    <mat-icon>inbox</mat-icon>
    <p>No data available</p>
  </div>
</div>`,
      codeScss: `.table-container {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
}

.mat-header-cell {
  font-weight: 600;
  color: #374151;
  
  &.sortable {
    cursor: pointer;
    user-select: none;
    
    &:hover {
      background: #f9fafb;
    }
  }
}

.sort-icon {
  font-size: 1rem;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.mat-cell {
  border-bottom: 1px solid #e5e7eb;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.no-data {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
  
  mat-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  p {
    margin: 0;
    font-size: 1.1rem;
  }
}`,
      meta: {
        description: 'Sortable data table with actions and loading states',
        category: 'table',
        status: 'generated',
        prompt: 'Create a reusable data table component with sorting, actions, and loading states'
      }
    }
  ];

  const createdComponents = [];
  
  for (const componentData of sampleComponents) {
    const component = await prisma.component.upsert({
      where: {
        userId_name: {
          userId,
          name: componentData.name
        }
      },
      update: {
        style: componentData.style,
        framework: componentData.framework,
        version: 1,
        codeTs: componentData.codeTs,
        codeHtml: componentData.codeHtml,
        codeScss: componentData.codeScss,
        meta: componentData.meta
      },
      create: {
        id: uuidv4(),
        userId,
        name: componentData.name,
        style: componentData.style,
        framework: componentData.framework,
        version: 1,
        codeTs: componentData.codeTs,
        codeHtml: componentData.codeHtml,
        codeScss: componentData.codeScss,
        meta: componentData.meta
      }
    });
    
    // Create or update initial version
    await prisma.componentVersion.upsert({
      where: {
        componentId_v: {
          componentId: component.id,
          v: 1
        }
      },
      update: {
        codeTs: componentData.codeTs,
        codeHtml: componentData.codeHtml,
        codeScss: componentData.codeScss,
        notes: 'Updated initial version'
      },
      create: {
        id: uuidv4(),
        componentId: component.id,
        v: 1,
        codeTs: componentData.codeTs,
        codeHtml: componentData.codeHtml,
        codeScss: componentData.codeScss,
        notes: 'Initial version'
      }
    });
    
    createdComponents.push(component);
    console.log(`✅ Created component: ${component.name}`);
  }
  
  return createdComponents;
}

async function createSampleSubscription(userId: string) {
  console.log('💳 Creating sample subscription...');
  
  // Check if subscription already exists
  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId }
  });
  
  let subscription;
  if (existingSubscription) {
    subscription = await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        plan: 'pro',
        status: 'active',
        startsAt: new Date(),
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });
  } else {
    subscription = await prisma.subscription.create({
      data: {
        id: uuidv4(),
        userId,
        plan: 'pro',
        status: 'active',
        startsAt: new Date(),
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });
  }
  
  console.log(`✅ Created subscription: ${subscription.plan} (${subscription.status})`);
  return subscription;
}

async function createSampleUsageLogs(userId: string) {
  console.log('📊 Creating sample usage logs...');
  
  const usageLogs = [];
  const routes = ['generate', 'export', 'save', 'delete'];
  
  for (let i = 0; i < 10; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)];
    const tokensIn = Math.floor(Math.random() * 1000) + 100;
    const tokensOut = Math.floor(Math.random() * 2000) + 500;
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)); // Last 7 days
    
    const log = await prisma.usageLog.create({
      data: {
        id: uuidv4(),
        userId,
        tokensIn,
        tokensOut,
        route,
        createdAt
      }
    });
    
    usageLogs.push(log);
  }
  
  console.log(`✅ Created ${usageLogs.length} usage logs`);
  return usageLogs;
}

async function printSeedSummary(results: SeedResults) {
  console.log('\n🌱 SEED SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`👤 Admin User: ${results.adminUser.email}`);
  console.log(`🧩 Components: ${results.sampleComponents.length} created`);
  console.log(`💳 Subscription: ${results.sampleSubscription.plan} (${results.sampleSubscription.status})`);
  console.log('═══════════════════════════════════════');
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Login with admin credentials');
  console.log('2. Explore the sample components');
  console.log('3. Test the generation flow');
  console.log('4. Check usage analytics');
}

async function main() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log(`📅 Seed started at: ${new Date().toISOString()}`);
    
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Create sample components
    const sampleComponents = await createSampleComponents(adminUser.id);
    
    // Create sample subscription
    const sampleSubscription = await createSampleSubscription(adminUser.id);
    
    // Create sample usage logs
    await createSampleUsageLogs(adminUser.id);
    
    const results: SeedResults = {
      adminUser,
      sampleComponents,
      sampleSubscription
    };
    
    // Print summary
    await printSeedSummary(results);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📅 Seed finished at: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
main().catch(console.error);
