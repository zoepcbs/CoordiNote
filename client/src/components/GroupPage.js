import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateGroup from "./CreateGroup";
import "./GroupPage.css";

function GroupPage() {
  const [inviteUsername, setInviteUsername] = useState("");
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/my-groups", config);
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err.response?.data || err.message);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/invitations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setInvitations(res.data);
    } catch (err) {
      console.error("❌ Error fetching invites:", err.response?.data || err.message);
    }
  };
  
  

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedGroupId) return alert("Select a group first.");
    try {
      await axios.post(
        `http://localhost:5000/api/groups/${selectedGroupId}/invite`,
        { username: inviteUsername },
        config
      );
      setInviteUsername("");
      alert("Invitation sent!");
    } catch (err) {
      alert("Invite failed.");
      console.error("Invite error:", err.response?.data || err.message);
    }
  };

  const acceptInvite = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/invitations/${id}/accept`, {}, config);
      fetchGroups();
      fetchInvitations();
    } catch (err) {
      console.error("Accept failed:", err.response?.data || err.message);
    }
  };

  const declineInvite = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/invitations/${id}/decline`, config);
      fetchInvitations();
    } catch (err) {
      console.error("Decline failed:", err.response?.data || err.message);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/leave`,
        {},
        config
      );
      alert("You left the group.");
      fetchGroups();
    } catch (err) {
      console.error("Leave failed:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }
  
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
  
      try {
        // Fetch groups and set them
        const groupsRes = await axios.get("http://localhost:5000/api/my-groups", config);
        setGroups(groupsRes.data);
  
        // Fetch invitations and set them
        const invitesRes = await axios.get("http://localhost:5000/api/invitations", config);
        setInvitations(invitesRes.data);
      } catch (err) {
        console.error("Error in useEffect fetch:", err.response?.data || err.message);
      }
    };
  
    fetchData();
  }, []);

  return (
    <div className="group-page">
      <h2>Your Groups</h2>

      <div className="groups-container">
        {groups.length === 0 ? (
          <p>You are not in any groups yet.</p>
        ) : (
          groups.map((group) => (
            <div key={group._id} className="group-card">
              <h4>{group.groupName}</h4>
              <p><strong>Created by:</strong> {group.creator?.username || "Unknown"}</p>
              <p><strong>Members:</strong> {group.members.map(m => m.username).join(", ")}</p>
              <button onClick={() => handleLeaveGroup(group._id)}>Leave Group</button>
            </div>
          ))
        )}
      </div>
      

      <h2>Create a New Group</h2>
      <CreateGroup onGroupCreated={fetchGroups} />

      <h3>Send Group Invite</h3>
      <form onSubmit={handleSendInvite}>
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          required
        >
          <option value="">Select a group</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.groupName}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Username to invite"
          value={inviteUsername}
          onChange={(e) => setInviteUsername(e.target.value)}
          required
        />
        <button type="submit">Send Invite</button>
      </form>

      <h3>Pending Invitations</h3>
      {invitations.length === 0 ? (
        <p>No pending invitations.</p>
      ) : (
        <ul>
          {invitations.map((invite) => (
            <li key={invite._id} className="group-card">
              <p><strong>{invite.group.groupName}</strong> — invited by {invite.invitedBy.username}</p>
              <div className="invite-actions">
                <button onClick={() => acceptInvite(invite._id)}>Accept</button>
                <button onClick={() => declineInvite(invite._id)}>Decline</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GroupPage;
