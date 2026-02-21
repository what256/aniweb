const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const animeRoutes = require('./routes/anime');
const { getConfig, updateConfig } = require('./configStore');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main anime routes
app.use('/api/anime', animeRoutes);

// Settings routes
app.get('/api/settings', (req, res) => {
  res.json(getConfig());
});

app.post('/api/settings', (req, res) => {
  try {
    const updated = updateConfig(req.body);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Aniweb Scraper API is running.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
