import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginWithCredentials, verifyMfa, getStoredAuth, registerUser } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "signin" | "register";
type Step = "credentials" | "otp";

function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("credentials");

  // Shared fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (getStoredAuth()) {
    navigate({ to: "/portal" });
    return null;
  }

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("credentials");
    setError("");
    setInfo("");
    setOtp("");
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      setInfo(res.message || "Registration successful! Please sign in.");
      setMode("signin");
      setStep("credentials");
      setName("");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Login → OTP ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await loginWithCredentials(email, password);
      setInfo(res.message || "OTP sent to your email.");
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyMfa(email, otp);
      navigate({ to: "/portal" });
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-obsidian-base overflow-hidden font-sans">
      {/* Ambient glows */}
      <div className="absolute top-[-30%] left-[-15%] w-[60vw] h-[60vw] rounded-full pointer-events-none opacity-20 blur-[140px]" style={{ background: "var(--aurora-violet)" }} />
      <div className="absolute bottom-[-20%] right-[-5%] w-[50vw] h-[50vw] rounded-full pointer-events-none opacity-15 blur-[160px]" style={{ background: "var(--aurora-cyan)" }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-xs font-semibold tracking-[0.25em] text-aurora-cyan uppercase mb-3">
            Axiom // Core
          </div>
          <h1 className="text-3xl font-light text-text-primary tracking-wide">
            {step === "otp"
              ? "Identity Verification"
              : mode === "register"
              ? "Create Account"
              : "Access Terminal"}
          </h1>
          <p className="text-sm text-text-tertiary mt-2">
            {step === "otp"
              ? "Enter the 6-digit code sent to your email"
              : mode === "register"
              ? "Register to access the intelligence portal"
              : "Enter your credentials to proceed"}
          </p>
        </div>

        {/* Mode toggle — only shown on credentials step */}
        {step === "credentials" && (
          <div className="flex rounded-2xl bg-obsidian-surface border border-glass-border p-1 mb-6">
            <button
              onClick={() => switchMode("signin")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/25"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-aurora-violet/15 text-aurora-violet border border-aurora-violet/25"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className={`glass-panel-rounded p-8 ${mode === "register" ? "aurora-glow-violet" : "aurora-glow-cyan"}`}>

          {/* Info / success banner */}
          {info && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/20 text-aurora-cyan text-xs">
              {info}
            </div>
          )}

          {/* ── OTP Step ─────────────────────────────────────────────────── */}
          {step === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary tracking-wider uppercase">
                  One-Time Password
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full bg-obsidian-base border border-glass-border rounded-xl px-4 py-3 text-center text-2xl font-light text-text-primary tracking-[0.5em] placeholder:text-text-tertiary placeholder:tracking-normal placeholder:text-sm outline-none focus:border-aurora-violet/50 focus:ring-1 focus:ring-aurora-violet/20 transition-all"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 rounded-xl bg-aurora-violet/10 border border-aurora-violet/30 text-aurora-violet text-sm font-medium hover:bg-aurora-violet/20 transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Identity"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("credentials"); setOtp(""); setError(""); }}
                className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
              >
                ← Back to login
              </button>
            </form>

          ) : mode === "register" ? (
            /* ── Register Form ──────────────────────────────────────────── */
            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary tracking-wider uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-obsidian-base border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-aurora-violet/50 focus:ring-1 focus:ring-aurora-violet/20 transition-all"
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary tracking-wider uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-obsidian-base border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-aurora-violet/50 focus:ring-1 focus:ring-aurora-violet/20 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary tracking-wider uppercase">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-obsidian-base border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-aurora-violet/50 focus:ring-1 focus:ring-aurora-violet/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-aurora-violet/10 border border-aurora-violet/30 text-aurora-violet text-sm font-medium hover:bg-aurora-violet/20 transition-all disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

          ) : (
            /* ── Sign-In Form ───────────────────────────────────────────── */
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary tracking-wider uppercase">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-obsidian-base border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-aurora-cyan/50 focus:ring-1 focus:ring-aurora-cyan/20 transition-all"
                  placeholder="operator@axiom.dev"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary tracking-wider uppercase">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-obsidian-base border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-aurora-cyan/50 focus:ring-1 focus:ring-aurora-cyan/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan text-sm font-medium hover:bg-aurora-cyan/20 transition-all disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Authenticate"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
