// 🌱 SEED SAMPLE DATA FOR TESTING
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample data...');

  try {
    // Create admin user if doesn't exist
    const adminEmail = 'admin@frontuna.com';
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          role: 'admin'
        }
      });
      console.log('✅ Created admin user');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create some test users
    const testUsers = [
      { email: 'john@example.com', password: 'password123' },
      { email: 'jane@example.com', password: 'password123' },
      { email: 'bob@example.com', password: 'password123' }
    ];

    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            passwordHash: hashedPassword,
            role: 'user'
          }
        });
        console.log(`✅ Created user: ${userData.email}`);

        // Create sample components for each user
        const sampleComponents = [
          {
            name: 'LoginForm',
            style: 'Material',
            framework: 'Angular',
            codeTs: `import { Component } from '@angular/core';

@Component({
  selector: 'app-login-form',
  template: \`
    <form class="login-form">
      <mat-form-field>
        <input matInput placeholder="Email" type="email">
      </mat-form-field>
      <mat-form-field>
        <input matInput placeholder="Password" type="password">
      </mat-form-field>
      <button mat-raised-button color="primary">Login</button>
    </form>
  \`
})
export class LoginFormComponent {}`,
            codeHtml: `<form class="login-form">
  <mat-form-field>
    <input matInput placeholder="Email" type="email">
  </mat-form-field>
  <mat-form-field>
    <input matInput placeholder="Password" type="password">
  </mat-form-field>
  <button mat-raised-button color="primary">Login</button>
</form>`,
            codeScss: `.login-form {
  display: flex;
  flex-direction: column;
  max-width: 400px;
  margin: 0 auto;
  
  mat-form-field {
    margin-bottom: 16px;
  }
  
  button {
    margin-top: 16px;
  }
}`,
            meta: { description: 'Material Design login form' }
          },
          {
            name: 'UserCard',
            style: 'Bootstrap',
            framework: 'React',
            codeTs: `import React from 'react';

interface UserCardProps {
  name: string;
  email: string;
  avatar?: string;
}

export const UserCard: React.FC<UserCardProps> = ({ name, email, avatar }) => {
  return (
    <div className="card user-card">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <img src={avatar || '/default-avatar.png'} className="avatar" alt="Avatar" />
          <div className="ms-3">
            <h5 className="card-title mb-1">{name}</h5>
            <p className="card-text text-muted">{email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};`,
            codeHtml: `<div class="card user-card">
  <div class="card-body">
    <div class="d-flex align-items-center">
      <img src="avatar.jpg" class="avatar" alt="Avatar">
      <div class="ms-3">
        <h5 class="card-title mb-1">John Doe</h5>
        <p class="card-text text-muted">john@example.com</p>
      </div>
    </div>
  </div>
</div>`,
            codeScss: `.user-card {
  max-width: 400px;
  
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .card-title {
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .card-text {
    font-size: 0.9rem;
  }
}`,
            meta: { description: 'Bootstrap user profile card' }
          }
        ];

        // Create components for this user
        for (const compData of sampleComponents) {
          await prisma.component.create({
            data: {
              ...compData,
              userId: user.id
            }
          });
        }

        // Create sample usage logs
        const usageLogs = [
          { route: '/api/generate', tokensIn: 150, tokensOut: 300 },
          { route: '/api/optimize', tokensIn: 100, tokensOut: 200 },
          { route: '/api/generate', tokensIn: 200, tokensOut: 400 },
          { route: '/api/analyze', tokensIn: 80, tokensOut: 160 }
        ];

        for (const logData of usageLogs) {
          await prisma.usageLog.create({
            data: {
              ...logData,
              userId: user.id,
              createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date in last 7 days
            }
          });
        }

        console.log(`✅ Created sample data for: ${userData.email}`);
      } else {
        console.log(`✅ User already exists: ${userData.email}`);
      }
    }

    console.log('🎉 Sample data seeding completed!');
    console.log('');
    console.log('📊 Available test accounts:');
    console.log('👑 Admin: admin@frontuna.com / admin123');
    console.log('👤 User: john@example.com / password123');
    console.log('👤 User: jane@example.com / password123');
    console.log('👤 User: bob@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
