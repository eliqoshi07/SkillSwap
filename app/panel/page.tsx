// app/panel/page.tsx
// This can be a Server or Client Component. If it's a Client Component,
// make sure it's rendered *inside* the Layout that provides the UserProvider.

// Example if page.tsx is a Client Component
// "use client";

import UserInfoDisplay from "@/components/userpannel";

export default function PanelPage() {
  // If this is a Client Component, it relies on the Layout providing the context

  return (
    <div>
      <h1>Panel Page</h1>
      <p>This page is protected.</p>
      <UserInfoDisplay /> {/* Use the client component to display user info */}
      {/* Rest of your panel content */}
    </div>
  );
}