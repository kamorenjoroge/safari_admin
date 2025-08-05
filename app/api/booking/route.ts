import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Booking } from '@/model/booking';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      carId,
      registrationNumber,
      model,
      pickupDate,
      returnDate,
      totalAmount,
      customerInfo,
      specialRequests,
    } = body;

    // Validate essential fields
    if (
      !carId ||
      !registrationNumber ||
      !model ||
      !pickupDate ||
      !returnDate ||
      !totalAmount ||
      !customerInfo?.fullName ||
      !customerInfo?.email ||
      !customerInfo?.phone ||
      !customerInfo?.idNumber
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking or customer information' },
        { status: 400 }
      );
    }

    // Create booking
    const newBooking = await Booking.create({
      carId,
      registrationNumber,
      model,
      pickupDate,
      returnDate,
      totalAmount,
      customerInfo,
      specialRequests,
    });

    return NextResponse.json(
      { success: true, data: newBooking },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Booking creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: bookings }, { status: 200 });

  } catch (error: unknown) {
    console.error('Booking fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
