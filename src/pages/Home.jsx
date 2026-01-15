import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowUpDown,
  Clock,
  Info
} from 'lucide-react';
import LoginModal from '../component/Login';

const Home = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortOrder, setSortOrder] = useState('oldest');
  const [loading, setLoading] = useState(true);

  const API_URL = `${process.env.VITE_API_URL}/events`;

  // HELPER: Convert a Date object to "YYYY-MM-DD" in LOCAL time bruh
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        setEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  // Highlight logic: Fixed to use local dates
  const eventDates = useMemo(() => {
    return events.map(event => event.date); 
  }, [events]);

  // Filter and Sort: Fixed to use local date comparison
  const displayedEvents = useMemo(() => {
    const dateString = getLocalDateString(selectedDate);
    return events
      .filter(event => event.date === dateString)
      .sort((a, b) => {
        return sortOrder === 'latest' 
          ? b.startTime.localeCompare(a.startTime) 
          : a.startTime.localeCompare(b.startTime);
      });
  }, [events, selectedDate, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />

      <button 
        onClick={() => setIsLoginOpen(true)}
        className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-xl border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all z-50 group"
      >
        <CalendarIcon size={24} />
        <span className="absolute right-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Admin</span>
      </button>

      <main className="flex-1 flex flex-col md:flex-row p-6 gap-6 max-w-7xl mx-auto w-full">
        
        {/* LEFT COLUMN: CALENDAR */}
        <div className="w-full md:w-96 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 h-fit">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-black text-slate-800 text-xl tracking-tight">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition"><ChevronRight size={20}/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 text-center gap-2">
            {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} />)}
            {[...Array(daysInMonth(currentMonth))].map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              
              // FIX: Use the local date helper instead of toISOString
              const dateString = getLocalDateString(dateObj);
              
              const isSelected = selectedDate.getDate() === day && 
                               selectedDate.getMonth() === currentMonth.getMonth() &&
                               selectedDate.getFullYear() === currentMonth.getFullYear();
              
              const hasEvent = eventDates.includes(dateString);
              
              return (
                <button 
                  key={day}
                  onClick={() => setSelectedDate(dateObj)}
                  className={`relative w-full aspect-square flex flex-col items-center justify-center text-sm rounded-2xl transition-all duration-200 ${
                    isSelected 
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 scale-105' 
                    : 'hover:bg-indigo-50 text-slate-600 font-semibold'
                  }`}
                >
                  {day}
                  {hasEvent && !isSelected && (
                    <span className="absolute bottom-2 w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <Info size={14}/> Blue dots indicate scheduled Events.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMELINE */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <header className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-slate-400 text-sm font-medium">{displayedEvents.length} Events Scheduled</p>
            </div>
            <button 
              onClick={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
              className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition"
            >
              <ArrowUpDown size={14} />
              {sortOrder === 'latest' ? 'LATEST FIRST' : 'OLDEST FIRST'}
            </button>
          </header>

          <div className="p-6 space-y-0 overflow-y-auto flex-1">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : displayedEvents.length > 0 ? (
              displayedEvents.map((event, index) => (
                <div key={event._id || index} className="flex gap-6 group relative">
                  <div className="w-20 sm:w-28 flex flex-col items-end pt-1 shrink-0">
                    <span className="text-[13px] font-black text-slate-900 tabular-nums">
                      {formatTime12h(event.startTime)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                      to {formatTime12h(event.endTime)}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full border-4 border-white bg-indigo-500 shadow-sm z-10 group-hover:scale-125 transition-transform"></div>
                    {index !== displayedEvents.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-100 my-1"></div>
                    )}
                  </div>

                  <div className="flex-1 pb-10">
                    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
                      <h3 className="font-bold text-slate-800 text-lg mb-1">{event.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">{event.description}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 w-fit px-3 py-1 rounded-lg">
                        <Clock size={12} /> {formatTime12h(event.startTime)} - {formatTime12h(event.endTime)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4 text-slate-300">
                  <CalendarIcon size={48} />
                </div>
                <h3 className="font-bold text-slate-800">No Events Scheduled</h3>
                <p className="text-slate-400 text-sm max-w-[200px] mt-1">There are no events found for this specific date.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;