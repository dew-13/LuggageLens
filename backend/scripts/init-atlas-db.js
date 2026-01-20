const mongoose = require('mongoose');
require('dotenv').config();

async function initAtlasDB() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get database info
    const admin = mongoose.connection.db.admin();
    const status = await admin.ping();
    console.log('✅ Database is responsive');

    // Create collections
    const db = mongoose.connection.db;
    
    // Users collection
    await db.createCollection('users').catch(() => {
      console.log('ℹ️  Users collection already exists');
    });

    // Lost Baggage collection
    await db.createCollection('lostbaggages').catch(() => {
      console.log('ℹ️  Lost Baggage collection already exists');
    });

    // Found Baggage collection
    await db.createCollection('foundbaggages').catch(() => {
      console.log('ℹ️  Found Baggage collection already exists');
    });

    // Matches collection
    await db.createCollection('matches').catch(() => {
      console.log('ℹ️  Matches collection already exists');
    });

    // Notifications collection
    await db.createCollection('notifications').catch(() => {
      console.log('ℹ️  Notifications collection already exists');
    });

    console.log('✅ Collections created/verified');

    // Insert sample users
    const users = db.collection('users');
    
    // Check if passenger exists
    const existingPassenger = await users.findOne({ email: 'passenger@email.com' });
    if (!existingPassenger) {
      await users.insertOne({
        name: 'Test Passenger',
        email: 'passenger@email.com',
        password: 'hashed_password_123',
        role: 'passenger',
        phone: '+1234567890',
        createdAt: new Date(),
        verified: true
      });
      console.log('✅ Sample passenger user created');
    } else {
      console.log('ℹ️  Passenger user already exists');
    }

    // Check if staff exists
    const existingStaff = await users.findOne({ email: 'staff@email.com' });
    if (!existingStaff) {
      await users.insertOne({
        name: 'Test Staff',
        email: 'staff@email.com',
        password: 'hashed_password_123',
        role: 'staff',
        phone: '+9876543210',
        createdAt: new Date(),
        verified: true
      });
      console.log('✅ Sample staff user created');
    } else {
      console.log('ℹ️  Staff user already exists');
    }

    // Check if admin exists
    const existingAdmin = await users.findOne({ email: 'admin@email.com' });
    if (!existingAdmin) {
      await users.insertOne({
        name: 'Admin User',
        email: 'admin@email.com',
        password: 'hashed_password_123',
        role: 'admin',
        phone: '+1111111111',
        createdAt: new Date(),
        verified: true
      });
      console.log('✅ Sample admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n✅ Database initialization complete!');
    console.log('\n📊 Sample Credentials:');
    console.log('   Passenger: passenger@email.com / password');
    console.log('   Staff:     staff@email.com / password');
    console.log('   Admin:     admin@email.com / password');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initAtlasDB();
