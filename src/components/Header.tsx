import { Bell, Menu, Search, Compass } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Compass className="w-8 h-8 text-[#65a30d]" />
            <Link to="/" className="text-2xl font-bold text-[#4d7c0f]">
              FunctionalTrazz
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/search" 
              className={`${isActive('/search') ? 'text-[#4d7c0f] font-semibold border-b-2 border-[#4d7c0f]' : 'text-gray-500 hover:text-[#4d7c0f] font-medium'} pb-1 transition-colors`}
            >
              Activities
            </Link>
            <Link 
              to="/city-search" 
              className={`${isActive('/city-search') ? 'text-[#4d7c0f] font-semibold border-b-2 border-[#4d7c0f]' : 'text-gray-500 hover:text-[#4d7c0f] font-medium'} pb-1 transition-colors`}
            >
              Cities
            </Link>
            <Link 
              to="/plan-trip" 
              className={`${isActive('/plan-trip') || isActive('/build-itinerary') || isActive('/planning') || isActive('/packing') || isActive('/notes') || isActive('/timeline') || isActive('/invoice') ? 'text-[#4d7c0f] font-semibold border-b-2 border-[#4d7c0f]' : 'text-gray-500 hover:text-[#4d7c0f] font-medium'} pb-1 transition-colors`}
            >
              Planning
            </Link>
            <Link 
              to="/itineraries" 
              className={`${isActive('/itineraries') || isActive('/itinerary-view') ? 'text-[#4d7c0f] font-semibold border-b-2 border-[#4d7c0f]' : 'text-gray-500 hover:text-[#4d7c0f] font-medium'} pb-1 transition-colors`}
            >
              Itineraries
            </Link>
            <Link 
              to="/community" 
              className={`${isActive('/community') ? 'text-[#4d7c0f] font-semibold border-b-2 border-[#4d7c0f]' : 'text-gray-500 hover:text-[#4d7c0f] font-medium'} pb-1 transition-colors`}
            >
              Community
            </Link>
            <Link 
              to="/profile" 
              className={`${isActive('/profile') ? 'text-[#4d7c0f] font-semibold border-b-2 border-[#4d7c0f]' : 'text-gray-500 hover:text-[#4d7c0f] font-medium'} pb-1 transition-colors`}
            >
              Profile
            </Link>

          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2 text-gray-500">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-2 w-2 h-2 bg-[#65a30d] rounded-full"></span>
              </Link>
            </div>
            
            <div className="hidden sm:flex items-center space-x-3">
              {currentUser ? (
                <>
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                      title={currentUser.email || ''}
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {currentUser.email}
                    </span>
                  )}
                  <button
                    onClick={logout}
                    className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
              )}
              <button className="px-5 py-2.5 bg-[#65a30d] text-white rounded-lg font-medium hover:bg-[#4d7c0f] transition-all shadow-sm">
                Book Now
              </button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
