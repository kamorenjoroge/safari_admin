import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { CarOwner } from '@/model/carowners';

type CarInput = {
  _id: string;
  model: string;
  regestrationNumber: string;
  type: string;
  year: number;
  image?: string;
};

// GET: Fetch one car owner
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    await dbConnect();
    const owner = await CarOwner.findById(id).lean();

    if (!owner) {
      return NextResponse.json({ success: false, error: 'Car owner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: owner }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching car owner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// PUT: Update car owner
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    await dbConnect();
    const body = await req.json() as {
      name: string;
      email: string;
      phone: string;
      location: string;
      joinedDate?: string;
      status?: string;
      cars: CarInput[];
    };

    if (!body.name || !body.email || !body.phone || !body.location) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!body.cars || body.cars.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one car is required' }, { status: 400 });
    }

    for (const car of body.cars) {
      if (!car._id || !car.model || !car.regestrationNumber || !car.type || !car.year) {
        return NextResponse.json({ success: false, error: 'All car fields are required' }, { status: 400 });
      }
    }

    const updatedOwner = await CarOwner.findByIdAndUpdate(
      id,
      {
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
          image: car.image || '',
        })),
      },
      { new: true }
    );

    if (!updatedOwner) {
      return NextResponse.json({ success: false, error: 'Car owner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedOwner });
  } catch (error: unknown) {
    console.error('Error updating car owner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// DELETE: Remove car owner
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    await dbConnect();
    const deletedOwner = await CarOwner.findByIdAndDelete(id);

    if (!deletedOwner) {
      return NextResponse.json({ success: false, error: 'Car owner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Owner deleted' });
  } catch (error: unknown) {
    console.error('Error deleting car owner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
