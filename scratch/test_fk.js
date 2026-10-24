const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supaUrl = urlMatch[1].trim();
const supaKey = keyMatch[1].trim();

async function run() {
  const randomUserId = '11111111-2222-3333-4444-555555555555'; // definitely not in auth.users
  const testAd = {
    user_id: randomUserId,
    category_id: 'mobiles',
    title: 'FK Test Ad',
    slug: 'fk-test-' + Date.now(),
    description: 'Testing FK constraint',
    price: 1000,
    status: 'active'
  };

  const res = await fetch(supaUrl + '/rest/v1/ads', {
    method: 'POST',
    headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(testAd)
  });
  console.log('Status:', res.status, res.statusText);
  const json = await res.json();
  console.log('Result:', JSON.stringify(json, null, 2));
}
run();
