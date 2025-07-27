import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/dbConnect';
import { Car } from '@/model/cars';

// PUT - Update a car
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params; // Await params in Next.js 15

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Car ID is required' },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Extract text fields
    const model = formData.get('model')?.toString() || '';
    const type = formData.get('type')?.toString() || '';
    const regestrationNumber = formData.get('regestrationNumber')?.toString() || '';
    const location = formData.get('location')?.toString() || '';
    const pricePerDay = formData.get('pricePerDay')?.toString() || '';
    const year = formData.get('year')?.toString() || '';
    const transmission = formData.get('transmission')?.toString() || '';
    const fuel = formData.get('fuel')?.toString() || '';
    const seats = formData.get('seats')?.toString() || '';
    const imageFile = formData.get('image') as File | null;
    const existingImage = formData.get('existingImage')?.toString() || '';

    // Handle features - get ALL feature entries from FormData
    const features: string[] = [];
    
    // Get all entries with key 'features'
    const allEntries = Array.from(formData.entries());
    const featureEntries = allEntries.filter(([key]) => key === 'features');
    
    // Extract all feature values
    featureEntries.forEach(([, value]) => {
      const featureValue = value.toString().trim();
      if (featureValue && !features.includes(featureValue)) {
        features.push(featureValue);
      }
    });

    // Handle schedule - get ALL schedule entries from FormData
    const schedule: { date: Date }[] = [];
    
    const scheduleEntries = allEntries.filter(([key]) => key === 'schedule');
    
    scheduleEntries.forEach(([, value]) => {
      const dateValue = value.toString().trim();
      if (dateValue) {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          schedule.push({ date });
        }
      }
    });

    console.log('Processed features for update:', features); // Debug log
    console.log('Processed schedule for update:', schedule); // Debug log
    console.log('Car ID:', id); // Debug log

    // Convert string values to appropriate types
    const pricePerDayNum = parseFloat(pricePerDay);
    const yearNum = parseInt(year);
    const seatsNum = parseInt(seats);

    // Validate required fields
    if (!model || !type || !regestrationNumber || !location || 
        isNaN(pricePerDayNum) || isNaN(yearNum) || !transmission || 
        !fuel || isNaN(seatsNum)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid required fields. All fields except features and schedule are required.',
          debug: { 
            model: !!model, 
            type: !!type, 
            regestrationNumber: !!regestrationNumber,
            location: !!location,
            pricePerDay: !isNaN(pricePerDayNum),
            year: !isNaN(yearNum),
            transmission: !!transmission,
            fuel: !!fuel,
            seats: !isNaN(seatsNum)
          } 
        },
        { status: 400 }
      );
    }

    // Additional validation
    if (pricePerDayNum < 0) {
      return NextResponse.json(
        { success: false, error: 'Price per day must be a positive number' },
        { status: 400 }
      );
    }

    if (yearNum < 1900) {
      return NextResponse.json(
        { success: false, error: 'Year must be a valid number (1900 or later)' },
        { status: 400 }
      );
    }

    if (seatsNum < 1) {
      return NextResponse.json(
        { success: false, error: 'Seats must be at least 1' },
        { status: 400 }
      );
    }

    // Find existing car
    const existingCar = await Car.findById(id);
    if (!existingCar) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      );
    }

    // Check if registration number is unique (excluding current car)
    const duplicateRegistration = await Car.findOne({
      regestrationNumber,
      _id: { $ne: id }
    });

    if (duplicateRegistration) {
      return NextResponse.json(
        { success: false, error: 'Registration number already exists' },
        { status: 400 }
      );
    }

    let imageUrl = existingCar.image;

    // Handle image upload if new image is provided
    if (imageFile && imageFile.size > 0) {
      const buffer = await imageFile.arrayBuffer();
      const array = new Uint8Array(buffer);

      imageUrl = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: 'cars',
            resource_type: 'auto' 
          },
          (error, result) => {
            if (error || !result) {
              console.error('Cloudinary upload error:', error);
              reject(error || new Error('Image upload failed'));
              return;
            }
            resolve(result.secure_url);
          }
        ).end(array);
      });
    } else if (existingImage) {
      // Keep existing image if no new image is uploaded
      imageUrl = existingImage;
    }

    // Update car
    const updatedCar = await Car.findByIdAndUpdate(
      id,
      {
        model,
        type,
        regestrationNumber,
        location,
        pricePerDay: pricePerDayNum,
        image: imageUrl,
        year: yearNum,
        transmission,
        fuel,
        seats: seatsNum,
        features,
        schedule,
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      data: updatedCar 
    });

  } catch (error: unknown) {
    console.error('Error updating car:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { 
      status: 500 
    });
  }
}

// DELETE - Delete a car
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params; // Await params in Next.js 15

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Car ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting car with ID:', id); // Debug log

    const deletedCar = await Car.findByIdAndDelete(id);

    if (!deletedCar) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      );
    }

    // Optional: Delete image from Cloudinary
    // You would need to extract the public_id from the image URL and call:
    // await cloudinary.uploader.destroy(public_id);

    return NextResponse.json({ 
      success: true, 
      data: deletedCar 
    });

  } catch (error: unknown) {
    console.error('Error deleting car:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { 
      status: 500 
    });
  }
}

// GET - Get a single car
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params; // Await params in Next.js 15

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Car ID is required' },
        { status: 400 }
      );
    }

    const car = await Car.findById(id);

    if (!car) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: car 
    });

  } catch (error: unknown) {
    console.error('Error fetching car:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { 
      status: 500 
    });
  }
}