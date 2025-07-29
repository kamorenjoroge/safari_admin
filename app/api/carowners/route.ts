// app/api/owners/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { CarOwner } from '@/model/carowners';

// Define car input type
type CarInput = {
  _id: string;
  model: string;
  regestrationNumber: string;
  type: string;
  year: number;
  image?: string;
};

// GET - List all car owners with their cars
export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    // Build the query
    const query: Record<string, unknown> = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'cars.model': { $regex: search, $options: 'i' } },
        { 'cars.regestrationNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const owners = await CarOwner.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: owners 
    });
  } catch (error) {
    console.error('Error fetching car owners:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new car owner
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json() as {
      name: string;
      email: string;
      phone: string;
      location: string;
      joinedDate?: string;
      status?: string;
      cars: CarInput[];
    };

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate at least one car
    if (!body.cars || body.cars.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one car is required' },
        { status: 400 }
      );
    }

    // Validate car fields
    for (const car of body.cars) {
      if (
        !car._id ||
        !car.model ||
        !car.regestrationNumber ||
        !car.type ||
        !car.year
      ) {
        return NextResponse.json(
          { success: false, error: 'All car fields are required' },
          { status: 400 }
        );
      }
    }

    // Create the new owner
    const newOwner = await CarOwner.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      location: body.location,
      joinedDate: body.joinedDate || new Date().toISOString().slice(0, 7),
      status: body.status || 'active',
      cars: body.cars.map((car) => ({
        _id: car._id,
        model: car.model,
        regestrationNumber: car.regestrationNumber,
        type: car.type,
        year: car.year,
        image: car.image || ''
      }))
    });

    return NextResponse.json({ 
      success: true, 
      data: newOwner 
    });
  } catch (error: unknown) {
    console.error('Error creating car owner:', error);

    // Handle duplicate key errors (e.g., duplicate email)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
