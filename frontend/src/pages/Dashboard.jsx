import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { 
  Bike, 
  Search, 
  PlusCircle, 
  Calendar, 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  KeyRound, 
  AlertCircle,
  CheckCircle2,
  HardHat
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('bookings');
  const [myBookings, setMyBookings] = useState([]);
  const [myOfferedRides, setMyOfferedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, ridesRes] = await Promise.all([
        axiosClient.get('/bookings/my-bookings').catch(() => ({ data: { bookings: [] } })),
        axiosClient.get('/rides/my-rides').catch(() => ({ data: { rides: [] } })),
      ]);
      setMyBookings(bookingsRes.data.bookings || []);
      setMyOfferedRides(ridesRes.data.rides || []);
    } catch (err) {
      console.error('Failed to load activity', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this bike reservation?')) return;
    setCancellingId(bookingId);
    try {
      await axiosClient.put(`/bookings/${bookingId}/cancel`);
      setStatusMessage({ text: 'Booking cancelled successfully. Seat reopened to pool.', type: 'success' });
      fetchDashboardData();
    } catch (err) {
      setStatusMessage({ 
        text: err.response?.data?.message || 'Failed to cancel booking.', 
        type: 'error' 
      });
    } finally {
      setCancellingId(null);
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
    }
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + 
           ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 pb-20 md:pb-10 space-y-4">
      {/* Welcome Banner (Compact) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/40">
                Verified Student
              </span>
              <span className="text-xs text-slate-400">ID: {user?.studentId}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
              Connected to <strong className="text-emerald-400 font-medium">{user?.department}</strong>. Ready to beat campus parking & commute green?
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/offer-ride')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Offer a Ride</span>
            </button>
            <button
              onClick={() => navigate('/search')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Find a Ride</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campus Impact Metrics */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-1.5">
            <Leaf className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">CO₂ Saved</span>
            <span className="text-base sm:text-lg font-bold text-slate-100">14.8 kg</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="w-7 h-7 rounded-lg bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 mb-1.5">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Saved</span>
            <span className="text-base sm:text-lg font-bold text-slate-100">$62.00</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Eco Trips</span>
            <span className="text-base sm:text-lg font-bold text-slate-100">8 Trips</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards (Compact) */}
      <div className="grid md:grid-cols-2 gap-3">
        <Link
          to="/search"
          className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl transition-all duration-200 flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Search className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Find a Ride
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xs">
              Search real-time bike rides from campus hostels, library, or transit gates.
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shrink-0 text-sm">
            →
          </div>
        </Link>

        <Link
          to="/offer-ride"
          className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-2xl transition-all duration-200 flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bike className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Offer a Ride
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-xs">
              Riding your scooter or bike across campus? Share your empty seat with a peer.
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shrink-0 text-sm">
            +
          </div>
        </Link>
      </div>

      {/* Notification Toast */}
      {statusMessage.text && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-700/60 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-700/60 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Activity Section */}
      <div id="my-rides" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Activity Hub
          </h2>

          {/* Activity Tabs */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Bookings ({myBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('offered')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'offered'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Offered Rides ({myOfferedRides.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Loading campus activity...</p>
          </div>
        ) : activeTab === 'bookings' ? (
          <div>
            {myBookings.length === 0 ? (
              <div className="py-8 text-center">
                <Bike className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-slate-300">No active bookings yet</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
                  Need a quick ride to class or the transit station?
                </p>
                <Link
                  to="/search"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Search className="w-3 h-3" />
                  Explore Available Rides
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((b) => (
                  <div
                    key={b._id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {b.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDateTime(b.ride?.departureTime)}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm font-medium text-slate-200">
                        <span className="text-emerald-400 font-semibold">{b.ride?.origin}</span>
                        <span className="text-slate-500 mx-1.5">➔</span>
                        <span className="text-sky-400 font-semibold">{b.ride?.destination}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Driver: <strong className="text-slate-200">{b.ride?.driver?.name}</strong></span>
                        <span>•</span>
                        <span>{b.ride?.driver?.bikeDetails?.model || 'Two-Wheeler'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      {/* Boarding Verification PIN */}
                      <div className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-center">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block flex items-center justify-center gap-0.5">
                          <KeyRound className="w-2.5 h-2.5 text-amber-400" /> PIN
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-400 tracking-wider">
                          {b.verificationPin}
                        </span>
                      </div>

                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingId === b._id}
                          className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {myOfferedRides.length === 0 ? (
              <div className="py-8 text-center">
                <Bike className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                <h3 className="text-xs font-semibold text-slate-300">You haven't offered any rides yet</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
                  Help a classmate commute by offering your pillion seat.
                </p>
                <Link
                  to="/offer-ride"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                >
                  <PlusCircle className="w-3 h-3" />
                  Post Ride Offer
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myOfferedRides.map((ride) => (
                  <div
                    key={ride._id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            ride.status === 'Open'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : ride.status === 'Full'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ride.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDateTime(ride.departureTime)}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm font-medium text-slate-200">
                        <span className="text-emerald-400 font-semibold">{ride.origin}</span>
                        <span className="text-slate-500 mx-1.5">➔</span>
                        <span className="text-sky-400 font-semibold">{ride.destination}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Seats: <strong className="text-slate-200">{ride.availableSeats} of {ride.totalSeats}</strong></span>
                        <span>•</span>
                        <span>Fuel Share: {ride.farePerSeat === 0 ? 'Free' : `$${ride.farePerSeat}`}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-medium bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        {ride.helmetProvided ? '🪖 Helmet Provided' : 'Bring Helmet'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
