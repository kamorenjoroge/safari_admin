import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import dbConnect from '@/lib/dbConnect';
import { Car } from '@/model/cars';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const formData = await request.formData();

    // Extract text fields
    const model = formData.get('model')?.toString() || '';
    const type = formData.get('type')?.toString() || '';
    const regestrationNumber = formData.get('regestrationNumber')?.toString() || '';
    const location = formData.get('location')?.toString() || '';
    const pricePerDay = parseFloat(formData.get('pricePerDay')?.toString() || '0');
    const year = parseInt(formData.get('year')?.toString() || '0');
    const transmission = formData.get('transmission')?.toString() || '';
    const fuel = formData.get('fuel')?.toString() || '';
    const seats = parseInt(formData.get('seats')?.toString() || '0');
    const imageFile = formData.get('image') as File | null;

    // Handle features - get ALL feature entries from FormData
    const features: string[] = [];
    
    // Method 1: Get all entries with key 'features' (for multiple append calls)
    const allEntries = Array.from(formData.entries());
    const featureEntries = allEntries.filter(([key]) => key === 'features');
    
    // Extract all feature values
    featureEntries.forEach(([, value]) => {
      const featureValue = value.toString().trim();
      if (featureValue && !features.includes(featureValue)) {
        features.push(featureValue);
      }
    });

    // Method 2: Fallback to check for JSON string (if sent as single JSON)
    if (features.length === 0) {
      const featuresJson = formData.get('featuresJson')?.toString();
      if (featuresJson) {
        try {
          const parsedFeatures = JSON.parse(featuresJson) as string[];
          features.push(...parsedFeatures);
        } catch (e) {
          console.error('Failed to parse features JSON:', e);
        }
      }
    }

    // Handle schedule data (optional)
    const schedule: Array<{ date: Date }> = [];
    const scheduleJson = formData.get('scheduleJson')?.toString();
    if (scheduleJson) {
      try {
        const parsedSchedule = JSON.parse(scheduleJson) as Array<{ date: string }>;
        schedule.push(...parsedSchedule.map(item => ({ date: new Date(item.date) })));
      } catch (e) {
        console.error('Failed to parse schedule JSON:', e);
      }
    }

    console.log('Processed features:', features); // Debug log
    console.log('Processed schedule:', schedule); // Debug log

    // Validate required fields
    if (!model || !type || !regestrationNumber || !location || pricePerDay <= 0 || year < 1900 || !transmission || !fuel || seats < 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing or invalid required fields. All fields are required and must be valid.',
          debug: { 
            model: !!model, 
            type: !!type, 
            regestrationNumber: !!regestrationNumber,
            location: !!location,
            pricePerDay: pricePerDay > 0,
            year: year >= 1900,
            transmission: !!transmission,
            fuel: !!fuel,
            seats: seats >= 1
          } 
        },
        { status: 400 }
      );
    }

    // Check if registration number already exists
    const existingCar = await Car.findOne({ regestrationNumber });
    if (existingCar) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A car with this registration number already exists.' 
        },
        { status: 409 }
      );
    }

    // Handle image upload
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    const buffer = await imageFile.arrayBuffer();
    const array = new Uint8Array(buffer);

    const imageUrl = await new Promise<string>((resolve, reject) => {
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

    // Create new Car
    const car = await Car.create({
      model,
      type,
      regestrationNumber,
      location,
      pricePerDay,
      image: imageUrl,
      year,
      transmission,
      fuel,
      seats,
      features,
      schedule,
    });

    return NextResponse.json({ 
      success: true, 
      data: car 
    }, { 
      status: 201 
    });

  } catch (error: unknown) {
    console.error('Error creating car:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle duplicate key error (in case the unique index check above fails)
    if (errorMessage.includes('duplicate key') || errorMessage.includes('E11000')) {
      return NextResponse.json({ 
        success: false, 
        error: 'A car with this registration number already exists.' 
      }, { 
        status: 409 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { 
      status: 500 
    });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const cars = await Car.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: cars 
    }, { 
      status: 200 
    });
  } catch (error: unknown) {
    console.error('Error fetching cars:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { 
      status: 500 
    });
  }
}