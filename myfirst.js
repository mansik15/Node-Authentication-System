const http = require('http');

http.createServer((req, res) => {

  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<a href="/login">Go to Login</a>');
  }

  else if (req.url === '/login' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>Login</h1>
      <form method="GET" action="/home">
        <input placeholder="User" /><br/><br/>
        <button>Login</button>
      </form>
    `);
  }

  else if (req.url === '/home' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Home Page 🎉</h1>');
  }

  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Page Not Found</h1>');
  }

}).listen(8080);
