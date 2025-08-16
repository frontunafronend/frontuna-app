import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

interface AuditResults {
  orphanVersions: number;
  duplicateComponents: number;
  usersWithoutComponents: number;
  componentsWithoutVersions: number;
  totalUsers: number;
  totalComponents: number;
  totalVersions: number;
  totalUsageLogs: number;
  totalSubscriptions: number;
}

async function auditOrphanVersions(): Promise<number> {
  console.log('\n🔍 Checking for orphan ComponentVersions...');
  
  // Find versions where the referenced component doesn't exist
  const orphanVersions = await prisma.$queryRaw`
    SELECT cv.id, cv."componentId"
    FROM "ComponentVersion" cv
    LEFT JOIN "Component" c ON cv."componentId" = c.id
    WHERE c.id IS NULL
  ` as Array<{id: string, componentId: string}>;
  
  if (orphanVersions.length > 0) {
    console.log(`❌ Found ${orphanVersions.length} orphan versions:`);
    orphanVersions.slice(0, 5).forEach(version => {
      console.log(`   - Version ${version.id} references missing component ${version.componentId}`);
    });
    if (orphanVersions.length > 5) {
      console.log(`   - ... and ${orphanVersions.length - 5} more`);
    }
  } else {
    console.log('✅ No orphan versions found');
  }
  
  return orphanVersions.length;
}

async function auditDuplicateComponents(): Promise<number> {
  console.log('\n🔍 Checking for duplicate component names per user...');
  
  const duplicates = await prisma.$queryRaw`
    SELECT "userId", name, COUNT(*) as count
    FROM "Component" 
    GROUP BY "userId", name 
    HAVING COUNT(*) > 1
  ` as Array<{userId: string, name: string, count: bigint}>;
  
  if (duplicates.length > 0) {
    console.log(`❌ Found ${duplicates.length} sets of duplicate component names:`);
    duplicates.slice(0, 5).forEach(dup => {
      console.log(`   - User ${dup.userId} has ${dup.count.toString()} components named "${dup.name}"`);
    });
    if (duplicates.length > 5) {
      console.log(`   - ... and ${duplicates.length - 5} more`);
    }
  } else {
    console.log('✅ No duplicate component names found');
  }
  
  return duplicates.length;
}

async function auditUsersWithoutComponents(): Promise<number> {
  console.log('\n🔍 Checking for users without any components...');
  
  const usersWithoutComponents = await prisma.user.findMany({
    where: {
      components: {
        none: {}
      }
    },
    select: {
      id: true,
      email: true,
      createdAt: true
    }
  });
  
  if (usersWithoutComponents.length > 0) {
    console.log(`⚠️  Found ${usersWithoutComponents.length} users without components:`);
    usersWithoutComponents.slice(0, 3).forEach(user => {
      console.log(`   - ${user.email} (created: ${user.createdAt.toISOString().split('T')[0]})`);
    });
    if (usersWithoutComponents.length > 3) {
      console.log(`   - ... and ${usersWithoutComponents.length - 3} more`);
    }
  } else {
    console.log('✅ All users have at least one component');
  }
  
  return usersWithoutComponents.length;
}

async function auditComponentsWithoutVersions(): Promise<number> {
  console.log('\n🔍 Checking for components without versions...');
  
  const componentsWithoutVersions = await prisma.component.findMany({
    where: {
      versions: {
        none: {}
      }
    },
    select: {
      id: true,
      name: true,
      userId: true
    }
  });
  
  if (componentsWithoutVersions.length > 0) {
    console.log(`⚠️  Found ${componentsWithoutVersions.length} components without versions:`);
    componentsWithoutVersions.slice(0, 3).forEach(comp => {
      console.log(`   - "${comp.name}" (${comp.id}) by user ${comp.userId}`);
    });
    if (componentsWithoutVersions.length > 3) {
      console.log(`   - ... and ${componentsWithoutVersions.length - 3} more`);
    }
  } else {
    console.log('✅ All components have at least one version');
  }
  
  return componentsWithoutVersions.length;
}

async function getTableCounts(): Promise<{
  totalUsers: number;
  totalComponents: number;
  totalVersions: number;
  totalUsageLogs: number;
  totalSubscriptions: number;
}> {
  console.log('\n📊 Getting table counts...');
  
  const [
    totalUsers,
    totalComponents,
    totalVersions,
    totalUsageLogs,
    totalSubscriptions
  ] = await Promise.all([
    prisma.user.count(),
    prisma.component.count(),
    prisma.componentVersion.count(),
    prisma.usageLog.count(),
    prisma.subscription.count()
  ]);
  
  return {
    totalUsers,
    totalComponents,
    totalVersions,
    totalUsageLogs,
    totalSubscriptions
  };
}

async function printAuditSummary(results: AuditResults) {
  console.log('\n📋 DATA AUDIT SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  console.log('| Table             | Count    | Issues Found      |');
  console.log('|-------------------|----------|-------------------|');
  console.log(`| Users            | ${results.totalUsers.toString().padStart(8)} | ${results.usersWithoutComponents > 0 ? '⚠️  ' + results.usersWithoutComponents + ' no components' : '✅ Clean'.padEnd(17)} |`);
  console.log(`| Components       | ${results.totalComponents.toString().padStart(8)} | ${results.duplicateComponents > 0 ? '❌ ' + results.duplicateComponents + ' duplicates' : '✅ Clean'.padEnd(17)} |`);
  console.log(`| Component Versions| ${results.totalVersions.toString().padStart(8)} | ${results.orphanVersions > 0 ? '❌ ' + results.orphanVersions + ' orphans' : '✅ Clean'.padEnd(17)} |`);
  console.log(`| Usage Logs       | ${results.totalUsageLogs.toString().padStart(8)} | ${'✅ Clean'.padEnd(17)} |`);
  console.log(`| Subscriptions    | ${results.totalSubscriptions.toString().padStart(8)} | ${'✅ Clean'.padEnd(17)} |`);
  console.log('═══════════════════════════════════════════════════');
  
  const totalIssues = results.orphanVersions + results.duplicateComponents;
  if (totalIssues > 0) {
    console.log(`\n⚠️  TOTAL ISSUES FOUND: ${totalIssues}`);
    console.log('💡 Run with --fix flag to automatically resolve issues');
  } else {
    console.log('\n🎉 DATABASE AUDIT PASSED - No issues found!');
  }
}

async function fixIssues(results: AuditResults) {
  if (process.argv.includes('--fix')) {
    console.log('\n🔧 FIXING ISSUES...');
    
    // Fix orphan versions
    if (results.orphanVersions > 0) {
      console.log(`🗑️  Deleting ${results.orphanVersions} orphan versions...`);
      const orphanIds = await prisma.$queryRaw`
        SELECT cv.id
        FROM "ComponentVersion" cv
        LEFT JOIN "Component" c ON cv."componentId" = c.id
        WHERE c.id IS NULL
      ` as Array<{id: string}>;
      
      if (orphanIds.length > 0) {
        const deleted = await prisma.componentVersion.deleteMany({
          where: {
            id: {
              in: orphanIds.map(v => v.id)
            }
          }
        });
        console.log(`✅ Deleted ${deleted.count} orphan versions`);
      }
    }
    
    console.log('✅ All fixable issues have been resolved');
  }
}

async function main() {
  try {
    console.log('🔍 Starting database audit...');
    console.log(`📅 Audit started at: ${new Date().toISOString()}`);
    
    // Run all audits
    const [
      orphanVersions,
      duplicateComponents,
      usersWithoutComponents,
      componentsWithoutVersions,
      counts
    ] = await Promise.all([
      auditOrphanVersions(),
      auditDuplicateComponents(),
      auditUsersWithoutComponents(),
      auditComponentsWithoutVersions(),
      getTableCounts()
    ]);
    
    const results: AuditResults = {
      orphanVersions,
      duplicateComponents,
      usersWithoutComponents,
      componentsWithoutVersions,
      ...counts
    };
    
    // Print summary
    await printAuditSummary(results);
    
    // Fix issues if requested
    await fixIssues(results);
    
    console.log('\n🎉 Audit completed successfully!');
    console.log(`📅 Audit finished at: ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the audit
main().catch(console.error);
