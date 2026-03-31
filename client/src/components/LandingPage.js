import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-left">
        <h2>WELCOME TO</h2>
        <h1>COORDINOTE</h1>
        <p>
          CoordiNote helps student groups stay organized. Share files, assign
          tasks, and track events — all in one place.
        </p>
        <button className="get-started" onClick={() => navigate("/register")}>
          Get Started!
        </button>
      </div>

      <div className="landing-right-shape"></div>

      <div className="landing-nav-buttons">
        <button className="login" onClick={() => navigate("/login")}>
          Log in
        </button>
        <button className="signup" onClick={() => navigate("/register")}>
          Sign up
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
