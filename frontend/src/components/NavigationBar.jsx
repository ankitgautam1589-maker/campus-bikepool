import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bike, 
  Search, 
  PlusCircle, 
  Compass, 
  LogOut, 
  ShieldCheck, 
  CalendarCheck 
} from 'lucide-react';

const NavigationBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Sleek Top Header for Desktop & Mobile */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Bike className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                Campus<span className="text-emerald-400">Bikepool</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-emerald-400/90 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/50">
                Verified
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              Find Rides
            </NavLink>
            <NavLink
              to="/offer-ride"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              Offer Ride
            </NavLink>
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-2 py-1 rounded-full">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-6 h-6 rounded-full object-cover border border-emerald-400/60"
              />
              <div className="text-left hidden sm:block leading-tight pr-1">
                <p className="text-xs font-semibold text-slate-200">{user?.name?.split(' ')[0]}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-1.5">
        <div className="flex items-center justify-around">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Compass className="w-4.5 h-4.5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Search className="w-4.5 h-4.5" />
            <span>Find</span>
          </NavLink>

          <NavLink
            to="/offer-ride"
            className={({ isActive }) =>
              `flex flex-col items-center -mt-4 transition-transform active:scale-95 ${
                isActive ? 'text-emerald-300' : 'text-white'
              }`
            }
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/30 border-2 border-slate-950">
              <PlusCircle className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5 text-emerald-400">Offer</span>
          </NavLink>

          <NavLink
            to="/dashboard#my-rides"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <CalendarCheck className="w-4.5 h-4.5" />
            <span>Activity</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};

export default NavigationBar;
