import React, { useState } from "react";
import axios from "axios";

function InviteUser({ groupId }) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleInvite = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/groups/${groupId}/invite`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ ${res.data.message}`);
      setUsername("");
    } catch (err) {
      setMessage("❌ Error inviting user.");
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
      <form onSubmit={handleInvite}>
        <input
          type="text"
          placeholder="Username to invite"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <button type="submit">Invite</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default InviteUser;
