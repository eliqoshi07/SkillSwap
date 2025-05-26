// context/UserContext.tsx
"use client"; // This is a Client Component file

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of your user data (matching the JWT payload or extended DB data)
interface UserData {
    id: string;
    email: string;
    name?: string; // If you fetch name from DB, make it optional here
    // Add other user properties you need
}

// Define the shape of the context value
interface UserContextValue {
    user: UserData | null;
    isLoading: boolean; // Optional: indicate if user data is still loading (less needed with Server Components)
    // You could add functions here like setUser, logout, etc.
}

// Create the context
const UserContext = createContext<UserContextValue | undefined>(undefined);

// Custom hook to use the UserContext
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// User Provider component
interface UserProviderProps {
    // This prop will receive the user data fetched on the server
    initialUser: UserData | null;
    children: ReactNode;
}

export const UserProvider = ({ initialUser, children }: UserProviderProps) => {
    // Use the initial data from the server to set the state
    const [user, setUser] = useState<UserData | null>(initialUser);
    const [isLoading, setIsLoading] = useState(false); // Or initialUser === undefined if fetching client-side

    // If you were fetching client-side, you'd use useEffect here:
    /*
    useEffect(() => {
      const fetchUser = async () => {
         setIsLoading(true);
         const res = await fetch('/api/user'); // Call your API route
         if (res.ok) {
            const userData = await res.json();
            setUser(userData);
         } else {
            setUser(null); // Not logged in or error
         }
         setIsLoading(false);
      };
      // Only fetch if user is not already provided (e.g., from server props)
      // or if you need to re-fetch
      if (initialUser === undefined) { // Example condition if initialUser might be undefined
          fetchUser();
      } else {
          setUser(initialUser); // Use data passed from server
      }
    }, [initialUser]); // Re-run if initialUser changes
    */

    // With Server Component fetching, isLoading state might be simpler or unnecessary
    // unless you add client-side logout/login logic here.

    return (
        <UserContext.Provider value={{ user, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};