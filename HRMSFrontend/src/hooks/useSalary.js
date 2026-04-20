import { useState } from "react";
import API from "../utils/axios";

const useSalary = () => {
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [incrementHistory, setIncrementHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ==============================
     🔥 SAVE SALARY
  ============================== */
  const saveSalary = async (employeeId, salary) => {
    try {
      setLoading(true);

      await API.post("/salary/save", {
        employeeId,
        salary,
      });

      await getSalaryHistory(employeeId);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     🔥 APPLY INCREMENT
  ============================== */
  const applyIncrement = async (employeeId, amount, remarks) => {
    try {
      setLoading(true);

      await API.post("/salary/increment", {
        employeeId,
        amount,
        remarks,
      });

      await getIncrementHistory(employeeId);
      await getSalaryHistory(employeeId);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     🔥 GET SALARY HISTORY
  ============================== */
  const getSalaryHistory = async (employeeId) => {
    try {
      setLoading(true);

      const res = await API.get(`/salary/admin/${employeeId}`);
      setSalaryHistory(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     🔥 GET INCREMENT HISTORY
  ============================== */
  const getIncrementHistory = async (employeeId) => {
    try {
      setLoading(true);

      const res = await API.get(
        `/salary/admin/increment/${employeeId}`
      );

      setIncrementHistory(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    salaryHistory,
    incrementHistory,
    loading,
    saveSalary,
    applyIncrement,
    getSalaryHistory,
    getIncrementHistory,
  };
};

export default useSalary;