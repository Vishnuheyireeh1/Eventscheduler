import React, { useState } from 'react'
import { Calendar as CalendarIcon, UserCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import LoginModal from './Login'

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        
        {/* LOGO / TITLE */}
        <Link
          to="/"
          className="flex items-center gap-2 cursor-pointer"
        >
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2 hover:text-indigo-700 transition-colors">
            <CalendarIcon size={28} />
            <span>EventScheduler</span>
          </h1>
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-1 flex items-center gap-2 group"
            title="Admin Login"
          >
            <span className="text-sm font-medium hidden md:block group-hover:text-indigo-600">
              Admin
            </span>
            <UserCircle size={32} />
          </button>
        </div>
      </nav>

      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}

export default Navbar
