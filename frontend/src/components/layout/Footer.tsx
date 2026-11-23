import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoImg from '../../assets/img/logo.png';

export default function Footer() {
  const { user } = useAuth();

  const getProtectedLink = (target: string) => {
    return user ? target : `/login?redirect=${encodeURIComponent(target)}`;
  };

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800 pt-16 pb-12">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Brand info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-3">
              <img src={logoImg} alt="URGENIE" className="h-10 w-auto object-contain max-w-[150px] brightness-125" />
            </Link>
            <p className="text-sm text-slate-400 mb-5 max-w-sm leading-relaxed font-medium">
              Hosur's leading local classifieds & direct community marketplace. Buy, sell, find jobs, discover rentals, and connect with trusted local businesses across Hosur, Tamil Nadu.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-xl px-3.5 py-2 w-fit">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Hosur Classifieds Portal</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-950/60 border border-blue-800/60 rounded-xl px-3.5 py-2 w-fit">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>Powered by ZeonyTechnologies</span>
              </div>
            </div>
          </div>
          
          {/* Col 2: Top Categories */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-200 mb-4">Top Categories</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-bold">
              <li><Link to={getProtectedLink('/category/jobs')} className="hover:text-blue-400 transition-colors">Industrial & Factory Jobs</Link></li>
              <li><Link to={getProtectedLink('/category/property')} className="hover:text-blue-400 transition-colors">Houses & Flats for Rent</Link></li>
              <li><Link to={getProtectedLink('/category/vehicles')} className="hover:text-blue-400 transition-colors">Used Bikes & Scooters</Link></li>
              <li><Link to={getProtectedLink('/category/electronics')} className="hover:text-blue-400 transition-colors">Mobile Phones & Laptops</Link></li>
              <li><Link to={getProtectedLink('/category/services')} className="hover:text-blue-400 transition-colors">Local Home Services</Link></li>
            </ul>
          </div>

          {/* Col 3: Localities in Hosur */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-200 mb-4">Hosur Localities</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-bold">
              <li><Link to={getProtectedLink('/browse?location=SIPCOT+Phase+1')} className="hover:text-blue-400 transition-colors flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-500" /> SIPCOT Phase 1 & 2</Link></li>
              <li><Link to={getProtectedLink('/browse?location=Mathigiri')} className="hover:text-blue-400 transition-colors flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-500" /> Mathigiri</Link></li>
              <li><Link to={getProtectedLink('/browse?location=Bagalur+Road')} className="hover:text-blue-400 transition-colors flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-500" /> Bagalur Road</Link></li>
              <li><Link to={getProtectedLink('/browse?location=Rayakottai+Road')} className="hover:text-blue-400 transition-colors flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-500" /> Rayakottai Road</Link></li>
              <li><Link to={getProtectedLink('/browse?location=Attibele+Border')} className="hover:text-blue-400 transition-colors flex items-center gap-1"><MapPin className="h-3 w-3 text-blue-500" /> Attibele Border</Link></li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-200 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-bold">
              <li><Link to="/post-ad" className="text-blue-400 hover:underline">Post a Free Ad</Link></li>
              <li><Link to={getProtectedLink('/browse')} className="hover:text-blue-400 transition-colors">Browse All Ads</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">User Login</Link></li>
              <li><Link to="/register" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-400 transition-colors">Safety & Privacy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>
            &copy; {new Date().getFullYear()} URGENIE Classifieds. Built for the Hosur community.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/70 text-slate-300 font-extrabold tracking-wide">
              Powered by ZeonyTechnologies
            </span>
            <span className="hidden sm:inline text-slate-600">&bull;</span>
            <p className="flex items-center gap-1">
              Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for Hosur, Tamil Nadu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
