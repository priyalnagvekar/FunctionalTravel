import React, { useState, useEffect } from 'react';
import {
  Users, PlaneTakeoff, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Eye, Plus,
  MapPin, Clock, Star, Activity, Database, Loader2, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { seedAllCollections, getCollectionStats, SeedResult } from '../../utils/seedData';

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState('');
  const [seedResults, setSeedResults] = useState<SeedResult[] | null>(null);
  const [seedError, setSeedError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const s = await getCollectionStats();
      setStats(s);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('This will add sample data to your Firestore database. Existing documents with the same IDs will be overwritten. Continue?')) return;
    setSeeding(true);
    setSeedResults(null);
    setSeedError('');
    try {
      const results = await seedAllCollections((msg) => setSeedProgress(msg));
      setSeedResults(results);
      setSeedProgress('');
      await loadStats();
    } catch (err: any) {
      console.error('Seed failed:', err);
      setSeedError(err.message || 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const totalDocs = Object.values(stats).reduce((a, b) => a + b, 0);
  const isEmpty = totalDocs === 0;

  const kpiCards = [
    { label: 'Total Users', value: loadingStats ? '...' : String(stats.users || 0), icon: Users, color: 'cyan' },
    { label: 'Active Trips', value: loadingStats ? '...' : String(stats.itineraries || 0), icon: PlaneTakeoff, color: 'violet' },
    { label: 'Destinations', value: loadingStats ? '...' : String(stats.destinations || 0), icon: MapPin, color: 'emerald' },
    { label: 'Activities', value: loadingStats ? '...' : String(stats.activities || 0), icon: Activity, color: 'amber' },
  ];

  const recentActivities = [
    { user: 'Sarah Chen', action: 'booked a trip to', target: 'Bali, Indonesia', time: '2 min ago', avatar: 'S' },
    { user: 'Alex Morgan', action: 'registered a new account', target: '', time: '8 min ago', avatar: 'A' },
    { user: 'James Wilson', action: 'left a review for', target: 'Tokyo Tour', time: '15 min ago', avatar: 'J' },
    { user: 'Maria Garcia', action: 'updated itinerary for', target: 'Paris Trip', time: '22 min ago', avatar: 'M' },
    { user: 'David Lee', action: 'booked a trip to', target: 'Rome, Italy', time: '30 min ago', avatar: 'D' },
    { user: 'Emma Brown', action: 'cancelled booking for', target: 'NYC Getaway', time: '45 min ago', avatar: 'E' },
  ];

  const topDestinations = [
    { name: 'Paris, France', bookings: 1248, rating: 4.9, trend: '+15%' },
    { name: 'Tokyo, Japan', bookings: 1102, rating: 4.8, trend: '+22%' },
    { name: 'Bali, Indonesia', bookings: 986, rating: 4.7, trend: '+8%' },
    { name: 'Rome, Italy', bookings: 874, rating: 4.8, trend: '+12%' },
    { name: 'New York, USA', bookings: 762, rating: 4.6, trend: '+5%' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-all flex items-center gap-2">
            <Eye className="w-4 h-4" /> View Site
          </button>
          <button onClick={() => navigate('/admin/trips')} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
            <Plus className="w-4 h-4" /> New Trip
          </button>
        </div>
      </div>

      {/* Seed Data Card — prominent when database is empty */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${
        isEmpty && !loadingStats
          ? 'bg-gradient-to-r from-cyan-950/50 via-slate-900 to-violet-950/50 border-cyan-500/30 ring-1 ring-cyan-500/10'
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isEmpty && !loadingStats
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Database Seeder</h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  {isEmpty && !loadingStats
                    ? 'Your database is empty. Seed it with sample data to get started, or add content manually from each admin section.'
                    : `${totalDocs} documents across ${Object.keys(stats).length} collections.`}
                </p>
                {/* Collection breakdown */}
                {!loadingStats && totalDocs > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {Object.entries(stats).map(([name, count]) => (
                      <span key={name} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 capitalize">
                        {name}: <strong className="text-white">{count}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 flex-shrink-0 ${
                isEmpty && !loadingStats
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              } disabled:opacity-50`}
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {seeding ? seedProgress || 'Seeding...' : isEmpty && !loadingStats ? 'Seed Database Now' : 'Re-seed Data'}
            </button>
          </div>

          {/* Seed Results */}
          {seedResults && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Seeding complete!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {seedResults.map(r => (
                  <div key={r.collection} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <p className="text-xs text-slate-400 capitalize">{r.collection}</p>
                    <p className="text-lg font-bold text-white">{r.existing}</p>
                    <p className="text-[10px] text-emerald-400">+{r.seeded} seeded</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {seedError && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{seedError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden h-48 lg:h-56 bg-gradient-to-r from-slate-900 via-cyan-950 to-violet-950 border border-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8 lg:px-12">
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-2">Platform Report — May 2026</p>
          <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3">Travel season is booming 🚀</h2>
          <p className="text-slate-300 text-sm lg:text-base max-w-xl">Bookings are up 24% this quarter. New user sign-ups increased significantly across all regions.</p>
        </div>
      </div>

      {/* KPI Cards — now dynamic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                kpi.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                kpi.color === 'violet' ? 'bg-violet-500/10 text-violet-400' :
                kpi.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-slate-400 text-sm">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">User Growth & Engagement</h3>
            <div className="flex gap-2">
              {['7D', '1M', '3M', '1Y'].map((p) => (
                <button key={p} className={`px-3 py-1 rounded-md text-xs font-medium ${p === '1M' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-52 relative">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 80, 120, 160].map((y) => (
                <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#1e293b" strokeWidth="1" />
              ))}
              <path d="M0,160 L60,140 L120,120 L180,130 L240,90 L300,100 L360,60 L420,70 L480,40 L540,50 L600,20 L600,200 L0,200 Z" fill="url(#chartGrad)" />
              <path d="M0,160 L60,140 L120,120 L180,130 L240,90 L300,100 L360,60 L420,70 L480,40 L540,50 L600,20" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {[[0,160],[60,140],[120,120],[180,130],[240,90],[300,100],[360,60],[420,70],[480,40],[540,50],[600,20]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              ))}
            </svg>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-6">Activity Distribution</h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="20" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#06b6d4" strokeWidth="20" strokeDasharray="100.53 251.33" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="62.83 251.33" strokeDashoffset="-100.53" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="50.27 251.33" strokeDashoffset="-163.36" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="37.70 251.33" strokeDashoffset="-213.63" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{stats.activities || 0}</span>
                <span className="text-xs text-slate-400">Total</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { color: 'bg-cyan-400', label: 'Cultural', pct: '40%' },
              { color: 'bg-violet-500', label: 'Adventure', pct: '25%' },
              { color: 'bg-amber-400', label: 'Relaxation', pct: '20%' },
              { color: 'bg-emerald-500', label: 'Culinary', pct: '15%' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-xs font-semibold text-slate-300 ml-auto">{item.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> Recent Activity
            </h3>
            <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-white">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    {activity.target && <span className="text-cyan-400">{activity.target}</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-400" /> Top Destinations
            </h3>
            <button onClick={() => navigate('/admin/destinations')} className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">View All</button>
          </div>
          <div className="space-y-3">
            {topDestinations.map((dest, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-800/50 transition-all group">
                <span className="text-lg font-bold text-slate-600 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{dest.name}</p>
                  <p className="text-xs text-slate-500">{dest.bookings.toLocaleString()} bookings</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-semibold">{dest.rating}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">{dest.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
