import { useEffect, useState } from "react";
import API from "../utils/axios";

const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/employees");
      setEmployees(res.data.data || res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (data) => {
    await API.post("/employees", data);
    console.log("data",data);
    fetchEmployees(); // auto refresh
  };

  const deleteEmployee = async (id) => {
    await API.delete(`/employees/${id}`);
    fetchEmployees();
  };

  const updateEmployee = async (id, data) => {
    await API.put(`/employees/${id}`, data);
    fetchEmployees();
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    createEmployee,
    deleteEmployee,
    updateEmployee,
  };
};

export default useEmployees;