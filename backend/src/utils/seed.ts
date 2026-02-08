import mongoose from 'mongoose';
import { User } from '../models/User';
import { DutyLocation } from '../models/DutyLocation';
import { Shift } from '../models/Shift';
import { config } from '../config/config';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await DutyLocation.deleteMany({});
    await Shift.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@guard.com',
      phone: '+1234567890',
      role: 'admin',
      password: 'Admin@123',
      isActive: true,
    });
    console.log('Created admin user');

    // Create supervisor
    const supervisor = await User.create({
      name: 'Supervisor User',
      email: 'supervisor@guard.com',
      phone: '+1234567891',
      role: 'supervisor',
      password: 'Super@123',
      isActive: true,
    });
    console.log('Created supervisor user');

    // Create sample guards
    const guards = await User.create([
      {
        name: 'John Smith',
        email: 'guard1@guard.com',
        phone: '+1234567892',
        role: 'guard',
        password: 'Guard@123',
        isActive: true,
      },
      {
        name: 'Jane Doe',
        email: 'guard2@guard.com',
        phone: '+1234567893',
        role: 'guard',
        password: 'Guard@123',
        isActive: true,
      },
      {
        name: 'Mike Johnson',
        email: 'guard3@guard.com',
        phone: '+1234567894',
        role: 'guard',
        password: 'Guard@123',
        isActive: true,
      },
      {
        name: 'Sarah Williams',
        email: 'guard4@guard.com',
        phone: '+1234567895',
        role: 'guard',
        password: 'Guard@123',
        isActive: true,
      },
      {
        name: 'David Brown',
        email: 'guard5@guard.com',
        phone: '+1234567896',
        role: 'guard',
        password: 'Guard@123',
        isActive: true,
      },
    ]);
    console.log('Created 5 guard users');

    // Create sample locations (using real coordinates)
    const locations = await DutyLocation.create([
      {
        name: 'Downtown Office Building',
        latitude: 40.7589,
        longitude: -73.9851,
        radius: 100,
        address: '123 Main St, New York, NY 10001',
        createdBy: admin._id,
        isActive: true,
      },
      {
        name: 'Shopping Mall - North Gate',
        latitude: 40.7614,
        longitude: -73.9776,
        radius: 150,
        address: '456 Mall Dr, New York, NY 10002',
        createdBy: admin._id,
        isActive: true,
      },
      {
        name: 'Residential Complex',
        latitude: 40.7505,
        longitude: -73.9934,
        radius: 200,
        address: '789 Residential Ave, New York, NY 10003',
        createdBy: admin._id,
        isActive: true,
      },
      {
        name: 'Industrial Park',
        latitude: 40.7489,
        longitude: -73.9680,
        radius: 250,
        address: '321 Industry Rd, New York, NY 10004',
        createdBy: admin._id,
        isActive: true,
      },
      {
        name: 'Hospital Main Entrance',
        latitude: 40.7686,
        longitude: -73.9918,
        radius: 80,
        address: '555 Health St, New York, NY 10005',
        createdBy: admin._id,
        isActive: true,
      },
    ]);
    console.log('Created 5 duty locations');

    // Assign locations to guards
    guards[0].assignedLocations = [locations[0]._id, locations[1]._id];
    guards[1].assignedLocations = [locations[1]._id, locations[2]._id];
    guards[2].assignedLocations = [locations[2]._id, locations[3]._id];
    guards[3].assignedLocations = [locations[3]._id, locations[4]._id];
    guards[4].assignedLocations = [locations[4]._id, locations[0]._id];

    await Promise.all(guards.map((guard) => guard.save()));
    console.log('Assigned locations to guards');

    // Create sample shifts
    const shifts = await Shift.create([
      {
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '16:00',
        lateThreshold: 15,
        location: locations[0]._id,
        assignedGuards: [guards[0]._id, guards[4]._id],
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        isActive: true,
      },
      {
        name: 'Evening Shift',
        startTime: '16:00',
        endTime: '00:00',
        lateThreshold: 15,
        location: locations[1]._id,
        assignedGuards: [guards[1]._id],
        daysOfWeek: [1, 2, 3, 4, 5],
        isActive: true,
      },
      {
        name: 'Night Shift',
        startTime: '00:00',
        endTime: '08:00',
        lateThreshold: 10,
        location: locations[2]._id,
        assignedGuards: [guards[2]._id],
        daysOfWeek: [1, 2, 3, 4, 5],
        isActive: true,
      },
      {
        name: 'Weekend Day Shift',
        startTime: '09:00',
        endTime: '17:00',
        lateThreshold: 20,
        location: locations[3]._id,
        assignedGuards: [guards[3]._id],
        daysOfWeek: [0, 6], // Sunday and Saturday
        isActive: true,
      },
      {
        name: 'Weekend Night Shift',
        startTime: '17:00',
        endTime: '01:00',
        lateThreshold: 20,
        location: locations[4]._id,
        assignedGuards: [guards[4]._id],
        daysOfWeek: [0, 6],
        isActive: true,
      },
    ]);
    console.log('Created 5 shifts');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('-------------------');
    console.log('Admin:');
    console.log('  Email: admin@guard.com');
    console.log('  Password: Admin@123');
    console.log('\nSupervisor:');
    console.log('  Email: supervisor@guard.com');
    console.log('  Password: Super@123');
    console.log('\nGuards (5 users):');
    console.log('  Email: guard1@guard.com - guard5@guard.com');
    console.log('  Password: Guard@123 (same for all guards)');
    console.log('\n⚠️  Remember to change these credentials in production!');

    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
