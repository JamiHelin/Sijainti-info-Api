const express = require('express');
const app = express();
const PORT = 3000;

// Testireitti
app.get('/', (req, res) => {
  res.send('Serveri toimii');
});

// Vaihe 3: Nominatim
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

// Vaihe 4: Open-Meteo
async function getWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Open-Meteo error: ${resp.status}`);
  const data = await resp.json();
  const current = data.current || {};
  const temperature = current.temperature_2m;
  const weather_code = current.weather_code;

  if (typeof temperature !== 'number') {
    throw new Error('Lämpötilaa ei saatu Open-Meteosta');
  }
  return { temperature, weather_code };
}

// Reitti /location-info
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
    const { temperature, weather_code } = await getWeather(lat, lon);

    // Palautetaan toistaiseksi nämä
    res.json({
        city,
        country,
        temperature,      // °C
        weather_code,     // Open-Meteon koodi
        coordinates: { lat: Number(lat), lon: Number(lon) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Virhe haettaessa paikannimeä tai säätietoja' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveri kuuntelee osoitteessa http://localhost:${PORT}`);
});