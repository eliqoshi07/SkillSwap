import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
// Import jwtVerify from jose (Edge compatible)
import { jwtVerify } from 'jose';

// Ensure JWT_SECRET is set in your .env.local file
const JWT_SECRET = process.env.JWT_SECRET;

// --- Add a clear check for the secret ---
// This ensures the middleware won't even load if the secret is missing.
// Throwing here is appropriate as middleware is critical infrastructure.
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables for middleware!");
}

// Encode the secret key for jose (needed for signing and verifying)
// This is done once when the middleware loads.
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

// Middleware must be an async function because jwtVerify is async
export async function middleware(req: NextRequest) {
  // Get the token from the 'token' cookie
  const token = req.cookies.get("token")?.value;

  // Define the URL for the login page
  const loginUrl = new URL("/login", req.url);

  // 1. If no token is found
  if (!token) {
    console.log("Middleware: No token found.");
    // Redirect to login page, UNLESS the requested path is already /login
    // This prevents infinite redirect loops.
    if (req.nextUrl.pathname !== '/login') {
       console.log("Middleware: Redirecting to login.");
       return NextResponse.redirect(loginUrl);
    }
     // If already on login page, allow access to the login page itself
     return NextResponse.next();
  }

  // 2. If a token is found, try to verify it
  try {
    // Use jwtVerify from jose to verify the token asynchronously
    // Pass the token string and the encoded secret
    await jwtVerify(token, encodedSecret);

    // If verification succeeds, log and allow the request to proceed
    console.log("Middleware: Token verified successfully.");

    // If the user is trying to access /login *with* a valid token,
    // you might want to redirect them to the protected area (e.g., /panel)
    // This is optional, but a common UX improvement.
    if (req.nextUrl.pathname === '/login') {
        console.log("Middleware: Valid token found on login page, redirecting to panel.");
        return NextResponse.redirect(new URL("/panel", req.url)); // Adjust '/panel' as needed
    }


    return NextResponse.next(); // Token is valid, proceed to the requested page

  } catch (err) {
    // 3. If token verification fails (e.g., expired, invalid signature)
    console.error("Middleware: Token verification failed:", err);

    // Redirect to login page
    // Create a response object first to be able to delete the cookie
    const response = NextResponse.redirect(loginUrl);

    // Delete the invalid cookie to prevent issues on future requests
    response.cookies.delete("token");

    return response; // Return the redirect response
  }
}

// 4. Configure the middleware to run only on specific paths
export const config = {
  // This will apply the middleware to any path under /panel
  // and crucially, also to the /login path itself.
  // Matching /login is important so we can handle users who are logged in
  // but try to navigate back to the login page.
  matcher: [
    '/panel/:path*', // Apply to all routes under /panel
    '/login',   
         // Apply to the login route
    // Add other protected routes/paths here if needed, e.g., '/dashboard/:path*'
  ],
};