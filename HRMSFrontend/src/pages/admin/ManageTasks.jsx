import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import API from "../../utils/axios";

function ManageTasks() {

  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    employeeId: "",
    priority: "Medium",
    deadline: "",
  });

  /* ==============================
     🔥 FETCH DATA
  ============================== */
  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTasks();
  }, []);

  const departments = [...new Set(employees.map(emp => emp.department))];

  const filteredEmployees = employees.filter(
    emp => selectedDepartment === "" || emp.department === selectedDepartment
  );

  /* ==============================
     🔥 HANDLE CHANGE
  ============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewTask({
      ...newTask,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleDepartmentChange = (dept) => {
    setSelectedDepartment(dept);

    setErrors({
      ...errors,
      department: "",
    });

    setNewTask({
      ...newTask,
      employeeId: "",
    });
  };

  /* ==============================
     🔥 VALIDATION
  ============================== */
  const validate = () => {
    let newErrors = {};

    if (!selectedDepartment) {
      newErrors.department = "Department is required";
    }

    if (!newTask.employeeId) {
      newErrors.employeeId = "Employee is required";
    }

    if (!newTask.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!newTask.deadline) {
      newErrors.deadline = "Deadline is required";
    }

    return newErrors;
  };

  /* ==============================
     🔥 CREATE TASK
  ============================== */
  const addTask = async () => {

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await API.post("/tasks", {
        title: newTask.title,
        employeeId: newTask.employeeId,
        department: selectedDepartment,
        priority: newTask.priority,
        deadline: newTask.deadline,
      });

      // 🔥 refresh
      fetchTasks();

      setNewTask({
        title: "",
        employeeId: "",
        priority: "Medium",
        deadline: "",
      });

      setSelectedDepartment("");
      setErrors({});
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error creating task");
    }
  };

  /* ==============================
     🔥 FORMAT DATE
  ============================== */
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-CA");

  return (
    <div className="container py-4">

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white">
          <h4 className="fw-bold text-primary">Manage Tasks</h4>
        </div>

        <div className="card-body">

          {/* FORM */}
          <div className="row g-3 mb-4">

            {/* Department */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && <small className="text-danger">{errors.department}</small>}
            </div>

            {/* Employee */}
            <div className="col-md-3">
              <select
                name="employeeId"
                className="form-select"
                value={newTask.employeeId}
                onChange={handleChange}
              >
                <option value="">Select Employee</option>
                {filteredEmployees.map(emp => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
              {errors.employeeId && <small className="text-danger">{errors.employeeId}</small>}
            </div>

            {/* Title */}
            <div className="col-md-3">
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="Task title"
                value={newTask.title}
                onChange={handleChange}
              />
              {errors.title && <small className="text-danger">{errors.title}</small>}
            </div>

            {/* Priority */}
            <div className="col-md-2">
              <select
                name="priority"
                className="form-select"
                value={newTask.priority}
                onChange={handleChange}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            {/* Deadline */}
            <div className="col-md-2">
              <input
                type="date"
                name="deadline"
                className="form-control"
                value={newTask.deadline}
                onChange={handleChange}
              />
              {errors.deadline && <small className="text-danger">{errors.deadline}</small>}
            </div>

            {/* Button */}
            <div className="col-md-2">
              <button className="btn btn-primary w-100" onClick={addTask}>
                Add Task
              </button>
            </div>

          </div>

          {/* TABLE */}
          <div className="table-responsive">
            {loading ? (
              <p className="text-center">Loading...</p>
            ) : (
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Task</th>
                    <th>Department</th>
                    <th>Employee</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <tr key={task._id}>
                        <td>{task._id.slice(-5)}</td>
                        <td>{task.title}</td>

                        <td>
                          <span className="badge bg-info">
                            {task.department}
                          </span>
                        </td>

                        <td>
                          {task.employee?.firstName} {task.employee?.lastName}
                        </td>

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
                          <span className="badge bg-secondary">
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No tasks found
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default ManageTasks;