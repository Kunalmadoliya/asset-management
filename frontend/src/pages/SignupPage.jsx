import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useSession, useSignUp, useSocialSignIn } from "../hooks/useAuth.js";

export function SignupPage() {
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useSession();
  const signUpMutation = useSignUp();
  const socialSignInMutation = useSocialSignIn();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  // Redirect to dashboard if already authenticated
  if (!sessionLoading && session?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name || !email || !password) {
      setFormError("Please fill in your name, email, and password.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    try {
      await signUpMutation.mutateAsync({ name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setFormError(err.message || "Failed to create account. Please try again.");
    }
  };

  const handleSocial = async (provider) => {
    setFormError("");
    try {
      await socialSignInMutation.mutateAsync({ provider });
    } catch (err) {
      setFormError(err.message || `Failed to sign up with ${provider}`);
    }
  };

  const isSubmitting = signUpMutation.isPending || socialSignInMutation.isPending;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create an account</h2>
          <p>Get started with email or your social accounts</p>
        </div>

        {formError && <div className="auth-error-banner">{formError}</div>}

        <div className="social-buttons">
          <button
            type="button"
            className="social-btn"
            disabled={isSubmitting}
            onClick={() => handleSocial("google")}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="social-btn"
            disabled={isSubmitting}
            onClick={() => handleSocial("microsoft")}
          >
            <svg viewBox="0 0 23 23" width="20" height="20" aria-hidden="true">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Continue with Microsoft
          </button>
        </div>

        <div className="auth-divider">
          <span>or register with email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              placeholder="Jane Doe"
              disabled={isSubmitting}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password (min 8 characters)</label>
            <input
              id="password"
              type="password"
              value={password}
              autoComplete="new-password"
              placeholder="••••••••"
              minLength={8}
              disabled={isSubmitting}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {signUpMutation.isPending ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
