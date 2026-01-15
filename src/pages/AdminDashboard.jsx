import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast'; // Import toast 
import { 
  Plus, Edit2, Trash2, Clock, Calendar as CalendarIcon, 
  User, X, Loader2, Search, ArrowUpDown 
} from 'lucide-react';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for button loading
  
  // Search and Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('oldest'); // Default to Oldest (upcoming first)

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Get Admin Email from LocalStorage
  const adminEmail = localStorage.getItem('adminEmail') || 'admin@events.com';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    createdBy: adminEmail
  });

  const API_URL = `${process.env.VITE_API_URL}`;

  // HELPER: Convert 24h string (14:30) to 12h string (02:30 PM)
  const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
  };

const fetchEvents = async () => {
  try {
    setLoading(true);
    const res = await axios.get(API_URL);
    // If your backend sends { data: [...] } use res.data
    // If it sends { events: [...] } use res.data.events
    setEvents(Array.isArray(res.data) ? res.data : []); 
    setLoading(false);
  } catch (err) {
    console.error("Fetch error:", err);
    setEvents([]); // Reset to empty array on error so it doesn't crash
    toast.error("Failed to load events");
    setLoading(false);
  }
};

  useEffect(() => {
    fetchEvents();
    setFormData(prev => ({ ...prev, createdBy: adminEmail }));
  }, [adminEmail]);

  // UPDATED: Logic for Latest and Oldest sorting
const filteredAndSortedEvents = useMemo(() => {
  // Add Array.isArray check to prevent the crash bruh
  if (!Array.isArray(events)) return []; 

  return events
    .filter(event => 
      event.date.includes(searchTerm) || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'latest') return dateB - dateA;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
}, [events, searchTerm, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading(editingEvent ? "Updating event..." : "Creating event...");

    try {
      const dataToSend = { ...formData, createdBy: adminEmail };
      
      if (editingEvent) {
        await axios.put(`${API_URL}/${editingEvent._id}`, dataToSend);
        toast.success("Event updated successfully!", { id: toastId });
      } else {
        await axios.post(API_URL, dataToSend);
        toast.success("Event created successfully!", { id: toastId });
      }

      setIsModalOpen(false);
      fetchEvents(); 
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong !";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    const toastId = toast.loading("Deleting event...");
    try {
      await axios.delete(`${API_URL}/${eventToDelete}`);
      toast.success("Event deleted!", { id: toastId });
      setIsDeleteModalOpen(false);
      setEventToDelete(null); 
      fetchEvents();
    } catch (err) { 
        toast.error("Delete failed ", { id: toastId }); 
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      date: '', 
      startTime: '', 
      endTime: '', 
      createdBy: adminEmail 
    });
    setEditingEvent(null);
  };

  const isPastEvent = (date) => date < new Date().toISOString().split('T')[0];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-500 font-medium animate-pulse">Loading dashboard ...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Panel</h1>
            <p className="text-slate-500">Active Event: <span className="text-indigo-600 font-bold">{adminEmail}</span></p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} /> Create New Event
          </button>
        </div>

        {/* Filter & Sort Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title or date (YYYY-MM-DD)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="oldest">Oldest First (Upcoming)</option>
              <option value="latest">Latest First (Recent)</option>
              <option value="title">Sort by Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Event</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timing</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Creator</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAndSortedEvents.length > 0 ? filteredAndSortedEvents.map((event) => {
                  const expired = isPastEvent(event.date);
                  return (
                    <tr key={event._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{event.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{event.description}</div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700"><CalendarIcon size={14}/> {event.date}</div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                          <Clock size={14}/> {formatTime12h(event.startTime)} - {formatTime12h(event.endTime)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md uppercase">
                          <User size={10}/> {event.createdBy}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            disabled={expired}
                            onClick={() => { setEditingEvent(event); setFormData(event); setIsModalOpen(true); }}
                            className={`p-2 rounded-lg transition ${expired ? 'text-slate-200 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                            title={expired ? "Past events cannot be edited" : "Edit Event"}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => { setEventToDelete(event._id); setIsDeleteModalOpen(true); }}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Event"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-400 font-medium">
                      No events found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 scale-in-center">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Title</label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Event Name" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="What is this about?" 
                  rows="2" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Date</label>
                  <input 
                    name="date" 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({...formData, date: e.target.value})} 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Creator</label>
                  <input 
                    value={formData.createdBy} 
                    readOnly 
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed mt-1 font-medium" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Start Time</label>
                  <input 
                    name="startTime" 
                    type="time" 
                    value={formData.startTime} 
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">End Time</label>
                  <input 
                    name="endTime" 
                    type="time" 
                    value={formData.endTime} 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
                    required 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {editingEvent ? 'Update Event' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Event?</h3>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone . Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-100 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;