/**
 * 🛡️ ADMIN SECURITY TEST
 * Test script to verify admin button security works correctly
 */

// Mock user scenarios for testing
const testUsers = [
  {
    email: 'admin@frontuna.com',
    role: 'admin',
    name: 'Admin User',
    description: 'Should see admin button'
  },
  {
    email: 'admin@frontuna.ai', 
    role: 'admin',
    name: 'Admin User AI',
    description: 'Should see admin button'
  },
  {
    email: 'user@frontuna.com',
    role: 'user',
    name: 'Regular User',
    description: 'Should NOT see admin button'
  },
  {
    email: 'admin@example.com',
    role: 'admin', 
    name: 'Fake Admin',
    description: 'Should NOT see admin button (wrong email)'
  },
  {
    email: 'admin@frontuna.com',
    role: 'user',
    name: 'Wrong Role',
    description: 'Should NOT see admin button (wrong role)'
  }
];

/**
 * 🔍 BULLETPROOF ADMIN CHECK FUNCTION
 * This is the exact same logic used in the frontend
 */
function isAdmin(user) {
  if (!user) {
    console.log('❌ ADMIN CHECK: No user provided');
    return false;
  }

  // 🛡️ BULLETPROOF ADMIN CHECK - Only specific admin emails with admin role
  const allowedAdminEmails = ['admin@frontuna.com', 'admin@frontuna.ai'];
  const hasAdminRole = user.role === 'admin';
  const hasAdminEmail = allowedAdminEmails.includes(user.email || '');
  const isVerifiedAdmin = hasAdminRole && hasAdminEmail;
  
  console.log('🔍 BULLETPROOF ADMIN CHECK:', {
    userEmail: user.email,
    userRole: user.role,
    hasAdminRole,
    hasAdminEmail,
    allowedEmails: allowedAdminEmails,
    isVerifiedAdmin,
    finalResult: isVerifiedAdmin
  });
  
  // STRICT: Only return true if BOTH role is admin AND email is in allowed list
  if (!hasAdminRole) {
    console.log('❌ ADMIN CHECK: User role is not admin:', user.role);
    return false;
  }
  
  if (!hasAdminEmail) {
    console.log('❌ ADMIN CHECK: User email not in admin list:', user.email);
    return false;
  }
  
  console.log('✅ ADMIN CHECK: User is verified admin');
  return true;
}

/**
 * 🧪 RUN ADMIN SECURITY TESTS
 */
function runAdminSecurityTests() {
  console.log('🌟 ================================');
  console.log('🛡️  ADMIN SECURITY TEST SUITE');
  console.log('🌟 ================================\n');

  testUsers.forEach((user, index) => {
    console.log(`\n📋 Test ${index + 1}: ${user.description}`);
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🎭 Role: ${user.role}`);
    
    const shouldShowAdminButton = isAdmin(user);
    
    console.log(`🔒 Admin Button Visible: ${shouldShowAdminButton ? '✅ YES' : '❌ NO'}`);
    console.log('─'.repeat(60));
  });

  console.log('\n🌟 ================================');
  console.log('✅ ADMIN SECURITY TESTS COMPLETE');
  console.log('🌟 ================================');
  
  // Summary
  const adminUsers = testUsers.filter(user => isAdmin(user));
  console.log(`\n📊 SUMMARY:`);
  console.log(`👑 Users who can see admin button: ${adminUsers.length}`);
  console.log(`👥 Total users tested: ${testUsers.length}`);
  
  adminUsers.forEach(user => {
    console.log(`   ✅ ${user.name} (${user.email})`);
  });
}

// Run the tests
runAdminSecurityTests();
