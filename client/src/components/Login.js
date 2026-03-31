import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      if (res.data.token) {
        // save token 
        localStorage.setItem("token", res.data.token);
        alert("Login successful!");
        setIsAuthenticated(true);
        // use React Router navigation
        console.log("About to navigate");
        navigate("/dashboard");
        console.log("Just navigated");
      }
      
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="login-background">
      <Link to="/" className="home-btn">← Home page</Link>

      <div className="login-card">
        <h1 className="logo">COORDINOTE</h1>
        <h2>Welcome Back!</h2>
        <p className="subtitle">We missed you, please enter your details.</p>

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

       
          <button type="submit" className="login-btn">Sign in</button>
        </form>

        <p className="create-account">
          No account? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
