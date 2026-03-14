import { NextResponse } from "next/server";

// Fetch live USD to INR exchange rate from Frankfurter (free, no key required)
export async function GET() {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=INR",
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    const data = await res.json();
    const rate = data.rates?.INR ?? 83.5; // Fallback to approximate rate
    return NextResponse.json({ rate });
  } catch {
    return NextResponse.json({ rate: 83.5 }); // Fallback
  }
}
