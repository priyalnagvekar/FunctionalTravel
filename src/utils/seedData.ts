import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

const seedUsers = [
  { id: 'seed_u1', name: 'Sarah Chen', email: 'sarah.chen@email.com', city: 'San Francisco', country: 'USA', joinDate: '2025-12-04', status: 'active', role: 'user', trips: 12, avatar: 'SC' },
  { id: 'seed_u2', name: 'Alex Morgan', email: 'alex.morgan@email.com', city: 'London', country: 'UK', joinDate: '2026-01-15', status: 'active', role: 'admin', trips: 8, avatar: 'AM' },
  { id: 'seed_u3', name: 'James Wilson', email: 'james.w@email.com', city: 'Sydney', country: 'Australia', joinDate: '2026-02-20', status: 'active', role: 'user', trips: 3, avatar: 'JW' },
  { id: 'seed_u4', name: 'Maria Garcia', email: 'maria.g@email.com', city: 'Madrid', country: 'Spain', joinDate: '2026-03-08', status: 'active', role: 'user', trips: 15, avatar: 'MG' },
  { id: 'seed_u5', name: 'David Lee', email: 'david.lee@email.com', city: 'Seoul', country: 'South Korea', joinDate: '2026-01-30', status: 'active', role: 'user', trips: 6, avatar: 'DL' },
  { id: 'seed_u6', name: 'Emma Brown', email: 'emma.b@email.com', city: 'Toronto', country: 'Canada', joinDate: '2026-04-12', status: 'active', role: 'user', trips: 2, avatar: 'EB' },
  { id: 'seed_u7', name: 'Raj Patel', email: 'raj.patel@email.com', city: 'Mumbai', country: 'India', joinDate: '2026-02-28', status: 'active', role: 'user', trips: 9, avatar: 'RP' },
  { id: 'seed_u8', name: 'Lisa Tanaka', email: 'lisa.t@email.com', city: 'Tokyo', country: 'Japan', joinDate: '2026-03-22', status: 'active', role: 'user', trips: 0, avatar: 'LT' },
];

const seedActivities = [
  { id: 'seed_a1', name: 'Eiffel Tower Guided Tour', description: 'Skip the line and explore all three levels of the iconic Eiffel Tower with a knowledgeable guide.', category: 'Cultural', location: 'Paris, France', duration: '3 hours', price: '$45', rating: 4.9, status: 'active', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce65f4?auto=format&fit=crop&q=80&w=300' },
  { id: 'seed_a2', name: 'Bali Sunrise Trek', description: 'Hike to the summit of Mount Batur for a breathtaking sunrise view over the volcanic landscape.', category: 'Adventure', location: 'Bali, Indonesia', duration: '6 hours', price: '$35', rating: 4.8, status: 'active', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=300' },
  { id: 'seed_a3', name: 'Tokyo Sushi Masterclass', description: 'Learn to prepare authentic sushi from a trained chef in a traditional Tokyo kitchen.', category: 'Culinary', location: 'Tokyo, Japan', duration: '2 hours', price: '$80', rating: 4.7, status: 'active', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=300' },
  { id: 'seed_a4', name: 'Rome Colosseum Night Tour', description: 'Explore the Colosseum after dark with dramatic lighting and fewer crowds.', category: 'Cultural', location: 'Rome, Italy', duration: '2.5 hours', price: '$55', rating: 4.6, status: 'active', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=300' },
  { id: 'seed_a5', name: 'NYC Helicopter Tour', description: "See Manhattan's skyline from above on a thrilling helicopter ride.", category: 'Adventure', location: 'New York, USA', duration: '30 min', price: '$200', rating: 4.9, status: 'active', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80&w=300' },
  { id: 'seed_a6', name: 'Santorini Wine Tasting', description: 'Visit three local wineries and taste volcanic wines with stunning caldera views.', category: 'Culinary', location: 'Santorini, Greece', duration: '4 hours', price: '$60', rating: 4.5, status: 'active', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=300' },
];

const seedDestinations = [
  {
    id: 'seed_d1', name: 'Paris', country: 'France', description: 'The City of Light offers world-class art, architecture, and gastronomy.',
    featured: true, visitors: 12480, rating: 4.9, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400',
    events: [
      { id: 'e1', name: 'Paris Fashion Week', date: '2026-09-28', type: 'Cultural', attendees: 5200 },
      { id: 'e2', name: 'Bastille Day Festival', date: '2026-07-14', type: 'Festival', attendees: 18000 },
      { id: 'e3', name: 'Nuit Blanche Art Walk', date: '2026-10-01', type: 'Art', attendees: 8400 },
    ],
    region: 'Europe', costIndex: 'Expensive', avgDailyCost: 150,
  },
  {
    id: 'seed_d2', name: 'Tokyo', country: 'Japan', description: 'A vibrant blend of ultra-modern and traditional Japanese culture.',
    featured: true, visitors: 11020, rating: 4.8, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400',
    events: [
      { id: 'e4', name: 'Cherry Blossom Viewing', date: '2026-03-25', type: 'Nature', attendees: 25000 },
      { id: 'e5', name: 'Sumo Grand Tournament', date: '2026-05-10', type: 'Sports', attendees: 11000 },
    ],
    region: 'Asia Pacific', costIndex: 'Expensive', avgDailyCost: 120,
  },
  {
    id: 'seed_d3', name: 'Bali', country: 'Indonesia', description: 'Tropical paradise known for rice terraces, temples, and surf beaches.',
    featured: false, visitors: 9860, rating: 4.7, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400',
    events: [
      { id: 'e6', name: 'Nyepi Day of Silence', date: '2026-03-19', type: 'Cultural', attendees: 3200 },
      { id: 'e7', name: 'Ubud Writers Festival', date: '2026-10-15', type: 'Literary', attendees: 1500 },
    ],
    region: 'Asia Pacific', costIndex: 'Budget', avgDailyCost: 40,
  },
  {
    id: 'seed_d4', name: 'Rome', country: 'Italy', description: 'The Eternal City brims with ancient ruins, Renaissance art, and mouth-watering cuisine.',
    featured: true, visitors: 10340, rating: 4.8, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400',
    events: [
      { id: 'e8', name: 'Rome Film Festival', date: '2026-10-16', type: 'Film', attendees: 6800 },
    ],
    region: 'Europe', costIndex: 'Moderate', avgDailyCost: 100,
  },
  {
    id: 'seed_d5', name: 'New York', country: 'USA', description: 'The city that never sleeps — iconic skyline, Broadway, world-class dining.',
    featured: false, visitors: 14200, rating: 4.6, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400',
    events: [
      { id: 'e9', name: 'NYC Marathon', date: '2026-11-01', type: 'Sports', attendees: 50000 },
      { id: 'e10', name: 'Broadway Week', date: '2026-09-05', type: 'Theater', attendees: 30000 },
    ],
    region: 'North America', costIndex: 'Expensive', avgDailyCost: 180,
  },
];

const seedBookings = [
  { id: 'seed_b1', user: 'Sarah Chen', email: 'sarah.chen@email.com', trip: 'Romantic Paris Getaway', destination: 'Paris, France', date: '2026-04-15', amount: '$2,500', status: 'confirmed', avatar: 'SC' },
  { id: 'seed_b2', user: 'Alex Morgan', email: 'alex.morgan@email.com', trip: 'Tokyo Cultural Immersion', destination: 'Tokyo, Japan', date: '2026-03-20', amount: '$3,200', status: 'completed', avatar: 'AM' },
  { id: 'seed_b3', user: 'Maria Garcia', email: 'maria.g@email.com', trip: 'Bali Beach Retreat', destination: 'Bali, Indonesia', date: '2026-05-01', amount: '$1,800', status: 'pending', avatar: 'MG' },
  { id: 'seed_b4', user: 'David Lee', email: 'david.lee@email.com', trip: 'Rome Ancient Wonders', destination: 'Rome, Italy', date: '2026-06-10', amount: '$2,100', status: 'confirmed', avatar: 'DL' },
  { id: 'seed_b5', user: 'Emma Brown', email: 'emma.b@email.com', trip: 'NYC City Explorer', destination: 'New York, USA', date: '2026-04-28', amount: '$2,800', status: 'cancelled', avatar: 'EB' },
];

const seedBookmarks = [
  { id: 'seed_bm1', user: 'Sarah Chen', userEmail: 'sarah.chen@email.com', tripTitle: 'Romantic Paris Getaway', destination: 'Paris, France', savedDate: '2026-03-10', price: '$2,500', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=300', avatar: 'SC' },
  { id: 'seed_bm2', user: 'Sarah Chen', userEmail: 'sarah.chen@email.com', tripTitle: 'Tokyo Cultural Immersion', destination: 'Tokyo, Japan', savedDate: '2026-03-12', price: '$3,200', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=300', avatar: 'SC' },
  { id: 'seed_bm3', user: 'Alex Morgan', userEmail: 'alex.morgan@email.com', tripTitle: 'Bali Beach Retreat', destination: 'Bali, Indonesia', savedDate: '2026-04-01', price: '$1,800', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=300', avatar: 'AM' },
  { id: 'seed_bm4', user: 'Maria Garcia', userEmail: 'maria.g@email.com', tripTitle: 'Rome Ancient Wonders', destination: 'Rome, Italy', savedDate: '2026-04-05', price: '$2,100', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=300', avatar: 'MG' },
];

const seedItineraries = [
  {
    id: 'seed_t1', title: 'Romantic Paris Getaway', destination: 'Paris, France',
    startDate: '2026-06-15', endDate: '2026-06-22', budget: '$2,500', status: 'published',
    description: 'A week-long romantic escape through the heart of Paris, from Montmartre sunsets to Seine cruises.',
    itinerary: 'Day 1: Arrive, check in, Eiffel Tower at sunset\nDay 2: Louvre Museum & Tuileries Gardens\nDay 3: Montmartre & Sacré-Cœur\nDay 4: Versailles Day Trip\nDay 5: Seine River Cruise & Notre-Dame\nDay 6: Champs-Élysées & Arc de Triomphe\nDay 7: Departure',
    included: 'Hotel (6 nights), Airport transfers, Louvre tickets, Seine cruise, Versailles day pass',
    costDetails: 'Hotel: $1,200 | Flights: $600 | Activities: $400 | Food: $300',
    insights: 'Book Louvre tickets in advance to skip the line. Visit Eiffel Tower at sunset for fewer crowds.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'seed_t2', title: 'Tokyo Cultural Immersion', destination: 'Tokyo, Japan',
    startDate: '2026-04-01', endDate: '2026-04-08', budget: '$3,200', status: 'published',
    description: "Dive deep into Tokyo's blend of ancient traditions and cutting-edge modernity.",
    itinerary: 'Day 1: Shibuya & Harajuku\nDay 2: Senso-ji Temple & Asakusa\nDay 3: Tsukiji Market & Sushi Class\nDay 4: Mt. Fuji Day Trip\nDay 5: Akihabara & TeamLab\nDay 6: Imperial Palace & Ginza\nDay 7: Departure',
    included: 'Hotel (6 nights), JR Pass, Sushi masterclass, Mt. Fuji tour',
    costDetails: 'Hotel: $1,400 | Flights: $900 | JR Pass: $250 | Activities: $350 | Food: $300',
    insights: 'Cherry blossom season peaks late March to early April. Get a Suica card for easy transit.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'seed_t3', title: 'Bali Beach Retreat', destination: 'Bali, Indonesia',
    startDate: '2026-07-10', endDate: '2026-07-17', budget: '$1,800', status: 'published',
    description: 'Relax on pristine beaches, explore ancient temples, and rejuvenate with spa treatments.',
    itinerary: 'Day 1: Arrive Seminyak, beach sunset\nDay 2: Ubud rice terraces & monkey forest\nDay 3: Mt. Batur sunrise trek\nDay 4: Uluwatu Temple & Kecak dance\nDay 5: Nusa Penida day trip\nDay 6: Spa & cooking class\nDay 7: Departure',
    included: 'Villa (6 nights), Airport transfers, Sunrise trek, Nusa Penida boat, Cooking class',
    costDetails: 'Villa: $600 | Flights: $500 | Activities: $300 | Food: $200 | Spa: $200',
    insights: 'Dry season (April–October) is the best time. Rent a scooter for flexibility.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'seed_t4', title: 'NYC City Explorer', destination: 'New York, USA',
    startDate: '2026-09-05', endDate: '2026-09-10', budget: '$2,800', status: 'draft',
    description: 'Experience the electric energy of New York City — Broadway, Central Park, and world-class dining.',
    itinerary: 'Day 1: Times Square & Broadway show\nDay 2: Statue of Liberty & Ellis Island\nDay 3: Central Park & MoMA\nDay 4: Brooklyn Bridge & DUMBO\nDay 5: 5th Avenue shopping & departure',
    included: 'Hotel (4 nights), Broadway ticket, Statue of Liberty ferry, MoMA pass',
    costDetails: 'Hotel: $1,200 | Flights: $500 | Broadway: $250 | Activities: $350 | Food: $500',
    insights: 'Get a MetroCard for unlimited subway rides. Book Broadway tickets via lottery for discounts.',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=600',
  },
];

async function seedCollection(collectionName: string, items: any[]): Promise<number> {
  const batch = writeBatch(db);
  let count = 0;
  for (const item of items) {
    const docRef = doc(db, collectionName, item.id);
    batch.set(docRef, item);
    count++;
  }
  await batch.commit();
  return count;
}

async function getCollectionCount(collectionName: string): Promise<number> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.size;
}

export interface SeedResult {
  collection: string;
  seeded: number;
  existing: number;
}

export async function seedAllCollections(onProgress?: (msg: string) => void): Promise<SeedResult[]> {
  const results: SeedResult[] = [];

  const collections = [
    { name: 'users', data: seedUsers },
    { name: 'activities', data: seedActivities },
    { name: 'destinations', data: seedDestinations },
    { name: 'bookings', data: seedBookings },
    { name: 'bookmarks', data: seedBookmarks },
    { name: 'itineraries', data: seedItineraries },
  ];

  for (const col of collections) {
    onProgress?.(`Seeding ${col.name}...`);
    const existingCount = await getCollectionCount(col.name);
    const seeded = await seedCollection(col.name, col.data);
    const newCount = await getCollectionCount(col.name);
    results.push({ collection: col.name, seeded, existing: newCount });
  }

  return results;
}

export async function getCollectionStats(): Promise<Record<string, number>> {
  const names = ['users', 'activities', 'destinations', 'bookings', 'bookmarks', 'itineraries'];
  const stats: Record<string, number> = {};
  for (const name of names) {
    stats[name] = await getCollectionCount(name);
  }
  return stats;
}
