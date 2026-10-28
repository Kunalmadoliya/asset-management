import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth.js";

/**
 * Reusable middleware to verify Better Auth session.
 * Attaches user and session objects to the Express request.
 */
export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "You must be signed in to access this resource.",
      });
    }

    req.user = session.user;
    req.session = session.session;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized",
      message: error.message || "Failed to authenticate session.",
    });
  }
}
