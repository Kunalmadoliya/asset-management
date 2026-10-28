import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../hooks/useAuth.js";

/**
 * Route guard component that requires an active Better Auth session.
 * Displays a loading spinner while validating session, and redirects
 * unauthenticated users to /login.
 */
export function ProtectedRoute({ children }) {
  const { data: session, isLoading, isFetching, error } = useSession();

  // If loading initially or refetching without user data yet, show spinner
  if (isLoading || (isFetching && !session?.user)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          gap: "1rem",
        }}
      >
        <div className="spinner" />
        <p style={{ color: "var(--text)" }}>Checking session...</p>
      </div>
    );
  }

  // Not authenticated
  if (error || !session?.user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
