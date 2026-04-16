import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";
import interviewrLogo from "../assets/Website Logo.png";
import interviewrWordmark from "../assets/Main Logo 2.png";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000"
});

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [verifying, setVerifying] = useState(true);

  const getResetErrorMessage = (detail) => {
    if (typeof detail !== "string") {
      return "Reset link is invalid or expired.";
    }
    if (detail === "Reset token expired") {
      return "This reset link has expired. Please request a new one.";
    }
    if (detail === "Invalid or expired reset token") {
      return "This reset link is invalid or has already expired.";
    }
    return detail;
  };

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      if (!token) {
        if (active) {
          setError("Reset token is missing. Please use the link from your email.");
          setVerifying(false);
        }
        return;
      }
      try {
        await api.get(`/auth/reset-password/verify?token=${encodeURIComponent(token)}`);
        if (active) setVerifying(false);
      } catch (err) {
        const msg = getResetErrorMessage(err.response?.data?.detail);
        if (active) {
          setError(msg);
          setVerifying(false);
        }
      }
    };
    verify();
    return () => {
      active = false;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }
    if (!password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err) {
      const msg = getResetErrorMessage(err.response?.data?.detail) || "Unable to reset password right now.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
              <h1>Choose a new password.</h1>
              <p>
                Set a fresh password for your account. Make it strong and unique.
              </p>
            </div>
          </div>
        </section>

        <section className="auth-modern-form-shell">
          <div className="auth-modern-form-card auth-reset-card">
            <div className="auth-modern-form-head">
              <h2 className="auth-modern-title">Reset Password</h2>
              <p className="auth-modern-subtitle">
                {done
                  ? "Your password has been updated."
                  : "Reset links are valid for 5 minutes. Enter your new password below."}
              </p>
            </div>

            {error && <div className="auth-modern-error">{error}</div>}

            {verifying ? (
              <div className="auth-reset-success">
                <p>Verifying reset link...</p>
              </div>
            ) : !done ? (
              <form onSubmit={handleSubmit} className="auth-modern-form">
                <div className="auth-modern-field">
                  <label className="auth-modern-label">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter a new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-modern-input"
                  />
                </div>

                <div className="auth-modern-field">
                  <label className="auth-modern-label">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-modern-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-modern-submit">
                  {loading ? "Resetting..." : "Update password"}
                </button>
              </form>
            ) : (
              <div className="auth-reset-success">
                <p>
                  You can now sign in with your new password.
                </p>
              </div>
            )}

            <div className="auth-modern-footer">
              <span>Ready to sign in?</span>
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

export default ResetPassword;
