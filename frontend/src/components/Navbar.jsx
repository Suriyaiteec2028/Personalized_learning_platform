import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, User, LogOut, Key, ShieldCheck, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">Personalized Learning Platform</h1>
            <p className="text-xs text-blue-400 font-medium">Intelligent Role-Based LMS</p>
          </div>
        </div>

        {/* Center Prominent Display: Teacher Unique 8-Digit Alphanumeric Code */}
        {user.role === 'teacher' && user.teacherCode && (
          <div className="hidden md:flex items-center bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-blue-500/50 px-4 py-1.5 rounded-full shadow-inner space-x-2">
            <Key className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Your Unique Teacher Code:</span>
            <span className="font-mono text-sm font-bold text-amber-300 bg-slate-950 px-2.5 py-0.5 rounded border border-amber-500/40 tracking-widest select-all">
              {user.teacherCode}
            </span>
          </div>
        )}

        {/* Right Student Connected Info / User Profile */}
        <div className="flex items-center space-x-4">
          {user.role === 'student' && (
            <div className="hidden sm:flex items-center text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 space-x-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Connected Teacher: <strong className="text-white">{user.connectedTeacherId?.name || 'Not Linked Yet'}</strong>
              </span>
            </div>
          )}

          {/* User Badge */}
          <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
              <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.2 rounded ${
                user.role === 'teacher' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Prominent Teacher Code Banner */}
      {user.role === 'teacher' && user.teacherCode && (
        <div className="md:hidden bg-blue-950/90 border-t border-blue-800/60 px-4 py-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Your Teacher Code:</span>
          <span className="font-mono text-xs font-bold text-amber-300 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40 tracking-wider">
            {user.teacherCode}
          </span>
        </div>
      )}
    </header>
  );
}
