import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const revalidate = 0; // Disable caching to ensure a real database query happens

export async function GET(request: Request) {
  try {
    // Read Supabase credentials from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Missing Supabase configuration variables." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Run a lightweight select query to wake up and keep Supabase active
    const { data, error } = await supabase
      .from("dc_bills")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Keep-alive database query failed:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log("Database keep-alive ping successful.");
    return NextResponse.json({
      success: true,
      message: "Database keep-alive ping successful",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Keep-alive error:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
