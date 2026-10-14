import { Link } from 'react-router-dom';
import { MapPin, Clock, Tag, Sparkles } from 'lucide-react';

interface AdCardProps {
  ad: {
    id: string;
    title: string;
    price: string;
    location: string;
    image: string;
    category: string;
    subcategory?: string;
    listingType?: string;
    postedAt: string;
  };
}

const LISTING_TYPE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  new: { label: 'Brand New', bg: 'bg-emerald-500/90', text: 'text-white' },
  preowned: { label: 'Pre-owned', bg: 'bg-blue-600/90', text: 'text-white' },
  rent: { label: 'For Rent', bg: 'bg-amber-500/95', text: 'text-white' },
  job: { label: 'Job Opening', bg: 'bg-purple-600/90', text: 'text-white' },
  service: { label: 'Service', bg: 'bg-cyan-600/90', text: 'text-white' },
  free: { label: 'Free Giveaway', bg: 'bg-rose-500/95', text: 'text-white' },
};

export default function AdCard({ ad }: AdCardProps) {
  const typeKey = (ad.listingType || '').toLowerCase();
  const typeBadge = LISTING_TYPE_BADGES[typeKey];

  return (
    <Link 
      to={`/ad/${ad.id}`} 
      className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-400/60 transition-all duration-300 overflow-hidden relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100">
        <img 
          src={ad.image} 
          alt={ad.title} 
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Listing Type Badge (Top-Left) */}
        {typeBadge && (
          <div className={`absolute top-2.5 left-2.5 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${typeBadge.bg} ${typeBadge.text} flex items-center gap-1`}>
            <Sparkles className="h-2.5 w-2.5" />
            <span>{typeBadge.label}</span>
          </div>
        )}

        {/* Category Badge (Top-Right) */}
        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-extrabold text-slate-800 capitalize shadow-xs border border-white/60 tracking-wide flex items-center gap-1">
          <Tag className="h-3 w-3 text-blue-600" />
          <span className="truncate max-w-[100px]">{ad.category}</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Price */}
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
            {ad.price}
          </h3>
        </div>

        {/* Title */}
        <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-4 leading-snug group-hover:text-slate-950">
          {ad.title}
        </p>
        
        {/* Footer Meta */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-3.5 border-t border-slate-100 font-semibold">
          <div className="flex items-center gap-1 text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate max-w-[110px]">{ad.location}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{ad.postedAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
