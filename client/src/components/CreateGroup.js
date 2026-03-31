import React, { useState } from "react";
import axios from "axios";

function CreateGroup({ onGroupCreated }) {
  const [groupName, setGroupName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/groups",
        { groupName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGroupName("");
      alert("Group created!");
      if (onGroupCreated) onGroupCreated(res.data); // optional callback to refresh dashboard
    } catch (err) {
        console.error("❌ Error creating group:", err.response?.data || err.message);
        alert("Error creating group: " + (err.response?.data?.error || err.message));
      }
      
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        placeholder="New Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        required
      />
      <button type="submit">Create Group</button>
    </form>
  );
}

export default CreateGroup;
