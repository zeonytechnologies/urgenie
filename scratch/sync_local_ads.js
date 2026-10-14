const fs = require('fs');
const path = require('path');

// 1. Update Home.tsx
const homePath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'Home.tsx');
let homeContent = fs.readFileSync(homePath, 'utf8');

const homeTarget = `        // 1. Fetch real ads from Supabase
        const { data: adsData } = await (supabase.from('ads') as any)
          .select('id, title, price, location_name, location_text, category_id, images, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(8);

        if (adsData && adsData.length > 0) {
          const mappedAds: AdItem[] = adsData.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: \`₹\${Number(item.price).toLocaleString()}\`,
            location: item.location_name || item.location_text || 'Hosur',
            image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
            category: item.category_id || 'General',
            postedAt: new Date(item.created_at).toLocaleDateString(),
          }));
          setLatestAds(mappedAds);
        }`;

const homeReplacement = `        // 1. Fetch real ads from Supabase & local storage
        let remoteAds = [];
        try {
          const { data: adsData } = await (supabase.from('ads') as any)
            .select('id, title, price, location_name, location_text, category_id, listing_type, images, created_at')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(12);
          if (adsData) remoteAds = adsData;
        } catch (e) {}

        let localAds = [];
        try {
          localAds = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
        } catch (e) {}

        const mergedMap = new Map();
        localAds.forEach((ad) => {
          if (ad && (ad.id || ad.slug)) mergedMap.set(ad.id || ad.slug, ad);
        });
        remoteAds.forEach((ad) => {
          if (ad && (ad.id || ad.slug)) mergedMap.set(ad.id || ad.slug, ad);
        });

        const combinedList = Array.from(mergedMap.values());
        if (combinedList.length > 0) {
          const mappedAds: AdItem[] = combinedList.slice(0, 8).map((item: any) => ({
            id: item.id || item.slug,
            title: item.title,
            price: item.listing_type === 'free' ? 'FREE' : \`₹\${Number(item.price || 0).toLocaleString()}\`,
            location: item.location_name || item.location_text || 'Hosur',
            image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
            category: item.category_id || 'General',
            postedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
          }));
          setLatestAds(mappedAds);
        }`;

if (homeContent.replace(/\r\n/g, '\n').includes(homeTarget.replace(/\r\n/g, '\n'))) {
  homeContent = homeContent.replace(/\r\n/g, '\n').replace(homeTarget.replace(/\r\n/g, '\n'), homeReplacement);
  fs.writeFileSync(homePath, homeContent, 'utf8');
  console.log('Home.tsx updated successfully');
} else {
  console.log('Home target not matched');
}

// 2. Update AdDetails.tsx
const adDetailsPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'AdDetails.tsx');
let adDetailsContent = fs.readFileSync(adDetailsPath, 'utf8');

const adDetailsTarget = `        if (!error && data) {
          setAd({
            id: data.id,
            title: data.title,
            price: data.listing_type === 'free' ? 'FREE' : \`₹\${Number(data.price || 0).toLocaleString()}\`,
            category: data.category_id || 'General',
            subcategory: data.subcategory_id || '',
            listing_type: data.listing_type || 'preowned',
            attributes: data.attributes || {},
            location: data.location_name || data.city || 'Hosur',
            postedAt: new Date(data.created_at).toLocaleDateString(),
            image: data.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
            description: data.description,
            condition: data.condition || 'Used - Good',
            seller: data.contact_name || data.profiles?.full_name || 'Verified Seller',
            phone: data.contact_phone || data.profiles?.phone || '9876543210',
            allow_whatsapp: data.allow_whatsapp !== false,
            user_id: data.user_id,
            views_count: data.views_count || 1,
          });

          // Increment views count in database
          try {
            await (supabase.from('ads') as any)
              .update({ views_count: (data.views_count || 0) + 1 })
              .eq('id', data.id);
          } catch {
            // Ignored
          }
        }`;

const adDetailsReplacement = `        if (!error && data) {
          setAd({
            id: data.id,
            title: data.title,
            price: data.listing_type === 'free' ? 'FREE' : \`₹\${Number(data.price || 0).toLocaleString()}\`,
            category: data.category_id || 'General',
            subcategory: data.subcategory_id || '',
            listing_type: data.listing_type || 'preowned',
            attributes: data.attributes || {},
            location: data.location_name || data.city || 'Hosur',
            postedAt: new Date(data.created_at).toLocaleDateString(),
            image: data.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
            description: data.description,
            condition: data.condition || 'Used - Good',
            seller: data.contact_name || data.profiles?.full_name || 'Verified Seller',
            phone: data.contact_phone || data.profiles?.phone || '9876543210',
            allow_whatsapp: data.allow_whatsapp !== false,
            user_id: data.user_id,
            views_count: data.views_count || 1,
          });

          // Increment views count in database
          try {
            await (supabase.from('ads') as any)
              .update({ views_count: (data.views_count || 0) + 1 })
              .eq('id', data.id);
          } catch {
            // Ignored
          }
        } else {
          // Check local storage for recently posted ad
          try {
            const localAds = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
            const found = localAds.find((a) => a.id === slug || a.slug === slug);
            if (found) {
              setAd({
                id: found.id,
                title: found.title,
                price: found.listing_type === 'free' ? 'FREE' : \`₹\${Number(found.price || 0).toLocaleString()}\`,
                category: found.category_id || 'General',
                subcategory: found.subcategory_id || '',
                listing_type: found.listing_type || 'preowned',
                attributes: found.attributes || {},
                location: found.location_name || found.city || 'Hosur',
                postedAt: found.created_at ? new Date(found.created_at).toLocaleDateString() : 'Recently',
                image: found.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
                description: found.description,
                condition: found.condition || 'Used - Good',
                seller: found.contact_name || 'Verified Seller',
                phone: found.contact_phone || '9876543210',
                allow_whatsapp: found.allow_whatsapp !== false,
                user_id: found.user_id,
                views_count: 1,
              });
            }
          } catch (e) {}
        }`;

if (adDetailsContent.replace(/\r\n/g, '\n').includes(adDetailsTarget.replace(/\r\n/g, '\n'))) {
  adDetailsContent = adDetailsContent.replace(/\r\n/g, '\n').replace(adDetailsTarget.replace(/\r\n/g, '\n'), adDetailsReplacement);
  fs.writeFileSync(adDetailsPath, adDetailsContent, 'utf8');
  console.log('AdDetails.tsx updated successfully');
} else {
  console.log('AdDetails target not matched');
}

// 3. Update MyAds.tsx
const myAdsPath = path.join(__dirname, '..', 'frontend', 'src', 'pages', 'MyAds.tsx');
let myAdsContent = fs.readFileSync(myAdsPath, 'utf8');

const myAdsTarget = `      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
        setAds([]);
      } else if (data) {
        setAds(data.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: \`₹\${Number(item.price || 0).toLocaleString()}\`,
          image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
          status: item.status || 'active',
          created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
          views_count: item.views_count || 0,
        })));
      } else {
        setAds([]);
      }`;

const myAdsReplacement = `      let remoteAds = [];
      try {
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) remoteAds = data;
      } catch (e) {}

      // Fetch user's local ads from localStorage
      let localAds = [];
      try {
        const stored = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
        localAds = stored.filter((a) => a.user_id === user.id || a.contact_phone === profile?.phone);
      } catch (e) {}

      const mergedMap = new Map();
      localAds.forEach((item) => {
        if (item && (item.id || item.slug)) mergedMap.set(item.id || item.slug, item);
      });
      remoteAds.forEach((item) => {
        if (item && (item.id || item.slug)) mergedMap.set(item.id || item.slug, item);
      });

      const combinedList = Array.from(mergedMap.values());
      setAds(combinedList.map((item: any) => ({
        id: item.id || item.slug,
        title: item.title,
        price: item.listing_type === 'free' ? 'FREE' : \`₹\${Number(item.price || 0).toLocaleString()}\`,
        image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
        status: item.status || 'active',
        created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
        views_count: item.views_count || 0,
      })));`;

if (myAdsContent.replace(/\r\n/g, '\n').includes(myAdsTarget.replace(/\r\n/g, '\n'))) {
  myAdsContent = myAdsContent.replace(/\r\n/g, '\n').replace(myAdsTarget.replace(/\r\n/g, '\n'), myAdsReplacement);
  fs.writeFileSync(myAdsPath, myAdsContent, 'utf8');
  console.log('MyAds.tsx updated successfully');
} else {
  console.log('MyAds target not matched');
}
