import { Schema, model, models, Types } from 'mongoose';

const CarOwnerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email format'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  joinedDate: {
    type: String,
    required: [true, 'Joined date is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    required: true,
  },
  cars: [
    {
      type: Types.ObjectId,
      ref: 'Car',
      required: true,
    }
  ],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const CarOwner = models.CarOwner || model('CarOwner', CarOwnerSchema);
