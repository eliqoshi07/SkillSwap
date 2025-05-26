import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken"; // <-- Remove this import
import { SignJWT } from "jose"; // <-- Import SignJWT for creating tokens
import clientPromise from "@/lib/db";
// import { cookies } from "next/headers"; // <-- Remove this import (not used in the snippet)
import { NextResponse } from "next/server";
import { User } from "@/types"; // Assuming User type includes _id
import { ObjectId } from "mongodb"; // Import ObjectId if your user._id is of this type

// Ensure JWT_SECRET is set in your .env.local file
const JWT_SECRET = process.env.JWT_SECRET;

// --- Add a clear check for the secret ---
// Throwing here ensures the server won't even start if the secret is missing.
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables for signup!");
}

// Encode the secret key for jose (needed for signing and verifying)
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request): Promise<NextResponse> { // Define return type
  const body = await req.json();
  const { name, email, password } = body;

  // 1. Input Validation
  if (!name || !email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("mydatabase");

    // 2. Check if user already exists
    const existing = await db.collection<User>("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User in Database
    const result = await db.collection<User>("users").insertOne({
      name,
      email,
      password: hashedPassword, // Store hashed password
      // Add any other default fields here if needed
    });

    // Check if insertion was successful
    if (!result.acknowledged) {
        console.error("Signup Error: Database insertion not acknowledged");
        return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
    }

    // Get the newly created user's ID
    const userId = result.insertedId;

    // 5. Generate JWT using jose
    // Convert MongoDB ObjectId to string, as JWT payload should be standard JSON
    const userIdString = userId instanceof ObjectId ? userId.toHexString() : String(userId);

    const token = await new SignJWT({ email: email, id: userIdString }) // Payload
      .setProtectedHeader({ alg: 'HS256' }) // Algorithm (HS256 for shared secrets)
      .setIssuedAt() // Set 'iat' claim (issued at)
      .setExpirationTime('7d') // Set 'exp' claim (expiration time)
      .sign(encodedSecret); // Sign with the encoded secret - AWAIT THIS!

    // Add a log here to confirm the token string is generated
    console.log("Generated Token (in Signup API):", token ? token.substring(0, 20) + '...' : 'Token is null/undefined');


    // 6. Set Cookie and Return Response
    // Create a response object first so we can attach the cookie
    const response = NextResponse.json(
      { message: "User registered" },
      { status: 201 } // 201 Created status for successful registration
    );

    response.cookies.set("token", token, { // Use the awaited token here
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookie in production (requires HTTPS)
      sameSite: "strict", // Helps mitigate CSRF attacks
      path: "/", // Cookie is available on all paths
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;

  } catch (error) {
    // 7. Handle Server Errors
    console.error("Signup Error:", error); // More specific logging
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}