import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CreditCard, CheckCircle, Sparkles, Zap, ArrowRight, Award, Wallet, Smartphone, Crown, Star, Heart, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const BookingForm = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [pageAnimated, setPageAnimated] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  
  // Helper function to format time for display
  const formatTimeForDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
    fetchBarbers();
    
    // Check authentication status
    const token = localStorage.getItem('token');
    if (!token || !user) {
      console.log('No token or user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Ensure axios headers are set
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Authentication headers set for user:', user.id);
  }, [user, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setPageAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await axios.get('/api/barbers');
      setBarbers(response.data);
    } catch (error) {
      toast.error('Failed to load barbers');
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleBarberSelect = (barber) => {
    setSelectedBarber(barber);
    setStep(3);
  };

  const handleDateTimeSelect = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }
    
    // Validate date is not in the past
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();
    
    if (selectedDateTime <= now) {
      toast.error('Please select a future date and time');
      return;
    }
    
    setStep(4);
  };

  const handleCreateAppointment = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      toast.error('Please complete all selections');
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast.error('Please log in to book an appointment');
      navigate('/login');
      return;
    }

    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token missing. Please log in again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Validate time format
      if (!selectedTime || !selectedTime.match(/^\d{2}:\d{2}$/)) {
        toast.error('Invalid time format selected');
        setLoading(false);
        return;
      }
      
      // Ensure proper time format for the backend
      const dateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      // Validate the date is valid
      if (isNaN(dateTime.getTime())) {
        toast.error('Invalid date or time selected');
        setLoading(false);
        return;
      }
      
      // Ensure axios headers are set
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Creating appointment with data:', {
        serviceId: selectedService._id,
        barberId: selectedBarber._id,
        dateTime: dateTime.toISOString(),
        notes,
        user: user.id,
        token: token ? 'Present' : 'Missing'
      });

      const response = await axios.post('/api/appointments', {
        serviceId: selectedService._id,
        barberId: selectedBarber._id,
        dateTime: dateTime.toISOString(),
        notes
      });

      console.log('Appointment created successfully:', response.data);
      setAppointment(response.data.appointment);
      setStep(5);
      toast.success('Appointment created successfully!');
    } catch (error) {
      console.error('Appointment creation error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to create appointment';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please log in again.';
        navigate('/login');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Handle specific error types
      if (errorMessage.includes('Time slot not available')) {
        toast.error('Please try a different time slot');
      } else if (errorMessage.includes('Invalid time value')) {
        toast.error('Please select a valid time slot');
      } else if (errorMessage.includes('Cannot book appointments in the past')) {
        toast.error('Please select a future date and time');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // For cash payment, just confirm the appointment
      const paymentResult = { success: true, method: 'cash' };

      if (paymentResult.success) {
        // Confirm payment on backend
        await axios.post('/api/payments/confirm', {
          appointmentId: appointment._id,
          paymentMethod: paymentResult.method
        });

        toast.success('Booking confirmed! Please bring exact amount when you visit.');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Booking failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30' 
  ];

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-12">
      {[1, 2, 3, 4, 5].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
            step >= stepNumber 
              ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl scale-110 ring-4 ring-blue-500/20' 
              : 'bg-gray-700 text-gray-400 border-2 border-gray-600'
          }`}>
            {step > stepNumber ? (
              <CheckCircle className="h-7 w-7 text-green-400" />
            ) : (
              <span className="text-white font-bold">{stepNumber}</span>
            )}
            {/* Glow effect for active step */}
            {step === stepNumber && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-md animate-pulse"></div>
            )}
          </div>
          {stepNumber < 5 && (
            <div className={`w-24 h-2 mx-4 rounded-full transition-all duration-500 ${
              step > stepNumber 
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg' 
                : 'bg-gray-700'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  // Debug panel for troubleshooting
  const renderDebugPanel = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-xs z-50">
        <h3 className="font-bold mb-2">Debug Info</h3>
        <div>User: {user ? user.id : 'None'}</div>
        <div>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
        <div>Step: {step}</div>
        <div>Service: {selectedService?.name || 'None'}</div>
        <div>Barber: {selectedBarber?.name || 'None'}</div>
        <div>Date: {selectedDate || 'None'}</div>
        <div>Time: {selectedTime || 'None'}</div>
        <button 
          onClick={() => console.log('Auth headers:', axios.defaults.headers.common)}
          className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Log Headers
        </button>
      </div>
    );
  };

  const renderServiceSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 rounded-full px-4 py-2 mb-4">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-600">Step 1</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Choose Your <span className="text-amber-300">Service</span>
        </h2>
        <p className="text-xl text-amber-100 max-w-2xl mx-auto">
          Select the perfect service for your grooming needs
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={service._id}
            onClick={() => handleServiceSelect(service)}
            className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl hover:shadow-white/10 transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 hover:border-blue-400/50 cursor-pointer overflow-hidden"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            {service.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-base font-bold shadow-2xl border-2 border-yellow-300/70 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <span>POPULAR</span>
                    <span className="text-lg">🔥</span>
                  </div>
                </span>
              </div>
            )}
            
            <div className="text-center relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Sparkles className="h-10 w-10" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors font-serif">
                {service.name}
              </h3>
              
              <p className="text-gray-300 mb-6 leading-relaxed text-base">
                {service.description}
              </p>
              
              <div className="flex justify-between items-center mb-6">
                <div className="text-center">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    ₱{service.price}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Total Price</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-300 bg-gray-800/50 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-gray-600">
                    <Clock className="h-4 w-4" />
                    {service.duration} min
                  </span>
                </div>
              </div>
              
              <div className="group inline-flex items-center justify-center w-full px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                Select Service
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBarberSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 rounded-full px-4 py-2 mb-4">
          <User className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-600">Step 2</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Choose Your <span className="text-amber-300">Barber</span>
        </h2>
        <p className="text-xl text-amber-100 max-w-2xl mx-auto">
          Select from our expert team of professional barbers
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {barbers.map((barber, index) => (
          <div
            key={barber._id}
            onClick={() => handleBarberSelect(barber)}
            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-green-200 cursor-pointer"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <User className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {barber.name}
                </h3>
                <p className="text-gray-600 mb-3 leading-relaxed">{barber.bio}</p>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="ml-1 font-semibold text-gray-900">{barber.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({barber.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {barber.experience} years experience
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Specialties:</span>
                <div className="flex flex-wrap gap-1">
                  {barber.specialties.slice(0, 2).map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs border border-green-200"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 rounded-full px-4 py-2 mb-4">
          <Calendar className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-600">Step 3</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Pick Your <span className="text-amber-300">Date & Time</span>
        </h2>
        <p className="text-xl text-amber-100 max-w-2xl mx-auto">
          Choose the perfect time for your appointment
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <label className="block text-lg font-semibold text-black mb-4">
            <Calendar className="inline h-5 w-5 mr-2 text-amber-600" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDate()}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors text-gray-900"
          />
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            <Clock className="inline h-5 w-5 mr-2 text-amber-600" />
            Select Time
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors text-gray-900"
          >
            <option value="">Choose a time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time} className="text-gray-900">
                {formatTimeForDisplay(time)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <label className="block text-lg font-bold text-black mb-4">
          Additional Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:outline-none transition-colors resize-none text-gray-900"
          placeholder="Any special requests or notes for your barber..."
        />
      </div>
      
      <button
        onClick={handleDateTimeSelect}
        className="group w-full inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Continue to Review
        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 rounded-full px-4 py-2 mb-4">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Step 4</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Review Your <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Booking</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Double-check your appointment details before confirming
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
    <div className="space-y-6">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-700">Service:</span>
            <span className="text-lg font-bold text-gray-900">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-700">Barber:</span>
            <span className="text-lg font-bold text-gray-900">{selectedBarber?.name}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-700">Date:</span>
            <span className="text-lg font-bold text-gray-900">{new Date(selectedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-700">Time:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatTimeForDisplay(selectedTime)}
            </span>
          </div>
          {notes && (
            <div className="flex justify-between items-start py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-700">Notes:</span>
              <span className="text-lg text-gray-900 max-w-xs text-right">{notes}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl px-4">
            <span className="text-xl font-bold text-gray-900">Total:</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              ₱{selectedService?.price}
            </span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleCreateAppointment}
        disabled={loading}
        className="group w-full inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Creating Appointment...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Confirm Appointment
          </>
        )}
      </button>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-600 rounded-full px-4 py-2 mb-4">
          <CreditCard className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-600">Step 5</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Choose <span className="text-amber-600">Payment Method</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select your preferred payment method to confirm your appointment
        </p>
      </div>
      
      {/* Order Summary */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-600" />
          Order Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-700">Service:</span>
            <span className="text-lg font-bold text-gray-900">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-700">Barber:</span>
            <span className="text-lg font-bold text-gray-900">{selectedBarber?.name}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-700">Date & Time:</span>
            <span className="text-lg font-bold text-gray-900">
              {new Date(selectedDate + 'T' + selectedTime).toLocaleDateString()} at {formatTimeForDisplay(selectedTime)}
            </span>
          </div>
          <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl px-4">
            <span className="text-xl font-bold text-gray-900">Total Amount:</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ₱{selectedService?.price}
            </span>
          </div>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          Payment Method
        </h3>
        
        <div className="mb-6">
          {/* Cash Only */}
          <div
            onClick={() => setSelectedPaymentMethod('cash')}
            className="p-6 border-2 border-green-500 bg-green-50 rounded-xl cursor-pointer transition-all duration-300 hover:bg-green-100 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-green-800">Cash Payment</h4>
                <p className="text-green-700">Pay at the barbershop when you visit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Payment Details */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Cash Payment</h4>
                <p className="text-green-700">Please bring exact amount (₱{selectedService?.price}) when you visit the barbershop.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirm Booking Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="group w-full inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Confirming Booking...
          </>
        ) : (
                      <>
              <CheckCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Confirm Booking
            </>
        )}
      </button>
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-all duration-700 ease-out bg-black
        ${pageAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {renderDebugPanel()}
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* User welcome section */}
          {user && (
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">
                  Welcome back, <span className="font-bold text-blue-400">{user.name}</span>! 👋
                </span>
                <Crown className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
          )}
          
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
            <Zap className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">Book Your Appointment</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 font-serif tracking-wide">
            Book Your <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Appointment</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Follow the simple steps below to schedule your perfect grooming session
          </p>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-white" />
              <span>Secure Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-white" />
              <span>Premium Service</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-white" />
              <span>Expert Barbers</span>
            </div>
          </div>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {renderStepIndicator()}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 mb-16 text-white">
          {step === 1 && renderServiceSelection()}
          {step === 2 && renderBarberSelection()}
          {step === 3 && renderDateTimeSelection()}
          {step === 4 && renderReview()}
          {step === 5 && renderPayment()}
        </div>
      </div>
    </div>
  );
};

export default BookingForm; 