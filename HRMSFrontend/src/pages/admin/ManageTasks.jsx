import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ManageTasks() {

  const employees = [
    { id: 1, name: "Kratika Sharma", department: "IT" },
    { id: 2, name: "Ravi Mehta", department: "IT" },
    { id: 3, name: "Priya Sharma", department: "HR" },
    { id: 4, name: "Amit Verma", department: "Finance" },
  ];

  const departments = [...new Set(employees.map(emp => emp.department))];

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [tasks, setTasks] = useState([]);

  const [errors, setErrors] = useState({});

  const [newTask, setNewTask] = useState({
    title: "",
    employee: "",
    priority: "Medium",
    deadline: "",
  });

  const filteredEmployees = employees.filter(
    emp => selectedDepartment === "" || emp.department === selectedDepartment
  );

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
      employee: "",
    });
  };

  const validate = () => {

    let newErrors = {};

    if (!selectedDepartment) {
      newErrors.department = "Department is required";
    }

    if (!newTask.employee) {
      newErrors.employee = "Employee is required";
    }

    if (!newTask.title.trim()) {
      newErrors.title = "Task title is required";
    }

    if (!newTask.deadline) {
      newErrors.deadline = "Deadline is required";
    } else {
      const today = new Date().toISOString().split("T")[0];

      if (newTask.deadline < today) {
        newErrors.deadline = "Deadline cannot be in the past";
      }
    }

    return newErrors;
  };

  const addTask = () => {

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const task = {
      id: Date.now(),
      ...newTask,
      department: selectedDepartment,
      status: "Pending",
    };

    setTasks([...tasks, task]);

    setNewTask({
      title: "",
      employee: "",
      priority: "Medium",
      deadline: "",
    });

    setSelectedDepartment("");
    setErrors({});
  };

  return (
    <div className="container py-4">

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white">
          <h4 className="fw-bold text-primary">
            Manage Tasks
          </h4>
        </div>

        <div className="card-body">

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

              {errors.department && (
                <small className="text-danger">
                  {errors.department}
                </small>
              )}
            </div>

            {/* Employee */}
            <div className="col-md-3">
              <select
                name="employee"
                className="form-select"
                value={newTask.employee}
                onChange={handleChange}
              >
                <option value="">Select Employee</option>

                {filteredEmployees.map(emp => (
                   <option key={emp.id} value={emp.employeeId}>
                    {emp.name}
                  </option>
                ))}
              </select>

              {errors.employee && (
                <small className="text-danger">
                  {errors.employee}
                </small>
              )}
            </div>

            {/* Task Title */}
            <div className="col-md-3">
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="Task title"
                value={newTask.title}
                onChange={handleChange}
              />

              {errors.title && (
                <small className="text-danger">
                  {errors.title}
                </small>
              )}
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

              {errors.deadline && (
                <small className="text-danger">
                  {errors.deadline}
                </small>
              )}
            </div>

            {/* Button */}
            <div className="col-md-2">
              <button
                className="btn btn-primary w-100"
                onClick={addTask}
              >
                Add Task
              </button>
            </div>

          </div>

          {/* Task Table */}
          <div className="table-responsive">

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
                    <tr key={task.id}>

                      <td>{task.id}</td>

                      <td className="fw-semibold">
                        {task.title}
                      </td>

                      <td>
                        <span className="badge bg-info">
                          {task.department}
                        </span>
                      </td>

                      <td>{task.employee}</td>

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

                      <td>{task.deadline}</td>

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
                      No tasks created yet
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ManageTasks;