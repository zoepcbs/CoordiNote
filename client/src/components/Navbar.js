import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/group" className="nav-link">Group</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
      </div>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
