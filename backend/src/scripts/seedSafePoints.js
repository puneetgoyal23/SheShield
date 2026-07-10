import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup env to connect to Atlas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import SafePoint from '../models/SafePoint.js';

const seedSafePoints = async () => {
  try {
    const mongoUri = process.env.Mongo_URI || "mongodb://localhost:27017/sheshield";
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Clear existing to avoid duplicates if run multiple times
    await SafePoint.deleteMany({});
    console.log('Cleared existing SafePoints.');

    const demoPoints = [
      {
        name: 'Cyber City Police Station',
        latitude: 28.4950,
        longitude: 77.0890,
        category: 'Police Station',
        openStatus: 'Open 24/7',
      },
      {
        name: 'Fortis Memorial Research Institute',
        latitude: 28.4595,
        longitude: 77.0725,
        category: 'Hospital',
        openStatus: 'Open 24/7',
      },
      {
        name: 'HUDA City Centre Metro',
        latitude: 28.4593,
        longitude: 77.0724,
        category: 'Metro Station',
        openStatus: 'Closes at 11:30 PM',
      },
      {
        name: 'Apollo Pharmacy 24/7',
        latitude: 28.4650,
        longitude: 77.0600,
        category: 'Pharmacy',
        openStatus: 'Open 24/7',
      },
      {
        name: 'Women Help Centre - Galleria',
        latitude: 28.4710,
        longitude: 77.0805,
        category: 'Women Help Centre',
        openStatus: 'Open 24/7',
      },
      {
        name: 'MG Road Metro Station',
        latitude: 28.4800,
        longitude: 77.0800,
        category: 'Metro Station',
        openStatus: 'Closes at 11:30 PM',
      },
      {
        name: 'Medanta - The Medicity',
        latitude: 28.4385,
        longitude: 77.0425,
        category: 'Hospital',
        openStatus: 'Open 24/7',
      },
      {
        name: 'Sushant Lok Police Station',
        latitude: 28.4500,
        longitude: 77.0750,
        category: 'Police Station',
        openStatus: 'Open 24/7',
      },
      {
        name: 'Connaught Place Police Post',
        latitude: 28.6304,
        longitude: 77.2177,
        category: 'Police Station',
        openStatus: 'Open 24/7',
      },
      {
        name: 'Safdarjung Hospital',
        latitude: 28.5685,
        longitude: 77.2062,
        category: 'Hospital',
        openStatus: 'Open 24/7',
      },
      {
        name: 'Rajiv Chowk Metro',
        latitude: 28.6328,
        longitude: 77.2197,
        category: 'Metro Station',
        openStatus: 'Closes at 11:30 PM',
      },
      {
        name: 'New Delhi Railway Station',
        latitude: 28.6429,
        longitude: 77.2212,
        category: 'Railway Station',
        openStatus: 'Open 24/7',
      }
    ];

    await SafePoint.insertMany(demoPoints);
    console.log(`Successfully seeded ${demoPoints.length} safe points!`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
};

seedSafePoints();
