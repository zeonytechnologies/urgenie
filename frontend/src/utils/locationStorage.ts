import { supabase } from '../lib/supabase';

export const DEFAULT_HOSUR_LOCATIONS = [
  'Hosur Town Center',
  'SIPCOT Phase 1',
  'SIPCOT Phase 2',
  'Mathigiri',
  'Bagalur Road',
  'Denkanikottai Road',
  'Rayakottai Road',
  'Thally Road',
  'Avalapalli Road',
  'Alasanatham Road',
  'Mookandapalli',
  'Nallur',
  'Mornapalli',
  'Zuzuvadi',
  'Attibele Border',
  'Kamraj Nagar',
  'Shanthi Nagar',
  'Railway Station Road',
  'Sevaganapalli',
  'Kelamangalam Road'
];

const CUSTOM_LOCATIONS_STORAGE_KEY = 'urgenie_custom_locations';

export function getCustomLocations(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_LOCATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getStoredLocations(): string[] {
  const custom = getCustomLocations();
  const all = [...DEFAULT_HOSUR_LOCATIONS, ...custom];
  const map = new Map<string, string>();
  all.forEach((loc) => {
    const trimmed = loc.trim();
    if (trimmed) {
      const key = trimmed.toLowerCase();
      if (!map.has(key)) {
        map.set(key, trimmed);
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
}

export async function fetchLiveLocations(): Promise<string[]> {
  const stored = getStoredLocations();
  try {
    const { data, error } = await (supabase.from('locations') as any)
      .select('name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const dbNames = data.map((d: any) => d.name).filter(Boolean);
      const combined = [...stored, ...dbNames];
      const map = new Map<string, string>();
      combined.forEach((loc) => {
        const trimmed = loc.trim();
        if (trimmed) {
          const key = trimmed.toLowerCase();
          if (!map.has(key)) {
            map.set(key, trimmed);
          }
        }
      });
      return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
    }
  } catch (err) {
    console.warn('Using stored locations fallback');
  }
  return stored;
}

export async function addCustomLocation(name: string): Promise<string> {
  const trimmed = name.trim();
  if (!trimmed) return '';

  // 1. Add to local storage
  const existing = getCustomLocations();
  const lower = trimmed.toLowerCase();
  if (!existing.some((l) => l.toLowerCase() === lower)) {
    const next = [...existing, trimmed];
    localStorage.setItem(CUSTOM_LOCATIONS_STORAGE_KEY, JSON.stringify(next));
  }

  // 2. Insert into Supabase locations table in background
  try {
    await (supabase.from('locations') as any).insert({
      name: trimmed,
      city: 'Hosur',
      state: 'Tamil Nadu',
      is_active: true,
    });
  } catch (err) {
    console.warn('Supabase location insert notice:', err);
  }

  // 3. Dispatch global event so all active views update their location lists
  try {
    window.dispatchEvent(new CustomEvent('urgenie-locations-updated', { detail: { location: trimmed } }));
  } catch {}

  return trimmed;
}

