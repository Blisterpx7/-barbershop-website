const mongoose = require('mongoose');
const Service = require('./models/service.js');
const Barber = require('./models/barber.js');
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./db.js');

const sampleServices = [
  // HAIRCUT SERVICES
  {
    name: 'Classic Haircut',
    description: 'Professional haircut with wash, cut, and style. Perfect for any occasion.',
    duration: 60,
    price: 150,
    category: 'haircut',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'
  },
  {
    name: 'Fade Haircut',
    description: 'Modern fade haircut with clean lines and sharp edges. Popular among young men.',
    duration: 75,
    price: 200,
    category: 'haircut',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400'
  },
  {
    name: 'Undercut Haircut',
    description: 'Trendy undercut with longer top and short sides. Modern and stylish.',
    duration: 80,
    price: 150,
    category: 'haircut',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'
  },
  {
    name: 'Buzz Cut',
    description: 'Short, clean buzz cut. Low maintenance and professional look.',
    duration: 45,
    price: 150,
    category: 'haircut',
    popular: false,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'
  },
  {
    name: 'Textured Crop',
    description: 'Modern textured crop with natural movement and style.',
    duration: 70,
    price: 150,
    category: 'haircut',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'
  },
  
  // BEARD SERVICES
  {
    name: 'Beard Trim & Shape',
    description: 'Expert beard trimming and shaping to maintain your perfect look.',
    duration: 30,
    price: 150,
    category: 'beard-trim',
    popular: true,
    imageUrl: "https://image.shutterstock.com/image-photo/straight-razor-barbershop-beard-vintage-260nw-2498174945.jpg"
  },
 
  // STYLING SERVICES
  {
    name: 'Hair Styling',
    description: 'Professional styling for special occasions or everyday look.',
    duration: 60,
    price: 150,
    category: 'styling',
    popular: true,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400'
  },

  // PACKAGE SERVICES
  {
    name: 'Kids Haircut',
    description: 'Gentle and fun haircuts for children with special care and patience.',
    duration: 45,
    price: 150,
    category: 'package',
    popular: false,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400'
  },
  
];

const sampleBarbers = [
  {
    name: 'James Andrei Mayang',
    email: 'jamesmayang51@gmail.com',
    phone: '+639977392206',
    specialties: ['styling', 'haircut', 'hair-treatment'],
    experience: 2,
    rating: 5.0,
    totalReviews: 134,
    schedule: {
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      startTime: '10:00am',
      endTime: '8:00pm' 
    },
    bio: 'Creative stylist known for trendy cuts and personalized service. Expert in modern fades and classic styles.',
    imageUrl: '/api/barbers/images/james.jpg',
  }, 
];

async function seedData() {
  try {
    await connectDB();
    
    // Clear existing data
    await Service.deleteMany({});
    await Barber.deleteMany({});
    
    console.log('Cleared existing data...');
    
    // Insert sample services
    const services = await Service.insertMany(sampleServices);
    console.log(`✅ Inserted ${services.length} services`);
    
    // Insert sample barbers
    const barbers = await Barber.insertMany(sampleBarbers);
    console.log(`✅ Inserted ${barbers.length} barbers`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample Services:');
    services.forEach(service => {
      console.log(`- ${service.name}: ₱${service.price} (${service.duration} min)`);
    });
    
    console.log('\nSample Barbers:');
    barbers.forEach(barber => {
      console.log(`- ${barber.name}: ${barber.experience} years experience, ${barber.rating}⭐`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 