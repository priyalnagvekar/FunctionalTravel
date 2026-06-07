import React, { useState, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, ArrowUpDown, 
  Image as ImageIcon, MapPin, Globe, Heart, 
  MessageCircle, Share2, Users, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import { rtdb } from '../firebase';

interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  location: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: number;
}

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const postsRef = ref(rtdb, 'community_posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsList = Object.entries(data).map(([id, value]: [string, any]) => ({
          id,
          ...value
        })).sort((a, b) => b.createdAt - a.createdAt);
        setPosts(postsList);
      } else {
        setPosts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const postsRef = ref(rtdb, 'community_posts');
      const newPostRef = push(postsRef);
      await set(newPostRef, {
        authorName: 'Current User', // Mock user
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
        location: 'Earth',
        content: newPostContent,
        tags: [],
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });
      setNewPostContent('');
    } catch (error) {
      console.error('Error adding post: ', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (post: Post) => {
    const postRef = ref(rtdb, `community_posts/${post.id}/likes`);
    await set(postRef, post.likes + 1);
  };

  const timeAgo = (timestamp: number) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <>
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col gap-10">
        
        {/* Header & Search Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Community Hub</h1>
            <p className="text-gray-600 text-[15px] md:text-base max-w-2xl">
              Connect with fellow travelers, share experiences, and find inspiration for your next adventure.
            </p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search experiences, places..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#65a30d] focus:ring-1 focus:ring-[#65a30d] outline-none transition-colors text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 font-medium whitespace-nowrap shadow-sm">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 font-medium whitespace-nowrap shadow-sm">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Feed Section */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Create Post Input */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80" 
                    alt="Current User Avatar" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-grow">
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your latest travel story..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3 focus:outline-none focus:ring-2 focus:ring-[#65a30d]/50 focus:border-[#65a30d] text-gray-900 resize-none h-24 placeholder-gray-400 text-[15px]" 
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-[#65a30d] transition-colors p-2 rounded-full hover:bg-gray-50 bg-white border border-gray-200 shadow-sm">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="text-gray-400 hover:text-[#65a30d] transition-colors p-2 rounded-full hover:bg-gray-50 bg-white border border-gray-200 shadow-sm">
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                      onClick={handlePost}
                      disabled={isPosting || !newPostContent.trim()}
                      className="bg-[#65a30d] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#4d7c0f] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed Posts */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#65a30d] animate-spin" />
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 pb-4 flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100">
                      <img 
                        src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}&background=random`} 
                        alt={post.authorName} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{post.authorName}</h3>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                        <Globe className="w-3.5 h-3.5" /> 
                        {timeAgo(post.createdAt)} in <a href="#" className="text-[#65a30d] hover:underline">{post.location}</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-4 text-gray-700 text-[15px] leading-relaxed">
                    <p className={post.tags?.length ? 'mb-4' : ''}>
                      {post.content}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-[#ecfccb] text-[#4d7c0f] rounded-full text-xs font-semibold">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {post.imageUrl && (
                    <div className="w-full h-64 sm:h-96 overflow-hidden bg-gray-100">
                      <img 
                        src={post.imageUrl} 
                        alt="Post Image" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  
                  <div className={`px-6 py-4 flex justify-between items-center ${!post.imageUrl && 'border-t border-gray-100'}`}>
                    <div className="flex gap-6">
                      <button onClick={() => handleLike(post)} className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors font-medium text-sm">
                        <Heart className="w-5 h-5" /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#65a30d] transition-colors font-medium text-sm">
                        <MessageCircle className="w-5 h-5" /> {post.comments} Responses
                      </button>
                    </div>
                    <button className="text-gray-400 hover:text-gray-900 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share your travel experience!</p>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            
            {/* About Community Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-6 h-6 text-[#65a30d]" />
                About Community
              </h2>
              <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                Community section where all the users can share their experience about a certain trip or activity. Using the search, group by or filter and sort by option, the user can narrow down the result that he is looking for.
              </p>
              <button className="w-full font-semibold text-[15px] bg-white border-2 border-gray-900 text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                Read Guidelines
              </button>
            </div>

            {/* Trending Discussions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Trending Discussions</h2>
              
              <div className="flex flex-col gap-5">
                <a href="#" className="group block">
                  <h4 className="font-semibold text-gray-900 group-hover:text-[#65a30d] transition-colors line-clamp-1 mb-1">
                    Best hidden cafes in Paris?
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">45 replies · Active 2h ago</p>
                </a>
                
                <a href="#" className="group block">
                  <h4 className="font-semibold text-gray-900 group-hover:text-[#65a30d] transition-colors line-clamp-1 mb-1">
                    Solo female travel tips for Southeast Asia
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">128 replies · Active 5m ago</p>
                </a>
                
                <a href="#" className="group block">
                  <h4 className="font-semibold text-gray-900 group-hover:text-[#65a30d] transition-colors line-clamp-1 mb-1">
                    Packing list for 2 weeks in Iceland
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">82 replies · Active 1h ago</p>
                </a>
              </div>
            </div>

          </aside>

        </div>
      </main>
      
      </>
  );
}
