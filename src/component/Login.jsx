import React, { useState } from 'react';
import { X, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Import toast bruh

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    
    // STATIC CREDENTIALS CHECK
    if (email === 'admin@events.com' && password === 'admin123') {
      localStorage.setItem('adminToken', 'secret-token-123');
      localStorage.setItem('adminEmail', email);
      
      // Success toast
      toast.success('Welcome back, Admin!', {
        duration: 3000,
        
      });

      onClose();
      navigate('/admin'); 
    } else {
      // Error toast instead of alert
      toast.error("Invalid credentials!", {
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
        },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-gray-800">Admin Login</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@events.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;