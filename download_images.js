const fs = require('fs');
const path = require('path');
const https = require('https');

const STADIUM_MAP = {
  "Angel Stadium": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Angel_Stadium_of_Anaheim_exterior_2013.jpg/640px-Angel_Stadium_of_Anaheim_exterior_2013.jpg",
  "Chase Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Chase_Field_-_2022.jpg/640px-Chase_Field_-_2022.jpg",
  "Truist Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Truist_Park_under_lights.jpg/640px-Truist_Park_under_lights.jpg",
  "Oriole Park at Camden Yards": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Camden_Yards_Orioles_vs_Royals_2023.jpg/640px-Camden_Yards_Orioles_vs_Royals_2023.jpg",
  "Fenway Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/2013_World_Series_Fenway_Park.jpg/640px-2013_World_Series_Fenway_Park.jpg",
  "Wrigley Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Wrigley_Field_exterior_September_2022.jpg/640px-Wrigley_Field_exterior_September_2022.jpg",
  "Great American Ball Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Great_American_Ball_Park_%2848529241926%29.jpg/640px-Great_American_Ball_Park_%2848529241926%29.jpg",
  "Progressive Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Progressive_Field_Cleveland_2021.jpg/640px-Progressive_Field_Cleveland_2021.jpg",
  "Coors Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Coors_Field_first_pitch.jpg/640px-Coors_Field_first_pitch.jpg",
  "Comerica Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Comerica_Park_Detroit_Tigers.jpg/640px-Comerica_Park_Detroit_Tigers.jpg",
  "Minute Maid Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Minute_Maid_Park_2022.jpg/640px-Minute_Maid_Park_2022.jpg",
  "Kauffman Stadium": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Kauffman_Stadium_August_2021.jpg/640px-Kauffman_Stadium_August_2021.jpg",
  "Dodger Stadium": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Dodger_Stadium_aerial_view%2C_2015.jpg/640px-Dodger_Stadium_aerial_view%2C_2015.jpg",
  "loanDepot park": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/LoanDepot_Park_2021.jpg/640px-LoanDepot_Park_2021.jpg",
  "American Family Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Miller_Park_roof_open_2019.jpg/640px-Miller_Park_roof_open_2019.jpg",
  "Target Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Target_Field_Minnesota_Twins.jpg/640px-Target_Field_Minnesota_Twins.jpg",
  "Yankee Stadium": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/New_Yankee_Stadium_under_lights.jpg/640px-New_Yankee_Stadium_under_lights.jpg",
  "Citi Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Citi_Field_2021.jpg/640px-Citi_Field_2021.jpg",
  "Citizens Bank Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Citizens_Bank_Park_Philadelphia.jpg/640px-Citizens_Bank_Park_Philadelphia.jpg",
  "PNC Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/PNC_Park_Pittsburgh.jpg/640px-PNC_Park_Pittsburgh.jpg",
  "Petco Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Petco_Park_San_Diego.jpg/640px-Petco_Park_San_Diego.jpg",
  "T-Mobile Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/T-Mobile_Park_Seattle.jpg/640px-T-Mobile_Park_Seattle.jpg",
  "Oracle Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Oracle_Park_dusk.jpg/640px-Oracle_Park_dusk.jpg",
  "Busch Stadium": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Busch_Stadium_St_Louis.jpg/640px-Busch_Stadium_St_Louis.jpg",
  "Oakland Coliseum": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Oakland_Coliseum_2021.jpg/640px-Oakland_Coliseum_2021.jpg",
  "Tropicana Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Tropicana_Field_St_Petersburg.jpg/640px-Tropicana_Field_St_Petersburg.jpg",
  "Globe Life Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Globe_Life_Field_2021.jpg/640px-Globe_Life_Field_2021.jpg",
  "Rogers Centre": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Rogers_Centre_Toronto.jpg/640px-Rogers_Centre_Toronto.jpg",
  "Nationals Park": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Nationals_Park_Washington.jpg/640px-Nationals_Park_Washington.jpg",
  "Guaranteed Rate Field": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Guaranteed_Rate_Field_Chicago.jpg/640px-Guaranteed_Rate_Field_Chicago.jpg"
};

const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg';
}

function downloadImage(name, url) {
  return new Promise((resolve, reject) => {
    const filename = sanitizeName(name);
    const dest = path.join(imagesDir, filename);

    if (fs.existsSync(dest)) {
      console.log(`Already downloaded: ${filename}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      }
    };

    https.get(url, options, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${name}: HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const entries = Object.entries(STADIUM_MAP);
  console.log(`Starting download of ${entries.length} stadium images...`);
  for (const [name, url] of entries) {
    try {
      await downloadImage(name, url);
    } catch (err) {
      console.error(`Error downloading ${name}:`, err.message);
    }
  }
  console.log('All downloads completed!');
}

run();
