import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginWithCredentials, verifyMfa, getStoredAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (getStoredAuth()) {
    navigate({ to: "/portal" });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginWithCredentials(email, password);
      if (res.requiresMfa && res.tempToken) {
        setTempToken(res.tempToken);
        setStep("otp");
      }
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
      await verifyMfa(tempToken, otp);
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
            {step === "credentials" ? "Access Terminal" : "Identity Verification"}
          </h1>
          <p className="text-sm text-text-tertiary mt-2">
            {step === "credentials"
              ? "Enter your credentials to proceed"
              : "Enter the 6-digit code from your authenticator"}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel-rounded p-8 aurora-glow-violet">
          {step === "credentials" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-text-secondary tracking-wider uppercase">
                  Email
                </label>
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
                <label className="text-xs text-text-secondary tracking-wider uppercase">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-obsidian-base border border-glass-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none focus:border-aurora-cyan/50 focus:ring-1 focus:ring-aurora-cyan/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/30 text-aurora-cyan text-sm font-medium hover:bg-aurora-cyan/20 transition-all disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Authenticate"}
              </button>
            </form>
          ) : (
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
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
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
          )}
        </div>
      </div>
    </div>
  );
}
