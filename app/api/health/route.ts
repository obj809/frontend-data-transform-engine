import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/`);
    const data = await response.json();

    return NextResponse.json({
      status: "success",
      message: "Backend data fetched successfully",
      backend_response: data,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch data from backend",
      },
      { status: 503 }
    );
  }
}
