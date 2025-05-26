// app/panel/layout.tsx (or app/panel/page.tsx)
// This is a Server Component
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";


import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

import { verifyAuth } from '@/lib/token';
import { UserProvider } from '@/hooks/useUser';
import { redirect } from 'next/navigation'; // Use next/navigation for server-side redirects

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // 1. Verify authentication token on the server
  const authPayload = await verifyAuth(); // Use verifyAuth utility

  // If you needed full user data from DB:
  // const user = await getAuthenticatedUser();

  // 2. If authentication failed (no token or invalid token), redirect to login
  // The middleware should ideally handle this first, but this is a good fallback
  // for direct navigation or if middleware is bypassed/different config.
  if (!authPayload /* || !user if you need DB data */) {
      console.log("PanelLayout: Authentication failed, redirecting to /login");
      redirect('/login'); // Server-side redirect
  }

  // 3. If authenticated, pass the initial user data to the Client Component context provider
  // Create the initial user data object based on the payload (or full user from DB)
  const initialUserData = {
      id: authPayload.id,
      email: authPayload.email,
      // Add other fields from payload or user object
      // name: user?.name, // If using getAuthenticatedUser
  };

  return (
    // Wrap the content with the UserProvider
    <UserProvider initialUser={initialUserData}>
       <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
       
          <div className="relative flex flex-col h-screen">
           
            <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
      
            </footer>
          </div>
      </body>
    </html>
    </UserProvider>
  );
}


export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

