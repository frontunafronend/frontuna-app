import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client } from 'pg';

/**
 * Database Connection Check API Endpoint
 * Tests Neon PostgreSQL connection and returns status
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Set connection timeout to 5 seconds
    const connectionTimeout = setTimeout(() => {
      client.end();
      throw new Error('Database connection timeout (5s)');
    }, 5000);

    // Connect to database
    await client.connect();
    clearTimeout(connectionTimeout);

    // Test query - get database version and current time
    const result = await client.query(`
      SELECT 
        version() as db_version,
        current_timestamp as server_time,
        current_database() as database_name
    `);

    const dbInfo = result.rows[0];

    // Test a simple count query (adjust table name as needed)
    let tableCount = null;
    try {
      const countResult = await client.query(`
        SELECT COUNT(*) as total 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      tableCount = parseInt(countResult.rows[0].total);
    } catch (tableError) {
      console.warn('Could not count tables:', tableError.message);
    }

    await client.end();

    const response = {
      ok: true,
      status: 'connected',
      timestamp: new Date().toISOString(),
      database: {
        name: dbInfo.database_name,
        version: dbInfo.db_version.split(' ')[0] + ' ' + dbInfo.db_version.split(' ')[1],
        server_time: dbInfo.server_time,
        tables_count: tableCount,
        connection_string: process.env.NEON_DATABASE_URL ? 'configured' : 'missing'
      },
      performance: {
        connection_time: '< 5s',
        ssl_enabled: true
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Database check failed:', error);

    // Ensure client is closed
    try {
      await client.end();
    } catch (closeError) {
      console.error('Error closing client:', closeError);
    }

    const errorResponse = {
      ok: false,
      status: 'connection_failed',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        type: error.name || 'DatabaseError',
        code: error.code || 'UNKNOWN'
      },
      database: {
        connection_string: process.env.NEON_DATABASE_URL ? 'configured' : 'missing',
        ssl_enabled: true
      },
      troubleshooting: {
        check_env_vars: 'Ensure NEON_DATABASE_URL is set correctly',
        check_network: 'Verify network connectivity to Neon',
        check_ssl: 'Neon requires SSL connections',
        check_permissions: 'Verify database user has required permissions'
      }
    };

    // Return appropriate status code based on error type
    const statusCode = error.message.includes('timeout') ? 408 : 
                      error.message.includes('authentication') ? 401 :
                      error.message.includes('permission') ? 403 :
                      error.code === 'ENOTFOUND' ? 502 : 500;

    res.status(statusCode).json(errorResponse);
  }
}
