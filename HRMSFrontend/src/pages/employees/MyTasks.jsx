import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../../utils/axios";

function MyTasks() {

  const [statusFilter, setStatusFilter] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ==============================
     🔥 FETCH MY TASKS
  ============================== */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks/my");
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ==============================
     🔥 UPDATE STATUS (REAL API)
  ============================== */
  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/tasks/${id}/status`, { status: newStatus });

      // 🔥 instant UI update
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  /* ==============================
     🔥 STATS
  ============================== */
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const progress = tasks.filter((t) => t.status === "In Progress").length;

  const filteredTasks = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-CA");

  return (
    <div className="container card py-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary">My Tasks</h4>
      </div>

      {/* Summary Cards */}
      <div className="row mb-1">

        <div className="col-md-3">
          <div
            className="card shadow-sm text-center p-3 bg-danger"
            onClick={() => setStatusFilter("")}
            style={{ cursor: "pointer" }}
          >
            <h6>Total Tasks</h6>
            <h4>{totalTasks}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm text-center p-3 bg-warning"
            onClick={() => setStatusFilter("Pending")}
            style={{ cursor: "pointer" }}
          >
            <h6>Pending</h6>
            <h4>{pending}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm text-center p-3 bg-info"
            onClick={() => setStatusFilter("In Progress")}
            style={{ cursor: "pointer" }}
          >
            <h6>In Progress</h6>
            <h4>{progress}</h4>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm text-center p-3 bg-success"
            onClick={() => setStatusFilter("Completed")}
            style={{ cursor: "pointer" }}
          >
            <h6>Completed</h6>
            <h4>{completed}</h4>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
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
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <tr key={task._id}>

                        <td>{task.title}</td>

                        <td>
                          <span className={`badge ${
                            task.priority === "High"
                              ? "bg-danger"
                              : task.priority === "Medium"
                              ? "bg-warning text-dark"
                              : "bg-success"
                          }`}>
                            {task.priority}
                          </span>
                        </td>

                        <td>{formatDate(task.deadline)}</td>

                        <td>
                          <span className={`badge ${
                            task.status === "Completed"
                              ? "bg-success"
                              : task.status === "In Progress"
                              ? "bg-info"
                              : "bg-secondary"
                          }`}>
                            {task.status}
                          </span>
                        </td>

                        <td>
                          <select
                            className="form-select"
                            value={task.status}
                            onChange={(e) =>
                              updateStatus(task._id, e.target.value)
                            }
                          >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                          </select>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-3">
                        No tasks found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default MyTasks;