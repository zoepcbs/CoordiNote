import React, { useEffect, useState } from "react";
import axios from "axios";

function GroupTasks({ groupId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState("task");
  const [status, setStatus] = useState("pending");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();
  }, [groupId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/groups/${groupId}/tasks`,
        { title, dueDate, type, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDueDate("");
      setType("task");
      setStatus("pending");

      // Re-fetch tasks after adding
      const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h4>Tasks</h4>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="task">Task</option>
          <option value="meeting">Meeting</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <strong>{task.title}</strong> — {task.type}
            {task.dueDate ? ` (due ${task.dueDate.slice(0, 10)})` : ""}
            — Status: {task.status}
            {task.assignedTo && ` — Assigned to: ${task.assignedTo.username}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupTasks;
