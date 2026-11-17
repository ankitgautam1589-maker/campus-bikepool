const mongoose = require('mongoose');
const User = require('./models/User');
const Ride = require('./models/Ride');
const Booking = require('./models/Booking');

const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding initial campus students and bike rides...');

    // 1. Create Verified Demo Students
    const user1 = await User.create({
      name: 'Alex Morgan',
      email: 'alex.morgan@university.edu',
      studentId: 'STU-10291',
      password: 'password123',
      department: 'Computer Science',
      phoneNumber: '+15550192831',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      isVerifiedStudent: true,
      rating: { average: 4.9, count: 24 },
      bikeDetails: {
        hasBike: true,
        model: 'Yamaha FZ-X 150',
        plateNumber: 'CMP-8821',
        hasPillionHelmet: true,
      },
    });

    const user2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.chen@university.edu',
      studentId: 'STU-20942',
      password: 'password123',
      department: 'Electrical Eng',
      phoneNumber: '+15550198822',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
      isVerifiedStudent: true,
      rating: { average: 5.0, count: 18 },
      bikeDetails: {
        hasBike: true,
        model: 'Vespa Elegante 150',
        plateNumber: 'CMP-4390',
        hasPillionHelmet: true,
      },
    });

    const user3 = await User.create({
      name: 'David Kim',
      email: 'david.kim@university.edu',
      studentId: 'STU-33019',
      password: 'password123',
      department: 'Business & MBA',
      phoneNumber: '+15550194911',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      isVerifiedStudent: true,
      rating: { average: 4.8, count: 31 },
      bikeDetails: {
        hasBike: true,
        model: 'Honda Activa 6G',
        plateNumber: 'CMP-7712',
        hasPillionHelmet: true,
      },
    });

    // 2. Create Sample Rides departing in future
    const now = Date.now();
    const ride1 = await Ride.create({
      driver: user1._id,
      origin: 'Central Library',
      destination: 'North Gate / Metro',
      departureTime: new Date(now + 45 * 60 * 1000), // +45 mins
      totalSeats: 1,
      availableSeats: 1,
      farePerSeat: 0,
      helmetProvided: true,
      bikeModel: 'Yamaha FZ-X',
      notes: 'Leaving right after Algorithm lecture. Waiting near library bike rack #3.',
      status: 'Open',
    });

    const ride2 = await Ride.create({
      driver: user2._id,
      origin: 'Engineering Block',
      destination: 'Sports Arena',
      departureTime: new Date(now + 90 * 60 * 1000), // +1.5 hours
      totalSeats: 1,
      availableSeats: 1,
      farePerSeat: 1.5,
      helmetProvided: true,
      bikeModel: 'Vespa Elegante',
      notes: 'Heading to campus badminton courts. Clean extra helmet available.',
      status: 'Open',
    });

    const ride3 = await Ride.create({
      driver: user3._id,
      origin: 'Hostel Complex B',
      destination: 'Student Union / Food Court',
      departureTime: new Date(now + 150 * 60 * 1000), // +2.5 hours
      totalSeats: 1,
      availableSeats: 1,
      farePerSeat: 0,
      helmetProvided: true,
      bikeModel: 'Honda Activa 6G',
      notes: 'Quick lunch trip. Can carry a standard backpack.',
      status: 'Open',
    });

    // 3. Create a demo booking for user3 on ride1 to illustrate active bookings
    await Booking.create({
      ride: ride1._id,
      passenger: user3._id,
      seatsBooked: 1,
      status: 'Confirmed',
      pickupNote: 'Will be holding a blue notebook.',
      verificationPin: '8492',
    });

    console.log('[Seed] Demo campus database seeded successfully!');
    console.log(`[Seed] Demo Accounts:`);
    console.log(`   - alex.morgan@university.edu (pass: password123)`);
    console.log(`   - sarah.chen@university.edu  (pass: password123)`);
    console.log(`   - david.kim@university.edu   (pass: password123)`);
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
};

module.exports = seedDemoData;
