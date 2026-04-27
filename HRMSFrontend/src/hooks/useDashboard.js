import { useEffect, useState } from "react";
import API from "../utils/axios";

const useDashboard = () => {
  const [data, setData] = useState({
    employees: [],
    attendance: [],
    leaves: [],
    holidays: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const emp = await API.get("/employees").catch(() => ({ data: [] }));
        const att = await API.get("/attendance").catch(() => ({ data: [] }));
        const leave = await API.get("/leaves").catch(() => ({ data: [] }));
        const holiday = await API.get("/holidays").catch(() => ({ data: [] }));

        setData({
          employees: Array.isArray(emp.data)
            ? emp.data
            : emp.data?.data || [],
          attendance: Array.isArray(att.data)
            ? att.data
            : att.data?.data || [],
          leaves: Array.isArray(leave.data)
            ? leave.data
            : leave.data?.data || [],
          holidays: Array.isArray(holiday.data)
            ? holiday.data
            : holiday.data?.data || [],
        });
      } catch (err) {
        console.log("DASHBOARD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};

export default useDashboard;