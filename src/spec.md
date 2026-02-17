# Specification

## Summary
**Goal:** Prevent premature post-login navigation by waiting for the signed-in user’s profile to resolve, then route users to the correct authorized destination.

**Planned changes:**
- Update the login redirect flow to wait for `useGetCallerUserProfile()` to finish before any automatic navigation occurs.
- Add role-based post-login routing: send existing users to their role landing route unless already on an allowed route.
- Keep new users (no existing profile) in the profile setup gating flow (do not redirect into role pages).
- Preserve the user’s intended protected route when logged out, and after login + profile resolution, navigate back to it only if authorized; otherwise fall back to the role landing route.

**User-visible outcome:** After signing in, the app no longer jumps into the main experience too early; users are routed only after their profile is resolved, returning to their intended page when permitted or otherwise landing on the correct role home, while new users remain in profile setup.
