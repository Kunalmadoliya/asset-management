import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../hooks/useAuth.js";

/**
 * Route guard component that requires an active Better Auth session.
 * Redirects unauthenticated users to /login.
 */
export function ProtectedRoute({ children }) {
  const { data: session, isLoading, error } = useSession();

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        gap: "1rem"
      }}>
        <div className="spinner" />
        <p style={{ color: "var(--text)" }}>Checking session...</p>
      </div>
    );
  }

  if (error || !session?.user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
