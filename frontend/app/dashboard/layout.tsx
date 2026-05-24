import { ReactNode } from "react";

// NOTE: Global shell is already applied in `frontend/app/layout.tsx` via
// `@/components/layout/DashboardLayout`. This route layout must not re-render
// Navbar/Sidebar, otherwise fixed elements overlap and scroll offsets break.
export default function DashboardRouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

