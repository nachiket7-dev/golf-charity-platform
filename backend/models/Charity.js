import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  description: { type: String },
  link: { type: String },
});

const charitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  logo: { type: String },
  images: [{ type: String }],
  website: { type: String },
  registrationNumber: { type: String },
  category: {
    type: String,
    enum: ['health', 'environment', 'education', 'sports', 'animals', 'community', 'international', 'other'],
    default: 'other',
  },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  events: [eventSchema],
  totalReceived: { type: Number, default: 0 },
  subscriberCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate slug from name
charitySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  next();
});

export default mongoose.model('Charity', charitySchema);
