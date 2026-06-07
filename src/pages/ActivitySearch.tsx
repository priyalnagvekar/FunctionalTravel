import React, { useState, useEffect } from 'react';
import { 
  Search, ListFilter, SlidersHorizontal, ArrowUpDown, 
  MapPin, Star, Heart, Image as ImageIcon, Loader2, X, Clock, Tag, CheckCircle2, Calendar
} from 'lucide-react';

import { collection, getDocs, doc, setDoc, collection as firestoreCollection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface Activity {
  id: string;
  name: string;
  rating: number;
  reviews?: number;
  location: string;
  description: string;
  price: string;
  image: string;
  category: string;
}

export default function ActivitySearch() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingStep, setBookingStep] = useState<'details'|'confirmed'>('details');
  const [bookingSaving, setBookingSaving] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'activities'));
        const data: Activity[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Activity);
        });
        setActivities(data);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const filtered = activities.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col gap-10">
        
        {/* Search header area */}
        <section className="flex flex-col gap-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Activity Search</h1>
          
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#65a30d] focus:ring-1 focus:ring-[#65a30d] outline-none transition-colors text-gray-900 font-medium"
              />
            </div>
            
            <div className="flex flex-wrap md:flex-nowrap gap-3">
              <button className="flex items-center gap-2 px-5 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-[#65a30d]/50 transition-colors text-gray-600 font-medium whitespace-nowrap shadow-sm">
                <ListFilter className="w-4 h-4" />
                Group by
              </button>
              <button className="flex items-center gap-2 px-5 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-[#65a30d]/50 transition-colors text-gray-600 font-medium whitespace-nowrap shadow-sm">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-5 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-[#65a30d]/50 transition-colors text-gray-600 font-medium whitespace-nowrap shadow-sm">
                <ArrowUpDown className="w-4 h-4" />
                Sort by
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-500 text-sm">Results for:</span>
            <span className="px-4 py-1.5 rounded-full border border-[#ecfccb] text-[#4d7c0f] bg-[#f7fee7] text-sm font-semibold">{searchQuery}</span>
          </div>
        </section>

        {/* Results List */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-gray-900">Results ({filtered.length})</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-[#65a30d] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg font-medium">No activities found</p>
              <p className="text-sm mt-1">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filtered.map((activity) => (
                <div key={activity.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row border border-gray-100 group">
                  <div className="relative w-full md:w-[380px] h-[280px] md:h-auto flex-shrink-0 overflow-hidden bg-gray-100">
                    {activity.image ? (
                      <img 
                        src={activity.image} 
                        alt={activity.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <button className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="text-2xl font-bold text-gray-900 leading-tight">{activity.name}</h3>
                      <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded text-sm font-semibold text-gray-800 flex-shrink-0">
                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                        {activity.rating} {activity.reviews ? `(${activity.reviews})` : ''}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-gray-500 text-[15px] font-medium mb-4">
                      <MapPin className="w-4 h-4" />
                      {activity.location}
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {activity.description}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-[28px] font-bold text-[#65a30d] tracking-tight">
                        {activity.price.startsWith('$') ? activity.price : `$${activity.price}`} <span className="text-gray-500 text-[15px] font-normal tracking-normal">/ person</span>
                      </div>
                      <button onClick={() => { setSelectedActivity(activity); setBookingStep('details'); setBookingDate(''); }} className="bg-[#65a30d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4d7c0f] transition-colors shadow-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-center mt-8">
            <button className="bg-white border-2 border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
              Load More Results
            </button>
          </div>
        </section>

      </main>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedActivity(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <button onClick={() => setSelectedActivity(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-sm">
              <X className="w-5 h-5" />
            </button>

            <div className="h-64 relative">
              <img src={selectedActivity.image} alt={selectedActivity.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-16">
                <h2 className="text-2xl font-bold text-white">{selectedActivity.name}</h2>
                <div className="flex items-center gap-3 mt-2 text-white/80 text-sm">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{selectedActivity.rating}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedActivity.location}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {bookingStep === 'details' && (
                <>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="flex items-center gap-1.5 text-sm bg-[#f7fee7] text-[#4d7c0f] px-3 py-1.5 rounded-full font-semibold border border-[#ecfccb]"><Tag className="w-3.5 h-3.5" />{selectedActivity.category}</span>
                    {(selectedActivity as any).duration && <span className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold border border-blue-100"><Clock className="w-3.5 h-3.5" />{(selectedActivity as any).duration}</span>}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6">{selectedActivity.description}</p>
                  <div className="flex items-center justify-between p-4 bg-[#65a30d]/5 rounded-xl border border-[#65a30d]/20 mb-6">
                    <span className="text-sm text-gray-600 font-medium">Price per person</span>
                    <span className="text-2xl font-bold text-[#65a30d]">{selectedActivity.price}</span>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                    <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none" />
                  </div>
                  <button disabled={!bookingDate || bookingSaving} onClick={async () => {
                    setBookingSaving(true);
                    try {
                      const ref = doc(collection(db, 'bookings'));
                      await setDoc(ref, {
                        id: ref.id,
                        user: currentUser?.displayName || currentUser?.email || 'Guest',
                        email: currentUser?.email || '',
                        trip: selectedActivity.name,
                        destination: selectedActivity.location,
                        date: bookingDate,
                        amount: selectedActivity.price,
                        status: 'confirmed',
                        avatar: currentUser?.displayName?.charAt(0) || 'G',
                        type: 'activity',
                        createdAt: new Date().toISOString(),
                      });

                      // Also create itinerary so it shows on My Trips & Itineraries
                      const itRef = doc(collection(db, 'itineraries'));
                      await setDoc(itRef, {
                        id: itRef.id,
                        userId: currentUser?.uid || 'anonymous',
                        title: selectedActivity.name,
                        destination: selectedActivity.location,
                        startDate: bookingDate,
                        endDate: bookingDate,
                        budget: selectedActivity.price,
                        status: 'Upcoming',
                        description: selectedActivity.description || '',
                        image: selectedActivity.image || '',
                        imageUrl: selectedActivity.image || '',
                        bookingId: ref.id,
                        type: 'activity',
                        createdAt: new Date().toISOString(),
                      });

                      setBookingStep('confirmed');
                    } catch (err) { console.error('Booking failed:', err); }
                    finally { setBookingSaving(false); }
                  }} className="w-full py-3.5 bg-[#65a30d] text-white rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors shadow-lg shadow-[#65a30d]/20 disabled:opacity-50">
                    {bookingSaving ? 'Booking...' : 'Book This Activity'}
                  </button>
                </>
              )}
              {bookingStep === 'confirmed' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#65a30d]/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#65a30d]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Activity Booked!</h3>
                  <p className="text-gray-500 mb-1"><strong>{selectedActivity.name}</strong></p>
                  <p className="text-gray-400 text-sm mb-6"><Calendar className="w-3.5 h-3.5 inline mr-1" />{new Date(bookingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {selectedActivity.location}</p>
                  <button onClick={() => { setSelectedActivity(null); setBookingDate(''); }} className="px-8 py-3 bg-[#65a30d] text-white rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </>
  );
}
