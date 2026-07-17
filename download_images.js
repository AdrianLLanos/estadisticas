const fs = require('fs');
const path = require('path');

const STADIUM_TITLES = {
  "Angel Stadium": "File:Angel Stadium of Anaheim exterior 2013.jpg",
  "Chase Field": "File:Chase Field - 2022.jpg",
  "Truist Park": "File:Truist Park under lights.jpg",
  "Oriole Park at Camden Yards": "File:Camden Yards Orioles vs Royals 2023.jpg",
  "Fenway Park": "File:2013 World Series Fenway Park.jpg",
  "Wrigley Field": "File:Wrigley Field exterior September 2022.jpg",
  "Great American Ball Park": "File:Great American Ball Park (48529241926).jpg",
  "Progressive Field": "File:Progressive Field Cleveland 2021.jpg",
  "Coors Field": "File:Coors Field first pitch.jpg",
  "Comerica Park": "File:Comerica Park Detroit Tigers.jpg",
  "Minute Maid Park": "File:Minute Maid Park 2022.jpg",
  "Kauffman Stadium": "File:Kauffman Stadium August 2021.jpg",
  "Dodger Stadium": "File:Dodger Stadium aerial view, 2015.jpg",
  "loanDepot park": "File:LoanDepot Park 2021.jpg",
  "American Family Field": "File:Miller Park roof open 2019.jpg",
  "Target Field": "File:Target Field Minnesota Twins.jpg",
  "Yankee Stadium": "File:New Yankee Stadium under lights.jpg",
  "Citi Field": "File:Citi Field 2021.jpg",
  "Citizens Bank Park": "File:Citizens Bank Park 2021.jpg",
  "PNC Park": "File:PNC Park Pittsburgh.jpg",
  "Petco Park": "File:Petco Park San Diego.jpg",
  "T-Mobile Park": "File:T-Mobile Park Seattle.jpg",
  "Oracle Park": "File:Oracle Park dusk.jpg",
  "Busch Stadium": "File:Busch Stadium St Louis.jpg",
  "Oakland Coliseum": "File:Oakland Coliseum 2021.jpg",
  "Tropicana Field": "File:Tropicana Field St Petersburg.jpg",
  "Globe Life Field": "File:Globe Life Field 2021.jpg",
  "Rogers Centre": "File:Rogers Centre Toronto.jpg",
  "Nationals Park": "File:Nationals Park Washington.jpg",
  "Guaranteed Rate Field": "File:Guaranteed Rate Field Chicago.jpg"
};

const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg';
}

async function getImageUrl(title) {
  // We request a standard width of 1280px. If the original image is smaller, MediaWiki API automatically returns the fallback original URL.
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&iiurlwidth=1280&format=json&titles=${encodeURIComponent(title)}`;
  
  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'estadisticas-mlb/1.0 (llanoszentenoadrianalejandro@gmail.com)'
    }
  });
  
  if (!res.ok) {
    throw new Error(`MediaWiki API error: HTTP ${res.status}`);
  }
  
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];
  const imageInfo = page?.imageinfo?.[0];
  
  // Use thumburl if available (handles standard size 1280px), otherwise fallback to original url
  return imageInfo?.thumburl || imageInfo?.url || null;
}

async function downloadFile(url, dest) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'estadisticas-mlb/1.0 (llanoszentenoadrianalejandro@gmail.com)'
    }
  });
  
  if (!res.ok) {
    throw new Error(`Download error: HTTP ${res.status}`);
  }
  
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(dest, buffer);
}

async function run() {
  const entries = Object.entries(STADIUM_TITLES);
  console.log(`Starting robust download of ${entries.length} stadium images using MediaWiki API...`);
  
  for (const [stadiumName, title] of entries) {
    const filename = sanitizeName(stadiumName);
    const dest = path.join(imagesDir, filename);
    
    try {
      console.log(`Resolving URL for: ${stadiumName}...`);
      const url = await getImageUrl(title);
      
      if (!url) {
        console.error(`Could not resolve URL for: ${stadiumName} (Title: ${title})`);
        continue;
      }
      
      console.log(`Downloading ${stadiumName} from: ${url}`);
      await downloadFile(url, dest);
      
      // Verify size
      const stats = fs.statSync(dest);
      console.log(`Successfully saved: ${filename} (${stats.size} bytes)`);
      
      // Sleep for a short time to respect Wikimedia API rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      console.error(`Error downloading ${stadiumName}:`, err.message);
    }
  }
  
  console.log('All stadium downloads completed!');
}

run();
