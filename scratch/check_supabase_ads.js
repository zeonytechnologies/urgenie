const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = (urlMatch ? urlMatch[1].trim() : '').replace(/\/+$/, '');
const supabaseKey = keyMatch ? keyMatch[1].trim() : '';

async function checkAds() {
  console.log('Querying Supabase REST API:', supabaseUrl);
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/ads?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`HTTP error ${res.status}:`, errText);
      return;
    }

    const data = await res.json();
    console.log(`Total ads in Supabase 'ads' table: ${data.length}`);
    data.forEach((ad, idx) => {
      console.log(`[${idx + 1}] ID: ${ad.id} | Title: "${ad.title}" | Status: "${ad.status}" | Category: "${ad.category_id}" | Subcategory: "${ad.subcategory_id}" | Price: ${ad.price}`);
    });
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkAds();
