import React, { useState, useEffect } from 'react';
import {
  Search, ListFilter, SlidersHorizontal, ArrowUpDown,
  MoreVertical, Calendar, ArrowRight, Loader2, X, Trash2, Edit3, CheckCircle2, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Itinerary {
  id: string;
  title: string;
  status: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  description?: string;
  destination?: string;
  imageUrl?: string;
  image?: string;
  members?: string[];
  badge?: string;
  badgeType?: string;
  daysAway?: string;
  tag?: string;
  budget?: string;
  travelers?: number;
}

interface GroupedItineraries {
  ongoing: Itinerary[];
  upcoming: Itinerary[];
  completed: Itinerary[];
}
//search
export default function Itineraries() {
  const [data, setData] = useState<GroupedItineraries>({ ongoing: [], upcoming: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editTrip, setEditTrip] = useState<Itinerary | null>(null);
  const [editForm, setEditForm] = useState({ title: '', destination: '', startDate: '', endDate: '', description: '', status: '', budget: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchItineraries = async () => {
    try {
      const q = query(
        collection(db, 'itineraries'),
        where('userId', '==', currentUser?.uid || 'anonymous')
      );
      const querySnapshot = await getDocs(q);
      const dbTrips: Itinerary[] = [];
      querySnapshot.forEach((docSnap) => {
        dbTrips.push({ id: docSnap.id, ...docSnap.data() } as Itinerary);
      });

      setData({
        ongoing: dbTrips.filter(t => t.status === 'Ongoing'),
        upcoming: dbTrips.filter(t => t.status === 'Upcoming'),
        completed: dbTrips.filter(t => t.status === 'Completed'),
      });
    } catch (err) {
      console.error('Failed to fetch itineraries:', err);
      setData({ ongoing: [], upcoming: [], completed: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItineraries(); }, [currentUser]);

  const filterBySearch = (items: Itinerary[]) =>
    items.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const openEdit = (trip: Itinerary) => {
    setEditTrip(trip);
    setEditForm({
      title: trip.title || '',
      destination: trip.destination || '',
      startDate: trip.startDate || '',
      endDate: trip.endDate || '',
      description: trip.description || '',
      status: trip.status || 'Upcoming',
      budget: trip.budget || '',
    });
    setMenuOpen(null);
  };

  const handleSaveEdit = async () => {
    if (!editTrip) return;
    setEditSaving(true);
    try {
      await updateDoc(doc(db, 'itineraries', editTrip.id), {
        title: editForm.title,
        destination: editForm.destination,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        description: editForm.description,
        status: editForm.status,
        budget: editForm.budget,
      });
      setEditTrip(null);
      await fetchItineraries();
    } catch (err) {
      console.error('Failed to update trip:', err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (tripId: string) => {
    try {
      await deleteDoc(doc(db, 'itineraries', tripId));
      setDeleteConfirm(null);
      setMenuOpen(null);
      await fetchItineraries();
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  const handleStatusChange = async (tripId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'itineraries', tripId), { status: newStatus });
      setMenuOpen(null);
      await fetchItineraries();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getImg = (trip: Itinerary) => trip.imageUrl || trip.image || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80';

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-[#65a30d] animate-spin" />
      </main>
    );
  }

  const TripCard = ({ trip, variant }: { trip: Itinerary; variant: 'ongoing' | 'upcoming' | 'completed' }) => (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group flex flex-col border border-gray-100 ${variant === 'completed' ? 'grayscale-[0.3] hover:grayscale-0' : ''}`}>
      <div className={`relative ${variant === 'completed' ? 'h-36' : variant === 'ongoing' ? 'h-60' : 'h-48'} overflow-hidden`}>
        <img src={getImg(trip)} alt={trip.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        {variant === 'ongoing' && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#65a30d] animate-pulse"></span>
            {trip.badge || 'Active'}
          </div>
        )}
        {variant === 'upcoming' && trip.daysAway && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#4d7c0f] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {trip.daysAway}
          </div>
        )}
      </div>

      <div className={`${variant === 'completed' ? 'p-4' : 'p-6'} flex flex-col gap-3 flex-grow`}>
        <div className="flex justify-between items-start">
          <h3 className={`${variant === 'completed' ? 'text-base' : 'text-xl'} font-bold text-gray-900 leading-tight`}>{trip.title}</h3>
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === trip.id ? null : trip.id); }} className="text-gray-400 hover:text-[#65a30d] transition-colors p-1">
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen === trip.id && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 animate-in fade-in">
                <button onClick={() => openEdit(trip)} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit Trip
                </button>
                {trip.status !== 'Ongoing' && (
                  <button onClick={() => handleStatusChange(trip.id, 'Ongoing')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Mark as Ongoing
                  </button>
                )}
                {trip.status !== 'Completed' && (
                  <button onClick={() => handleStatusChange(trip.id, 'Completed')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" /> Mark as Completed
                  </button>
                )}
                {trip.status !== 'Upcoming' && (
                  <button onClick={() => handleStatusChange(trip.id, 'Upcoming')} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" /> Mark as Upcoming
                  </button>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => setDeleteConfirm(trip.id)} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Trip
                </button>
              </div>
            )}
          </div>
        </div>

        {trip.destination && (
          <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {trip.destination}</p>
        )}

        {(trip.startDate || trip.endDate) && variant !== 'completed' && (
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            {trip.startDate} - {trip.endDate}
          </div>
        )}

        {trip.description && variant === 'ongoing' && (
          <p className="text-[15px] text-gray-600 mt-1 line-clamp-2">{trip.description}</p>
        )}

        {variant === 'completed' && trip.date && (
          <div className="text-xs text-gray-500 font-medium">{trip.date}</div>
        )}

        <div className={`mt-auto ${variant !== 'completed' ? 'pt-4 border-t border-gray-100' : 'pt-2'} flex items-center justify-between`}>
          {variant === 'ongoing' && (
            <>
              <div className="flex -space-x-2">
                {(trip.members || []).map((m, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold border-2 border-white">{m}</div>
                ))}
              </div>
              <Link to="/itinerary-view" className="text-sm font-semibold text-[#65a30d] hover:text-[#4d7c0f] transition-colors flex items-center gap-1">
                View Itinerary <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </>
          )}
          {variant === 'upcoming' && (
            <>
              {trip.tag && <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-semibold">{trip.tag}</span>}
              {trip.budget && <span className="text-sm font-semibold text-[#65a30d]">{trip.budget}</span>}
              <button onClick={() => openEdit(trip)} className="text-sm font-semibold text-gray-500 hover:text-[#65a30d] transition-colors">
                Edit Trip
              </button>
            </>
          )}
          {variant === 'completed' && (
            <button className="text-[#65a30d] text-xs font-bold self-start hover:underline">
              View Memories
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col gap-12">



        {/* Empty state */}
        {data.ongoing.length === 0 && data.upcoming.length === 0 && data.completed.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">No trips yet</h2>
            <p className="text-gray-400 mb-6">Book a destination from the home page to see your trips here.</p>
            <Link to="/" className="px-6 py-3 bg-[#65a30d] text-white rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors">
              Explore Destinations
            </Link>
          </div>
        )}

        {/* Ongoing */}
        {filterBySearch(data.ongoing).length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#65a30d] rounded-full"></span> Ongoing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBySearch(data.ongoing).map(trip => <TripCard key={trip.id} trip={trip} variant="ongoing" />)}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {filterBySearch(data.upcoming).length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-blue-500 rounded-full"></span> Up-coming
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterBySearch(data.upcoming).map(trip => <TripCard key={trip.id} trip={trip} variant="upcoming" />)}
            </div>
          </section>
        )}

        {/* Completed */}
        {filterBySearch(data.completed).length > 0 && (
          <section className="flex flex-col gap-6 opacity-80">
            <h2 className="text-2xl font-semibold text-gray-500 flex items-center gap-3">
              <span className="w-2 h-8 bg-gray-300 rounded-full"></span> Completed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterBySearch(data.completed).map(trip => <TripCard key={trip.id} trip={trip} variant="completed" />)}
            </div>
          </section>
        )}
      </main >

      {/* Edit Trip Modal */}
      {
        editTrip && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditTrip(null)} />
            <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
              <button onClick={() => setEditTrip(null)} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#65a30d]" /> Edit Trip
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                  <input type="text" value={editForm.destination} onChange={e => setEditForm({ ...editForm, destination: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={editForm.startDate} onChange={e => setEditForm({ ...editForm, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={editForm.endDate} onChange={e => setEditForm({ ...editForm, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <input type="text" value={editForm.budget} onChange={e => setEditForm({ ...editForm, budget: e.target.value })} placeholder="$2,500" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditTrip(null)} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} disabled={editSaving} className="flex-1 py-3 bg-[#65a30d] text-white rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors disabled:opacity-50">
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Trip?</h3>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone. The trip will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}
