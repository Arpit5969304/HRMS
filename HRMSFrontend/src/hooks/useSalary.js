import { useState } from "react";
import API from "../utils/axios";

const useSalary = () => {
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [incrementHistory, setIncrementHistory] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const saveSalary = async (employeeId, salary) => {
    try {
      setLoading(true);

      const res = await API.post("/salary/save", {
        employeeId,
        salary,
      });

      await getSalaryHistory(employeeId);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const applyIncrement = async (employeeId, amount, remarks) => {
    try {
      setLoading(true);

      const res = await API.post("/salary/increment", {
        employeeId,
        amount,
        remarks,
      });

      await Promise.all([
        getIncrementHistory(employeeId),
        getSalaryHistory(employeeId),
      ]);

      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const getSalaryHistory = async (employeeId) => {
    try {
      setLoading(true);

      const res = await API.get(`/salary/admin/${employeeId}`);
      setSalaryHistory(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      setSalaryHistory([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSalary = async (employeeId) => {
    try {
      setLoading(true);

      const res = await API.get(`/salary/admin/current/${employeeId}`);
      return res.data;
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getIncrementHistory = async (employeeId) => {
    try {
      setLoading(true);

      const res = await API.get(`/salary/admin/increment/${employeeId}`);
      setIncrementHistory(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      setIncrementHistory([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPayrollPreview = async (employeeId, month, year) => {
    try {
      setLoading(true);

      const res = await API.get(`/salary/admin/payroll/${employeeId}/preview`, {
        params: { month, year },
      });

      return res.data;
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAdminPayrollHistory = async (employeeId) => {
    try {
      setLoading(true);

      const res = await API.get(`/salary/admin/payroll/${employeeId}`);
      setPayrollHistory(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      setPayrollHistory([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const payMonthlySalary = async (employeeId, month, year, notes) => {
    try {
      setLoading(true);

      const res = await API.post("/salary/admin/payroll/pay", {
        employeeId,
        month,
        year,
        notes,
      });

      await getAdminPayrollHistory(employeeId);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const getMySalaryData = async () => {
    try {
      setLoading(true);

      const res = await API.get("/salary/my");
      return res.data;
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMyPayrollPreview = async (month, year) => {
    try {
      setLoading(true);

      const res = await API.get("/salary/me/payroll/preview", {
        params: { month, year },
      });

      return res.data;
    } catch (err) {
      console.log(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMyPayrollHistory = async () => {
    try {
      setLoading(true);

      const res = await API.get("/salary/me/payroll");
      setPayrollHistory(res.data);
      return res.data;
    } catch (err) {
      console.log(err);
      setPayrollHistory([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    salaryHistory,
    incrementHistory,
    payrollHistory,
    loading,
    saveSalary,
    applyIncrement,
    getCurrentSalary,
    getSalaryHistory,
    getIncrementHistory,
    getPayrollPreview,
    getAdminPayrollHistory,
    payMonthlySalary,
    getMySalaryData,
    getMyPayrollPreview,
    getMyPayrollHistory,
  };
};

export default useSalary;
