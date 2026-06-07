import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Plane, Bed, UtensilsCrossed, Camera, MapPin, 
  TrendingUp, Loader2, PieChart, ArrowRight, Calendar
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Trip {
  id: string;
  title: string;
  destination?: string;
  budget?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  imageUrl?: string;
  image?: string;
  travelers?: number;
}

function parseBudget(b?: string): number {
  if (!b) return 0;
  return parseInt(b.replace(/[^0-9]/g, '')) || 0;
}

export default function Budget() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const q = query(
          collection(db, 'itineraries'),
          where('userId', '==', currentUser?.uid || 'anonymous')
        );
        const snap = await getDocs(q);
        const fetched: Trip[] = [];
        snap.forEach(d => fetched.push({ id: d.id, ...d.data() } as Trip));
        setTrips(fetched);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [currentUser]);

  const totalBudget = trips.reduce((sum, t) => sum + parseBudget(t.budget), 0);
  const upcomingTrips = trips.filter(t => t.status === 'Upcoming');
  const ongoingTrips = trips.filter(t => t.status === 'Ongoing');
  const completedTrips = trips.filter(t => t.status === 'Completed');

  // Simulated category breakdown (proportional to total budget)
  const categories = [
    { name: 'Flights', icon: Plane, pct: 0.35, color: 'bg-[#65a30d]', textColor: 'text-[#65a30d]' },
    { name: 'Accommodation', icon: Bed, pct: 0.30, color: 'bg-blue-500', textColor: 'text-blue-500' },
    { name: 'Food & Dining', icon: UtensilsCrossed, pct: 0.20, color: 'bg-amber-500', textColor: 'text-amber-500' },
    { name: 'Activities', icon: Camera, pct: 0.15, color: 'bg-violet-500', textColor: 'text-violet-500' },
  ];

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-[#65a30d] animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Budget Overview</h1>
          <p className="text-gray-500 mt-1">Track spending across all your trips.</p>
        </div>
        <Link to="/itineraries" className="text-sm font-semibold text-[#65a30d] hover:text-[#4d7c0f] flex items-center gap-1 transition-colors">
          View All Trips <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20">
          <DollarSign className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-400 mb-2">No budget data yet</h2>
          <p className="text-gray-400 mb-6">Book a trip to start tracking your travel budget.</p>
          <Link to="/" className="px-6 py-3 bg-[#65a30d] text-white rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors">
            Explore Destinations
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#65a30d]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#65a30d]" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Total Budget</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Across {trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Upcoming</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{upcomingTrips.length}</p>
              <p className="text-xs text-gray-400 mt-1">${upcomingTrips.reduce((s, t) => s + parseBudget(t.budget), 0).toLocaleString()} budgeted</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Ongoing</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{ongoingTrips.length}</p>
              <p className="text-xs text-gray-400 mt-1">${ongoingTrips.reduce((s, t) => s + parseBudget(t.budget), 0).toLocaleString()} in progress</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Completed</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{completedTrips.length}</p>
              <p className="text-xs text-gray-400 mt-1">${completedTrips.reduce((s, t) => s + parseBudget(t.budget), 0).toLocaleString()} spent</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Estimated Breakdown</h3>
              <div className="space-y-5">
                {categories.map(cat => {
                  const amount = Math.round(totalBudget * cat.pct);
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${cat.color}/10 flex items-center justify-center`}>
                            <cat.icon className={`w-4 h-4 ${cat.textColor}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">${amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className={`${cat.color} h-full rounded-full transition-all`} style={{ width: `${cat.pct * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Grand Total</span>
                <span className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</span>
              </div>
            </div>

            {/* Per-Trip Budget List */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Budget by Trip</h3>
              <div className="space-y-4">
                {trips.map(trip => {
                  const budget = parseBudget(trip.budget);
                  const pct = totalBudget > 0 ? Math.round((budget / totalBudget) * 100) : 0;
                  const img = trip.imageUrl || trip.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=100';
                  return (
                    <div key={trip.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <img src={img} alt={trip.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-gray-900 truncate">{trip.title}</h4>
                          <span className="text-sm font-bold text-[#65a30d] ml-2 flex-shrink-0">{trip.budget || '$0'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          {trip.destination && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {trip.destination}</span>}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            trip.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                            trip.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-200 text-gray-600'
                          }`}>{trip.status}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#65a30d] h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold flex-shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
