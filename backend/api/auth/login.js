// Simple login endpoint
module.exports = async (req, res) => {
  // Set CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://frontuna.com',
    'https://www.frontuna.com', 
    'https://frontuna-frontend-app.vercel.app',
    'http://localhost:4200',
    'http://localhost:4201',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080'
  ];
  
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Parse body
  let body = {};
  if (req.body) {
    body = req.body;
  } else {
    // Manual body parsing for Vercel
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    await new Promise(resolve => req.on('end', resolve));
    const rawBody = Buffer.concat(chunks).toString();
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
  }
  
  console.log('Login attempt:', { email: body.email });
  
  // Mock login validation
  if (body.email === 'admin@frontuna.com' && body.password === 'admin123') {
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    // Set httpOnly cookie for refresh token
    res.setHeader('Set-Cookie', [
      `refreshToken=mock-refresh-${Date.now()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`,
      `accessToken=${mockToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`
    ]);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        email: 'admin@frontuna.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      },
      token: mockToken
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
};