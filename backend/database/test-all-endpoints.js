const http = require('http');

const endpoints = [
  '/api/reports?range=today',
  '/api/products',
  '/api/insights',
  '/api/offers'
];

let index = 0;

function testNext() {
  if (index >= endpoints.length) {
    console.log('✅ ALL ENDPOINTS RESPONDED WITH 200 OK');
    process.exit(0);
    return;
  }

  const endpoint = endpoints[index];
  console.log(`Querying http://localhost:5000${endpoint} ...`);

  http.get(`http://localhost:5000${endpoint}`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[${endpoint}] STATUS:`, res.statusCode);
      if (res.statusCode !== 200) {
        console.error(`❌ FAILED: ${endpoint} returned status ${res.statusCode}`);
        console.error('BODY:', data);
        process.exit(1);
      }
      try {
        const json = JSON.parse(data);
        console.log(`[${endpoint}] Parsed successfully. Type:`, Array.isArray(json) ? 'Array' : 'Object');
      } catch (err) {
        console.error(`❌ JSON parse error for ${endpoint}:`, err.message);
        console.error('BODY:', data);
        process.exit(1);
      }
      index++;
      testNext();
    });
  }).on('error', (err) => {
    console.error(`❌ CONNECTION ERROR for ${endpoint}:`, err.message);
    process.exit(1);
  });
}

testNext();
