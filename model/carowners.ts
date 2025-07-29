import { Schema, model, models } from 'mongoose';

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
  cars: {
    type: [
      {
        _id: {
          type: String,
          required: true,
        },
        model: {
          type: String,
          required: [true, 'Car model is required'],
          trim: true,
        },
        regestrationNumber: {
          type: String,
          required: [true, 'Registration number is required'],
          trim: true,
        },
        type: {
          type: String,
          required: [true, 'Car type is required'],
          trim: true,
        },
        year: {
          type: Number,
          required: [true, 'Year is required'],
          min: [1900, 'Invalid year'],
        },
        image: {
          type: String,
          required: [true, 'Image URL is required'],
          trim: true,
        },
      },
    ],
    required: [true, 'At least one car is required'],
    validate: {
      validator: function (cars: {
        _id: string;
        model: string;
        regestrationNumber: string;
        type: string;
        year: number;
        image: string;
      }[]) {
        return cars.length > 0;
      },
      message: 'At least one car must be listed',
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

export const CarOwner = models.CarOwner || model('CarOwner', CarOwnerSchema);
