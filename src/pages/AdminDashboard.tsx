import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import { 
  Search, Bell, Download, LayoutDashboard, Users, 
  Building2, Mountain, TrendingUp, ArrowUpRight,
  PlaneTakeoff, DollarSign, MoreHorizontal, Info, Settings
} from 'lucide-react';

export default function AdminDashboard() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#faf9f9]">
      {/* Admin Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="flex justify-between items-center w-full px-6 md:px-16 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-[#4d7c0f] tracking-tight">
              Traveloop
            </Link>
            <nav className="hidden md:flex gap-6 items-center">
              <Link to="/search" className="text-gray-500 hover:text-[#4d7c0f] transition-colors font-medium text-sm">Destinations</Link>
              <Link to="/plan-trip" className="text-gray-500 hover:text-[#4d7c0f] transition-colors font-medium text-sm">Planning</Link>
              <Link to="/itineraries" className="text-gray-500 hover:text-[#4d7c0f] transition-colors font-medium text-sm">Itineraries</Link>
              <Link to="/admin" className="text-[#4d7c0f] font-semibold border-b-2 border-[#4d7c0f] pb-1 text-sm">Admin</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center relative">
              <Search className="absolute left-3 text-gray-400 w-4 h-4 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="w-64 h-10 pl-10 pr-4 rounded-full border border-gray-200 bg-gray-50 text-sm focus:border-[#65a30d] focus:ring-1 focus:ring-[#65a30d] outline-none transition-all text-gray-900"
              />
            </div>
            <button className="text-gray-500 hover:text-[#4d7c0f] transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-100 overflow-hidden border border-gray-200 flex-shrink-0 cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80" 
                alt="Admin Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <button className="hidden md:flex bg-[#65a30d] text-white font-semibold text-sm px-6 py-2 rounded-full hover:bg-[#4d7c0f] shadow-sm transition-all items-center gap-2">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-16 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Platform overview and user analytics.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-2.5 rounded-full border border-[#65a30d] text-[#65a30d] font-semibold text-sm hover:bg-[#f7fee7] transition-all flex items-center gap-2 bg-white">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Pills */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200 pb-6">
          <button className="px-6 py-2.5 rounded-full bg-[#65a30d] text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-gray-200 hover:border-[#65a30d] hover:text-[#65a30d] font-semibold text-sm transition-all flex items-center gap-2">
            <Users className="w-4 h-4" /> Manage Users
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-gray-200 hover:border-[#65a30d] hover:text-[#65a30d] font-semibold text-sm transition-all flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Popular Cities
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-gray-200 hover:border-[#65a30d] hover:text-[#65a30d] font-semibold text-sm transition-all flex items-center gap-2">
            <Mountain className="w-4 h-4" /> Popular Activities
          </button>
          <button className="px-6 py-2.5 rounded-full bg-white text-gray-600 border border-gray-200 hover:border-[#65a30d] hover:text-[#65a30d] font-semibold text-sm transition-all flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Trends & Analytics
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Analytics Main Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[#65a30d] font-semibold text-sm flex items-center">
                    +12% <ArrowUpRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Users</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">24,592</h3>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                    <PlaneTakeoff className="w-6 h-6" />
                  </div>
                  <span className="text-[#65a30d] font-semibold text-sm flex items-center">
                    +8% <ArrowUpRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Trips</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">3,410</h3>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-[#65a30d] font-semibold text-sm flex items-center">
                    +24% <ArrowUpRight className="w-4 h-4 ml-0.5" />
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Revenue (YTD)</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">$1.2M</h3>
                </div>
              </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Line Chart Placeholder */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm md:col-span-2 min-h-[300px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">User Growth & Engagement</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-grow relative bg-[#faf9f9] rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full p-4 relative">
                    <div className="absolute inset-x-4 inset-y-8 flex items-end justify-between opacity-50">
                      <div className="w-px bg-gray-300 h-full absolute left-0 bottom-0"></div>
                      <div className="h-px bg-gray-300 w-full absolute left-0 bottom-0"></div>
                      {/* SVGs line chart */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10" fill="none" stroke="#84cc16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                        <path d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10 L100,100 L0,100 Z" fill="#84cc16" fillOpacity="0.1" stroke="none"></path>
                        <circle cx="20" cy="60" fill="#4d7c0f" r="2"></circle>
                        <circle cx="40" cy="70" fill="#4d7c0f" r="2"></circle>
                        <circle cx="60" cy="30" fill="#4d7c0f" r="2"></circle>
                        <circle cx="80" cy="40" fill="#4d7c0f" r="2"></circle>
                        <circle cx="100" cy="10" fill="#4d7c0f" r="2"></circle>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bar Chart Placeholder */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[280px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Top Destinations</h3>
                </div>
                <div className="flex-grow flex items-end justify-between gap-3 px-2 pt-4 border-b border-l border-gray-200 pb-2 h-40">
                  <div className="w-full bg-[#65a30d] hover:bg-[#4d7c0f] transition-colors rounded-t h-[80%] relative group">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded transition-opacity">Paris</div>
                  </div>
                  <div className="w-full bg-blue-200 hover:bg-blue-300 transition-colors rounded-t h-[60%] relative group">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded transition-opacity">Rome</div>
                  </div>
                  <div className="w-full bg-orange-300 hover:bg-orange-400 transition-colors rounded-t h-[75%] relative group">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded transition-opacity">Tokyo</div>
                  </div>
                  <div className="w-full bg-gray-400 hover:bg-gray-500 transition-colors rounded-t h-[40%] relative group">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded transition-opacity">Bali</div>
                  </div>
                  <div className="w-full bg-gray-200 hover:bg-gray-300 transition-colors rounded-t h-[50%] relative group">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded transition-opacity">NYC</div>
                  </div>
                </div>
                <div className="flex justify-between px-2 mt-3 text-xs font-semibold text-gray-500">
                  <span>PAR</span>
                  <span>ROM</span>
                  <span>TYO</span>
                  <span>DPS</span>
                  <span>NYC</span>
                </div>
              </div>

              {/* Pie Chart Placeholder */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[280px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Activity Distribution</h3>
                </div>
                <div className="flex-grow flex items-center justify-center relative">
                  <div className="w-36 h-36 rounded-full border-[18px] border-gray-100 relative">
                    <div className="absolute inset-[-18px] rounded-full border-[18px] border-[#65a30d]" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 50% 100%)' }}></div>
                    <div className="absolute inset-[-18px] rounded-full border-[18px] border-blue-200" style={{ clipPath: 'polygon(50% 50%, 0 100%, 0 0, 50% 0)', transform: 'rotate(45deg)' }}></div>
                    <div className="absolute inset-[-18px] rounded-full border-[18px] border-orange-300" style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0)', transform: 'rotate(-45deg)' }}></div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#65a30d]"></div> Cultural</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-200"></div> Adventure</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-300"></div> Relaxation</div>
                </div>
              </div>

            </div>
          </div>

          {/* Descriptive Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-gray-100/50 rounded-2xl p-8 border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-[#65a30d]" /> Module Guide
              </h2>
              
              <div className="space-y-6">
                <div className="border-l-2 border-[#65a30d] pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1.5">Manage Users</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    This section is responsible for managing platform users and their permissions. Monitor account statuses, review recent sign-ups, and manage access levels to ensure platform integrity.
                  </p>
                </div>
                
                <div className="border-l-2 border-blue-300 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1.5">Popular Cities</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    View lists of the most frequently visited cities based on current user itineraries. Use this data to feature specific destinations or target marketing campaigns effectively.
                  </p>
                </div>
                
                <div className="border-l-2 border-orange-300 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1.5">Popular Activities</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Analyze the types of activities users are booking or adding to their trips. Helps in understanding user intent, from adventure sports to cultural museum tours.
                  </p>
                </div>
                
                <div className="border-l-2 border-gray-400 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-1.5">User Trends & Analytics</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    This section focuses on providing deep analytical insights across various metrics. Track seasonal booking variations, demographic shifts, and platform engagement over time.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-base hover:bg-white transition-colors flex justify-center items-center gap-2 shadow-sm">
                  <Settings className="w-5 h-5" /> Advanced Settings
                </button>
              </div>
            </div>
          </aside>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
