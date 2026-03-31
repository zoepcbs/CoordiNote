import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserProfile.css"; 

function UserProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", bio: "", profilePhoto: "" });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          bio: res.data.bio || "",
          profilePhoto: res.data.profilePhoto || ""
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [token]);

  // handles saving updated profile
  const handleSave = async () => {
    try {
      const res = await axios.put("http://localhost:5000/api/me", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p>No user found</p>;

  return (
    <div className="profile-background" style={{ padding: "2rem" }}>
      <div className="profile-card">
        <h2>Your Profile</h2>
        <img
          src={user.profilePhoto || "https://static.vecteezy.com/system/resources/previews/020/765/399/original/default-profile-account-unknown-icon-black-silhouette-free-vector.jpg"}
          alt="Profile Photo"
          style={{ borderRadius: "50%", width: "100px", height: "100px" }}
        />
        {editMode ? (
          <div className="edit-container">
            <label>First Name</label>
            <input
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <label>Last Name</label>
            <input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <label>Bio</label>
            <textarea
              placeholder="Bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <label>Profile Photo (URL)</label>
            <input
              placeholder="Image URL"
              value={form.profilePhoto}
              onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })}
            />
            <button className="submit-btn" onClick={handleSave}>Save</button>
          </div>
      ) : (
        <div className="profile">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Bio:</strong> {user.bio}</p>
          <button className="submit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  </div>
  );
}

export default UserProfile;
