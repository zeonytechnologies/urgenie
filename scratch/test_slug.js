const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supaUrl = urlMatch[1].trim();
const supaKey = keyMatch[1].trim();

async function run() {
  const testAd = {
    user_id: 'd12fc73e-2b3c-4371-b22c-ce3181ec864a',
    category_id: 'vehicles',
    title: 'Tractor',
    slug: 'tractor',
    description: 'Duplicate slug test',
    price: 50000,
    status: 'active'
  };

  const res = await fetch(supaUrl + '/rest/v1/ads', {
    method: 'POST',
    headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(testAd)
  });
  console.log('Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Body:', text);
}
run();
