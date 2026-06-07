import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronDown, SlidersHorizontal, PlusCircle, 
  Calendar, Users, Camera, MapPin, Footprints, Sailboat, 
  Plane, Bed, Plus, Loader2, X, Star, CheckCircle2, DollarSign
} from 'lucide-react';
import { doc, setDoc, collection as firestoreCollection } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';



export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState<'details'|'form'|'confirmed'>('details');
  const [bookingData, setBookingData] = useState({ travelers: 1, date: '' });
  const [bookingSaving, setBookingSaving] = useState(false);

  const handleSearch = () => {
    // Navigate to city search with query parameter as a mock search implementation
    navigate(`/city-search?q=${encodeURIComponent(searchQuery)}`);
  };

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'destinations'));
        const fetchedDests: any[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedDests.push({ id: docSnap.id, ...docSnap.data() });
        });
        setDestinations(fetchedDests.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch destinations:", err);
        setDestinations([]);
      } finally {
        setLoadingRegions(false);
      }
    };
    
    const fetchTrips = async () => {
      try {
        const q = query(
          collection(db, 'itineraries'),
          where('userId', '==', currentUser?.uid || 'anonymous')
        );
        const querySnapshot = await getDocs(q);
        const fetchedTrips: any[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedTrips.push({ id: docSnap.id, ...docSnap.data() });
        });
        setMyTrips(fetchedTrips.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch trips:", err);
        setMyTrips([]);
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchDestinations();
    fetchTrips();
  }, [currentUser]);
  return (
    <>
      
      <main className="flex-grow pb-16">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] sm:h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80" 
              alt="Grand canyon landscape at sunset" 
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>
          </div>
          
          <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 drop-shadow-md">
              Discover Your Next Great Adventure
            </h1>
            
            {/* Search Component */}
            <div className="w-full max-w-3xl bg-white rounded-full p-2 flex items-center shadow-lg">
              <div className="flex-grow flex items-center px-4">
                <Search className="text-gray-400 w-5 h-5 mr-3" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Where do you want to go?" 
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-800 text-lg placeholder-gray-400 py-3 outline-none"
                />
              </div>
              <div className="hidden sm:flex items-center border-l border-gray-200 pl-4 pr-2 space-x-2">
                <button className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-full transition-colors flex items-center gap-1">
                  Group by <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                <button className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-full transition-colors flex items-center gap-1">
                  Filter <SlidersHorizontal className="w-4 h-4 ml-1" />
                </button>
              </div>
              <button 
                onClick={handleSearch}
                className="bg-[#65a30d] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#4d7c0f] transition-colors ml-2 shadow-sm whitespace-nowrap">
                Search
              </button>
            </div>
            
            {/* Plan New Trip Button */}
            <div className="mt-8">
              <Link to="/plan-trip" className="bg-[#4d7c0f] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#3f6212] transition-colors shadow-lg flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Plan New Trip
              </Link>
            </div>
          </div>
        </section>

        {/* Top Regional Selections */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Top Regional Selections</h2>
            <a href="#" className="text-[#65a30d] font-medium hover:underline hidden sm:block">View all regions</a>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingRegions ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#65a30d] animate-spin" />
              </div>
            ) : destinations.length > 0 ? (
              destinations.map(dest => (
                <div key={dest.id} onClick={() => { setSelectedDest(dest); setBookingStep('details'); }} className="group cursor-pointer rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border border-gray-100">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-white/95 text-[#4d7c0f] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                      {dest.country}
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#65a30d] transition-colors">{dest.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{dest.description}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                      {dest.rating && <span className="flex items-center gap-1 text-amber-500 font-semibold"><Star className="w-3.5 h-3.5 fill-amber-400" />{dest.rating}</span>}
                      {dest.visitors && <span>{dest.visitors.toLocaleString()} visitors</span>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center text-gray-500 py-8">
                No destinations available yet.
              </div>
            )}
          </div>
        </section>

        {/* My Trips */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-100 rounded-3xl mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">My Trips</h2>
            <Link to="/itineraries" className="text-[#65a30d] font-medium hover:underline hidden sm:block">View all itineraries</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingTrips ? (
              <div className="col-span-1 md:col-span-3 flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#65a30d] animate-spin" />
              </div>
            ) : myTrips.length > 0 ? (
              myTrips.map(trip => (
                <div key={trip.id} className={`${trip.status === 'Upcoming' ? 'bg-[#65a30d]/10 border-2 border-[#65a30d]/30' : 'bg-white border border-gray-100'} rounded-xl overflow-hidden shadow-sm flex flex-col`}>
                  <div className="relative h-48">
                    <img src={trip.imageUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80'} alt={trip.title} className="w-full h-full object-cover" />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${trip.status === 'Upcoming' ? 'bg-[#65a30d] text-white' : 'bg-white text-gray-800'}`}>
                      {trip.status || 'Upcoming'}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{trip.title}</h3>
                      {trip.status === 'Upcoming' && <span className="text-[#65a30d] font-bold text-sm">Upcoming</span>}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {trip.destination}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 text-center text-gray-500 py-8">
                You haven't planned any trips yet!
              </div>
            )}
          </div>
        </section>

        {/* Recommended & Budget */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recommended */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Recommended For You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div onClick={() => { setSelectedDest({ name: 'Reykjavik', country: 'Iceland', description: 'A gateway to dramatic landscapes including geysers, volcanoes, and the Northern Lights. Discover natural hot springs, glaciers, and a vibrant creative scene.', image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80', rating: 4.8, visitors: 6800, region: 'Europe', costIndex: 'Moderate', avgDailyCost: 130, events: [] }); setBookingStep('details'); }} className="relative rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                  <img src="https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80" alt="Iceland Aurora" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent flex flex-col justify-end p-6">
                    <span className="text-[#a3e635] text-sm font-semibold mb-1 shadow-sm">Based on interest: Nature</span>
                    <h3 className="text-white text-2xl font-bold">Reykjavik, Iceland</h3>
                  </div>
                </div>
                <div onClick={() => { setSelectedDest({ name: 'Kyoto', country: 'Japan', description: 'The cultural heart of Japan, filled with ancient temples, traditional tea houses, bamboo forests, and stunning seasonal beauty.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80', rating: 4.9, visitors: 9200, region: 'Asia Pacific', costIndex: 'Moderate', avgDailyCost: 110, events: [{ id: 'ek1', name: 'Gion Matsuri Festival', date: '2026-07-17', type: 'Cultural', attendees: 40000 }] }); setBookingStep('details'); }} className="relative rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                  <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80" alt="Kyoto Shrine" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent flex flex-col justify-end p-6">
                    <span className="text-[#a3e635] text-sm font-semibold mb-1 shadow-sm">Trending Now</span>
                    <h3 className="text-white text-2xl font-bold">Kyoto, Japan</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Overview */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget Overview</h2>
              <div className="space-y-6">
                {myTrips.length > 0 ? (
                  <>
                    {myTrips.slice(0, 2).map(trip => {
                      const budget = parseInt((trip.budget || '$0').replace(/[^0-9]/g, '')) || 0;
                      return (
                        <div key={trip.id}>
                          <div className="flex justify-between text-sm font-semibold mb-2">
                            <span className="text-gray-900 truncate mr-2">{trip.title}</span>
                            <span className="text-[#65a30d]">{trip.budget || '$0'}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-[#65a30d] h-full rounded-full" style={{ width: `${Math.min(100, Math.max(20, budget / 50))}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">No trips yet — book one to track your budget!</p>
                )}
                
                <div className="flex justify-between items-center py-5 border-t border-gray-100">
                  <span className="text-gray-500 font-medium tracking-tight">Total Budget</span>
                  <span className="text-gray-900 font-bold text-3xl tracking-tight">
                    ${myTrips.reduce((sum, t) => sum + (parseInt((t.budget || '0').replace(/[^0-9]/g, '')) || 0), 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#4d7c0f]">
                        <Plane className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-[15px]">Flights (est.)</span>
                    </div>
                    <span className="font-semibold">
                      ${Math.round(myTrips.reduce((s, t) => s + (parseInt((t.budget || '0').replace(/[^0-9]/g, '')) || 0), 0) * 0.35).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#4d7c0f]">
                        <Bed className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-[15px]">Stay (est.)</span>
                    </div>
                    <span className="font-semibold">
                      ${Math.round(myTrips.reduce((s, t) => s + (parseInt((t.budget || '0').replace(/[^0-9]/g, '')) || 0), 0) * 0.30).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Link to="/budget" className="block w-full py-3 text-center text-[#4d7c0f] font-semibold tracking-wide border-2 border-gray-200 rounded-xl hover:border-[#65a30d] hover:bg-[#65a30d]/5 transition-colors mt-6">
                  View Full Report
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-[#65a30d] text-white px-6 py-4 rounded-full shadow-lg hover:bg-[#4d7c0f] hover:-translate-y-1 transition-all group border border-transparent">
          <Plus className="w-5 h-5" />
          <span className="font-semibold text-[15px]">Plan a trip</span>
        </button>

        {/* Destination Detail & Booking Modal */}
        {selectedDest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDest(null)} />
            <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <button onClick={() => setSelectedDest(null)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>

              {/* Hero Image */}
              <div className="h-64 relative">
                <img src={selectedDest.image} alt={selectedDest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h2 className="text-3xl font-bold text-white">{selectedDest.name}, {selectedDest.country}</h2>
                  <div className="flex items-center gap-3 mt-2 text-white/80 text-sm">
                    {selectedDest.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{selectedDest.rating}</span>}
                    {selectedDest.visitors && <span>{selectedDest.visitors.toLocaleString()} visitors</span>}
                    {selectedDest.region && <span className="bg-white/20 px-2 py-0.5 rounded-full">{selectedDest.region}</span>}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {bookingStep === 'details' && (
                  <>
                    <p className="text-gray-700 leading-relaxed mb-6">{selectedDest.description}</p>
                    {selectedDest.avgDailyCost && (
                      <div className="flex items-center gap-4 mb-6 p-4 bg-[#65a30d]/5 rounded-xl border border-[#65a30d]/20">
                        <DollarSign className="w-5 h-5 text-[#65a30d]" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Avg. Daily Cost: ${selectedDest.avgDailyCost}</p>
                          <p className="text-xs text-gray-500">{selectedDest.costIndex} destination</p>
                        </div>
                      </div>
                    )}
                    {selectedDest.events?.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Upcoming Events</h3>
                        <div className="space-y-2">
                          {selectedDest.events.map((ev: any) => (
                            <div key={ev.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{ev.name}</p>
                                <p className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {ev.type}</p>
                              </div>
                              <span className="text-xs text-gray-400">{ev.attendees?.toLocaleString()} attendees</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={() => setBookingStep('form')} className="w-full py-3.5 bg-[#65a30d] text-white rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors shadow-lg shadow-[#65a30d]/20">
                      Book This Destination
                    </button>
                  </>
                )}

                {bookingStep === 'form' && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Confirm Your Booking</h3>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                        <input type="date" value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Travelers</label>
                        <select value={bookingData.travelers} onChange={e => setBookingData({...bookingData, travelers: parseInt(e.target.value)})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65a30d] focus:border-transparent outline-none">
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} traveler{n>1?'s':''}</option>)}
                        </select>
                      </div>
                      {selectedDest.avgDailyCost && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex justify-between text-sm"><span className="text-gray-500">Estimated cost per day</span><span className="font-semibold">${selectedDest.avgDailyCost} × {bookingData.travelers}</span></div>
                          <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200"><span>Est. Daily Total</span><span className="text-[#65a30d]">${selectedDest.avgDailyCost * bookingData.travelers}</span></div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setBookingStep('details')} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">Back</button>
                      <button disabled={!bookingData.date || bookingSaving} onClick={async () => {
                        setBookingSaving(true);
                        try {
                          const bookingRef = doc(firestoreCollection(db, 'bookings'));
                          const travelDate = new Date(bookingData.date);
                          const endDate = new Date(travelDate);
                          endDate.setDate(endDate.getDate() + 7);
                          const amount = `$${(selectedDest.avgDailyCost || 100) * bookingData.travelers}`;

                          // Save booking
                          await setDoc(bookingRef, {
                            id: bookingRef.id,
                            user: currentUser?.displayName || currentUser?.email || 'Guest',
                            email: currentUser?.email || '',
                            trip: `Trip to ${selectedDest.name}`,
                            destination: `${selectedDest.name}, ${selectedDest.country}`,
                            date: bookingData.date,
                            travelers: bookingData.travelers,
                            amount,
                            status: 'confirmed',
                            avatar: currentUser?.displayName?.charAt(0) || 'G',
                            createdAt: new Date().toISOString(),
                          });

                          // Also create an itinerary so it shows on My Trips & Itineraries page
                          const itineraryRef = doc(firestoreCollection(db, 'itineraries'));
                          await setDoc(itineraryRef, {
                            id: itineraryRef.id,
                            userId: currentUser?.uid || 'anonymous',
                            title: `Trip to ${selectedDest.name}`,
                            destination: `${selectedDest.name}, ${selectedDest.country}`,
                            startDate: bookingData.date,
                            endDate: endDate.toISOString().split('T')[0],
                            budget: amount,
                            status: 'Upcoming',
                            description: selectedDest.description || '',
                            image: selectedDest.image || '',
                            imageUrl: selectedDest.image || '',
                            travelers: bookingData.travelers,
                            bookingId: bookingRef.id,
                            createdAt: new Date().toISOString(),
                          });

                          setBookingStep('confirmed');
                        } catch (err) { console.error('Booking failed:', err); }
                        finally { setBookingSaving(false); }
                      }} className="flex-1 py-3 bg-[#65a30d] text-white rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors disabled:opacity-50 shadow-lg shadow-[#65a30d]/20">
                        {bookingSaving ? 'Confirming...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </>
                )}

                {bookingStep === 'confirmed' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-[#65a30d]/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#65a30d]" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-gray-500 mb-1">Your trip to <strong>{selectedDest.name}, {selectedDest.country}</strong> is booked.</p>
                    <p className="text-gray-400 text-sm mb-6">Date: {new Date(bookingData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {bookingData.travelers} traveler{bookingData.travelers>1?'s':''}</p>
                    <button onClick={() => { setSelectedDest(null); setBookingData({ travelers: 1, date: '' }); }} className="px-8 py-3 bg-[#65a30d] text-white rounded-xl font-semibold hover:bg-[#4d7c0f] transition-colors">Done</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
      
      </>
  );
}
