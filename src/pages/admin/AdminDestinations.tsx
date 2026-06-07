import React, { useState, useEffect } from 'react';
import {
  Search, Plus, MapPin, Calendar, Star, Users,
  Edit3, Trash2, Globe, Loader2
} from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  featured: boolean;
  visitors: number;
  rating: number;
  image: string;
  events: Event[];
}

interface Event {
  id: string;
  name: string;
  date: string;
  type: string;
  attendees: number;
}



export default function AdminDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDest, setNewDest] = useState<Partial<Destination>>({
    name: '', country: '', description: '', featured: false, visitors: 0, rating: 5.0, image: '', events: []
  });

  const fetchDestinations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'destinations'));
        const fetchedDests: Destination[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedDests.push({ id: docSnap.id, ...docSnap.data() } as Destination);
        });

        setDestinations(fetchedDests);
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleAddDestination = async () => {
    if (!newDest.name || !newDest.country) return;
    try {
      const newDocRef = doc(collection(db, 'destinations'));
      const destToAdd = {
        ...newDest,
        id: newDocRef.id,
        events: newDest.events || []
      };
      await setDoc(newDocRef, destToAdd);
      setIsAddModalOpen(false);
      setNewDest({ name: '', country: '', description: '', featured: false, visitors: 0, rating: 5.0, image: '', events: [] });
      fetchDestinations();
    } catch (error) {
      console.error("Error adding destination:", error);
    }
  };

  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Destinations & Events</h1>
          <p className="text-slate-400 mt-1">Manage destinations and view events for selected places.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
        <input type="text" placeholder="Search destinations..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 h-10 pl-10 pr-4 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destinations List */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">All Destinations</h3>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
          ) : filtered.map(dest => (
            <div
              key={dest.id}
              onClick={() => setSelectedDest(dest)}
              className={`bg-slate-900 rounded-xl border overflow-hidden cursor-pointer transition-all flex ${
                selectedDest?.id === dest.id ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="w-28 h-28 flex-shrink-0">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white">{dest.name}, {dest.country}</h3>
                    {dest.featured && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">FEATURED</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{dest.description}</p>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{dest.visitors.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{dest.rating}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dest.events.length} events</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Events for Selected Place */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Events for {selectedDest ? `${selectedDest.name}` : 'Selected Place'}
          </h3>
          {selectedDest ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              {/* Destination Header */}
              <div className="h-40 relative">
                <img src={selectedDest.image} alt={selectedDest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h2 className="text-lg font-bold text-white">{selectedDest.name}, {selectedDest.country}</h2>
                  <p className="text-xs text-slate-300">{selectedDest.description}</p>
                </div>
              </div>

              {/* Events Table */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-white">{selectedDest.events.length} Events</p>
                  <button className="px-3 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500/20 transition-all flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Event
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Event</th>
                        <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendees</th>
                        <th className="text-right py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDest.events.map(event => (
                        <tr key={event.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 text-sm text-white font-medium">{event.name}</td>
                          <td className="py-3 px-3 text-sm text-slate-400">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-medium">
                              {event.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-sm text-slate-400">{event.attendees.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                              <button className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center">
              <Globe className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-500 text-sm">Select a destination to view its events</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Destination Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Add New Destination</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                  <input type="text" value={newDest.name} onChange={e => setNewDest({...newDest, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Country</label>
                  <input type="text" value={newDest.country} onChange={e => setNewDest({...newDest, country: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Image URL</label>
                <input type="text" value={newDest.image} onChange={e => setNewDest({...newDest, image: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea value={newDest.description} onChange={e => setNewDest({...newDest, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500 min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Visitors</label>
                  <input type="number" value={newDest.visitors} onChange={e => setNewDest({...newDest, visitors: parseInt(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Rating</label>
                  <input type="number" step="0.1" value={newDest.rating} onChange={e => setNewDest({...newDest, rating: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="featured" checked={newDest.featured} onChange={e => setNewDest({...newDest, featured: e.target.checked})} className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900" />
                <label htmlFor="featured" className="text-sm font-medium text-slate-400">Featured Destination</label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all">Cancel</button>
                <button onClick={handleAddDestination} className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20">Save Destination</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
