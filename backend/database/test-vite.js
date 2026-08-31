const http = require('http');

console.log('Sending test request to Vite at http://localhost:3000/ ...');

http.get('http://localhost:3000/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', JSON.stringify(res.headers));
    console.log('HTML HEADERS LENGTH:', data.length);
    console.log('HTML PREVIEW:', data.substring(0, 300));
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('ERROR CONNECTING TO VITE DEV PORT 3000:', err.message);
  process.exit(1);
});
