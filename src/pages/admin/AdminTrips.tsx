import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit3, Trash2, Eye, Calendar,
  MapPin, DollarSign, Clock, X, Upload, Save, Loader2, CheckCircle2, PlayCircle, ArrowUpCircle
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  status: string;
  description: string;
  itinerary: string;
  included: string;
  costDetails: string;
  insights: string;
  image: string;
}



const emptyTrip: Omit<Trip, 'id'> = {
  title: '', destination: '', startDate: '', endDate: '', budget: '',
  status: 'draft', description: '', itinerary: '', included: '',
  costDetails: '', insights: '', image: ''
};

export default function AdminTrips() {
  const [view, setView] = useState<'list' | 'detail' | 'form'>('list');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState(emptyTrip as Trip);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'itineraries'));
      const fetchedTrips: Trip[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedTrips.push({ id: docSnap.id, ...docSnap.data() } as Trip);
      });
      
      setTrips(fetchedTrips);
    } catch (err) {
      console.error("Failed to fetch trips:", err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const openDetail = (trip: Trip) => { setSelectedTrip(trip); setView('detail'); };
  const openForm = (trip?: Trip) => {
    setFormData(trip ? { ...trip } : { ...emptyTrip, id: '' });
    setView('form');
  };
  const goBack = () => { setView('list'); setSelectedTrip(null); };

  const handleSaveTrip = async () => {
    setSaving(true);
    try {
      if (formData.id) {
        // Update existing
        await setDoc(doc(db, 'itineraries', formData.id), formData, { merge: true });
      } else {
        // Add new
        const newDocRef = doc(collection(db, 'itineraries'));
        await setDoc(newDocRef, { ...formData, id: newDocRef.id });
      }
      await fetchTrips();
      goBack();
    } catch (err) {
      console.error("Error saving trip:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      await deleteDoc(doc(db, 'itineraries', id));
      await fetchTrips();
      if (selectedTrip?.id === id) goBack();
    } catch (err) {
      console.error("Error deleting trip:", err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'itineraries', id), { status: newStatus });
      await fetchTrips();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filtered = trips.filter(t =>
    (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.destination || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LIST VIEW
  if (view === 'list') return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Trip Management</h1>
          <p className="text-slate-400 mt-1">Create, edit, and manage all platform trips.</p>
        </div>
        <button onClick={() => openForm()} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" /> Add New Trip
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
        <input
          type="text" placeholder="Search trips..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 h-10 pl-10 pr-4 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((trip) => (
          <div key={trip.id} className="bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden flex flex-col sm:flex-row">
            <div className="w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
              <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{trip.title}</h3>
                  <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    trip.status === 'Ongoing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    trip.status === 'Upcoming' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    trip.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    trip.status === 'draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-600'
                  }`}>{trip.status}</span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">{trip.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {trip.destination}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {trip.startDate} → {trip.endDate}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {trip.budget}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 flex-wrap">
                <button onClick={() => openDetail(trip)} className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button onClick={() => openForm(trip)} className="px-3 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500/20 transition-all flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                {trip.status !== 'Completed' && (
                  <button onClick={() => handleStatusChange(trip.id, 'Completed')} className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                  </button>
                )}
                {trip.status !== 'Ongoing' && (
                  <button onClick={() => handleStatusChange(trip.id, 'Ongoing')} className="px-3 py-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium hover:bg-blue-500/20 transition-all flex items-center gap-1.5">
                    <PlayCircle className="w-3.5 h-3.5" /> Ongoing
                  </button>
                )}
                {trip.status !== 'Upcoming' && (
                  <button onClick={() => handleStatusChange(trip.id, 'Upcoming')} className="px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium hover:bg-amber-500/20 transition-all flex items-center gap-1.5">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> Upcoming
                  </button>
                )}
                <button onClick={() => handleDeleteTrip(trip.id)} className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-all flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))) : (
          <div className="text-center text-slate-500 py-8">
            No trips found.
          </div>
        )}
      </div>
    </div>
  );

  // DETAIL VIEW (Trip Listing — matches wireframe)
  if (view === 'detail' && selectedTrip) return (
    <div className="space-y-6">
      <button onClick={goBack} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">← Back to Trips</button>
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="h-56 lg:h-72 relative">
          <img src={selectedTrip.image} alt={selectedTrip.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl font-bold text-white mb-2">{selectedTrip.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-cyan-400" />{selectedTrip.destination}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-cyan-400" />{selectedTrip.startDate} → {selectedTrip.endDate}</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-cyan-400" />{selectedTrip.budget}</span>
            </div>
          </div>
        </div>
        <div className="p-6 lg:p-8 space-y-6">
          {[
            { title: 'Short Description of the Trip', content: selectedTrip.description },
            { title: 'Itinerary', content: selectedTrip.itinerary },
            { title: 'Included', content: selectedTrip.included },
            { title: 'Short Cost Detail of the Trip', content: selectedTrip.costDetails },
            { title: 'Extra Insights of the Trip', content: selectedTrip.insights },
          ].map((section) => (
            <div key={section.title} className="border-l-2 border-cyan-500/30 pl-5">
              <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">{section.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
          <div className="flex gap-3 pt-4 border-t border-slate-800 flex-wrap">
            <button onClick={() => openForm(selectedTrip)} className="px-5 py-2.5 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit Trip
            </button>
            {selectedTrip.status !== 'Completed' && (
              <button onClick={() => { handleStatusChange(selectedTrip.id, 'Completed'); goBack(); }} className="px-5 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Mark as Done
              </button>
            )}
            {selectedTrip.status !== 'Ongoing' && (
              <button onClick={() => { handleStatusChange(selectedTrip.id, 'Ongoing'); goBack(); }} className="px-5 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium hover:bg-blue-500/20 transition-all flex items-center gap-2">
                <PlayCircle className="w-4 h-4" /> Mark as Ongoing
              </button>
            )}
            <button onClick={() => handleDeleteTrip(selectedTrip.id)} className="px-5 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-all flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // FORM VIEW (Add/Update Trip — matches wireframe)
  return (
    <div className="space-y-6">
      <button onClick={goBack} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">← Back to Trips</button>
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 lg:p-8">
        <h2 className="text-xl font-bold text-white mb-6">{formData.title ? 'Update Trip' : 'Add New Trip'}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Trip Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
                placeholder="e.g. Romantic Paris Getaway" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Destination</label>
              <input type="text" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })}
                className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
                placeholder="e.g. Paris, France" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
                <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date</label>
                <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Budget</label>
                <input type="text" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
                  placeholder="$2,500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-all">
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Banner Image URL</label>
              <div className="flex gap-2">
                <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
                  placeholder="https://..." />
                <button className="px-3 h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all resize-none"
                placeholder="Short description of the trip..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Itinerary</label>
              <textarea value={formData.itinerary} onChange={e => setFormData({ ...formData, itinerary: e.target.value })} rows={3}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all resize-none"
                placeholder="Day 1: ...\nDay 2: ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">What's Included</label>
              <textarea value={formData.included} onChange={e => setFormData({ ...formData, included: e.target.value })} rows={2}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all resize-none"
                placeholder="Hotel, transfers, tours..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Cost Details</label>
              <textarea value={formData.costDetails} onChange={e => setFormData({ ...formData, costDetails: e.target.value })} rows={2}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all resize-none"
                placeholder="Hotel: $X | Flights: $X ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Extra Insights</label>
              <textarea value={formData.insights} onChange={e => setFormData({ ...formData, insights: e.target.value })} rows={2}
                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all resize-none"
                placeholder="Travel tips and advice..." />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-800">
          <button onClick={handleSaveTrip} disabled={saving} className="px-6 py-2.5 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {saving ? 'Saving...' : 'Save Trip'}
          </button>
          <button onClick={goBack} className="px-6 py-2.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-sm font-medium hover:bg-slate-700 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
