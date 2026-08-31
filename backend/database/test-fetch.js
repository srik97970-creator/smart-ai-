const http = require('http');

console.log('Sending request to http://localhost:5000/api/reports?range=today ...');

http.get('http://localhost:5000/api/reports?range=today', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', JSON.stringify(res.headers));
    console.log('BODY:', data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('ERROR CONNECTING TO SERVER:', err.message);
  process.exit(1);
});
