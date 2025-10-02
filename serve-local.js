// Simple local server to serve HTML files with proper CORS
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  let filePath = '';
  
  if (req.url === '/' || req.url === '/admin') {
    filePath = path.join(__dirname, 'admin-dashboard.html');
  } else if (req.url === '/test') {
    filePath = path.join(__dirname, 'test-live-api-simple.html');
  } else {
    // Serve any requested file
    filePath = path.join(__dirname, req.url.substring(1));
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Frontuna Local Server</h1>
      <p>Available pages:</p>
      <ul>
        <li><a href="/admin">Admin Dashboard</a></li>
        <li><a href="/test">API Test Page</a></li>
      </ul>
    `);
    return;
  }
  
  // Determine content type
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  if (ext === '.js') contentType = 'text/javascript';
  if (ext === '.css') contentType = 'text/css';
  
  // Serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Local server running at http://localhost:${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`🧪 API Test Page: http://localhost:${PORT}/test`);
  console.log('');
  console.log('✅ Now your HTML files will work with CORS!');
});
