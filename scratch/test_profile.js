const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supaUrl = urlMatch[1].trim();
const supaKey = keyMatch[1].trim();

async function run() {
  const newProfile = {
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Test Profile Insert',
    email: 'test_insert_' + Date.now() + '@example.com',
    phone: '9999999999',
    role: 'user'
  };

  const res = await fetch(supaUrl + '/rest/v1/profiles', {
    method: 'POST',
    headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(newProfile)
  });
  console.log('Status:', res.status, res.statusText);
  const json = await res.json();
  console.log('Result:', JSON.stringify(json, null, 2));

  if (res.status === 201) {
    // Delete it
    await fetch(supaUrl + '/rest/v1/profiles?id=eq.a0000000-0000-0000-0000-000000000001', {
      method: 'DELETE',
      headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey }
    });
    console.log('Cleaned up test profile');
  }
}
run();
