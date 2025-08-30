const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@frontuna.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    
    console.log(`📧 Admin email: ${adminEmail}`);
    
    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    let adminUser;
    if (existingAdmin) {
      console.log('🔄 Admin user exists, updating...');
      adminUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'admin',
          passwordHash
        }
      });
    } else {
      console.log('🆕 Creating new admin user...');
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: 'admin'
        }
      });
    }
    
    console.log(`✅ Admin user ready: ${adminUser.email} (Role: ${adminUser.role})`);
    console.log(`🔑 Password: ${adminPassword}`);
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Setting up admin user for Frontuna...');
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    
    await createAdminUser();
    
    console.log('\n🎉 Admin setup completed successfully!');
    console.log('🎯 You can now login with admin credentials');
    console.log('🔐 The admin button will only show for this user');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

main().catch(console.error);
