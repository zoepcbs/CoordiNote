import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import "react-calendar/dist/Calendar.css";
import TaskModal from "./TaskModal";

function GroupCalendar({ groupId }) {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks for calendar", err);
      }
    };

    fetchTasks();
  }, [groupId, token]);

  const handleTaskSubmit = async (taskData) => {
    try {
      const taskWithGroup = { ...taskData, groupId, dueDate: selectedDate.toISOString() };

      if (editingTask) { // EDIT mode:
        await axios.put(
          `http://localhost:5000/api/tasks/${editingTask._id}`,
          taskWithGroup,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } 
      else { // create NEW task:
        await axios.post(
          `http://localhost:5000/api/groups/${groupId}/tasks`, 
          taskWithGroup,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
      setShowModal(false); // close modal after submitting
      setEditingTask(null);
    } catch (err) {
      alert("Failed to save task.");
      console.error(err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the task list
      const res = await axios.get(`http://localhost:5000/api/groups/${groupId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err; // This will be caught in the TaskModal's handleDelete
    }
  };

  const tasksByDate = {};
  tasks.forEach((task) => {
    const dateKey = task.dueDate?.slice(0, 10);
    if (dateKey) {
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push(task);
    }
  });

  return (
    <div style={{ marginTop: "1rem" }}>
      <h4>Group Calendar</h4>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={({ date }) => {
          const dateKey = date.toISOString().slice(0, 10);
          const dayTasks = tasksByDate[dateKey];
          if (dayTasks?.length) {
            return (
              <div style={{ display: "flex", gap: "4px", marginTop: "4px", justifyContent: "center" }}>
                {dayTasks.slice(0, 3).map((task) => (
                  <span
                    key={task._id}
                    title={task.title}
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor:
                        task.type === "meeting"
                          ? "#007bff"
                          : task.status === "completed"
                          ? "green"
                          : task.status === "in progress"
                          ? "orange"
                          : "red",
                    }}
                  ></span>
                ))}
                {dayTasks.length > 3 && <span style={{ fontSize: "0.6rem" }}>+{dayTasks.length - 3}</span>}
              </div>
            );
          }
          return null;
        }}
      />

      <div style={{ marginTop: "1rem" }}>
        <h5>Add task on {selectedDate.toDateString()}:</h5>
        <button onClick={() => setShowModal(true)}>+ Add Task for This Day</button>
        <TaskModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSubmit={handleTaskSubmit}
          onDelete={handleDeleteTask}
          defaultDate={selectedDate.toISOString().slice(0, 10)}
          task={editingTask}
          groupId={groupId}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <h5>Tasks due on {selectedDate.toDateString()}:</h5>
        <ul>
          {tasks
            .filter((task) => task.dueDate?.slice(0, 10) === selectedDate.toISOString().slice(0, 10))
            .map((task) => (
              <li key={task._id}>
                <strong>{task.title}</strong> ({task.type} --- Status: {task.status} --- Assigned To: {task.assignedTo?.username || "Unassigned"})
                <button onClick={() => handleEditTask(task)}>Edit Task</button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default GroupCalendar;
