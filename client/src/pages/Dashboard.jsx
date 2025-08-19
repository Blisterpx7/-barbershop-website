import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, User, Star, CreditCard, CheckCircle, XCircle, Sparkles, Zap, ArrowRight, Award, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/animations/ScrollReveal';

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageAnimated, setPageAnimated] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newDateTime, setNewDateTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPageAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('https://barbershop-website-vy8e.onrender.com/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const upcomingAppointments = appointments.filter(
    appointment => new Date(appointment.dateTime) > new Date() && 
    ['scheduled', 'confirmed'].includes(appointment.status)
  );

  const pastAppointments = appointments.filter(
    appointment => new Date(appointment.dateTime) < new Date() || 
    ['completed', 'cancelled'].includes(appointment.status)
  );

  const canCancelAppointment = (appointment) => {
    const appointmentTime = new Date(appointment.dateTime);
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
    return hoursUntilAppointment >= 2 && ['scheduled', 'confirmed'].includes(appointment.status);
  };

  const canRescheduleAppointment = (appointment) => {
    return ['scheduled', 'confirmed'].includes(appointment.status);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setActionLoading(true);
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}/cancel`, {
        reason: cancelReason
      });
      
      toast.success('Appointment cancelled successfully!');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !newDateTime) return;
    
    setActionLoading(true);
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}/reschedule`, {
        newDateTime: new Date(newDateTime).toISOString()
      });
      
      toast.success('Appointment rescheduled successfully!');
      setShowRescheduleModal(false);
      setNewDateTime('');
      setSelectedAppointment(null);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewDateTime('');
    setShowRescheduleModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-700 ease-out bg-black
        ${pageAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}
      `}
    >
      {/* Hero Section */}
      <section className="relative py-16 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="up" delay={0}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, <span className="bg-white bg-clip-text text-transparent">{user?.name}!</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={200}>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your appointments and view your booking history
            </p>
          </ScrollReveal>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div 
            className="group relative bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Appointments</p>
                <p className="text-2xl font-bold text-white">{appointments.length}</p>
              </div>
            </div>
          </div>

          <div 
            className="group relative bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Upcoming</p>
                <p className="text-2xl font-bold text-white">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>

          <div 
            className="group relative bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div 
            className="group relative bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Loyalty Points</p>
                <p className="text-2xl font-bold text-white">{user?.loyaltyPoints || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Appointments */}
          <ScrollReveal direction="up" delay={0}>
          <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-700 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 text-white rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
              </div>
              <Link
                to="/booking"
                className="group inline-flex items-center justify-center px-4 py-2 text-black bg-white rounded-xl hover:bg-gray-200 transition-all duration-300 border border-white font-semibold text-sm"
              >
                <Zap className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                Book New
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-4">No upcoming appointments</p>
                <Link
                  to="/booking"
                  className="group inline-flex items-center justify-center px-6 py-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 font-semibold"
                >
                  Book your first appointment
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="group border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {appointment.serviceId?.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span>Barber: {appointment.barberId?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span>Date: {new Date(appointment.dateTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span>Time: {new Date(appointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold">Total: ₱{appointment.totalPrice}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      {canRescheduleAppointment(appointment) && (
                        <button
                          onClick={() => openRescheduleModal(appointment)}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Edit className="h-4 w-4" />
                          Reschedule
                        </button>
                      )}
                      
                      {canCancelAppointment(appointment) && (
                        <button
                          onClick={() => openCancelModal(appointment)}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Cancel
                        </button>
                      )}
                      
                      {!canCancelAppointment(appointment) && ['scheduled', 'confirmed'].includes(appointment.status) && (
                        <div className="flex items-center gap-2 px-3 py-2 text-orange-600 bg-orange-50 rounded-lg text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>Cannot cancel (within 2 hours)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </ScrollReveal>

          {/* Past Appointments */}
          <ScrollReveal direction="up" delay={100}>
          <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-700 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-800 text-white rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Past Appointments</h2>
            </div>

            {pastAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No past appointments</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pastAppointments.map((appointment) => (
                  <div key={appointment._id} className="group border-2 border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-md transition-all duration-300 animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {appointment.serviceId?.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span>Barber: {appointment.barberId?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span>Date: {new Date(appointment.dateTime).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold">Total: ₱{appointment.totalPrice}</span>
                      </div>
                      {appointment.payment?.status === 'paid' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold">Payment Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </ScrollReveal>
        </div>

        {/* Quick Actions */}
        <ScrollReveal direction="up" delay={200}>
        <div className="bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-700 mb-16 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-800 text-white rounded-xl flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/booking"
              className="group flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: '0ms' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Book Appointment</h3>
                <p className="text-sm text-gray-600">Schedule a new appointment</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
            </Link>

            <Link
              to="/services"
              className="group flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">View Services</h3>
                <p className="text-sm text-gray-600">Browse our service offerings</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
            </Link>

            <Link
              to="/barbers"
              className="group flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Meet Our Barbers</h3>
                <p className="text-sm text-gray-600">Learn about our team</p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
            </Link>
          </div>
        </div>
        </ScrollReveal>
      </div>

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cancel Appointment</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel your appointment with <strong>{selectedAppointment.barberId?.name}</strong>?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Service:</strong> {selectedAppointment.serviceId?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date(selectedAppointment.dateTime).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Time:</strong> {new Date(selectedAppointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="3"
                placeholder="Please let us know why you're cancelling..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedAppointment(null);
                }}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Edit className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reschedule Appointment</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Choose a new date and time for your appointment with <strong>{selectedAppointment.barberId?.name}</strong>.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Service:</strong> {selectedAppointment.serviceId?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Date:</strong> {new Date(selectedAppointment.dateTime).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Current Time:</strong> {new Date(selectedAppointment.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Date & Time:
              </label>
              <input
                type="datetime-local"
                value={newDateTime}
                onChange={(e) => setNewDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setNewDateTime('');
                  setSelectedAppointment(null);
                }}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Keep Current Time
              </button>
              <button
                onClick={handleRescheduleAppointment}
                disabled={actionLoading || !newDateTime}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 