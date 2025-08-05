// app/api/booking/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Booking } from '@/model/booking';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id).lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: booking },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Booking fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const allowedUpdates = ['status', 'specialRequests', 'pickupDate', 'returnDate'];
    const updates = Object.keys(body).filter(key => allowedUpdates.includes(key));

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    if (body.status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    if (body.pickupDate || body.returnDate) {
      const pickupDate = body.pickupDate ? new Date(body.pickupDate) : null;
      const returnDate = body.returnDate ? new Date(body.returnDate) : null;
      
      if (pickupDate && returnDate && pickupDate >= returnDate) {
        return NextResponse.json(
          { success: false, error: 'Pickup date must be before return date' },
          { status: 400 }
        );
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: booking },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Booking update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { message: 'Booking deleted successfully' } },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Booking deletion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}