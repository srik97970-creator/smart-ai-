require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Bind API routes
app.use('/api', apiRouter);

// Serve static assets in production if frontend is built
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  // If request starts with /api, let it fall through or return 404 API error
  if (req.url.startsWith('/api')) {
    return next();
  }
  
  // Otherwise serve React frontend router index.html
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('SmartShop AI API is online. Frontend is not built yet.');
    }
  });
});

// Generic Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`SmartShop AI Backend running on port ${PORT}`);
  console.log(`Press Ctrl+C to terminate server.`);
});
