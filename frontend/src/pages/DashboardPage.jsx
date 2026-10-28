import { useState } from "react";
import { useSession, useSignOut } from "../hooks/useAuth.js";

export function DashboardPage() {
  const { data: session } = useSession();
  const signOutMutation = useSignOut();

  const [apiResponse, setApiResponse] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  const handleTestBackendApi = async () => {
    setApiLoading(true);
    setApiError("");
    setApiResponse(null);

    try {
      const baseUrl = import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Required to send Better Auth session cookies
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }

      const json = await res.json();
      setApiResponse(json);
    } catch (err) {
      setApiError(err.message || "Failed to reach protected backend API");
    } finally {
      setApiLoading(false);
    }
  };

  const user = session?.user;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2>Asset Management Dashboard</h2>
          <p style={{ color: "var(--text)", fontSize: "0.95rem" }}>
            Signed in as <strong>{user?.email}</strong>
          </p>
        </div>
        <button
          type="button"
          className="logout-btn"
          disabled={signOutMutation.isPending}
          onClick={handleSignOut}
        >
          {signOutMutation.isPending ? "Signing out..." : "Sign out"}
        </button>
      </header>

      <div className="dashboard-grid">
        {/* User Profile Card */}
        <div className="dashboard-card">
          <h3>Your Profile</h3>
          <div className="profile-details">
            {user?.image && (
              <img
                src={user.image}
                alt="Avatar"
                className="user-avatar"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
            <div>
              <p><strong>Name:</strong> {user?.name || "Not provided"}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>User ID:</strong> <code className="inline-code">{user?.id}</code></p>
              <p>
                <strong>Email Verified:</strong>{" "}
                <span className={user?.emailVerified ? "badge-success" : "badge-warning"}>
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Backend API Test Card */}
        <div className="dashboard-card">
          <h3>Backend Session Test</h3>
          <p style={{ color: "var(--text)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Test whether the backend middleware (<code>requireAuth</code>) validates this active cookie session via <code>GET /api/me</code> with <code>credentials: 'include'</code>.
          </p>

          <button
            type="button"
            className="submit-btn"
            style={{ width: "auto" }}
            disabled={apiLoading}
            onClick={handleTestBackendApi}
          >
            {apiLoading ? "Calling /api/me..." : "Verify Session with Backend (/api/me)"}
          </button>

          {apiError && (
            <div className="auth-error-banner" style={{ marginTop: "1rem" }}>
              {apiError}
            </div>
          )}

          {apiResponse && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ color: "var(--text)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                Response from <code>GET /api/me</code>:
              </p>
              <pre className="json-box">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
