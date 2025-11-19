// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb'; // adjust import path if needed

export async function GET() {
  try {
    await connectDB(); // Connect to MongoDB

    const connectionState = mongoose.connection.readyState;

    // readyState meanings:
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    let state = '';
    switch (connectionState) {
      case 0:
        state = '🔴 Disconnected';
        break;
      case 1:
        state = '🟢 Connected';
        break;
      case 2:
        state = '🟡 Connecting';
        break;
      case 3:
        state = '🟠 Disconnecting';
        break;
    }

    return NextResponse.json({
      success: true,
      state,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (error: any) {
    console.error('DB Connection Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
