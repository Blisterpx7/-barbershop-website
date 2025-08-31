import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Star, Clock, Award, Sparkles, Zap, ArrowRight, Heart, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/animations/ScrollReveal';
import { getApiUrl } from '../config/api';

const Barbers = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageAnimated, setPageAnimated] = useState(false);

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setPageAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const fetchBarbers = async () => {
    try {
      const response = await axios.get(`${getApiUrl('/barbers')}`);
      setBarbers(response.data);
    } catch (error) {
      console.error('Error fetching barbers:', error);
      toast.error('Failed to load barbers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading our expert barbers...</p>
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
      <section className="relative py-20 bg-gradient-to-b from-black to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="up" delay={0}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20">
              <User className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Our Team</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white font-serif tracking-wide">
              Meet Our <span className="text-amber-300 font-serif">Expert Barbers</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={200}>
            <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our skilled team of professional barbers brings years of experience and passion 
              to every haircut, ensuring you get the perfect look every time.
            </p>
          </ScrollReveal>
          
          {/* Trust indicators */}
          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-amber-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Licensed Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-amber-400" />
                <span>500+ Happy Clients</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" />
                <span>4.9/5 Average Rating</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-16">
        {/* Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {barbers.map((barber, index) => (
            <div 
              key={barber._id} 
              className="group relative bg-gray-900 rounded-2xl p-8 shadow-2xl hover:shadow-white/10 transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 hover:border-white/30 animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Popular badge */}
              {barber.rating >= 4.8 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3" />
                    Top Rated
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <div className="w-24 h-24 bg-white text-black rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg grayscale hover:grayscale-0">
                  <User className="h-12 w-12" />
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-white mb-3 group-hover:text-gray-300 transition-colors tracking-wide">
                  {barber.name}
                </h3>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="flex items-center">
                    <span className="text-white text-xl">★</span>
                    <span className="ml-1 font-bold text-lg text-white">{barber.rating}</span>
                  </div>
                  <span className="text-gray-400 text-sm">({barber.totalReviews} reviews)</span>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Award className="h-5 w-5 text-white" />
                  <span className="text-sm text-gray-300 font-medium">
                    {barber.experience} years experience
                  </span>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed text-base">
                  {barber.bio}
                </p>

                <div className="mb-6">
                  <h4 className="font-serif font-semibold text-white mb-3 tracking-wide">Specialties:</h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {barber.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm font-medium border border-gray-600 hover:border-white/50 transition-colors"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="font-serif font-semibold text-white mb-3 tracking-wide">Working Hours:</h4>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-300 bg-gray-800 px-4 py-2 rounded-xl border border-gray-600">
                    <Clock className="h-4 w-4 text-white" />
                    <span className="font-medium">{barber.schedule.startTime} - {barber.schedule.endTime}</span>
                  </div>
                </div>

                <Link
                  to="/booking"
                  className="btn-primary group inline-flex items-center justify-center w-full mt-4 font-semibold shadow-lg"
                >
                  <User className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  Book with {barber.name}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {barbers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-300 text-xl font-medium">
              No barbers available at the moment.
            </p>
            <p className="text-gray-500 mt-2">
              Please check back later or contact us for more information.
            </p>
          </div>
        )}

        {/* Stats Section */}
        <ScrollReveal direction="up" delay={0}>
          <div className="bg-gray-900 text-white rounded-2xl p-12 shadow-2xl mb-16 border border-gray-700 mt-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
                <Award className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Our Achievements</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-white tracking-wide">
                Why Choose Our <span className="bg-white bg-clip-text text-transparent font-serif">Barbers?</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Our team brings together decades of combined experience and a passion for excellence
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {['15+','500+','4.9','100%'].map((value, idx) => (
                <div key={idx} className="group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 text-white">{value}</div>
                  <div className="text-gray-300 font-medium">
                    {idx === 0 && 'Years Combined Experience'}
                    {idx === 1 && 'Happy Clients'}
                    {idx === 2 && 'Average Rating'}
                    {idx === 3 && 'Satisfaction Rate'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal direction="up" delay={100}>
          <div className="text-center mb-16">
            <div className="bg-gray-900 text-white rounded-2xl p-12 shadow-2xl border border-gray-700">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
                <Zap className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Ready to Transform?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-white tracking-wide">
                Ready to Book Your <span className="bg-white bg-clip-text text-transparent font-serif">Appointment?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Choose your preferred barber and service to get started on your transformation journey.
              </p>
              <Link
                to="/booking"
                className="btn-primary group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold shadow-lg"
              >
                <Zap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Book Appointment
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Barbers; 