const express = require('express');
const app = express();
const PORT = 3000;

// Testireitti
app.get('/', (req, res) => {
  res.send('Serveri toimii');
});

// Apufunktio: hae kaupunki ja maa Nominatimista
async function getCityAndCountry(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'sijainti-info-demo/1.0'
    }
  });
  if (!resp.ok) {
    throw new Error(`Nominatim error: ${resp.status}`);
  }
  const data = await resp.json();
  const a = data.address || {};
  const city =
    a.city || a.town || a.village || a.hamlet || a.municipality || a.county || null;
  const country = a.country || null;

  if (!city && !country) {
    throw new Error('Paikannimeä ei löytynyt');
  }
  return { city, country };
}

// Reitti /location-info – vaihe 3: lisää Nominatim-haku
app.get('/location-info', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  if (!lat || !lon) {
    return res.status(400).json({
      error: 'Anna lat ja lon parametrit'
    });
  }

  try {
    const { city, country } = await getCityAndCountry(lat, lon);

    // Palautetaan toistaiseksi nämä + koordinaatit
    res.json({
      city,
      country,
      coordinates: { lat: Number(lat), lon: Number(lon) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Virhe haettaessa paikannimeä Nominatimista' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveri kuuntelee osoitteessa http://localhost:${PORT}`);
});