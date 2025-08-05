// app/api/carowners/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { CarOwner } from '@/model/carowners';
import { Car } from '@/model/cars';
import mongoose from 'mongoose';

// GET - Fetch single car owner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params; // Await params before accessing id
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid owner ID format' 
        },
        { status: 400 }
      );
    }
    
    const owner = await CarOwner.findById(id)
      .populate({
        path: 'cars',
        select: 'model regestrationNumber type year image location pricePerDay',
        model: 'Car'
      });
    
    if (!owner) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Car owner not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: owner
    });
  } catch (error) {
    console.error('Error fetching car owner:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch car owner' 
      },
      { status: 500 }
    );
  }
}

// PUT - Update car owner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params; // Await params before accessing id
    const body = await request.json();
    const { name, email, phone, location, joinedDate, status, cars } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid owner ID format' 
        },
        { status: 400 }
      );
    }

    // Check if owner exists
    const existingOwner = await CarOwner.findById(id);
    if (!existingOwner) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Car owner not found' 
        },
        { status: 404 }
      );
    }

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

    // Check if email already exists (excluding current owner)
    const existingOwnerByEmail = await CarOwner.findOne({ 
      email: email.trim().toLowerCase(),
      _id: { $ne: id }
    });
    if (existingOwnerByEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An owner with this email already exists' 
        },
        { status: 400 }
      );
    }

    // Check if phone already exists (excluding current owner)
    const existingOwnerByPhone = await CarOwner.findOne({ 
      phone: phone.trim(),
      _id: { $ne: id }
    });
    if (existingOwnerByPhone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An owner with this phone number already exists' 
        },
        { status: 400 }
      );
    }

    // Validate car IDs
    const validCarIds = cars.filter(carId => mongoose.Types.ObjectId.isValid(carId));
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

    // Check if any of the cars are already assigned to another owner (excluding current owner)
    const carsAlreadyAssigned = await CarOwner.find({
      cars: { $in: validCarIds },
      _id: { $ne: id }
    });

    if (carsAlreadyAssigned.length > 0) {
      // Find which specific cars are already assigned
      return NextResponse.json(
        { 
          success: false, 
          error: 'One or more cars are already assigned to another owner' 
        },
        { status: 400 }
      );
    }

    // Update the car owner
    const updatedOwner = await CarOwner.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        location: location.trim(),
        joinedDate: joinedDate.trim(),
        status: status || 'active',
        cars: validCarIds
      },
      { 
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'cars',
      select: 'model regestrationNumber type year image location pricePerDay',
      model: 'Car'
    });

    return NextResponse.json({
      success: true,
      data: updatedOwner,
      message: 'Car owner updated successfully'
    });

  } catch (error) {
    console.error('Error updating car owner:', error);
    
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
      (error as mongoose.mongo.MongoError).code === 11000
    ) {
      const mongoError = error as mongoose.mongo.MongoError & { keyPattern?: Record<string, unknown> };
      const field = mongoError.keyPattern ? Object.keys(mongoError.keyPattern)[0] : 'unknown';
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

// DELETE - Delete car owner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params; // Await params before accessing id
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid owner ID format' 
        },
        { status: 400 }
      );
    }
    
    const deletedOwner = await CarOwner.findByIdAndDelete(id);
    
    if (!deletedOwner) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Car owner not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Car owner deleted successfully',
      data: { id: deletedOwner._id }
    });
  } catch (error) {
    console.error('Error deleting car owner:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete car owner' 
      },
      { status: 500 }
    );
  }
}