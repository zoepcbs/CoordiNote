import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/register", {
        firstName,
        lastName,
        username,
        email,
        password,
      });
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
      console.error(err.response?.data || err);
    }
  };

  return (
    <div className="register-background">
      <Link to="/" className="home-btn">← Home page</Link>

      <div className="register-card">
        <h1 className="logo">COORDINOTE</h1>
        <h2>Create Your Account</h2>
        <p className="subtitle">Let's get started by filling in the form below.</p>

        <form onSubmit={handleRegister}>
          <label>First Name</label>
          <input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <label>Last Name</label>
          <input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <label>Username</label>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="register-btn">Register</button>
        </form>

        <p className="create-account">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
