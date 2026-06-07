import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Shield,
  Ban, Trash2, Eye, MapPin, Calendar, X,
  ChevronLeft, ChevronRight, UserCheck, UserX, Loader2
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface UserData {
  id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  joinDate: string;
  status: 'active' | 'suspended';
  role: 'user' | 'admin';
  trips: number;
  avatar: string;
}



export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserData>>({
    name: '', email: '', city: '', country: '', role: 'user', status: 'active', trips: 0, avatar: ''
  });

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers: UserData[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedUsers.push({ id: docSnap.id, ...docSnap.data() } as UserData);
      });
      
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (id: string, updates: Partial<UserData>) => {
    try {
      await updateDoc(doc(db, 'users', id), updates);
      await fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      await fetchUsers();
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) return;
    try {
      const newDocRef = doc(collection(db, 'users'));
      const userToAdd = {
        ...newUser,
        id: newDocRef.id,
        joinDate: new Date().toISOString(),
        avatar: newUser.avatar || newUser.name.charAt(0).toUpperCase()
      };
      await setDoc(newDocRef, userToAdd);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', city: '', country: '', role: 'user', status: 'active', trips: 0, avatar: '' });
      fetchUsers();
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.city || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage all platform users, roles, and permissions.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'suspended'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: UserCheck, color: 'text-cyan-400' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: 'text-emerald-400' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: UserX, color: 'text-red-400' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-violet-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-lg font-bold text-white">{loading ? '-' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Trips</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length > 0 ? filtered.map((user) => (
                <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
                        {user.avatar || (user.name ? user.name.charAt(0) : '?')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.city}, {user.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-600'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-300 font-medium">{user.trips || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleUpdateUser(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })} className="p-1.5 rounded-md text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all" title="Toggle Role">
                        <Shield className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleUpdateUser(user.id, { status: user.status === 'active' ? 'suspended' : 'active' })} className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Toggle Status">
                        <Ban className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
          <p className="text-sm text-slate-500">Showing {filtered.length} of {users.length} users</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-all ${
                p === 1 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}>
                {p}
              </button>
            ))}
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-lg p-8 shadow-2xl">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white rounded-md hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">Full User Information</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white">
                {selectedUser.avatar}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Login Name', value: selectedUser.email.split('@')[0] },
                { label: 'Full Name', value: selectedUser.name },
                { label: 'Email Address', value: selectedUser.email },
                { label: 'City', value: selectedUser.city },
                { label: 'Country', value: selectedUser.country },
                { label: 'Status', value: selectedUser.status },
                { label: 'Role', value: selectedUser.role },
                { label: 'Total Trips', value: String(selectedUser.trips) },
              ].map((field) => (
                <div key={field.label} className="flex items-center justify-between py-2 border-b border-slate-800">
                  <span className="text-sm text-slate-400">{field.label}</span>
                  <span className="text-sm font-medium text-white capitalize">{field.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => handleUpdateUser(selectedUser.id, { role: selectedUser.role === 'admin' ? 'user' : 'admin' })} className="flex-1 py-2.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 text-sm font-semibold hover:bg-violet-500/20 transition-all flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> {selectedUser.role === 'admin' ? 'Demote' : 'Promote'}
              </button>
              <button onClick={() => handleUpdateUser(selectedUser.id, { status: selectedUser.status === 'active' ? 'suspended' : 'active' })} className="flex-1 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-semibold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2">
                <Ban className="w-4 h-4" /> {selectedUser.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
              <button onClick={() => handleDeleteUser(selectedUser.id)} className="flex-1 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">City</label>
                  <input type="text" value={newUser.city} onChange={e => setNewUser({...newUser, city: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Country</label>
                  <input type="text" value={newUser.country} onChange={e => setNewUser({...newUser, country: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all">Cancel</button>
                <button onClick={handleAddUser} className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20">Save User</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
