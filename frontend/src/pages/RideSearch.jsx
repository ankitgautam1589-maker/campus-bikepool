import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import RideCard from '../components/RideCard';
import { Search, MapPin, Calendar, RefreshCw, Bike, AlertCircle, CheckCircle2 } from 'lucide-react';

const CAMPUS_HUBS = [
  'Central Library',
  'North Gate / Metro',
  'Engineering Block',
  'Hostel Complex B',
  'Sports Arena',
  'Student Union',
];

const RideSearch = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingToast, setBookingToast] = useState(null);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (searchParams = {}) => {
    setLoading(true);
    try {
      const params = {
        origin: searchParams.origin !== undefined ? searchParams.origin : origin,
        destination: searchParams.destination !== undefined ? searchParams.destination : destination,
        date: searchParams.date !== undefined ? searchParams.date : date,
      };

      const { data } = await axiosClient.get('/rides/search', { params });
      setRides(data.rides || []);
    } catch (err) {
      console.error('Failed to search rides', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRides();
  };

  const handleQuickHubSelect = (hubName, type) => {
    if (type === 'origin') {
      setOrigin(hubName);
      fetchRides({ origin: hubName });
    } else {
      setDestination(hubName);
      fetchRides({ destination: hubName });
    }
  };

  const handleBookRide = async (rideId) => {
    try {
      const { data } = await axiosClient.post('/bookings', {
        rideId,
        seatsToBook: 1,
      });

      setBookingToast({
        type: 'success',
        message: `Ride booked! Boarding Verification PIN: ${data.booking.verificationPin}`,
      });

      setRides((prev) =>
        prev.map((r) => {
          if (r._id === rideId) {
            const rem = data.remainingSeats !== undefined ? data.remainingSeats : r.availableSeats - 1;
            return {
              ...r,
              availableSeats: rem,
              status: rem <= 0 ? 'Full' : r.status,
            };
          }
          return r;
        })
      );

      return data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to book seat. Please try again.';
      setBookingToast({
        type: 'error',
        message: errorMsg,
      });
      fetchRides();
      throw err;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-6 pb-20 md:pb-10">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Find Campus Rides
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time peer bike pooling across campus departments and gates.
        </p>
      </div>

      {/* Global Booking Feedback Alert */}
      {bookingToast && (
        <div
          className={`mb-3.5 p-3 rounded-xl flex items-center justify-between gap-2.5 text-xs font-medium animate-fadeIn ${
            bookingToast.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-600/70 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-600/70 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {bookingToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{bookingToast.message}</span>
          </div>
          <button
            onClick={() => setBookingToast(null)}
            className="text-slate-400 hover:text-white text-xs underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Filter Box (Compact) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-4 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid md:grid-cols-3 gap-2.5">
            {/* Origin input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Pickup Location
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Enter pickup point"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Destination input */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Destination
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Date filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Departure Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs sm:text-sm text-white outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Quick Landmark Chips */}
          <div>
            <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
              Popular Campus Hubs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CAMPUS_HUBS.map((hub) => (
                <button
                  key={hub}
                  type="button"
                  onClick={() => handleQuickHubSelect(hub, 'destination')}
                  className={`px-2.5 py-0.5 rounded-lg text-xs transition-colors border ${
                    destination === hub
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-600 font-medium'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>

          {/* Search Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setOrigin('');
                setDestination('');
                setDate('');
                fetchRides({ origin: '', destination: '', date: '' });
              }}
              className="text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Reset Filters
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Search Rides'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs sm:text-sm font-semibold text-slate-200">
          Available Rides ({rides.length})
        </h2>
        <button
          onClick={() => fetchRides()}
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Loading campus routes...</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-2.5">
            <Bike className="w-5 h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-200">No matching rides found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5 mb-4">
            No active departures match your criteria right now.
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={() => {
                setOrigin('');
                setDestination('');
                setDate('');
                fetchRides({ origin: '', destination: '', date: '' });
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700"
            >
              Clear Filters
            </button>
            <Link
              to="/offer-ride"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium shadow-sm shadow-emerald-600/20"
            >
              Offer Ride
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3.5">
          {rides.map((ride) => (
            <RideCard
              key={ride._id}
              ride={ride}
              onBookSuccess={handleBookRide}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RideSearch;
