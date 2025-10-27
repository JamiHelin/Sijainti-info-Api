const express = require('express');
const app = express();
const PORT = 3000;

// Testireitti
app.get('/', (req, res) => {
  res.send('Serveri toimii');
});

// ✅ Tässä uusi reitti /location-info
app.get('/location-info', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  // Tarkista että molemmat parametrit on annettu
  if (!lat || !lon) {
    return res.status(400).json({
      error: "Anna lat ja lon parametrit"
    });
  }

  // Testipalautus
  res.json({
    message: "Koordinaatit vastaanotettu!",
    coordinates: { lat, lon }
  });
});

app.listen(PORT, () => {
  console.log(`Serveri kuuntelee osoitteessa http://localhost:${PORT}`);
});