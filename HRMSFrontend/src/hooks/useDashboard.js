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
        const [emp, att, leave, holiday] = await Promise.all([
          API.get("/employees"),
          API.get("/attendance"),
          API.get("/leaves"),
          API.get("/holidays"),
        ]);

        setData({
          employees: emp.data.data || emp.data,
          attendance: att.data,
          leaves: leave.data,
          holidays: holiday.data,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};

export default useDashboard;