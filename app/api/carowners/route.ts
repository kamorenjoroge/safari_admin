// app/api/carowners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { CarOwner } from '@/model/carowners';
import { Car } from '@/model/cars';
import mongoose from 'mongoose';

// GET - Fetch all car owners with populated car data
export async function GET() {
  try {
    await dbConnect();
    
    const owners = await CarOwner.find({})
      .populate({
        path: 'cars',
        select: 'model regestrationNumber type year image location pricePerDay',
        model: 'Car'
      })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: owners,
      count: owners.length
    });
  } catch (error) {
    console.error('Error fetching car owners:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch car owners' 
      },
      { status: 500 }
    );
  }
}

// POST - Create new car owner
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, email, phone, location, joinedDate, status, cars } = body;

    // Validation
    if (!name || !email || !phone || !location || !joinedDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, email, phone, location, joinedDate' 
        },
        { status: 400 }
      );
    }

    if (!cars || !Array.isArray(cars) || cars.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one car must be assigned to the owner' 
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingOwnerByEmail = await CarOwner.findOne({ email });
    if (existingOwnerByEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An owner with this email already exists' 
        },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const existingOwnerByPhone = await CarOwner.findOne({ phone });
    if (existingOwnerByPhone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An owner with this phone number already exists' 
        },
        { status: 400 }
      );
    }

    // Validate car IDs and check if they exist
    const validCarIds = cars.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validCarIds.length !== cars.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid car ID format' 
        },
        { status: 400 }
      );
    }

    // Check if all cars exist
    const existingCars = await Car.find({ _id: { $in: validCarIds } });
    if (existingCars.length !== validCarIds.length) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'One or more cars do not exist' 
        },
        { status: 400 }
      );
    }

    // Check if any of the cars are already assigned to another owner
    const carsAlreadyAssigned = await CarOwner.find({
      cars: { $in: validCarIds }
    });

    if (carsAlreadyAssigned.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'One or more cars are already assigned to another owner' 
        },
        { status: 400 }
      );
    }

    // Create the new car owner
    const newOwner = new CarOwner({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      location: location.trim(),
      joinedDate: joinedDate.trim(),
      status: status || 'active',
      cars: validCarIds
    });

    const savedOwner = await newOwner.save();
    
    // Populate the cars data in the response
    const populatedOwner = await CarOwner.findById(savedOwner._id)
      .populate({
        path: 'cars',
        select: 'model regestrationNumber type year image location pricePerDay',
        model: 'Car'
      });

    return NextResponse.json({
      success: true,
      data: populatedOwner,
      message: 'Car owner created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating car owner:', error);
    
    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: `Validation error: ${validationErrors.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      const keyPattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern;
      const field = keyPattern ? Object.keys(keyPattern)[0] : 'field';
      return NextResponse.json(
        { 
          success: false, 
          error: `${field} already exists` 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}