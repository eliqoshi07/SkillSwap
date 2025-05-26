// components/UserInfoDisplay.tsx
"use client"; // This is a Client Component file

import { useUser } from "@/hooks/useUser";

const UserInfoDisplay = () => {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return <div>Loading user info...</div>;
    }

    if (!user) {
        // This case should ideally be handled by the layout/middleware redirecting,
        // but it's good to have a fallback in the component itself.
        return <div>User not logged in.</div>;
    }

    // Display user information
    return (
        <div>
            <h2>Welcome!</h2>
            <p>Your User ID: {user.id}</p>
            <p>Your Email: {user.email}</p>
            {user.name && <p>Your Name: {user.name}</p>} {/* Display name if available */}
            {/* Add other user info */}
        </div>
    );
};

export default UserInfoDisplay;