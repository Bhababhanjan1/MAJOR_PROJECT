import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

function Interview() {
  const navigate = useNavigate();
  const location = useLocation();
  const customContext = location.state || {};
  const interviewRootRef = useRef(null);

  const [status, setStatus] = useState("Ready to launch your live interview.");
  const [error, setError] = useState("");
  const [launching, setLaunching] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  const hasResumeContext = Boolean(customContext.resumeText || customContext.jobRole);

  const isFullscreenActive = () => Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );

  const ensureFullscreenMode = async () => {
    if (isFullscreenActive()) return true;

    const target = interviewRootRef.current || document.documentElement;
    const requestFullscreen =
      target.requestFullscreen ||
      target.webkitRequestFullscreen ||
      target.msRequestFullscreen;

    if (!requestFullscreen) {
      throw new Error("Fullscreen mode is not supported in this browser.");
    }

    await requestFullscreen.call(target);

    if (!isFullscreenActive()) {
      throw new Error("Fullscreen did not start. Please try again.");
    }

    return true;
  };

  const openVoiceInterview = () => {
    navigate("/voice-interview", {
      state: {
        ...customContext,
        forceFreshSession: true,
        startSource: "interview-page",
      },
    });
  };

  const beginInterview = async () => {
    if (launching) return;

    setLaunching(true);
    setError("");
    setShowFullscreenPrompt(false);
    setStatus("Requesting fullscreen access...");

    try {
      await ensureFullscreenMode();
      setStatus("Opening the live interview room...");
      openVoiceInterview();
    } catch (requestError) {
      setLaunching(false);
      setShowFullscreenPrompt(true);
      setStatus("Fullscreen is required before the interview can start.");
      setError(requestError?.message || "Fullscreen is required to continue.");
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!launching) return;
      if (isFullscreenActive()) return;

      setLaunching(false);
      setShowFullscreenPrompt(true);
      setStatus("Fullscreen is required before the interview can start.");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [launching]);

  const handleGoBack = () => {
    if (hasResumeContext) {
      navigate("/resume-interview", { state: customContext });
      return;
    }
    navigate(-1);
  };

  return (
    <div
      className="mock-page reveal"
      ref={interviewRootRef}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column", paddingBottom: 0 }}
    >
      <div
        style={{
          padding: "16px 40px",
          background: "rgba(30, 30, 47, 0.9)",
          color: "white",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>Live Interview</h3>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {error ? (
          <div style={{ color: "#dc2626", padding: "20px", textAlign: "center", fontWeight: "bold" }}>
            {error}
          </div>
        ) : null}

        {showFullscreenPrompt ? (
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto 24px",
              padding: "18px 20px",
              background: "#fff7ed",
              border: "1px solid #fdba74",
              borderRadius: "12px",
              color: "#9a3412",
              textAlign: "center",
              boxShadow: "0 10px 24px rgba(249, 115, 22, 0.12)",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Fullscreen Required</div>
            <div style={{ marginBottom: 14 }}>
              Enter fullscreen before launching the live interview. The interview page will keep the same fullscreen protection once the session starts.
            </div>
            <button
              className="mock-btn"
              style={{ marginTop: 0, background: "#ea580c", padding: "12px 24px" }}
              onClick={beginInterview}
              disabled={launching}
            >
              {launching ? "Launching..." : "Continue in Fullscreen"}
            </button>
          </div>
        ) : null}

        <div className="mock-section" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
            <h1>Ready to Start Your Interview?</h1>
            <p style={{ fontSize: 16, color: "#555", marginTop: 12 }}>
              Stay in fullscreen from the moment you launch the session. Once the live interview room opens, the voice interview page will continue with the same fullscreen protection, startup countdown, and pause confirmation flow.
            </p>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 10 }}>
              Status: <strong>{status}</strong>
            </p>

            <button
              className="mock-btn"
              style={{ background: "#5b21b6", marginTop: 24, padding: "16px 32px", fontSize: 16 }}
              onClick={beginInterview}
              disabled={launching}
            >
              {launching ? "Launching Interview..." : "Start Interview in Fullscreen"}
            </button>

            <button className="go-back-btn" onClick={handleGoBack}>
              Go Back
            </button>
          </div>
        </div>
      </div>

      <div className="footer" style={{ marginTop: "auto", marginBottom: 0 }}>
        Launch screen ready - fullscreen is required before the live interview begins
      </div>
    </div>
  );
}

export default Interview;
