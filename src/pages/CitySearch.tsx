import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, DollarSign, TrendingUp, Plus, Filter, Globe, Star } from 'lucide-react';

interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: 'Budget' | 'Moderate' | 'Expensive' | 'Premium';
  popularity: number;
  image: string;
  description: string;
  avgDailyCost: number;
}

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const regions = ['All', 'Europe', 'Asia Pacific', 'Americas', 'Africa'];
const costLevels = ['All', 'Budget', 'Moderate', 'Expensive', 'Premium'];

export default function CitySearch() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCost, setSelectedCost] = useState('All');
  const [addedCities, setAddedCities] = useState<Set<string>>(new Set());

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'destinations'));
        const data: City[] = [];
        querySnapshot.forEach((doc) => {
          const d = doc.data();
          data.push({
            id: doc.id,
            name: d.name || '',
            country: d.country || '',
            region: d.region || 'Europe',
            costIndex: d.costIndex || 'Moderate',
            popularity: d.visitors ? Math.min(100, Math.round(d.visitors / 100)) : 80,
            image: d.image || '',
            description: d.description || '',
            avgDailyCost: d.avgDailyCost || 100,
          } as City);
        });
        setCities(data);
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const filtered = cities.filter(city => {
    const matchesQuery = city.name.toLowerCase().includes(query.toLowerCase()) ||
                         city.country.toLowerCase().includes(query.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
    const matchesCost = selectedCost === 'All' || city.costIndex === selectedCost;
    return matchesQuery && matchesRegion && matchesCost;
  });

  const toggleCity = (id: string) => {
    setAddedCities(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const costColor = (cost: string) => {
    switch (cost) {
      case 'Budget': return 'bg-emerald-100 text-emerald-700';
      case 'Moderate': return 'bg-amber-100 text-amber-700';
      case 'Expensive': return 'bg-orange-100 text-orange-700';
      case 'Premium': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">City Search</h1>
          <p className="text-gray-600 text-[15px] max-w-2xl">
            Discover cities around the world. Search by name or country, filter by region or cost index, and add cities to your trip.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cities or countries..." 
              className="w-full h-14 pl-12 pr-4 bg-white rounded-xl border border-gray-200 focus:border-[#65a30d] focus:ring-1 focus:ring-[#65a30d] outline-none transition-colors text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-14 pl-9 pr-8 bg-white rounded-xl border border-gray-200 focus:border-[#65a30d] focus:ring-1 focus:ring-[#65a30d] outline-none text-gray-700 font-medium appearance-none cursor-pointer"
              >
                {regions.map(r => <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>)}
              </select>
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select 
                value={selectedCost}
                onChange={(e) => setSelectedCost(e.target.value)}
                className="h-14 pl-9 pr-8 bg-white rounded-xl border border-gray-200 focus:border-[#65a30d] focus:ring-1 focus:ring-[#65a30d] outline-none text-gray-700 font-medium appearance-none cursor-pointer"
              >
                {costLevels.map(c => <option key={c} value={c}>{c === 'All' ? 'All Budgets' : c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">{filtered.length} cities found</p>
          {addedCities.size > 0 && (
            <span className="text-sm font-semibold text-[#4d7c0f] bg-[#ecfccb] px-4 py-1.5 rounded-full">
              {addedCities.size} added to trip
            </span>
          )}
        </div>

        {/* City Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#65a30d]"></div>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(city => (
            <div key={city.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={city.image} 
                  alt={city.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${costColor(city.costIndex)}`}>
                    {city.costIndex}
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-[#65a30d]" />
                  <span className="text-xs font-bold text-gray-800">{city.popularity}%</span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{city.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {city.country} · {city.region}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{city.description}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#65a30d]" />
                    <span className="text-sm font-semibold text-gray-700">~${city.avgDailyCost}/day</span>
                  </div>
                  <button 
                    onClick={() => toggleCity(city.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      addedCities.has(city.id) 
                        ? 'bg-[#65a30d] text-white shadow-sm' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-[#65a30d] hover:text-[#4d7c0f]'
                    }`}
                  >
                    {addedCities.has(city.id) ? (
                      <>
                        <Star className="w-4 h-4 fill-current" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Add to Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No cities found</h3>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}

      </main>
    </>
  );
}
