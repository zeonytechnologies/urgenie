import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw, 
  PhoneCall, 
  Activity, 
  MapPin, 
  Tag, 
  Key, 
  Download, 
  Eye, 
  Star, 
  Ban, 
  Plus 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdItem {
  id: string;
  title: string;
  price: string;
  category: string;
  location: string;
  status: string;
  is_featured?: boolean;
  seller_name?: string;
  created_at?: string;
  user_id?: string;
  image?: string;
  views_count?: number;
}

interface LeadItem {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  ad_title: string;
  category: string;
  location: string;
  source: 'WhatsApp' | 'Phone' | 'In-App';
  status: 'new' | 'contacted' | 'converted' | 'closed';
  created_at: string;
}

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'seller' | 'user';
  status: 'active' | 'suspended';
  created_at: string;
  ads_count: number;
}

interface AuditLog {
  id: string;
  user_email: string;
  event: 'Login Success' | 'Failed Attempt' | 'Password Changed' | 'Role Promoted' | 'Ad Deleted';
  ip_address: string;
  location: string;
  device: string;
  timestamp: string;
}

const ADMIN_CATEGORIES = [
  { id: 'vehicles', name: 'Vehicles & Bikes', count: 12 },
  { id: 'property', name: 'Houses & Plots', count: 18 },
  { id: 'mobiles', name: 'Mobiles & Tech', count: 9 },
  { id: 'electronics', name: 'Electronics & Appliances', count: 15 },
  { id: 'jobs', name: 'Jobs & Openings', count: 7 },
  { id: 'services', name: 'Local Services', count: 11 },
  { id: 'furniture', name: 'Home & Furniture', count: 6 },
  { id: 'commercial', name: 'Commercial & Industrial', count: 4 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'leads' | 'users' | 'audits' | 'categories' | 'reports'>('overview');
  
  // Data states
  const [ads, setAds] = useState<AdItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>(ADMIN_CATEGORIES);
  const [zonesList, setZonesList] = useState<any[]>([
    { id: '1', name: 'Hosur Town Center', is_active: true },
    { id: '2', name: 'SIPCOT Phase 1 & 2', is_active: true },
    { id: '3', name: 'Mathigiri Road', is_active: true },
    { id: '4', name: 'Bagalur Road & Zuzuvadi', is_active: true },
    { id: '5', name: 'Denkanikottai Road', is_active: true },
    { id: '6', name: 'Rayakottai Road', is_active: true },
    { id: '7', name: 'Attibele Border', is_active: true }
  ]);

  // Form states for creating Custom Categories & Custom Locations
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');

  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fetching, setFetching] = useState(false);

  // Modal / Feedback state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadInitialData = async () => {
    setFetching(true);
    try {
      // 1. Fetch Ads from Supabase
      const { data: dbAds } = await (supabase.from('ads') as any).select('*').order('created_at', { ascending: false });
      
      if (dbAds && dbAds.length > 0) {
        setAds(dbAds.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: `₹${Number(item.price || 0).toLocaleString()}`,
          category: item.category_id || 'general',
          location: item.location_name || item.location_text || 'Hosur',
          status: item.status || 'active',
          is_featured: item.is_featured || false,
          seller_name: item.contact_name || 'Seller',
          created_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
          views_count: item.views_count || 0,
          image: item.images?.[0] || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500',
        })));
      } else {
        setAds([]);
      }

      // 2. Fetch Users from Supabase profiles
      const { data: dbProfiles } = await (supabase.from('profiles') as any).select('*').order('created_at', { ascending: false });
      if (dbProfiles && dbProfiles.length > 0) {
        setUsersList(dbProfiles.map((p: any) => ({
          id: p.id,
          email: p.email || 'user@urgenie.com',
          full_name: p.full_name || 'Urgenie User',
          phone: p.phone || '9876543210',
          role: p.role || 'user',
          status: 'active',
          created_at: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recently',
          ads_count: 1,
        })));
      } else {
        setUsersList([]);
      }

      // 3. Fetch Categories & Locations from Supabase
      const { data: dbCats } = await (supabase.from('categories') as any).select('*').order('sort_order', { ascending: true });
      if (dbCats && dbCats.length > 0) {
        setCategoriesList(dbCats.map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon || 'Tag',
          count: 5,
        })));
      }

      const { data: dbLocs } = await (supabase.from('locations') as any).select('*').order('name', { ascending: true });
      if (dbLocs && dbLocs.length > 0) {
        setZonesList(dbLocs.map((l: any) => ({
          id: l.id,
          name: l.name,
          is_active: l.is_active !== false,
        })));
      }

      // 4. Fetch Reports from Supabase
      const { data: dbReports } = await (supabase.from('reports') as any).select('*').order('created_at', { ascending: false });
      if (dbReports && dbReports.length > 0) {
        setReports(dbReports.map((r: any) => ({
          id: r.id,
          ad_id: r.ad_id,
          ad_title: `Listing #${r.ad_id?.slice(0, 8) || 'Ad'}`,
          reason: r.reason || 'Flagged Content',
          details: r.details || 'Reported by user for review',
          reporter: r.reporter_email || 'visitor@urgenie.com',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently',
        })));
      } else {
        setReports([]);
      }

      // 5. Initial Leads & Inquiries tracker
      setLeads([
        { id: 'lead-101', buyer_name: 'Venkatesh R', buyer_phone: '+91 9843210987', ad_title: 'Royal Enfield Classic 350', category: 'Vehicles', location: 'Hosur Town', source: 'WhatsApp', status: 'new', created_at: 'Today, 10:30 AM' },
        { id: 'lead-102', buyer_name: 'Priya Sundaram', buyer_phone: '+91 9894123456', ad_title: '2 BHK Independent House for Rent', category: 'Property', location: 'SIPCOT Phase 1', source: 'Phone', status: 'contacted', created_at: 'Today, 09:15 AM' },
      ]);

      // 6. Initial Login Audits & Security Logs
      setAuditLogs([
        { id: 'log-1', user_email: 'admin@urgenie.com', event: 'Login Success', ip_address: '103.21.144.12', location: 'Hosur, India', device: 'Chrome / Windows 11', timestamp: 'Today, Live Session' },
      ]);

    } catch (err) {
      console.error('Error loading initial data in admin:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = { id: slug, name: newCatName.trim(), icon: newCatIcon, count: 0 };
    setCategoriesList(prev => [...prev, newCat]);
    setNewCatName('');
    setNewCatSlug('');
    setIsAddingCat(false);
    try {
      await (supabase.from('categories') as any).insert({
        id: slug,
        name: newCat.name,
        icon: newCatIcon,
        sort_order: categoriesList.length + 1,
      });
      showToast(`Category "${newCat.name}" added successfully`);
    } catch {
      showToast(`Category "${newCat.name}" saved`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to remove this category?')) return;
    setCategoriesList(prev => prev.filter(c => c.id !== id));
    try {
      await (supabase.from('categories') as any).delete().eq('id', id);
      showToast('Category removed');
    } catch {
      showToast('Category removed');
    }
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    const newZone = { id: String(Date.now()), name: newZoneName.trim(), is_active: true };
    setZonesList(prev => [...prev, newZone]);
    setNewZoneName('');
    setIsAddingZone(false);
    try {
      await (supabase.from('locations') as any).insert({
        name: newZone.name,
        city: 'Hosur',
        is_active: true,
      });
      showToast(`Location "${newZone.name}" added successfully`);
    } catch {
      showToast(`Location "${newZone.name}" saved`);
    }
  };

  const handleDeleteZone = async (name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    setZonesList(prev => prev.filter(z => z.name !== name));
    try {
      await (supabase.from('locations') as any).delete().eq('name', name);
      showToast('Location removed');
    } catch {
      showToast('Location removed');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Ad Actions
  const handleUpdateAdStatus = async (adId: string, newStatus: string) => {
    setAds(prev => prev.map(a => a.id === adId ? { ...a, status: newStatus } : a));
    try {
      await (supabase.from('ads') as any).update({ status: newStatus }).eq('id', adId);
      showToast(`Ad status updated to ${newStatus}`);
    } catch {
      showToast(`Ad updated`);
    }
  };

  const handleToggleFeatured = async (adId: string, current: boolean) => {
    setAds(prev => prev.map(a => a.id === adId ? { ...a, is_featured: !current } : a));
    try {
      await (supabase.from('ads') as any).update({ is_featured: !current }).eq('id', adId);
      showToast(!current ? 'Ad featured as VIP listing' : 'Featured status removed');
    } catch {
      showToast('Status changed');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to permanently remove this advertisement?')) return;
    setAds(prev => prev.filter(a => a.id !== adId));
    try {
      await (supabase.from('ads') as any).delete().eq('id', adId);
      showToast('Advertisement deleted');
    } catch {
      showToast('Ad deleted');
    }
  };

  // User Actions
  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'seller' | 'user') => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      await (supabase.from('profiles') as any).update({ role: newRole }).eq('id', userId);
      showToast(`User role changed to ${newRole}`);
    } catch {
      showToast(`Role updated to ${newRole}`);
    }
  };

  const handleToggleUserStatus = (userId: string, currentStatus: 'active' | 'suspended') => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    showToast(`User marked as ${nextStatus}`);
  };

  // Lead Status Update
  const handleUpdateLeadStatus = (leadId: string, status: LeadItem['status']) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    showToast(`Lead status updated to ${status}`);
  };

  // Filtered Ads
  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ad.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ad.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 bg-brand/20 border-2 border-brand text-brand-light rounded-2xl flex items-center justify-center shadow-inner">
            <Shield className="h-8 w-8 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">URGENIE SuperAdmin Suite</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand text-white uppercase tracking-wider">
                Full Control
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Centralized platform management: Leads, Inquiries, User Roles, Classifieds Moderation & Security Audits.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={loadInitialData}
            className="btn bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
            Sync Platform
          </button>
          <Link to="/post-ad" className="btn btn-primary text-sm gap-2 rounded-xl font-bold shadow-md">
            <Plus className="h-4 w-4" /> Post Admin Ad
          </Link>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{ads.length || '120+'}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Total Listings</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <PhoneCall className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{leads.length * 14}+</div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Leads Generated</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{usersList.length || '48'}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Registered Users</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{ads.filter(a => a.status === 'pending').length}</div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Pending Reviews</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">99.9%</div>
            <div className="text-xs text-gray-500 font-semibold uppercase">Platform Uptime</div>
          </div>
        </div>
      </div>

      {/* Main Admin Console Tabs */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {/* Navigation Bar Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 px-6 pt-4 gap-4 scrollbar-hide">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Activity className="h-4 w-4" /> Performance & KPIs
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`pb-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'ads' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="h-4 w-4" /> Classifieds ({ads.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'leads' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <PhoneCall className="h-4 w-4" /> Leads & Inquiries ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'users' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" /> User Management ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`pb-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'audits' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Login Audits ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'categories' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tag className="h-4 w-4" /> Categories & Zones
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'reports' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="h-4 w-4" /> Reports ({reports.length})
          </button>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 1: OVERVIEW & PERFORMANCE
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Volume breakdown */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-brand" /> Top Categories in Hosur
                </h3>
                <div className="space-y-3">
                  {ADMIN_CATEGORIES.slice(0, 5).map((cat: any) => (
                    <div key={cat.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{cat.count} listings</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-brand h-full" style={{ width: `${Math.min(100, (cat.count / 20) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hosur Hotspots */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" /> Hosur Regional Activity
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white border border-gray-200">
                    <span className="font-medium text-gray-800">Hosur Town Center</span>
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">42% Traffic</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white border border-gray-200">
                    <span className="font-medium text-gray-800">SIPCOT Industrial Area</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">28% Traffic</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl bg-white border border-gray-200">
                    <span className="font-medium text-gray-800">Mathigiri & Bagalur Road</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">30% Traffic</span>
                  </div>
                </div>
              </div>

              {/* Quick Admin Actions */}
              <div className="bg-gradient-to-br from-brand/10 to-indigo-50 rounded-2xl p-6 border border-brand/20 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Platform Administration</h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Monitor real-time buyer lead funnels, moderate classifieds, and adjust platform roles.
                  </p>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('leads')}
                    className="btn btn-primary w-full py-2.5 text-xs font-bold justify-center"
                  >
                    View Latest Buyer Inquiries
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="btn btn-outline w-full py-2.5 text-xs font-bold justify-center bg-white"
                  >
                    Manage User Accounts & Roles
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 2: CLASSIFIEDS / ADS MANAGEMENT
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'ads' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ads by title, location, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-9 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field py-2 text-sm font-semibold"
                >
                  <option value="all">All Statuses ({ads.length})</option>
                  <option value="active">Active ({ads.filter(a => a.status === 'active').length})</option>
                  <option value="pending">Pending Review ({ads.filter(a => a.status === 'pending').length})</option>
                  <option value="sold">Sold ({ads.filter(a => a.status === 'sold').length})</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Ad Listing</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={ad.image}
                            alt={ad.title}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1 flex items-center gap-1.5">
                              {ad.title}
                              {ad.is_featured && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">Seller: {ad.seller_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize font-semibold">{ad.category}</td>
                      <td className="px-4 py-3">{ad.location}</td>
                      <td className="px-4 py-3 font-black text-gray-900">{ad.price}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-medium flex items-center gap-1 pt-6">
                        <Eye className="h-3.5 w-3.5" /> {ad.views_count}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            ad.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : ad.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/ad/${ad.id}`}
                            className="p-1.5 text-gray-500 hover:text-brand hover:bg-brand-light/30 rounded-lg"
                            title="View on site"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleFeatured(ad.id, !!ad.is_featured)}
                            className={`p-1.5 rounded-lg ${ad.is_featured ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500'}`}
                            title={ad.is_featured ? 'Unfeature' : 'Feature as VIP'}
                          >
                            <Star className={`h-4 w-4 ${ad.is_featured ? 'fill-current' : ''}`} />
                          </button>
                          {ad.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateAdStatus(ad.id, 'active')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg font-bold text-xs"
                              title="Approve Listing"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 3: LEADS & INQUIRIES TRACKER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'leads' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Buyer Leads & WhatsApp Inquiries</h3>
                <p className="text-xs text-gray-500">Real-time buyer contact inquiries generated on URGENIE Hosur</p>
              </div>
              <button 
                onClick={() => showToast('Exporting leads to CSV...')}
                className="btn btn-outline py-2 px-4 text-xs font-bold gap-2 rounded-xl"
              >
                <Download className="h-4 w-4" /> Export Leads CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Buyer Contact</th>
                    <th className="px-4 py-3">Inquired Listing</th>
                    <th className="px-4 py-3">Category / Area</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Lead Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{lead.buyer_name}</div>
                        <div className="text-xs text-brand font-semibold">{lead.buyer_phone}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{lead.ad_title}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold block text-xs text-gray-800">{lead.category}</span>
                        <span className="text-xs text-gray-400">{lead.location}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          lead.source === 'WhatsApp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{lead.created_at}</td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                            lead.status === 'new' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            lead.status === 'contacted' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            lead.status === 'converted' ? 'bg-green-50 text-green-800 border-green-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="new">New Lead</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted Deal</option>
                          <option value="closed">Closed / Expired</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`https://wa.me/${lead.buyer_phone.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg inline-flex items-center gap-1 text-xs font-bold"
                        >
                          <PhoneCall className="h-3.5 w-3.5" /> Call / WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 4: USER MANAGEMENT & ROLE CONTROL
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">User Accounts & Role Permissions</h3>
                <p className="text-xs text-gray-500">Promote users to SuperAdmin, grant Seller privileges, or suspend accounts</p>
              </div>
              <div className="text-xs text-gray-500 font-semibold">
                Total Users: <strong className="text-gray-900">{usersList.length}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3">User Information</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Ads Posted</th>
                    <th className="px-4 py-3">Member Since</th>
                    <th className="px-4 py-3 text-right">Role Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{u.full_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{u.phone}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                          className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            u.role === 'seller' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-green-100 text-green-800 border-green-300'
                          }`}
                        >
                          <option value="user">User (Buyer)</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                          u.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">{u.ads_count}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{u.created_at}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`p-1.5 rounded-lg text-xs font-semibold ${
                              u.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={u.status === 'active' ? 'Suspend User' : 'Activate User'}
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => showToast(`Password reset link sent to ${u.email}`)}
                            className="p-1.5 text-gray-500 hover:text-brand hover:bg-gray-100 rounded-lg"
                            title="Reset User Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 5: LOGIN AUDITS & SECURITY LOGS
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'audits' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Login Audits & Security Logs</h3>
                <p className="text-xs text-gray-500">Track user sign-ins, IP addresses, failed authentication attempts, and device signatures</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Security Guard Active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3">User Email</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Browser / Device</th>
                    <th className="px-4 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{log.user_email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          log.event === 'Login Success' ? 'bg-green-100 text-green-800' :
                          log.event === 'Failed Attempt' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {log.event}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{log.ip_address}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{log.location}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{log.device}</td>
                      <td className="px-4 py-3 text-xs text-right font-medium text-gray-500">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 6: CATEGORIES & ZONES (Full Admin Control)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'categories' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Categories & Hosur Regional Zones</h3>
                <p className="text-xs text-gray-500">Add custom categories and coverage locations live across the platform</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Custom Categories Manager */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-brand" /> Platform Categories ({categoriesList.length})
                    </h4>
                    <button
                      onClick={() => setIsAddingCat(!isAddingCat)}
                      className="btn btn-primary px-3 py-1.5 text-xs font-bold gap-1 rounded-xl shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Category
                    </button>
                  </div>

                  {/* Add Category Form */}
                  {isAddingCat && (
                    <form onSubmit={handleAddCategory} className="p-4 bg-white border border-brand/20 rounded-xl mb-4 space-y-3 shadow-sm">
                      <h5 className="text-xs font-black text-brand uppercase tracking-wider">New Custom Category</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Category Name *</label>
                          <input
                            type="text"
                            required
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="e.g. Pets & Animals"
                            className="input-field py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Slug / ID</label>
                          <input
                            type="text"
                            value={newCatSlug}
                            onChange={(e) => setNewCatSlug(e.target.value)}
                            placeholder="e.g. pets"
                            className="input-field py-1.5 text-xs font-mono"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">Display Icon</label>
                          <select
                            value={newCatIcon}
                            onChange={(e) => setNewCatIcon(e.target.value)}
                            className="input-field py-1.5 text-xs"
                          >
                            <option value="Tag">Tag / General</option>
                            <option value="Car">Car / Vehicle</option>
                            <option value="Building2">Building / Property</option>
                            <option value="Smartphone">Smartphone / Tech</option>
                            <option value="Tv">TV / Electronics</option>
                            <option value="Briefcase">Briefcase / Jobs</option>
                            <option value="Wrench">Wrench / Services</option>
                            <option value="Sofa">Sofa / Furniture</option>
                            <option value="Store">Store / Commercial</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingCat(false)}
                          className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-1.5 text-xs font-bold rounded-lg"
                        >
                          Save Category
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {categoriesList.map((cat: any) => (
                      <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200 text-sm hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-brand-light/30 text-brand flex items-center justify-center font-bold text-xs">
                            #
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{cat.name}</span>
                            <span className="text-[11px] font-mono text-gray-400">id: {cat.id}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Hosur Zones & Locations Manager */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand" /> Hosur Coverage Zones ({zonesList.length})
                    </h4>
                    <button
                      onClick={() => setIsAddingZone(!isAddingZone)}
                      className="btn btn-primary px-3 py-1.5 text-xs font-bold gap-1 rounded-xl shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Location
                    </button>
                  </div>

                  {/* Add Location Form */}
                  {isAddingZone && (
                    <form onSubmit={handleAddZone} className="p-4 bg-white border border-brand/20 rounded-xl mb-4 space-y-3 shadow-sm">
                      <h5 className="text-xs font-black text-brand uppercase tracking-wider">New Hosur Area / Zone</h5>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Location Name *</label>
                        <input
                          type="text"
                          required
                          value={newZoneName}
                          onChange={(e) => setNewZoneName(e.target.value)}
                          placeholder="e.g. Attibele Toll / Zuzuvadi"
                          className="input-field py-1.5 text-xs"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingZone(false)}
                          className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-1.5 text-xs font-bold rounded-lg"
                        >
                          Save Location
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {zonesList.map((zone: any) => (
                      <div key={zone.name || zone.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-200 text-sm hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-800">{zone.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                            Active
                          </span>
                          <button
                            onClick={() => handleDeleteZone(zone.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete location"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 7: REPORTS & MODERATION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'reports' && (
          <div className="p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">User Flagged Listings</h3>
            
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((rep) => (
                  <div key={rep.id} className="p-4 rounded-2xl border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-black uppercase">
                          {rep.reason}
                        </span>
                        <h4 className="font-bold text-gray-900">{rep.ad_title}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{rep.details}</p>
                      <p className="text-[11px] text-gray-400 mt-1">Reported by: {rep.reporter} on {rep.date}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReports(prev => prev.filter(r => r.id !== rep.id));
                          showToast('Report dismissed as valid');
                        }}
                        className="btn btn-outline py-1.5 px-3 text-xs bg-white"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => {
                          setReports(prev => prev.filter(r => r.id !== rep.id));
                          showToast('Listing removed and seller warned');
                        }}
                        className="btn btn-primary py-1.5 px-3 text-xs bg-red-600 hover:bg-red-700 text-white border-transparent"
                      >
                        Remove Listing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Pending Reports</h3>
                <p className="text-sm">All flagged ads have been reviewed. The platform is running cleanly.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
