// lib/auth.ts
import { cookies } from 'next/headers';
import { jwtVerify, type JWTPayload } from 'jose';

// Ensure JWT_SECRET is set in your .env.local
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables!");
}

const encodedSecret = new TextEncoder().encode(JWT_SECRET);

// Define the expected shape of your JWT payload
interface AuthPayload extends JWTPayload {
    email: string;
    id: string; // Assuming _id is stored as string in JWT
    // Add any other claims you put in the token
}

// Server-side function to verify the token from cookies and return payload
export const verifyAuth = async (): Promise<AuthPayload | null> => {
  const token = cookies().get('token')?.value;

  if (!token) {
    console.log("verifyAuth: No token found in cookies.");
    return null;
  }

  try {
    // jwtVerify will throw if the token is invalid or expired
    const { payload } = await jwtVerify(token, encodedSecret);
    console.log("verifyAuth: Token verified, payload:", payload);
    return payload as AuthPayload; // Return the payload
  } catch (err) {
    console.error("verifyAuth: Token verification failed:", err);
    // Token is invalid or expired, treat as unauthenticated
    // Optionally, you could clear the bad cookie here too, but middleware often handles this on redirect
    return null;
  }
};

// Optional: Function to get user data from DB based on payload (if needed)
// Requires connecting to your DB
/*
import clientPromise from "@/lib/db";
import { User } from "@/types";
import { ObjectId } from "mongodb";

export const getAuthenticatedUser = async (): Promise<User | null> => {
    const payload = await verifyAuth();

    if (!payload) {
        return null;
    }

    try {
        const client = await clientPromise;
        const db = client.db("mydatabase");

        // Find the user by ID from the JWT payload
        // Convert string ID back to ObjectId if your DB uses ObjectId
        const userId = new ObjectId(payload.id);

        const user = await db.collection<User>("users").findOne({ _id: userId });

        // Make sure not to return the password hash!
        if (user) {
             const { password, ...userWithoutPassword } = user;
             return userWithoutPassword as User; // Assuming User type allows omitting password
        }

        return null; // User not found in DB based on token ID

    } catch (error) {
        console.error("getAuthenticatedUser: Database fetch failed:", error);
        return null;
    }
}
*/