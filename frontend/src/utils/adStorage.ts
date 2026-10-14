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

export const purgeDeletedAndStaleLocalAds = (liveRemoteAdIds: Set<string>) => {
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
      // If it's a Supabase UUID ad, but not in live remote ads, it was deleted in Supabase!
      if (isUuid(ad.id) && !liveRemoteAdIds.has(ad.id)) {
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
