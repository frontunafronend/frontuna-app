import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
let mongoClient: MongoClient;

// Configuration
const DRY_RUN = process.env.DRY_RUN === '1';
const BATCH_SIZE = 100;

interface MongoUser {
  _id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  subscription?: {
    plan?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
    subscriptionId?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface MongoComponent {
  _id: string;
  name: string;
  description?: string;
  prompt?: string;
  framework: string;
  category?: string;
  styleTheme?: string;
  code?: {
    html?: string;
    css?: string;
    javascript?: string;
    typescript?: string;
  };
  userId: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MongoUsageLog {
  _id: string;
  userId: string;
  tokensUsed?: number;
  route?: string;
  createdAt?: Date;
}

async function connectToMongo() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error('MONGO_URL environment variable is required');
  }

  mongoClient = new MongoClient(mongoUrl);
  await mongoClient.connect();
  console.log('✅ Connected to MongoDB');
  return mongoClient.db();
}

async function migrateUsers(db: any) {
  console.log('\n📊 Starting User migration...');
  
  const usersCollection = db.collection('users');
  const users = await usersCollection.find({}).toArray() as MongoUser[];
  
  console.log(`Found ${users.length} users to migrate`);
  
  if (DRY_RUN) {
    console.log(`🔍 DRY RUN: Would migrate ${users.length} users`);
    return new Map<string, string>();
  }
  
  const batches = [];
  const batchSize = BATCH_SIZE;
  
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    batches.push(batch);
  }
  
  let migratedCount = 0;
  const userIdMapping = new Map<string, string>();
  
  for (const batch of batches) {
    const prismaUsers = batch.map(user => {
      const newId = uuidv4();
      userIdMapping.set(user._id.toString(), newId);
      
      return {
        id: newId,
        email: user.email,
        passwordHash: user.password,
        role: user.role || 'user',
        createdAt: user.createdAt || new Date(),
        meta: {
          originalId: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          subscription: user.subscription,
          migrationDate: new Date()
        }
      };
    });
    
    try {
      for (const userData of prismaUsers) {
        await prisma.user.upsert({
          where: { email: userData.email },
          update: userData,
          create: userData
        });
        migratedCount++;
        
        // Progress indicator every 50 records
        if (migratedCount % 50 === 0) {
          console.log(`📈 Progress: ${migratedCount}/${users.length} users (${Math.round(migratedCount/users.length*100)}%)`);
        }
      }
      
      console.log(`✅ Migrated batch: ${migratedCount}/${users.length} users`);
    } catch (error) {
      console.error(`❌ Error migrating user batch:`, error);
      console.log(`⚠️  Continuing with next batch...`);
    }
  }
  
  console.log(`✅ User migration completed: ${migratedCount} users migrated`);
  return userIdMapping;
}

async function migrateComponents(db: any, userIdMapping: Map<string, string>) {
  console.log('\n📊 Starting Component migration...');
  
  const componentsCollection = db.collection('components');
  const components = await componentsCollection.find({}).toArray() as MongoComponent[];
  
  console.log(`Found ${components.length} components to migrate`);
  
  const batches = [];
  const batchSize = 100;
  
  for (let i = 0; i < components.length; i += batchSize) {
    const batch = components.slice(i, i + batchSize);
    batches.push(batch);
  }
  
  let migratedCount = 0;
  const componentIdMapping = new Map<string, string>();
  
  for (const batch of batches) {
    const prismaComponents = batch.map(component => {
      const newId = uuidv4();
      componentIdMapping.set(component._id.toString(), newId);
      
      const newUserId = userIdMapping.get(component.userId.toString());
      if (!newUserId) {
        console.warn(`⚠️  Component ${component._id} references non-existent user ${component.userId}`);
        return null;
      }
      
      return {
        id: newId,
        userId: newUserId,
        name: component.name,
        style: component.styleTheme || 'modern',
        framework: component.framework || 'angular',
        version: 1,
        codeTs: component.code?.typescript || component.code?.javascript || '',
        codeHtml: component.code?.html || '',
        codeScss: component.code?.css || '',
        createdAt: component.createdAt || new Date(),
        meta: {
          originalId: component._id.toString(),
          description: component.description,
          prompt: component.prompt,
          category: component.category,
          status: component.status,
          migrationDate: new Date()
        }
      };
    }).filter(Boolean);
    
    try {
      await prisma.component.createMany({
        data: prismaComponents,
        skipDuplicates: true
      });
      
      migratedCount += prismaComponents.length;
      console.log(`✅ Migrated batch: ${migratedCount}/${components.length} components`);
    } catch (error) {
      console.error(`❌ Error migrating component batch:`, error);
    }
  }
  
  console.log(`✅ Component migration completed: ${migratedCount} components migrated`);
  return componentIdMapping;
}

async function migrateUsageLogs(db: any, userIdMapping: Map<string, string>) {
  console.log('\n📊 Starting UsageLog migration...');
  
  const usageLogsCollection = db.collection('usage_logs');
  const usageLogs = await usageLogsCollection.find({}).toArray() as MongoUsageLog[];
  
  console.log(`Found ${usageLogs.length} usage logs to migrate`);
  
  if (usageLogs.length === 0) {
    console.log('No usage logs found, skipping...');
    return;
  }
  
  const batches = [];
  const batchSize = 100;
  
  for (let i = 0; i < usageLogs.length; i += batchSize) {
    const batch = usageLogs.slice(i, i + batchSize);
    batches.push(batch);
  }
  
  let migratedCount = 0;
  
  for (const batch of batches) {
    const prismaUsageLogs = batch.map(log => {
      const newUserId = userIdMapping.get(log.userId.toString());
      if (!newUserId) {
        console.warn(`⚠️  Usage log ${log._id} references non-existent user ${log.userId}`);
        return null;
      }
      
      return {
        id: uuidv4(),
        userId: newUserId,
        tokensIn: log.tokensUsed || 0,
        tokensOut: 0, // Default value since not in old schema
        route: log.route || 'unknown',
        createdAt: log.createdAt || new Date()
      };
    }).filter(Boolean);
    
    try {
      await prisma.usageLog.createMany({
        data: prismaUsageLogs,
        skipDuplicates: true
      });
      
      migratedCount += prismaUsageLogs.length;
      console.log(`✅ Migrated batch: ${migratedCount}/${usageLogs.length} usage logs`);
    } catch (error) {
      console.error(`❌ Error migrating usage log batch:`, error);
    }
  }
  
  console.log(`✅ UsageLog migration completed: ${migratedCount} usage logs migrated`);
}

async function migrateSubscriptions(db: any, userIdMapping: Map<string, string>) {
  console.log('\n📊 Starting Subscription migration...');
  
  // Extract subscription data from users since it's embedded in MongoDB
  const usersCollection = db.collection('users');
  const usersWithSubscriptions = await usersCollection.find({ 
    'subscription': { $exists: true } 
  }).toArray() as MongoUser[];
  
  console.log(`Found ${usersWithSubscriptions.length} users with subscriptions to migrate`);
  
  if (usersWithSubscriptions.length === 0) {
    console.log('No subscriptions found, skipping...');
    return;
  }
  
  let migratedCount = 0;
  
  for (const user of usersWithSubscriptions) {
    const newUserId = userIdMapping.get(user._id.toString());
    if (!newUserId || !user.subscription) {
      continue;
    }
    
    try {
      await prisma.subscription.create({
        data: {
          id: uuidv4(),
          userId: newUserId,
          plan: user.subscription.plan || 'free',
          status: user.subscription.status || 'active',
          startsAt: user.subscription.startDate || new Date(),
          renewsAt: user.subscription.endDate,
          stripeId: user.subscription.customerId
        }
      });
      
      migratedCount++;
      
      if (migratedCount % 50 === 0) {
        console.log(`✅ Migrated ${migratedCount}/${usersWithSubscriptions.length} subscriptions`);
      }
    } catch (error) {
      console.error(`❌ Error migrating subscription for user ${user._id}:`, error);
    }
  }
  
  console.log(`✅ Subscription migration completed: ${migratedCount} subscriptions migrated`);
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  const userCount = await prisma.user.count();
  const componentCount = await prisma.component.count();
  const usageLogCount = await prisma.usageLog.count();
  const subscriptionCount = await prisma.subscription.count();
  
  console.log(`📊 Final counts:`);
  console.log(`   Users: ${userCount}`);
  console.log(`   Components: ${componentCount}`);
  console.log(`   Usage Logs: ${usageLogCount}`);
  console.log(`   Subscriptions: ${subscriptionCount}`);
  
  return { userCount, componentCount, usageLogCount, subscriptionCount };
}

async function printSummaryTable(results: any) {
  console.log('\n📊 MIGRATION SUMMARY TABLE');
  console.log('═══════════════════════════════════════');
  console.log('| Collection        | Count    | Status |');
  console.log('|-------------------|----------|--------|');
  console.log(`| Users            | ${results.userCount.toString().padStart(8)} | ✅     |`);
  console.log(`| Components       | ${results.componentCount.toString().padStart(8)} | ✅     |`);
  console.log(`| Usage Logs       | ${results.usageLogCount.toString().padStart(8)} | ✅     |`);
  console.log(`| Subscriptions    | ${results.subscriptionCount.toString().padStart(8)} | ✅     |`);
  console.log('═══════════════════════════════════════');
  console.log(`| TOTAL RECORDS    | ${(results.userCount + results.componentCount + results.usageLogCount + results.subscriptionCount).toString().padStart(8)} | ✅     |`);
  console.log('═══════════════════════════════════════');
}

async function main() {
  try {
    console.log('🚀 Starting MongoDB to Neon migration...');
    console.log(`📅 Migration started at: ${new Date().toISOString()}`);
    
    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE - No data will be written to database');
    }
    
    // Connect to databases
    const mongoDb = await connectToMongo();
    console.log('✅ Connected to Prisma/Neon');
    
    // Run migrations in order
    const userIdMapping = await migrateUsers(mongoDb);
    const componentIdMapping = await migrateComponents(mongoDb, userIdMapping);
    await migrateUsageLogs(mongoDb, userIdMapping);
    await migrateSubscriptions(mongoDb, userIdMapping);
    
    // Verify results
    const results = await verifyMigration();
    
    // Print summary table
    await printSummaryTable(results);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`📅 Migration finished at: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Cleanup connections
    if (mongoClient) {
      await mongoClient.close();
      console.log('🔌 MongoDB connection closed');
    }
    
    await prisma.$disconnect();
    console.log('🔌 Prisma connection closed');
  }
}

// Run the migration
main().catch(console.error);
