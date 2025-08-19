import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, Scissors, Sparkles, Zap, Award, ArrowRight } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/animations/ScrollReveal';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalAnimation, setModalAnimation] = useState('closed');
  const [pageAnimated, setPageAnimated] = useState(false);

  useEffect(() => {
    setServices([
      {
        _id: '1',
        name: "Men's Classic Cut",
        description: "A timeless classic men's haircut tailored to your style and face shape.",
        price: 150,
        duration: 45,
        category: 'haircut',
        popular: true,
        image: 'https://images.unsplash.com/photo-1630827020718-3433092696e7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        _id: '2',
        name: "Fade Haircut",
        description: "Modern fade haircut with clean lines and sharp contrast.",
        price: 150,
        duration: 50,
        category: 'haircut',
        popular: true,
        image: 'https://img.freepik.com/premium-photo/young-handsome-boy-barbershop_1048944-9286533.jpg?uid=R165827019&ga=GA1.1.285579409.1727629090&semt=ais_hybrid&w=740&q=80'
      },
      {
        _id: '3',
        name:"Curtain Haircut",
        description: "Trendy curtain haircut with longer top and shorter sides for a modern look.",
        price: 150,
        duration: 55,
        category: 'styling',
        popular: false,
        image: 'https://media.istockphoto.com/id/1385498091/photo/portrait-of-adult-caucasian-man-in-black-shirt-at-the-studio-with-white-isolated-background.jpg?s=612x612&w=0&k=20&c=_ldSSSHAtNpr1Hgem_-HJKv_kOnPNAh5uQgLCae5T4U='
      },
      {
        _id: '4',
        name: "Low fade haircut",
        description: "Subtle low fade haircut with gradual transition from short to longer hair.",
        price: 150,
        duration: 45,
        category: 'haircut',
        popular: true,
        image: 'https://media.istockphoto.com/id/2177784860/photo/professional-groomer-uses-big-brush-to-apply-white-powder.jpg?s=612x612&w=0&k=20&c=PlSY-jAInTAiRSIYMPb8noa49QI4MftUg5k-w12QtoU='
      },
      {
        _id: '5',
        name: "Beard Trim & Shape",
        description: "Professional beard trimming and shaping for a clean look.",
        price: 150,
        duration: 30,
        category: 'beard-trim',
        popular: true,
        image: "https://image.shutterstock.com/image-photo/straight-razor-barbershop-beard-vintage-260nw-2498174945.jpg"
      },
      {
        _id: '6',
        name: "Kids Haircut",
        description: "Gentle and fun haircut for children with patience and care.",
        price: 150,
        duration: 30,
        category: 'haircut',
        popular: false,
        image: 'https://media.istockphoto.com/id/825461082/photo/5-year-old-getting-a-haircut.jpg?s=612x612&w=0&k=20&c=ax37u3ZD2p7odcIyhTO82hqww5lJ8fOAUJXsUVP2Ag8='
      },
      {
        _id: '7',
        name: " Low Taper Fade",
        description: "Gradual fade from top to bottom with clean lines and smooth transition.",
        price: 150,
        duration: 50,
        category: 'haircut',
        popular: true,
        image:'https://i.pinimg.com/736x/0c/e5/97/0ce59724004f1815c328efc41564ebea.jpg'
      },
      {
        _id: '8',
        name: "Mid Fade",
        description: "Fade that starts in the middle of the sides for a balanced look.",
        price: 150,
        duration: 45,
        category: 'haircut',
        popular: true,
        image:'https://imgs.search.brave.com/3gwUfWB_ERV-XqOEhc9TRlci38ZdWpAdM7YFS3WDjkI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZW5z/aGFpcmN1dHMuY29t/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIy/LzEwL21pZC1mYWRl/LWhhaXJjdXQtc2hh/ci1iYW5nLXNwaWt5/LWhpZ2hsaWdodHMt/NjgzeDEwMjQuanBn'
      },
      {
        _id: '9',
        name: "Mullet",
        description: "Classic mullet with short front and sides, longer back for a retro vibe.",
        price: 150,
        duration: 55,
        category: 'haircut',
        popular: false,
        image:'https://img.freepik.com/premium-photo/teenager-wearing-denim-jacket-showing-hairstyle_1048944-20058970.jpg?uid=R165827019&ga=GA1.1.285579409.1727629090&semt=ais_hybrid&w=740&q=80'
      },
      {
        _id: '10',
        name: "Burst Fade",
        description: "Fade that curves around the ear for a unique and modern style.",
        price: 150,
        duration: 50,
        category: 'haircut',
        popular: true,
        image:'https://i.pinimg.com/736x/7e/7d/ea/7e7deaa4fa6aa702bc2e7a2e92b7a8ab.jpg'
      },
      {
        _id:'11',
        name:"Low Drop fade",
        description: "Fade that drops lower at the back for a stylish and edgy look.",
        price: 150,
        duration: 50,
        category:'Haircut',
        popular: true,
        image:'https://i.pinimg.com/736x/3d/c2/d5/3dc2d558c4eaee6f5bb20a560c56eb7b.jpg'
      },
      {
        _id: '12',
        name: "Buzz Cut",
        description: "Ultra-short cut for maximum low maintenance and clean appearance.",
        price: 150,
        duration: 25,
        category: 'haircut',
        popular: false,
        image: 'https://images.unsplash.com/photo-1640301133543-41fe25ad6450?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        _id: '13',
        name: "Textured Crop",
        description: "Messy, textured top with short sides for a modern, effortless look.",
        price: 150,
        duration: 45,
        category: 'haircut',
        popular: true,
        image:'https://i.pinimg.com/736x/d6/83/76/d683767ad34235e7f5ba740c1af6fd1c.jpg'
      },
      {
        _id: '14',
        name: "Hair Treatment",
        description: "Deep conditioning treatment for healthy and shiny hair.",
        price: 150,
        duration: 60,
        category: 'hair-treatment',
        popular: false,
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        _id:'15',
        name:"Army cut",
        description: "Short, uniform cut with tapered sides for a clean military-inspired look.",
        price: 150,
        duration: 40,
        category: 'haircut',
        popular: false,
        image:'https://media.istockphoto.com/id/175603014/photo/profile-view-of-blank-faced-marine.jpg?s=612x612&w=0&k=20&c=ngqaltrqAsBN5q1rkdNFBLhCH3wUha5FjNKmoQr6AAw='
      }
    ]);
    setLoading(false);
    setTimeout(() => setPageAnimated(true), 200);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('https://barbershop-website-vy8e.onrender.com/api/services');
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Services', color: 'from-blue-500 to-purple-500' },
    { id: 'haircut', name: 'Haircuts', color: 'from-green-500 to-emerald-500' },
    { id: 'styling', name: 'Styling', color: 'from-yellow-500 to-orange-500' },
    { id: 'beard-trim', name: 'Beard Trim', color: 'from-red-500 to-pink-500' },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const openModal = (service) => {
    setSelectedService(service);
    setModalOpen(true);
    setTimeout(() => setModalAnimation('open'), 10);
    setModalAnimation('opening');
  };

  const closeModal = () => {
    setModalAnimation('closing');
    setTimeout(() => {
      setModalOpen(false);
      setModalAnimation('closed');
      setSelectedService(null);
    }, 250);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading services...</p>
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
      <section className="relative py-20 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="up" delay={0}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20">
              <Scissors className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Our Services</span>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Professional <span className="text-amber-300">Grooming</span> Services
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={200}>
            <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of professional grooming services, 
              designed to give you the perfect look every time.
            </p>
          </ScrollReveal>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {/* Category Filter */}
        <ScrollReveal direction="up" delay={0}>
          <div className="bg-gray-900 rounded-2xl shadow-xl p-6 mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-gray-800 text-white hover:bg-gray-700 hover:shadow-md'
                  }`}
                >
                  {category.id === 'all' && <Sparkles className="h-4 w-4" />}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredServices.map((service, index) => (
            <div 
              key={service._id} 
              className="group relative bg-gray-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 cursor-pointer animate-fade-in-up"
              onClick={() => openModal(service)}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Popular
                  </span>
                </div>
              )}
              <div className="text-center">
                {service.image && (
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                )}
                <div className="w-16 h-16 bg-gray-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Scissors className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-amber-200 mb-4 group-hover:text-amber-300 transition-colors">
                  {service.name}
                </h3>
                <p className="text-amber-100 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <span className="text-3xl font-bold text-white">
                    ₱{service.price}
                  </span>
                  <span className="text-gray-400 bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.duration} min
                  </span>
                </div>
                <Link
                  to="/booking"
                  className="group inline-flex items-center justify-center w-full px-6 py-3 text-black bg-white rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 font-semibold"
                  onClick={e => e.stopPropagation()}
                >
                  Book Now
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        {filteredServices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scissors className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-300 text-xl font-medium">
              No services found in this category.
            </p>
          </div>
        )}
        {/* CTA Section */}
        <ScrollReveal direction="up" delay={100}>
          <div className="text-center mb-16">
            <div className="bg-gray-900 text-white rounded-2xl p-12 shadow-2xl border border-gray-700">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
                <Zap className="h-4 w-4 text-white" />
                <span className="text-sm font-medium">Ready to Transform?</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Book Your <span className="bg-white bg-clip-text text-transparent">Appointment?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Choose your preferred service and barber to get started on your transformation journey.
              </p>
              <Link
                to="/booking"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Zap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Book Appointment
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
      {/* Service Details Modal */}
      {modalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className={`bg-gray-900 text-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative transition-all duration-300 ease-out
              ${modalAnimation === 'opening' ? 'opacity-0 scale-95' : ''}
              ${modalAnimation === 'open' ? 'opacity-100 scale-100' : ''}
              ${modalAnimation === 'closing' ? 'opacity-0 scale-95' : ''}
            `}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold z-10"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="p-8">
              <div className="text-center">
                {selectedService.image && (
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={selectedService.image}
                      alt={selectedService.name}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                )}
                <div className="w-16 h-16 bg-gray-800 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Scissors className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">{selectedService.name}</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">{selectedService.description}</p>
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <span className="text-3xl font-bold text-white">
                    ₱{selectedService.price}
                  </span>
                  <span className="text-gray-400 bg-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedService.duration} min
                  </span>
                </div>
                {selectedService.popular && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-black mb-6">
                    <Star className="h-4 w-4 mr-1" />
                    Popular Choice
                  </div>
                )}
                <Link
                  to="/booking"
                  className="group inline-flex items-center justify-center w-full px-6 py-3 text-black bg-white rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 font-semibold"
                  onClick={() => closeModal()}
                >
                  Book This Service
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services; 