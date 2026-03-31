import React, { useEffect, useState } from "react";
import axios from "axios";
import ToDoList from "./ToDoList";
import GroupCalendar from "./GroupCalendar";
import GroupFiles from "./GroupFiles";
import TaskModal from "./TaskModal";
import CreateGroup from "./CreateGroup";
import "./Dashboard.css";

function Dashboard() {
  // Main data states
  const [groups, setGroups] = useState([]);
  const [personalTasks, setPersonalTasks] = useState([]);
  const [groupTasks, setGroupTasks] = useState({});
  const [groupMembers, setGroupMembers] = useState({});
  
  // UI state management
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [activeView, setActiveView] = useState("todo"); // todo, calendar
  const [calendarView, setCalendarView] = useState("weekly"); // weekly, monthly
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState(null);
  
  const token = localStorage.getItem("token");

  // Fetch all tasks (personal + from all groups)
  const fetchAllTasks = async () => {
    try {
      // Fetch personal tasks
      const personalRes = await axios.get("http://localhost:5000/api/my-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch group tasks if we have groups
      let groupTasksArray = [];
      if (groups.length > 0) {
        const groupTasksPromises = groups.map(async group => {
          const res = await axios.get(`http://localhost:5000/api/groups/${group._id}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return res.data || [];
        });
        groupTasksArray = (await Promise.all(groupTasksPromises)).flat();
      }
      
      // Combine all tasks
      setPersonalTasks([...personalRes.data, ...groupTasksArray]);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  // Initial data fetching
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/my-groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(res.data);
        fetchAllTasks();
      } catch (err) {
        console.error("Error fetching groups", err);
      }
    };

    /*
    const fetchPersonalTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/my-tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPersonalTasks(res.data || []);
      } catch (err) {
        console.error("Error fetching personal tasks", err);
      }
    };
    */

    fetchGroups();
    //fetchPersonalTasks();
  }, [token]);

  // Fetch group-specific data when a group is expanded
  useEffect(() => {
    if (!expandedGroup) return;
    
    const fetchGroupTasks = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/groups/${expandedGroup}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setGroupTasks(prev => ({
          ...prev,
          [expandedGroup]: res.data || []
        }));
      } catch (err) {
        console.error(`Error fetching tasks for group ${expandedGroup}`, err);
      }
    };
    
    const fetchGroupMembers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/groups/${expandedGroup}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setGroupMembers(prev => ({
          ...prev,
          [expandedGroup]: res.data || []
        }));
      } catch (err) {
        console.error(`Error fetching members for group ${expandedGroup}`, err);
      }
    };
    
    fetchGroupTasks();
    fetchGroupMembers();
  }, [expandedGroup, token]);

  // Get current active tasks based on expanded group
  const currentTasks = expandedGroup ? (groupTasks[expandedGroup] || []) : personalTasks;
  
  // Toggle group expansion
  const toggleGroup = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
    // Reset active view when toggling groups
    setActiveView("todo");
  };
  
  // Go back to personal dashboard
  const goToPersonalDashboard = () => {
    setExpandedGroup(null);
    setActiveView("todo");
  };
  

  // Handle task form submission
  const handleTaskSubmit = async (taskData) => {
    try {
      const taskWithDate = { 
        ...taskData, 
        dueDate: selectedDate.toISOString() 
      };

      if (expandedGroup) {
        // Group task
        const taskWithGroup = { ...taskWithDate, groupId: expandedGroup };
        
        if (editingTask) {
          // Edit existing task
          await axios.put(
            `http://localhost:5000/api/tasks/${editingTask._id}`,
            taskWithGroup,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Create new task
          await axios.post(
            `http://localhost:5000/api/groups/${expandedGroup}/tasks`, 
            taskWithGroup,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        
        // Refresh tasks
        if (expandedGroup) {
          const res = await axios.get(`http://localhost:5000/api/groups/${expandedGroup}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGroupTasks(prev => ({
            ...prev,
            [expandedGroup]: res.data || []
          }));
        }
        fetchAllTasks(); // Refresh all tasks
      } else {
        // Personal task
        if (editingTask) {
          // Edit existing task
          await axios.put(
            `http://localhost:5000/api/tasks/${editingTask._id}`,
            taskWithDate,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Create new task
          await axios.post(
            `http://localhost:5000/api/my-tasks`, 
            taskWithDate,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        fetchAllTasks(); // Refresh all tasks
      }
      
      // Reset state
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (err) {
      alert("Failed to save task.");
      console.error(err);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh task lists
      if (expandedGroup) {
        const res = await axios.get(`http://localhost:5000/api/groups/${expandedGroup}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroupTasks(prev => ({
          ...prev,
          [expandedGroup]: res.data || []
        }));
      } /*else {
        const res = await axios.get("http://localhost:5000/api/my-tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPersonalTasks(res.data || []);
      }*/
      fetchAllTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  // Handle group creation callback
  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [...prev, newGroup]);
    setExpandedGroup(newGroup._id);
    setActiveView("todo");
  };

  // Calculate task completion percentage
  const calculateCompletion = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  // Get current week dates for the calendar
  const getCurrentWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 6 is Saturday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - day + (day === 0 ? -6 : 1)); // Start from Monday
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };
  
  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    /*if (!expandedGroup) return [];
    
    return (groupTasks[expandedGroup] || []).filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });*/
    const tasksToCheck = expandedGroup ? (groupTasks[expandedGroup] || []) : personalTasks;
    
    return tasksToCheck.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  const weekDates = getCurrentWeekDates();

  // Get current active tasks based on expanded group
  //const currentTasks = expandedGroup ? (groupTasks[expandedGroup] || []) : personalTasks;
  
  // Get name of current view context (personal or group name)
  const currentViewName = expandedGroup 
    ? (groups.find(g => g._id === expandedGroup)?.groupName || "Group") 
    : "Personal Dashboard";

  // Get sidebar items based on whether a group is expanded or not
  const getSidebarItems = () => {
    const items = [
      { id: 'todo', label: 'To-Do List' },
      { id: 'calendar', label: 'Calendar' }
    ];
    
    // Only show Documents and Members tabs when a group is expanded
    if (expandedGroup) {
      items.push({ id: 'documents', label: 'Documents' });
      items.push({ id: 'members', label: 'Group Members' });
    }
    
    return items;
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">CoordiNote</div>
        <div className="header-right">
          <button className="message-btn">
            <span className="email-icon">✉️</span>
          </button>
          <div className="user-avatar">U</div>
        </div>
      </header>

      {/* Groups Section */}
      <section className="groups-section">
        <div className="section-header">
          <h2>YOUR GROUPS</h2>
          <button 
            className="add-btn" 
            title="Create New Group"
            onClick={() => {
              setExpandedGroup(null);
              setActiveView("create-group");
            }}
          >+</button>
        </div>
        <div className="groups-carousel">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div 
                key={group._id} 
                className={`group-card ${expandedGroup === group._id ? 'active' : ''}`}
                onClick={() => toggleGroup(group._id)}
              >
                <div className="group-image" style={{ backgroundColor: `${group.color || '#4db8ff'}` }}></div>
                <div className="group-title">{group.groupName}</div>
                <div className="group-members">
                  {(groupMembers[group._id] || []).slice(0, 5).map((member, idx) => (
                    <div key={idx} className="member-avatar">{member.username ? member.username.charAt(0) : 'M'}</div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="no-groups-message">You don't have any groups yet. Click the + button to create one.</div>
          )}
        </div>
      </section>

      {/* Dashboard Main Content */}
      <section className="dashboard-main">
        {/* Header for either personal or group dashboard */}
        <div className="section-header">
          <div className="selected-group-name">{currentViewName}</div>
          {expandedGroup && (
            <button 
              className="back-to-personal-btn"
              onClick={goToPersonalDashboard}
              title="Back to Personal Dashboard"
            >
              Back to Personal Dashboard
            </button>
          )}
          <button className="message-btn">
            <span className="email-icon">✉️</span>
          </button>
        </div>

        {/* Sidebar navigation and content */}
        <div className="dashboard-content-wrapper">
          <div className="sidebar">
            {getSidebarItems().map(item => (
              <div 
                key={item.id}
                className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Main content area - changes based on activeView */}
          <div className="content-area">
            {/* Create Group View */}
            {activeView === 'create-group' && (
              <div className="create-group-content">
                <h3>Create a New Group</h3>
                <CreateGroup onGroupCreated={handleGroupCreated} />
              </div>
            )}
            
            {/* To-Do List View */}
            {activeView === 'todo' && (
              <div className="dashboard-content">
                {/* Progress Chart */}
                <div className="progress-section">
                  <div className="progress-chart">
                    <div className="progress-circle">
                      <svg viewBox="0 0 36 36">
                        <path
                          className="circle-bg"
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="circle"
                          strokeDasharray={`${calculateCompletion(currentTasks)}, 100`}
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <text x="18" y="20.35" className="percentage">
                          {calculateCompletion(currentTasks)}%
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="tasks-list">
                    {currentTasks.length > 0 ? (
                      currentTasks.map((task) => (
                        <div key={task._id} className="task-item">
                          <div className="task-header">
                            <input 
                              type="checkbox" 
                              checked={task.status === "completed"}
                              onChange={async () => {
                                try {
                                  const newStatus = task.status === "completed" ? "pending" : "completed";
                                  await axios.put(
                                    `http://localhost:5000/api/tasks/${task._id}`,
                                    { status: newStatus },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  
                                  // Update local state
                                  if (expandedGroup) {
                                    const updatedTasks = [...groupTasks[expandedGroup]];
                                    const taskIndex = updatedTasks.findIndex(t => t._id === task._id);
                                    if (taskIndex !== -1) {
                                      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus };
                                      setGroupTasks({
                                        ...groupTasks,
                                        [expandedGroup]: updatedTasks
                                      });
                                    }
                                  } else {
                                    const updatedTasks = [...personalTasks];
                                    const taskIndex = updatedTasks.findIndex(t => t._id === task._id);
                                    if (taskIndex !== -1) {
                                      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus };
                                      setPersonalTasks(updatedTasks);
                                    }
                                  }
                                } catch (err) {
                                  console.error("Error updating task status:", err);
                                }
                              }}
                            />
                            <span className={`task-title ${task.status === "completed" ? 'completed' : ''}`}>
                              {task.title}
                            </span>
                            <button 
                              className="edit-task-btn"
                              onClick={() => {
                                setEditingTask(task);
                                setSelectedDate(new Date(task.dueDate || Date.now()));
                                setShowTaskModal(true);
                              }}
                            >
                              Edit
                            </button>
                          </div>
                          
                          <div className="task-details">
                            {task.type && <span className="task-type">{task.type}</span>}
                            {task.assignedTo && (
                              <span className="task-assigned">
                                Assigned to: {typeof task.assignedTo === 'object' ? task.assignedTo.username : 'Unknown'}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="task-date">
                                Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-tasks-message">No tasks yet. Add a task to get started!</div>
                    )}
                    
                    {/* Add new task button */}
                    <button 
                      className="add-task-btn"
                      onClick={() => {
                        setEditingTask(null);
                        setSelectedDate(new Date());
                        setShowTaskModal(true);
                      }}
                    >
                      Add New Task
                    </button>
                  </div>
                </div>
                
                
              </div>
            )}

            {/* Calendar View */}
            {activeView === 'calendar' && (
              <div className="calendar-content">
                <div className="calendar-view-selector">
                  <button 
                    className={`view-btn ${calendarView === 'weekly' ? 'active' : ''}`}
                    onClick={() => setCalendarView('weekly')}
                  >
                    Weekly
                  </button>
                  <button 
                    className={`view-btn ${calendarView === 'monthly' ? 'active' : ''}`}
                    onClick={() => setCalendarView('monthly')}
                  >
                    Monthly
                  </button>
                </div>

                {calendarView === 'weekly' && (
                  <div className="calendar-grid">
                    {weekDates.map((date, idx) => (
                      <div key={idx} className="calendar-day">
                        <div className="day-header">
                          <span>{date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="day-tasks">
                          <ul>
                            {getTasksForDate(date).map((task, taskIdx) => (
                              <li key={taskIdx}>
                                • {task.title} 
                                {task.groupId && (
                                  <span className="task-group-indicator">
                                    ({groups.find(g => g._id === task.groupId)?.groupName || 'Group'})
                                  </span>
                                )}
                              </li>
                            ))}
                            
                            <li 
                              className="add-day-task" 
                              onClick={() => {
                                setEditingTask(null);
                                setSelectedDate(date);
                                setShowTaskModal(true);
                              }}
                            >
                              + Add task
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {calendarView === 'monthly' && (
                  <div className="integrated-calendar">
                    <GroupCalendar groupId={expandedGroup} />
                  </div>
                )}
              </div>
            )}

            {/* Documents View - Only shown when a group is expanded */}
            {activeView === 'documents' && expandedGroup && (
              <div className="documents-content">
                <GroupFiles groupId={expandedGroup} />
              </div>
            )}

            {/* Members View - Only shown when a group is expanded */}
            {activeView === 'members' && expandedGroup && (
              <div className="members-content">
                <h3>Group Members</h3>
                <div className="members-list">
                  {(groupMembers[expandedGroup] || []).length > 0 ? (
                    <ul>
                      {(groupMembers[expandedGroup] || []).map((member, idx) => (
                        <li key={idx} className="member-item">
                          <div className="member-avatar">{member.username ? member.username.charAt(0) : 'M'}</div>
                          <div className="member-info">
                            <span className="member-name">{member.username || 'Unknown Member'}</span>
                            <span className="member-role">{member._id === groups.find(g => g._id === expandedGroup)?.creator ? 'Owner' : 'Member'}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No members found for this group.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

                {/* Task Modal */}
                <TaskModal
                  isOpen={showTaskModal}
                  onClose={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                  }}
                  onSubmit={handleTaskSubmit}
                  onDelete={handleDeleteTask}
                  defaultDate={selectedDate.toISOString().slice(0, 10)}
                  task={editingTask}
                  groupId={expandedGroup}
                />

                
      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="logo">CoordiNote</div>
      </footer>
    </div>
  );
}

export default Dashboard;
