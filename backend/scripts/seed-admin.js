const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@frontuna.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@frontuna.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('✅ Admin user created:', {
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

    // Log the admin creation
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        event: 'ADMIN_CREATED',
        meta: { email: admin.email, method: 'seed' },
        ip: 'system',
        userAgent: 'seed-script'
      }
    });

    console.log('✅ Admin user seeded successfully!');
    console.log('📧 Email: admin@frontuna.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAdmin };
