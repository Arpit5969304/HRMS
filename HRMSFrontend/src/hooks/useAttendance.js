import { useCallback, useState } from "react";
import API from "../utils/axios";

const getListData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const useAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAllAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/attendance");
      const data = getListData(res.data);

      setAttendance(data);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load attendance data";

      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/attendance/me");
      const data = getListData(res.data);

      setAttendance(data);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load attendance data";

      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    attendance,
    loading,
    error,
    getAllAttendance,
    getMyAttendance,
  };
};

export default useAttendance;
