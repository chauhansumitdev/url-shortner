const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/urlshortner', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
});

const Url = mongoose.model('Url', urlSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/shorten', async (req, res) => {
  const originalUrl = req.body.url;
  const shortUrl = generateShortUrl();
  
  try {
      const url = new Url({ originalUrl, shortUrl });
      await url.save();
      console.log(`URL stored in the database: ${originalUrl} -> ${shortUrl}`);
      res.send(`Shortened URL: http://localhost:${PORT}/${shortUrl}`);
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});


app.get('/:shortUrl', async (req, res) => {
  const shortUrl = req.params.shortUrl;
  
  try {
      const url = await Url.findOne({ shortUrl });
      if (url) {
          console.log(`Redirecting to: ${url.originalUrl}`);
          res.redirect(url.originalUrl);
      } else {
          console.log(`URL not found for short URL: ${shortUrl}`);
          res.status(404).send('URL not found');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});

function generateShortUrl() {
    return shortid.generate();
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
