const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const server = spawn('node', ['.output/server/index.mjs'], { stdio: 'inherit' });

setTimeout(() => {
  http.get('http://localhost:3000/samples/websites/slick-cuts-style/', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      fs.writeFileSync(path.join(process.cwd(), '.output', 'public', 'index.html'), data);
      server.kill();
      process.exit(0);
    });
  }).on('error', (err) => {
    server.kill();
    process.exit(1);
  });
}, 3000);
