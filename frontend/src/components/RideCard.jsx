import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  HardHat,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RideCard = ({ ride, onBookSuccess }) => {
  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const isDriver = user && ride.driver?._id === user.id;
  const isFull = ride.availableSeats <= 0 || ride.status === 'Full';

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ', ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleBook = async () => {
    setErrorMsg('');
    setIsBooking(true);
    try {
      if (onBookSuccess) {
        await onBookSuccess(ride._id);
        setBookedSuccess(true);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to book seat. Please try again.';
      setErrorMsg(serverMessage);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-slate-700 transition-all duration-200 shadow-sm flex flex-col justify-between">
      {/* Top Header: Driver Info & Price */}
      <div className="flex items-start justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <img
            src={ride.driver?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={ride.driver?.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/40"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-slate-100 text-xs sm:text-sm">{ride.driver?.name || 'Student'}</h3>
              {ride.driver?.isVerifiedStudent && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Verified Campus Student" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{ride.driver?.department || 'Student'}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-amber-400 font-medium">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {ride.driver?.rating?.average ? ride.driver.rating.average.toFixed(1) : '5.0'}
              </span>
            </div>
          </div>
        </div>

        {/* Fare */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-medium text-slate-400 block">Fuel Share</span>
          <span className="text-sm sm:text-base font-bold text-emerald-400">
            {ride.farePerSeat === 0 ? 'FREE' : `$${ride.farePerSeat}`}
          </span>
        </div>
      </div>

      {/* Route Timeline (Compact) */}
      <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80 mb-2.5 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-950"></div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-500 font-medium block">Pickup</span>
            <p className="text-xs font-medium text-slate-200 truncate">{ride.origin}</p>
          </div>
        </div>

        <div className="border-l border-dashed border-slate-700 ml-0.5 h-2"></div>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 ring-2 ring-sky-950"></div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-slate-500 font-medium block">Drop-off</span>
            <p className="text-xs font-medium text-slate-200 truncate">{ride.destination}</p>
          </div>
        </div>
      </div>

      {/* Ride Tags / Badges */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-3">
        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-800">
          <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{formatTime(ride.departureTime)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-800">
          <Users className="w-3 h-3 text-sky-400 shrink-0" />
          <span>{ride.availableSeats} {ride.availableSeats === 1 ? 'Seat' : 'Seats'} Left</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-800">
          <HardHat className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">
            {ride.helmetProvided ? 'Helmet Ready' : 'Bring Helmet'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-800">
          <span className="text-[11px]">🏍️</span>
          <span className="truncate">{ride.bikeModel || 'Two-Wheeler'}</span>
        </div>
      </div>

      {ride.notes && (
        <p className="text-[11px] text-slate-400 bg-slate-800/30 p-1.5 rounded-md mb-2.5 italic border border-slate-800/40 truncate">
          "{ride.notes}"
        </p>
      )}

      {/* Error / Conflict Notification */}
      {errorMsg && (
        <div className="mb-2.5 p-2 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-start gap-1.5 text-[11px] text-rose-300 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Button */}
      {bookedSuccess ? (
        <div className="w-full py-1.5 bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 rounded-lg text-center text-xs font-semibold flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Seat Confirmed
        </div>
      ) : isDriver ? (
        <div className="w-full py-1.5 bg-slate-800 text-slate-400 rounded-lg text-center text-xs font-medium border border-slate-700">
          Your Offered Ride
        </div>
      ) : isFull ? (
        <button
          disabled
          className="w-full py-1.5 bg-slate-800 text-slate-500 rounded-lg text-center text-xs font-semibold cursor-not-allowed"
        >
          Fully Booked
        </button>
      ) : (
        <button
          onClick={handleBook}
          disabled={isBooking}
          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-xs rounded-lg shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {isBooking ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Reserving...</span>
            </>
          ) : (
            <>
              <span>Reserve Seat</span>
              <ArrowRight className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default RideCard;
