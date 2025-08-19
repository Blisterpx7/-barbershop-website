const express = require('express');
const Barber = require('../models/barber.js');
const router = express.Router();

// Get all active barbers
router.get('/', async (req, res) => {
  try {
    const barbers = await Barber.find({ isActive: true }).sort({ name: 1 });
    res.json(barbers);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    res.status(500).json({ error: 'Failed to fetch barbers' });
  }
});

// Get barber by ID
router.get('/:id', async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }
    res.json(barber);
  } catch (error) {
    console.error('Error fetching barber:', error);
    res.status(500).json({ error: 'Failed to fetch barber' });
  }
});

// Get barber image
router.get('/:id/image', async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }
    
    if (!barber.imageUrl) {
      return res.status(404).json({ error: 'No image available for this barber' });
    }
    
    res.json({ imageUrl: barber.imageUrl });
  } catch (error) {
    console.error('Error fetching barber image:', error);
    res.status(500).json({ error: 'Failed to fetch barber image' });
  }
});

module.exports = router;
