import { Link } from 'react-router-dom';
import { Scissors, Clock, Star, Users, Award, CheckCircle, Sparkles, Zap, Shield, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import FloatingElements from '../components/animations/FloatingElements';
import GradientBackground from '../components/animations/GradientBackground';
import TypewriterText from '../components/animations/TypewriterText';
import ScrollReveal from '../components/animations/ScrollReveal';

const Home = () => {
  const features = [
    {
      icon: <Scissors className="h-8 w-8" />,
      title: 'Expert Barbers',
      description: 'Our skilled barbers have years of experience in creating the perfect look for every client.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Flexible Hours',
      description: 'Open 7 days a week with extended hours to fit your busy schedule.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Premium Service',
      description: 'We use only the highest quality products and tools for exceptional results.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Friendly Staff',
      description: 'Our welcoming team ensures you feel comfortable and relaxed during your visit.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const services = [
    {
      name: 'Classic Haircut',
      price: '₱150',
      duration: '45 min',
      description: 'Traditional men\'s haircut with wash and style',
      popular: false
    },
    {
      name: 'Fade Haircut',
      price: '₱150',
      duration: '45 min',
      description: 'Professional beard trimming and shaping with precision tools',
      popular: true
    },
    {
      name: 'Hair Styling',
      price: '₱150',
      duration: '45 min',
      description: 'Professional hair styling for special occasions',
      popular: false
    }
  ];

  const [pageAnimated, setPageAnimated] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setPageAnimated(true), 200);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`min-h-screen transition-all duration-700 ease-out bg-black
        ${pageAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}
      `}
    >
      {/* Animated Background Elements */}
      <FloatingElements />
      <GradientBackground />
      
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-screen flex items-center bg-black">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 bg-black"></div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
          <div className="text-center">
            <ScrollReveal delay={200}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20 hover-glow">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
                <span className="text-sm font-medium text-white">Premium Barber Services</span>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={400}>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white">
                Professional
                <span className="gradient-text"> Grooming</span>
                <br />
                <span className="text-4xl md:text-6xl text-amber-300 animate-pulse-glow">Services</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal delay={600}>
              <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                <TypewriterText 
                  text="Experience the finest barber services with our expert team. From classic cuts to modern styles, we've got you covered."
                  speed={50}
                  className="text-xl md:text-2xl text-amber-100"
                />
              </p>
            </ScrollReveal>
            <ScrollReveal delay={800}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/booking"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover-lift animate-bounce-in"
                >
                  <Zap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Book Appointment
                </Link>
                <Link
                  to="/services"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 hover-lift"
                >
                  View Services
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>
            {/* Trust indicators */}
            <ScrollReveal delay={1000}>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-amber-200">
                <div className="flex items-center gap-2 hover-scale">
                  <Shield className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span>100% Safe & Clean</span>
                </div>
                <div className="flex items-center gap-2 hover-scale">
                  <Heart className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span>500+ Happy Clients</span>
                </div>
                <div className="flex items-center gap-2 hover-scale">
                  <Star className="h-4 w-4 text-amber-400 animate-pulse" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2 mb-4">
              <Award className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose <span className="text-amber-300">Barbery's?</span>
            </h2>
            <p className="text-xl text-amber-100 max-w-3xl mx-auto leading-relaxed">
              We're committed to providing the best grooming experience with quality service and attention to detail.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-700"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gray-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-amber-100 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-2 mb-4">
              <Scissors className="h-4 w-4" />
              <span className="text-sm font-medium">Our Services</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our <span className="bg-white bg-clip-text text-transparent">Popular Services</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover our most requested services, designed to give you the perfect look.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`group relative bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 ${
                  service.popular 
                    ? 'border-white bg-gray-800' 
                    : 'border-gray-700 hover:border-white/30'
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-gray-300 transition-colors">
                    {service.name}
                  </h3>
                  <div className="flex justify-center items-center space-x-4 mb-6">
                    <span className="text-3xl font-bold text-white">
                      {service.price}
                    </span>
                    <span className="text-gray-400 bg-gray-800 px-3 py-1 rounded-full text-sm">
                      {service.duration}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  <Link
                    to="/booking"
                    className="group inline-flex items-center justify-center w-full px-6 py-3 text-black bg-white rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 font-semibold"
                  >
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gray-800 rounded-full hover:bg-gray-700 transition-all duration-300 border-2 border-gray-700 hover:border-white/30"
            >
              View All Services
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 text-white">500+</div>
              <div className="text-gray-300 font-medium">Happy Clients</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 text-white">1</div>
              <div className="text-gray-300 font-medium">Expert Barber</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 text-white">2+</div>
              <div className="text-gray-300 font-medium">Years Experience</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300 text-white">4.9</div>
              <div className="text-gray-300 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">Ready to Transform?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready for a <span className="bg-white bg-clip-text text-transparent">New Look?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Book your appointment today and experience the difference that professional grooming makes.
          </p>
          <Link
            to="/booking"
            className="group inline-flex items-center justify-center px-10 py-4 text-xl font-bold text-black bg-white rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Zap className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
            Book Your Appointment
          </Link>
        </div>
      </section>
    </div>
  );
};

// ArrowRight component
const ArrowRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

export default Home; 