import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function MyTasks() {
  // Dummy Tasks
  const [statusFilter, setStatusFilter] = useState("");
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Create Login API",
      priority: "High",
      deadline: "2026-03-20",
      status: "Pending",
    },
    {
      id: 2,
      title: "Fix Attendance Module",
      priority: "Medium",
      deadline: "2026-03-25",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Update Employee Profile UI",
      priority: "Low",
      deadline: "2026-03-30",
      status: "Completed",
    },
  ]);

  const updateStatus = (id, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task,
      ),
    );
  };

  // Task Stats
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const progress = tasks.filter((t) => t.status === "In Progress").length;

  const filteredTasks = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  return (
    <div className="container card py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary">My Tasks</h4>
      </div>

      {/* Summary Cards */}
      <div className="row mb-1 ">
        <div className="col-md-3 ">
          <div
            className="card shadow-sm text-center p-3 bg-danger"
            onClick={() => setStatusFilter("")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="text-muted">Total Tasks</h6>
            <h4 className="fw-bold">{totalTasks}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm text-center p-3 bg-warning"
            onClick={() => setStatusFilter("Pending")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="text-muted">Pending</h6>
            <h4 className="fw-bold ">{pending}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm text-center p-3 bg-info"
            onClick={() => setStatusFilter("In Progress")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="text-muted">In Progress</h6>
            <h4 className="fw-bold ">{progress}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm text-center p-3 bg-success "
            onClick={() => setStatusFilter("Completed")}
            style={{ cursor: "pointer" }}
          >
            <h6 className="text-muted">Completed</h6>
            <h4 className="fw-bold ">{completed}</h4>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="fw-semibold">{task.title}</td>

                    {/* Priority */}
                    <td>
                      <span
                        className={`badge ${
                          task.priority === "High"
                            ? "bg-danger"
                            : task.priority === "Medium"
                              ? "bg-warning text-dark"
                              : "bg-success"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Deadline */}
                    <td>{task.deadline}</td>

                    {/* Status */}
                    <td>
                      <span
                        className={`badge ${
                          task.status === "Completed"
                            ? "bg-success"
                            : task.status === "In Progress"
                              ? "bg-info"
                              : "bg-secondary"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    {/* Status Update */}
                    <td>
                      <select
                        className="form-select"
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                      >
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyTasks;
