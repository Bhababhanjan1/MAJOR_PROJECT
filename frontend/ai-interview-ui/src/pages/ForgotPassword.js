import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import interviewrLogo from "../assets/Website Logo.png";
import interviewrWordmark from "../assets/Main Logo 2.png";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000"
});

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [nowTick, setNowTick] = useState(Date.now());

  const toLocalPath = (link) => {
    try {
      const url = new URL(link);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return link;
    }
  };

  useEffect(() => {
    if (!cooldownUntil) return undefined;
    const intervalId = window.setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [cooldownUntil]);

  const cooldownRemainingSeconds = useMemo(() => {
    if (!cooldownUntil) return 0;
    return Math.max(0, Math.ceil((cooldownUntil - nowTick) / 1000));
  }, [cooldownUntil, nowTick]);

  const isCoolingDown = cooldownRemainingSeconds > 0;

  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const requestResetLink = async () => {
    setError(null);
    if (!email) {
      setError("Please enter your email address.");
      return false;
    }
    if (isCoolingDown) {
      setError(`Please wait ${formatCooldown(cooldownRemainingSeconds)} before requesting another link.`);
      return false;
    }
    setLoading(true);
    try {
      let res;
      try {
        res = await api.post("/auth/forgot-password", { email });
      } catch (primaryErr) {
        if (primaryErr?.response?.status === 404) {
          res = await api.post("/forgot-password", { email });
        } else {
          throw primaryErr;
        }
      }
      const maybeLink = res?.data?.dev_reset_link || "";
      setDevLink(maybeLink);
      setCooldownUntil(Date.now() + 60 * 1000);
      setSent(true);
      return true;
    } catch (err) {
      const retryAfterHeader = err.response?.headers?.["retry-after"];
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : 0;
      if (retryAfterSeconds > 0) {
        setCooldownUntil(Date.now() + retryAfterSeconds * 1000);
      }
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string"
        ? detail
        : err.response?.status
          ? `Unable to send reset link (status ${err.response.status}).`
          : "Unable to send reset link right now. Please check if the backend is running.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await requestResetLink();
  };

  return (
    <div className="auth-modern-page">
      <div className="auth-modern-layout auth-reset-layout">
        <section className="auth-modern-showcase auth-reset-showcase">
          <div className="auth-modern-badge">INTERVIEWR</div>
          <div className="auth-modern-brand">
            <div className="auth-modern-logo-lockup">
              <div className="auth-modern-logo-wrap">
                <img src={interviewrLogo} alt="INTERVIEWR" className="auth-modern-logo" />
              </div>
              <img
                src={interviewrWordmark}
                alt="INTERVIEWR wordmark"
                className="auth-modern-wordmark"
              />
            </div>
            <div className="auth-modern-copy">
              <h1>Reset your password securely.</h1>
              <p>
                Enter your account email and we will send you a secure link to choose a new password.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-modern-form-shell">
          <div className="auth-modern-form-card auth-reset-card">
            <div className="auth-modern-form-head">
              <h2 className="auth-modern-title">Forgot Password</h2>
              <p className="auth-modern-subtitle">
                {sent
                  ? "If the email exists, a reset link has been sent."
                  : "We will email you a secure reset link."}
              </p>
            </div>

            {error && <div className="auth-modern-error">{error}</div>}

            {!sent ? (
              <form onSubmit={handleSubmit} className="auth-modern-form">
                <div className="auth-modern-field">
                  <label className="auth-modern-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-modern-input"
                  />
                </div>

                <button type="submit" disabled={loading || isCoolingDown} className="auth-modern-submit">
                  {loading
                    ? "Sending..."
                    : isCoolingDown
                      ? `Resend in ${formatCooldown(cooldownRemainingSeconds)}`
                      : "Send reset link"}
                </button>
              </form>
            ) : (
              <div className="auth-reset-success">
                <p>
                  Check your inbox for a reset link. The link is valid for 5 minutes.
                  If you do not see it in a few minutes, check your spam folder.
                </p>
                {isCoolingDown && (
                  <p className="auth-reset-devlink">
                    You can request another link in {formatCooldown(cooldownRemainingSeconds)}.
                  </p>
                )}
                <div className="auth-reset-actions">
                  <button
                    type="button"
                    className="auth-reset-resend"
                    disabled={loading || isCoolingDown}
                    onClick={requestResetLink}
                  >
                    {loading ? "Sending..." : "Resend"}
                  </button>
                </div>
                {devLink && (
                  <p className="auth-reset-devlink">
                    Dev link: <button type="button" onClick={() => navigate(toLocalPath(devLink))}>{devLink}</button>
                  </p>
                )}
              </div>
            )}

            <div className="auth-modern-footer">
              <span>Remembered your password?</span>
              <button
                type="button"
                className="auth-modern-switch"
                onClick={() => navigate("/auth")}
              >
                Back to sign in
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;
