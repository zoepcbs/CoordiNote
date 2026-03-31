import React, { useState, useEffect } from "react";
import "./TaskModal.css"; 

function TaskModal({ isOpen, onClose, onSubmit, onDelete, defaultDate, task, groupId }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(defaultDate || "");
  const [type, setType] = useState("meeting");
  const [status, setStatus] = useState("incomplete");
  const [assignedTo, setAssignedTo] = useState("");
  const [members, setMembers] = useState([]);

  // pre-fill the form if editing:
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const idToUse = task?.groupId || groupId;
        if (!idToUse) return;
        const res = await fetch(`http://localhost:5000/api/groups/${idToUse}/members`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to fetch members:", res.status, text);
          return;
        }
  
        const data = await res.json();
        setMembers(data);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      }
    };
  
    fetchMembers();
  
    if (task) {
      setTitle(task.title || "");
      setDueDate(task.dueDate?.slice(0, 10) || defaultDate || "");
      setType(task.type || "task");
      setStatus(task.status || "pending");
      setAssignedTo(task.assignedTo?._id || task.assignedTo || "");
    } else {
      setTitle("");
      setDueDate(defaultDate || "");
      setType("task");
      setStatus("pending");
      setAssignedTo("");
    }
  }, [task, groupId, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      title,
      type,
      status,
      dueDate,
      assignedTo: assignedTo || undefined // Send undefined if empty to allow server to handle
    };
    onSubmit(submitData);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await onDelete(task._id);
        onClose();
      } catch (err) {
        console.error("Failed to delete task:", err);
        alert("Failed to delete task");
      }
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? "show" : ""}`}>
      <div className="modal-content">
      <h3>{task ? "Edit Task" : `Create Task for ${new Date(defaultDate).toDateString()}`}</h3>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="📝 Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="task">📌 Task</option>
            <option value="meeting">📅 Meeting</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">⏳ Pending</option>
            <option value="in progress">🔧 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Select member</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.username}
              </option>
            ))}
          </select>
          <div className="modal-buttons">
            <button type="submit">{task ? "Save" : "Create"}</button>
            {task && (
              <button 
                type="button"
                onClick={handleDelete}
                className="delete"
              >Delete</button>
            )}
            <button type="button" onClick={onClose} className="cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
