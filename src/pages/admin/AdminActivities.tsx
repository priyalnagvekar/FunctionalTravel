import React, { useState } from 'react';
import {
  Plus, Search, Edit3, Trash2, MapPin, Clock,
  DollarSign, Star, X, Save, Upload, Loader2
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Activity {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  duration: string;
  price: string;
  rating: number;
  status: 'active' | 'inactive';
  image: string;
}



const categories = ['All', 'Cultural', 'Adventure', 'Culinary', 'Relaxation'];

const emptyActivity: Omit<Activity, 'id'> = {
  name: '', description: '', category: 'Cultural', location: '', duration: '', price: '', rating: 0, status: 'active', image: ''
};

export default function AdminActivities() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyActivity as Activity);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'activities'));
      const fetched: Activity[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as Activity);
      });
      
      setActivities(fetched);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSaveActivity = async () => {
    setSaving(true);
    try {
      if (formData.id) {
        await setDoc(doc(db, 'activities', formData.id), formData, { merge: true });
      } else {
        const newDocRef = doc(collection(db, 'activities'));
        await setDoc(newDocRef, { ...formData, id: newDocRef.id });
      }
      await fetchActivities();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving activity:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteDoc(doc(db, 'activities', id));
      await fetchActivities();
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  const filtered = activities.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Activity Management</h1>
          <p className="text-slate-400 mt-1">Manage activities, tours, and experiences across all destinations.</p>
        </div>
        <button onClick={() => { setFormData({ ...emptyActivity }); setShowForm(true); }}
          className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" /> Add Activity
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input type="text" placeholder="Search activities..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 h-10 pl-10 pr-4 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : filtered.length > 0 ? filtered.map(activity => (
          <div key={activity.id} className="bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden group">
            <div className="h-40 relative overflow-hidden">
              <img src={activity.image} alt={activity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  activity.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-slate-700/90 text-slate-300'
                }`}>{activity.status}</span>
              </div>
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 rounded-md bg-slate-900/80 text-cyan-400 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {activity.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-cyan-400 transition-colors">{activity.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{activity.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{activity.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{activity.price}</span>
                <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-amber-400" />{activity.rating}</span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button onClick={() => { const { id, ...rest } = activity; setFormData(rest); setShowForm(true); }}
                  className="flex-1 py-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-1">
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDeleteActivity(activity.id)} className="flex-1 py-1.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium hover:bg-red-500/20 transition-all flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center text-slate-500 py-8">
            No activities found.
          </div>
        )}
      </div>

      {/* Activity Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white rounded-md hover:bg-slate-800 transition-all">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">{formData.name ? 'Edit Activity' : 'Add New Activity'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Activity Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
                  placeholder="e.g. Eiffel Tower Tour" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-all">
                  <option>Cultural</option><option>Adventure</option><option>Culinary</option><option>Relaxation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
                  placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Duration</label>
                <input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
                  placeholder="e.g. 3 hours" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Price</label>
                <input type="text" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all"
                  placeholder="$45" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-10 px-4 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 focus:border-cyan-500/50 outline-none transition-all">
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 outline-none transition-all resize-none"
                  placeholder="Describe the activity..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Image URL</label>
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
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-800">
              <button onClick={handleSaveActivity} disabled={saving} className="px-6 py-2.5 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                {saving ? 'Saving...' : 'Save Activity'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-sm font-medium hover:bg-slate-700 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
