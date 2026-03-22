/**
 * Seed script — creates test data for development
 * Usage: node seed.js
 *
 * Creates:
 *  - 1 admin user        (admin@test.com / Admin1234!)
 *  - 1 subscriber user   (user@test.com / User1234!)
 *  - 5 sample charities
 *  - 1 published sample draw
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// ── inline minimal schemas (avoid circular imports) ──────────────────────────
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'subscriber' },
  subscriptionStatus: { type: String, default: 'inactive' },
  subscriptionPlan: String,
  scores: [{ value: Number, date: Date, enteredAt: Date }],
  selectedCharity: mongoose.Schema.Types.ObjectId,
  charityPercentage: { type: Number, default: 10 },
  totalWon: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const charitySchema = new mongoose.Schema({
  name: String, slug: String, description: String,
  shortDescription: String, logo: String, category: String,
  isFeatured: Boolean, isActive: { type: Boolean, default: true },
  totalReceived: { type: Number, default: 0 },
  events: [{ title: String, date: Date, location: String, description: String }],
  createdAt: { type: Date, default: Date.now },
});

const drawSchema = new mongoose.Schema({
  month: Number, year: Number, drawType: String,
  status: { type: String, default: 'published' },
  winningNumbers: [Number],
  totalPrizePool: Number, jackpotPool: Number,
  fourMatchPool: Number, threeMatchPool: Number,
  jackpotRollover: { type: Number, default: 0 },
  participantCount: Number, totalSubscribers: Number,
  winners: [{
    user: mongoose.Schema.Types.ObjectId,
    matchType: String, prizeAmount: Number,
    paymentStatus: { type: String, default: 'pending' },
  }],
  publishedAt: Date,
  totalCharityContributions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Charity = mongoose.model('Charity', charitySchema);
const Draw = mongoose.model('Draw', drawSchema);

const CHARITIES = [
  {
    name: 'Irish Cancer Society',
    slug: 'irish-cancer-society',
    category: 'health',
    isFeatured: true,
    shortDescription: 'Supporting cancer patients and funding life-saving research across Ireland.',
    description: 'The Irish Cancer Society is the national cancer charity in Ireland. We fund world-class research, provide specialist nurses, and run support programmes for patients and families affected by cancer.',
    logo: 'https://ui-avatars.com/api/?name=ICS&background=166534&color=ffffff&size=128&bold=true',
    totalReceived: 240000,
    events: [
      { title: 'Charity Golf Day', date: new Date('2026-05-10'), location: 'Royal Dublin Golf Club', description: 'Annual charity golf classic raising funds for cancer research.' },
    ],
  },
  {
    name: 'Tidy Towns Ireland',
    slug: 'tidy-towns-ireland',
    category: 'environment',
    isFeatured: true,
    shortDescription: 'Keeping Ireland beautiful — one community at a time.',
    description: 'Tidy Towns is a nationwide community initiative to improve the environment and appearance of Irish towns and villages. We support hundreds of local groups across the country.',
    logo: 'https://ui-avatars.com/api/?name=TT&background=14532d&color=ffffff&size=128&bold=true',
    totalReceived: 95000,
  },
  {
    name: 'GOAL Worldwide',
    slug: 'goal-worldwide',
    category: 'international',
    isFeatured: false,
    shortDescription: 'Responding to humanitarian crises in the world\'s most vulnerable communities.',
    description: 'GOAL is an international humanitarian organisation founded in Ireland in 1977. We work in some of the most challenging environments in the world, responding to emergencies and building resilience.',
    logo: 'https://ui-avatars.com/api/?name=GOAL&background=1d4ed8&color=ffffff&size=128&bold=true',
    totalReceived: 312000,
  },
  {
    name: 'Dogs Trust Ireland',
    slug: 'dogs-trust-ireland',
    category: 'animals',
    isFeatured: false,
    shortDescription: 'The dog rescue centre that never puts a healthy dog to sleep.',
    description: 'Dogs Trust is Ireland\'s largest dog welfare charity, rehoming thousands of dogs every year. We believe every dog deserves a loving home and work tirelessly to make that happen.',
    logo: 'https://ui-avatars.com/api/?name=DT&background=92400e&color=ffffff&size=128&bold=true',
    totalReceived: 128000,
  },
  {
    name: 'Barretstown',
    slug: 'barretstown',
    category: 'health',
    isFeatured: true,
    shortDescription: 'Rebuilding lives affected by serious childhood illness through the power of camp.',
    description: 'Barretstown is a magical place in the heart of County Kildare where children living with serious illness and their families can find fun, friendship and healing through specially designed therapeutic recreation programmes. All programmes are provided free of charge.',
    logo: 'https://ui-avatars.com/api/?name=B&background=4c1d95&color=ffffff&size=128&bold=true',
    totalReceived: 176000,
    events: [
      { title: 'Summer Gala Golf Tournament', date: new Date('2026-06-15'), location: 'K Club, Straffan', description: 'An exclusive golf tournament supporting therapeutic programmes for children.' },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing seed data
    await User.deleteMany({ email: { $in: ['admin@test.com', 'user@test.com'] } });
    await Charity.deleteMany({ slug: { $in: CHARITIES.map(c => c.slug) } });
    await Draw.deleteMany({ month: 3, year: 2026 });

    // Create charities
    const charities = await Charity.insertMany(CHARITIES);
    console.log(`✅ Created ${charities.length} charities`);

    // Hash passwords
    const adminPwd = await bcrypt.hash('Admin1234!', 12);
    const userPwd = await bcrypt.hash('User1234!', 12);

    // Create admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: adminPwd,
      role: 'admin',
      subscriptionStatus: 'active',
      subscriptionPlan: 'yearly',
    });

    // Create subscriber with 5 scores
    const subscriber = await User.create({
      name: 'Test Golfer',
      email: 'user@test.com',
      password: userPwd,
      role: 'subscriber',
      subscriptionStatus: 'active',
      subscriptionPlan: 'monthly',
      selectedCharity: charities[0]._id,
      charityPercentage: 15,
      scores: [
        { value: 32, date: new Date('2026-03-10'), enteredAt: new Date() },
        { value: 28, date: new Date('2026-03-03'), enteredAt: new Date() },
        { value: 35, date: new Date('2026-02-24'), enteredAt: new Date() },
        { value: 22, date: new Date('2026-02-17'), enteredAt: new Date() },
        { value: 38, date: new Date('2026-02-10'), enteredAt: new Date() },
      ],
    });

    console.log('✅ Created admin user:      admin@test.com / Admin1234!');
    console.log('✅ Created subscriber user: user@test.com / User1234!');

    // Create a sample published draw for March 2026
    const draw = await Draw.create({
      month: 3,
      year: 2026,
      drawType: 'random',
      status: 'published',
      winningNumbers: [22, 28, 32, 35, 40],
      totalPrizePool: 560000, // €5,600
      jackpotPool: 224000,    // €2,240 (40%)
      fourMatchPool: 196000,  // €1,960 (35%)
      threeMatchPool: 140000, // €1,400 (25%)
      jackpotRollover: 0,
      participantCount: 1,
      totalSubscribers: 2,
      totalCharityContributions: 70000, // €700
      winners: [
        {
          user: subscriber._id,
          matchType: '4-match',  // user matched 22, 28, 32, 35 = 4 numbers
          prizeAmount: 196000,
          paymentStatus: 'pending',
        },
      ],
      publishedAt: new Date('2026-03-15'),
    });

    console.log('✅ Created sample draw for March 2026');
    console.log('\n🎉 Seed complete!');
    console.log('\n📋 Test credentials:');
    console.log('   Admin:      admin@test.com  / Admin1234!  →  /admin');
    console.log('   Subscriber: user@test.com   / User1234!   →  /dashboard');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
