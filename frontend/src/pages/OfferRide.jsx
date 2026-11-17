import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { 
  Bike, 
  MapPin, 
  Clock, 
  HardHat, 
  AlertCircle, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const OfferRide = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDefaultDateTime = () => {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    d.setSeconds(0, 0);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureTime: getDefaultDateTime(),
    totalSeats: 1,
    farePerSeat: 0,
    helmetProvided: true,
    bikeModel: user?.bikeDetails?.model || '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const depDate = new Date(formData.departureTime);
    if (isNaN(depDate.getTime()) || depDate <= new Date()) {
      setError('Please select a valid future departure date and time.');
      return;
    }

    setLoading(true);

    try {
      await axiosClient.post('/rides', {
        ...formData,
        totalSeats: Number(formData.totalSeats),
        farePerSeat: Number(formData.farePerSeat),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard#my-rides');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to publish ride offer. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 md:py-6 pb-20 md:pb-10">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bike className="w-5 h-5 text-emerald-400" />
          <span>Offer a Bike Pool Ride</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Share your pillion seat with a verified student going your way.
        </p>
      </div>

      {success && (
        <div className="mb-3.5 p-3 bg-emerald-950/80 border border-emerald-600/70 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Ride published successfully! Redirecting to your dashboard...</span>
        </div>
      )}

      {error && (
        <div className="mb-3.5 p-3 bg-rose-950/80 border border-rose-600/70 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Origin & Destination */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Pickup Location *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="origin"
                  required
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="Enter pickup location"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Destination *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter drop-off destination"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Departure Date & Time */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Departure Date & Time *
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5" />
              <input
                type="datetime-local"
                name="departureTime"
                required
                value={formData.departureTime}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-8 pr-3 py-1.5 text-xs sm:text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          {/* Seats & Fare */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Available Seats
              </label>
              <select
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white outline-none transition-colors"
              >
                <option value={1}>1 Pillion Seat</option>
                <option value={2}>2 Seats</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                Fuel Contribution ($)
              </label>
              <input
                type="number"
                name="farePerSeat"
                min={0}
                step={0.5}
                value={formData.farePerSeat}
                onChange={handleChange}
                placeholder="0 for Free"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white outline-none transition-colors"
              />
            </div>
          </div>

          {/* Bike Model */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Vehicle Model
            </label>
            <input
              type="text"
              name="bikeModel"
              value={formData.bikeModel}
              onChange={handleChange}
              placeholder="e.g. Yamaha FZ / Honda Activa"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white placeholder-slate-600 outline-none transition-colors"
            />
          </div>

          {/* Helmet Provided Checkbox */}
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="helmetProvided"
              name="helmetProvided"
              checked={formData.helmetProvided}
              onChange={handleChange}
              className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
            />
            <label htmlFor="helmetProvided" className="text-xs text-slate-300 cursor-pointer">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <HardHat className="w-3.5 h-3.5 text-amber-400" />
                Provide clean spare helmet for passenger
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Recommended for campus safety compliance.
              </p>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Pickup Instructions (Optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Waiting near the campus bike rack"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs sm:text-sm text-white placeholder-slate-600 outline-none transition-colors resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Publish Ride Offer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfferRide;
