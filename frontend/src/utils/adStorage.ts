/**
 * Utility functions for managing local advertisement storage,
 * synchronization, and deletion tombstones.
 */

export const removeAdFromLocalStorage = (id: string, slug?: string) => {
  try {
    // 1. Remove from active local ads
    const stored = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
    const updated = stored.filter((a: any) => {
      if (!a) return false;
      if (a.id === id || a.slug === id) return false;
      if (slug && (a.id === slug || a.slug === slug)) return false;
      return true;
    });
    localStorage.setItem('urgenie_local_ads', JSON.stringify(updated));

    // 2. Record tombstone in urgenie_deleted_ads so it is never resurrected
    const deleted = JSON.parse(localStorage.getItem('urgenie_deleted_ads') || '[]');
    if (id && !deleted.includes(id)) deleted.push(id);
    if (slug && !deleted.includes(slug)) deleted.push(slug);
    localStorage.setItem('urgenie_deleted_ads', JSON.stringify(deleted));
  } catch (err) {
    console.warn('Error removing ad from localStorage:', err);
  }
};

export const getDeletedAdIds = (): Set<string> => {
  try {
    const deleted = JSON.parse(localStorage.getItem('urgenie_deleted_ads') || '[]');
    return new Set(deleted);
  } catch {
    return new Set();
  }
};

export const isAdDeletedLocally = (idOrSlug: string): boolean => {
  try {
    const deleted = JSON.parse(localStorage.getItem('urgenie_deleted_ads') || '[]');
    return deleted.includes(idOrSlug);
  } catch {
    return false;
  }
};

export const purgeDeletedAndStaleLocalAds = (liveRemoteAdIds: Set<string>, remoteFetchSucceeded = false) => {
  try {
    const stored = JSON.parse(localStorage.getItem('urgenie_local_ads') || '[]');
    const deletedIds = getDeletedAdIds();

    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    const validLocalAds = stored.filter((ad: any) => {
      if (!ad || !ad.id) return false;
      // If tombstoned as deleted, drop it
      if (deletedIds.has(ad.id) || (ad.slug && deletedIds.has(ad.slug))) {
        return false;
      }
      // ONLY purge UUID ads if remote fetch was actually successful and returned ads!
      // Never purge during network offline or Supabase connection failures
      if (remoteFetchSucceeded && liveRemoteAdIds.size > 0 && isUuid(ad.id) && !liveRemoteAdIds.has(ad.id)) {
        return false;
      }
      return true;
    });

    localStorage.setItem('urgenie_local_ads', JSON.stringify(validLocalAds));
    return validLocalAds;
  } catch {
    return [];
  }
};

export const DEFAULT_SEED_ADS: any[] = [];

export function sanitizeAdFields(ad: any) {
  if (!ad) return ad;
  const clean = { ...ad };
  const cat = (clean.category_id || clean.category || '').toLowerCase();

  if (cat === 'jobs') {
    delete clean.brand;
    delete clean.model;
    delete clean.year;
    delete clean.fuel_type;
    delete clean.km_driven;
    delete clean.transmission;
    delete clean.owners_count;
    delete clean.bhk;
    delete clean.area_sqft;
    delete clean.furnishing;
    delete clean.deposit_amount;
  } else if (cat === 'vehicles') {
    delete clean.bhk;
    delete clean.area_sqft;
    delete clean.furnishing;
    delete clean.deposit_amount;
    delete clean.job_type;
  } else if (cat === 'property' || cat === 'commercial') {
    delete clean.brand;
    delete clean.model;
    delete clean.year;
    delete clean.fuel_type;
    delete clean.km_driven;
    delete clean.transmission;
    delete clean.owners_count;
    delete clean.job_type;
  } else if (['mobiles', 'electronics', 'furniture', 'services', 'community', 'business'].includes(cat)) {
    delete clean.km_driven;
    delete clean.fuel_type;
    delete clean.transmission;
    delete clean.owners_count;
    delete clean.bhk;
    delete clean.area_sqft;
    delete clean.furnishing;
    delete clean.deposit_amount;
    delete clean.job_type;
  }
  return clean;
}

export const getLocalAds = (): any[] => {
  try {
    const raw = localStorage.getItem('urgenie_local_ads');
    let stored = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(stored)) {
      stored = [];
    }

    // Filter out any legacy seed ads that might have been saved in localStorage
    stored = stored.filter((ad: any) => ad && ad.id && !String(ad.id).startsWith('seed-'));
    localStorage.setItem('urgenie_local_ads', JSON.stringify(stored));

    const deletedIds = getDeletedAdIds();
    const sanitized = stored.map(sanitizeAdFields);
    return sanitized.filter((ad: any) => ad && ad.id && !deletedIds.has(ad.id) && (!ad.slug || !deletedIds.has(ad.slug)));
  } catch {
    return [];
  }
};

export const saveLocalAd = (ad: any) => {
  try {
    const cleanAd = sanitizeAdFields(ad);
    const stored = getLocalAds();
    const filtered = stored.filter((a: any) => a.id !== cleanAd.id && a.slug !== cleanAd.slug);
    localStorage.setItem('urgenie_local_ads', JSON.stringify([cleanAd, ...filtered]));
  } catch (err) {
    console.warn('Error saving local ad:', err);
  }
};

/**
 * Increment views count for an advertisement and return the updated count.
 */
export const incrementAdViews = (idOrSlug: string): number => {
  try {
    const raw = localStorage.getItem('urgenie_local_ads');
    if (!raw) return 1;
    const ads = JSON.parse(raw);
    let updatedViews = 1;
    const updated = ads.map((ad: any) => {
      if (ad.id === idOrSlug || ad.slug === idOrSlug) {
        const nextViews = (ad.views_count || 0) + 1;
        updatedViews = nextViews;
        return { ...ad, views_count: nextViews };
      }
      return ad;
    });
    localStorage.setItem('urgenie_local_ads', JSON.stringify(updated));
    return updatedViews;
  } catch {
    return 1;
  }
};

/**
 * Update advertisement status (e.g., active -> sold) in local storage.
 */
export const updateAdStatusInLocalStorage = (idOrSlug: string, status: 'active' | 'sold' | 'pending' | 'deleted') => {
  try {
    const raw = localStorage.getItem('urgenie_local_ads');
    if (!raw) return;
    const ads = JSON.parse(raw);
    const updated = ads.map((ad: any) => {
      if (ad.id === idOrSlug || ad.slug === idOrSlug) {
        return { ...ad, status };
      }
      return ad;
    });
    localStorage.setItem('urgenie_local_ads', JSON.stringify(updated));
  } catch (err) {
    console.warn('Error updating ad status:', err);
  }
};


