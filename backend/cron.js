const cron = require('node-cron');
const { createLogger } = require('./src/utils/logger');

const logger = createLogger('cron-jobs');

// Import job handlers (to be implemented)
// const aiKeeperJobs = require('./src/jobs/ai-keeper-weekly.job');
// const analyticsJobs = require('./src/jobs/analytics-daily.job');
// const usageJobs = require('./src/jobs/usage-alerts.job');

/**
 * Start all cron jobs
 */
function start() {
  logger.info('Starting cron jobs...');

  // Daily analytics processing (runs at 2 AM every day)
  cron.schedule('0 2 * * *', () => {
    logger.info('Running daily analytics job');
    // TODO: Implement analytics processing
    // analyticsJobs.processDailyAnalytics();
  });

  // Weekly AI Keeper insights (runs at 3 AM every Sunday)
  cron.schedule('0 3 * * 0', () => {
    logger.info('Running weekly AI Keeper job');
    // TODO: Implement AI Keeper weekly analysis
    // aiKeeperJobs.generateWeeklyInsights();
  });

  // Usage alerts check (runs every hour)
  cron.schedule('0 * * * *', () => {
    logger.info('Running usage alerts check');
    // TODO: Implement usage alerts
    // usageJobs.checkUsageAlerts();
  });

  // Cleanup old logs (runs at 1 AM every day)
  cron.schedule('0 1 * * *', () => {
    logger.info('Running log cleanup job');
    // TODO: Implement log cleanup
  });

  // Update sitemap (runs at 4 AM every day)
  cron.schedule('0 4 * * *', () => {
    logger.info('Running sitemap update job');
    // TODO: Implement sitemap generation
  });

  logger.info('All cron jobs started successfully');
}

/**
 * Stop all cron jobs
 */
function stop() {
  logger.info('Stopping all cron jobs...');
  cron.getTasks().forEach(task => task.destroy());
  logger.info('All cron jobs stopped');
}

module.exports = {
  start,
  stop
};