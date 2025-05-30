🛡️ Next.js JWT Auth Template with MongoDB & HeroUI

A full-stack authentication starter template using Next.js App Router, React, JWT via jose, and MongoDB, styled with HeroUI (shadcn/ui) components.

    ✅ JWT functionality is decoupled from MongoDB — you may swap in any database of your choice.
    🎨 Beautiful UI built with HeroUI (shadcn/ui).

✨ Features

    🔐 Secure backend-only JWT Auth via jose (HttpOnly cookies)

    🧱 MongoDB for user data (optional; easily replaceable)

    🧬 Next.js App Router (Edge-ready)

    ✨ HeroUI (shadcn/ui) + TailwindCSS-based interface

    🧩 Login and Signup API logic in app/api/...

    🧰 JWT auth guard in middleware.ts

📦 Tech Stack

    Frontend: Next.js 14, React, TailwindCSS, HeroUI (shadcn/ui)

    Backend: Next.js API routes

    Auth: jose, bcrypt

    DB (Optional): MongoDB

    Routing: App Router

    Middleware: JWT-protected routes

📁 Project Structure

/app
  /api
    /signup/route.ts     # Signup endpoint
    /login/route.ts      # Login endpoint
  /panel                 # Protected area (requires token)
  /login                 # Login page
/middleware.ts           # JWT guard
/lib/db.ts               # MongoDB connection
/types/index.ts          # User types
/components              # HeroUI (shadcn/ui) components

🎨 UI with HeroUI (shadcn/ui)

The project uses shadcn/ui for polished UI components (buttons, forms, alerts, cards, etc.) with TailwindCSS.
Easily customizable via the included config.

# Example button usage
import { Button } from "@/components/ui/button";

<Button className="w-full">Sign In</Button>

🔐 Auth Code (Highlight)
app/api/login/route.ts

const token = await new SignJWT({ email: user.email, id: userIdString })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('7d')
  .sign(encodedSecret);

response.cookies.set("token", token, {
  httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 7
});

middleware.ts

await jwtVerify(token, encodedSecret); // Throws if invalid

if (req.nextUrl.pathname === '/login') {
  return NextResponse.redirect(new URL("/panel", req.url));
}

⚙️ .env.local Setup

JWT_SECRET=your_super_secret_key
MONGODB_URI=your_optional_mongo_uri

    🔁 You can replace MongoDB with another database like PostgreSQL, Supabase, or Prisma ORM. Just update the DB logic in the API routes.

🧪 Run Dev Server

npm install
npm run dev

✅ Optional: Removing MongoDB

This template uses MongoDB to store user data, but you can switch it out:

    Replace clientPromise logic in api/signup and api/login

    Use your preferred DB or ORM (e.g., Prisma + PostgreSQL)

JWT authentication logic remains the same.
✅ Optional: Customize HeroUI Components

npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input

🙌 Credits

Built with:

    Next.js

    shadcn/ui (HeroUI)

    jose

    TailwindCSS

    MongoDB (Optional)
 
 
#   S k i l l S w a p  
 