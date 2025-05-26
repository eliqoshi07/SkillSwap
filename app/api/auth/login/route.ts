import bcrypt from "bcrypt";
import { SignJWT } from "jose"; // Import SignJWT for creating tokens
import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";
import { User } from "@/types"; // Assuming User type includes _id
import { ObjectId } from "mongodb"; // Import ObjectId if your user._id is of this type

// Ensure JWT_SECRET is set in your .env.local file
const JWT_SECRET = process.env.JWT_SECRET;

// --- Add a clear check for the secret ---
// Throwing here ensures the server won't even start if the secret is missing.
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables for login!");
}

// Encode the secret key for jose (needed for signing and verifying)
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request): Promise<NextResponse> { // Define return type
  const body = await req.json();
  const { email, password } = body;

  // 1. Input Validation
  if (!email || !password) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("mydatabase");

    // 2. Find User by Email
    const user = await db.collection<User>("users").findOne({ email });

    if (!user) {
      // User not found
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 3. Compare Password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // Password doesn't match
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // 4. Generate JWT using jose
    // Convert MongoDB ObjectId to string if necessary, as JWT payload should be standard JSON
    const userIdString = user._id instanceof ObjectId ? user._id.toHexString() : String(user._id);

    const token = await new SignJWT({ email: user.email, id: userIdString }) // Payload
      .setProtectedHeader({ alg: 'HS256' }) // Algorithm (HS256 for shared secrets)
      .setIssuedAt() // Set 'iat' claim (issued at)
      .setExpirationTime('7d') // Set 'exp' claim (expiration time)
      .sign(encodedSecret); // Sign with the encoded secret - AWAIT THIS!

    // Add a log here to confirm the token string is generated
    console.log("Generated Token (in Login API):", token ? token.substring(0, 20) + '...' : 'Token is null/undefined');


    // 5. Set Cookie and Return Response
    // Create a response object first so we can attach the cookie
    const response = NextResponse.json({ message: "Login successful" }, { status: 200 }); // Corrected status

    response.cookies.set("token", token, {
      httpOnly: true, // Prevents client-side JavaScript access
      secure: process.env.NODE_ENV === "production", // Use secure cookie in production (requires HTTPS)
      sameSite: "strict", // Helps mitigate CSRF attacks
      path: "/", // Cookie is available on all paths
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return response;

  } catch (error) {
    // 6. Handle Server Errors
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}