const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const supaUrl = urlMatch[1].trim();
const supaKey = keyMatch[1].trim();

async function testBulletproofInsert() {
  const testUserId = 'd12fc73e-2b3c-4371-b22c-ce3181ec864a'; // known profile

  const adPayload = {
    user_id: testUserId,
    category_id: 'vehicles',
    subcategory_id: null,
    title: 'Bulletproof Tractor Test',
    slug: 'bulletproof-tractor-test-' + Date.now(),
    description: 'Good condition tractor\n\n📌 Listing Type: Rent / Lease\n• Rent Term: Per Day',
    price: 50000,
    price_text: '₹50,000 / Day',
    is_negotiable: true,
    condition: 'good',
    location_name: 'Hosur Town Center',
    location_text: 'Hosur Town Center',
    contact_name: 'ZEONY TECHNOLOGIES',
    contact_phone: '6382654365',
    allow_whatsapp: true,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600'],
    status: 'active',
    views_count: 0,
    is_featured: false
  };

  const res = await fetch(supaUrl + '/rest/v1/ads', {
    method: 'POST',
    headers: {
      'apikey': supaKey,
      'Authorization': 'Bearer ' + supaKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(adPayload)
  });

  const json = await res.json();
  console.log('Insert Status:', res.status, 'Response:', json);

  if (res.status === 201 && json && json[0]) {
    console.log('Successfully created ad in Supabase with ID:', json[0].id);
    // Delete test ad
    await fetch(supaUrl + '/rest/v1/ads?id=eq.' + json[0].id, {
      method: 'DELETE',
      headers: { 'apikey': supaKey, 'Authorization': 'Bearer ' + supaKey }
    });
    console.log('Cleaned up test ad');
  }
}

testBulletproofInsert();
