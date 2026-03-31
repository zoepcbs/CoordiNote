import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import GroupPage from "./components/GroupPage";
import ToDoList from "./components/ToDoList";
import Login from "./components/Login";
import Register from "./components/Register";
import UserProfile from "./components/UserProfile";
import LandingPage from "./components/LandingPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        {/* Landing page as default route */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Register setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/group"
          element={
            isAuthenticated ? <GroupPage /> : <Navigate to="/login" />
          }
        />
        
        <Route
          path="/profile"
          element={
            isAuthenticated ? <UserProfile /> : <Navigate to="/login" />
          }
        />

        {/* Catch-all: redirect based on auth */}
        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
