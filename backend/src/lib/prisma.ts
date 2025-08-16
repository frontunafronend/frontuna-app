import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern to prevent multiple instances in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

// Performance monitoring middleware
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  const duration = after - before;
  
  // Log slow queries (>300ms)
  if (duration > 300) {
    console.warn(`🐌 Slow query detected (${duration}ms):`, {
      model: params.model,
      action: params.action,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  }
  
  return result;
});

// Plan quota enforcement middleware
prisma.$use(async (params, next) => {
  // Only apply to component creation and usage logging
  if (params.model === 'Component' && params.action === 'create') {
    const userId = params.args.data.userId;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            where: { status: 'active' },
            orderBy: { startsAt: 'desc' },
            take: 1
          },
          components: {
            select: { id: true }
          }
        }
      });
      
      if (user) {
        const activeSubscription = user.subscriptions[0];
        const currentComponentCount = user.components.length;
        
        // Define plan limits
        const planLimits = {
          free: parseInt(process.env.FREE_PLAN_LIMIT || '5'),
          pro: parseInt(process.env.PRO_PLAN_LIMIT || '100'),
          enterprise: parseInt(process.env.ENTERPRISE_PLAN_LIMIT || '1000')
        };
        
        const plan = activeSubscription?.plan || 'free';
        const limit = planLimits[plan as keyof typeof planLimits] || planLimits.free;
        
        if (currentComponentCount >= limit) {
          throw new Error(`Plan quota exceeded. ${plan} plan allows ${limit} components. Current: ${currentComponentCount}`);
        }
      }
    }
  }
  
  return next(params);
});

// Usage tracking middleware
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  // Track component operations
  if (params.model === 'Component' && ['create', 'update', 'delete'].includes(params.action)) {
    const userId = params.action === 'delete' 
      ? params.args.where.userId 
      : params.args.data?.userId || result?.userId;
      
    if (userId) {
      // Log the operation (fire and forget)
      prisma.usageLog.create({
        data: {
          id: require('uuid').v4(),
          userId,
          tokensIn: 0,
          tokensOut: 0,
          route: `component_${params.action}`
        }
      }).catch(err => {
        console.warn('Failed to log component operation:', err.message);
      });
    }
  }
  
  return result;
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
