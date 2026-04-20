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
    try {
      const isFormData = data instanceof FormData;

      await API.post("/employees", data, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      fetchEmployees();
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const deleteEmployee = async (id) => {
    await API.delete(`/employees/${id}`);
    fetchEmployees();
  };

  const updateEmployee = async (id, data) => {
    try {
      const isFormData = data instanceof FormData;

      await API.put(`/employees/${id}`, data, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      fetchEmployees();
    } catch (err) {
      console.log(err);
      throw err;
    }
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
