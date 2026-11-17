const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Pre-seeded verified campus students
const users = [
  {
    _id: '66461a1b8f1d2c001a111111',
    id: '66461a1b8f1d2c001a111111',
    name: 'Alex Morgan',
    email: 'alex.morgan@university.edu',
    studentId: 'STU-10291',
    passwordHash: bcrypt.hashSync('password123', 10),
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
  },
  {
    _id: '66461a1b8f1d2c001a222222',
    id: '66461a1b8f1d2c001a222222',
    name: 'Sarah Chen',
    email: 'sarah.chen@university.edu',
    studentId: 'STU-20942',
    passwordHash: bcrypt.hashSync('password123', 10),
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
  },
  {
    _id: '66461a1b8f1d2c001a333333',
    id: '66461a1b8f1d2c001a333333',
    name: 'David Kim',
    email: 'david.kim@university.edu',
    studentId: 'STU-33019',
    passwordHash: bcrypt.hashSync('password123', 10),
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
  },
];

const now = Date.now();
const rides = [
  {
    _id: '66461b2c8f1d2c002b111111',
    driver: users[0],
    origin: 'Central Library',
    destination: 'North Gate / Metro',
    departureTime: new Date(now + 45 * 60 * 1000).toISOString(),
    totalSeats: 1,
    availableSeats: 1,
    farePerSeat: 0,
    helmetProvided: true,
    bikeModel: 'Yamaha FZ-X',
    notes: 'Leaving right after Algorithm lecture. Waiting near library bike rack #3.',
    status: 'Open',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66461b2c8f1d2c002b222222',
    driver: users[1],
    origin: 'Engineering Block',
    destination: 'Sports Arena',
    departureTime: new Date(now + 90 * 60 * 1000).toISOString(),
    totalSeats: 1,
    availableSeats: 1,
    farePerSeat: 1.5,
    helmetProvided: true,
    bikeModel: 'Vespa Elegante',
    notes: 'Heading to campus badminton courts. Clean extra helmet available.',
    status: 'Open',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '66461b2c8f1d2c002b333333',
    driver: users[2],
    origin: 'Hostel Complex B',
    destination: 'Student Union / Food Court',
    departureTime: new Date(now + 150 * 60 * 1000).toISOString(),
    totalSeats: 1,
    availableSeats: 1,
    farePerSeat: 0,
    helmetProvided: true,
    bikeModel: 'Honda Activa 6G',
    notes: 'Quick lunch trip. Can carry a standard backpack.',
    status: 'Open',
    createdAt: new Date().toISOString(),
  },
];

const bookings = [
  {
    _id: '66461c3d8f1d2c003c111111',
    ride: rides[0],
    passenger: users[2],
    seatsBooked: 1,
    pickupNote: 'Will be holding a blue notebook.',
    verificationPin: '8492',
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  },
];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_campus_bikepool_jwt_key_2026', {
    expiresIn: '7d',
  });
};

const mockAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_campus_bikepool_jwt_key_2026');
    const user = users.find((u) => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Student account no longer exists.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = {
  users,
  rides,
  bookings,
  generateToken,
  mockAuthMiddleware,
};
