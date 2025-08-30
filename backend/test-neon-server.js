/**
 * 🧪 TEST NEON SERVER
 * Quick test of our Neon integration with your database URL
 */

const { NeonDatabaseService } = require('./neon-integration');

// Your Neon database URL
const NEON_URL = 'postgresql://neondb_owner:npg_CUA5d3BQLGON@ep-soft-fire-aemufuhz-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testNeonIntegration() {
  console.log('🧪 Testing Neon Database Integration...');
  
  const neonService = new NeonDatabaseService();
  
  try {
    // Test connection
    const prisma = await neonService.initialize(NEON_URL);
    console.log('✅ Neon service initialized successfully!');
    
    // Test health check
    const isHealthy = await neonService.healthCheck();
    console.log('💓 Health check:', isHealthy ? '✅ Healthy' : '❌ Unhealthy');
    
    // Test database query
    const client = neonService.getClient();
    const result = await client.$queryRaw`SELECT NOW() as current_time, COUNT(*) as user_count FROM "User"`;
    console.log('📊 Database query result:', result[0]);
    
    // Test table access
    const tables = await client.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📋 Available tables:', tables.map(t => t.table_name));
    
    console.log('🌟 All tests passed! Neon integration is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await neonService.disconnect();
    console.log('✅ Test completed');
  }
}

// Run the test
testNeonIntegration();
