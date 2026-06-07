/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import BuildItinerary from './pages/BuildItinerary';
import PlanTrip from './pages/PlanTrip';
import Profile from './pages/Profile';
import Itineraries from './pages/Itineraries';
import ActivitySearch from './pages/ActivitySearch';
import ItineraryView from './pages/ItineraryView';
import PackingChecklist from './pages/PackingChecklist';
import Notifications from './pages/Notifications';
import TripNotes from './pages/TripNotes';
import TripTimeline from './pages/TripTimeline';
import ExpenseInvoice from './pages/ExpenseInvoice';
import Community from './pages/Community';
import CitySearch from './pages/CitySearch';
import SharedItinerary from './pages/SharedItinerary';
import Budget from './pages/Budget';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminLogin from './pages/admin/AdminLogin';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTrips from './pages/admin/AdminTrips';
import AdminActivities from './pages/admin/AdminActivities';
import AdminDestinations from './pages/admin/AdminDestinations';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookmarks from './pages/admin/AdminBookmarks';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Public Shared Itinerary (no auth, no layout) */}
          <Route path="/shared/:itineraryId" element={<SharedItinerary />} />

          {/* User-facing App (green theme, Header + Footer) */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<ActivitySearch />} />
            <Route path="/community" element={<Community />} />
            
            {/* Protected User Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/build-itinerary" element={<BuildItinerary />} />
              <Route path="/plan-trip" element={<PlanTrip />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/itineraries" element={<Itineraries />} />
              <Route path="/itinerary-view" element={<ItineraryView />} />
              <Route path="/packing" element={<PackingChecklist />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notes" element={<TripNotes />} />
              <Route path="/timeline" element={<TripTimeline />} />
              <Route path="/invoice" element={<ExpenseInvoice />} />
              <Route path="/city-search" element={<CitySearch />} />
              <Route path="/budget" element={<Budget />} />
            </Route>
          </Route>

          {/* Admin Panel (dark theme, Sidebar layout — completely separate) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="trips" element={<AdminTrips />} />
              <Route path="activities" element={<AdminActivities />} />
              <Route path="destinations" element={<AdminDestinations />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="bookmarks" element={<AdminBookmarks />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
