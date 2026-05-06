import React, { useEffect, useState } from "react";
import API from "../../utils/axios";
import {
  FaPhone, FaVenusMars, FaBirthdayCake, FaMapMarkerAlt,
  FaBuilding, FaEnvelope, FaUserTie, FaIdBadge,
  FaMoneyBillWave, FaUniversity, FaCreditCard,
  FaPhoneAlt, FaClock, FaUser, FaCodeBranch
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import "../../assets/styles/ProfilePage.css";

const ProfilePage = () => {

  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({});

  /* ==============================
     🔥 FETCH DATA
  ============================== */
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const [userRes, accountRes] = await Promise.all([
        API.get("/employees/me"),
        API.get("/employee-account/my-account"),
      ]);

      setUser(userRes.data);
      setAccount(accountRes.data.data);

      setFormData({
        fullName: userRes.data.fullName || "",
        personalPhone: userRes.data.phone || "",
        dob: userRes.data.dob || "",
        gender: userRes.data.gender || "",
        address: userRes.data.address || "",

        bankName: accountRes.data?.data?.bankName || "",
        accountNumber: "",
        ifsc: accountRes.data?.data?.ifscCode || "",
        pan: accountRes.data?.data?.panNumber || "",
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ==============================
     🔥 HANDLE CHANGE
  ============================== */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* ==============================
     🔥 UPDATE PROFILE
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.put("/employees/update-profile", formData);

      alert("✅ Profile updated");
      setOpenModal(false);
      fetchProfile();

    } catch (err) {
      alert(err.response?.data?.message || "Error updating");
    }
  };

  if (loading || !user) return <p className="text-center">Loading...</p>;

  /* ==============================
     🔥 DYNAMIC DATA
  ============================== */

  const personalDetails = [
    { label: "Phone", value: user.phone, icon: <FaPhone /> },
    { label: "Gender", value: user.gender, icon: <FaVenusMars /> },
    { label: "Date of Birth", value: user.dob, icon: <FaBirthdayCake /> },
    { label: "Address", value: user.address, icon: <FaMapMarkerAlt /> },
  ];

  const companyDetails = [
    { label: "Email", value: user.email, icon: <FaEnvelope /> },
    { label: "Department", value: user.department, icon: <FaBuilding /> },
    { label: "Designation", value: user.designation, icon: <FaUserTie /> },
    { label: "Employee ID", value: user.employeeId, icon: <FaIdBadge /> },
  ];

  const accountDetails = account ? [
    { label: "Bank Name", value: account.bankName, icon: <FaUniversity /> },
    { label: "Account Number", value: account.accountNumber, icon: <FaCreditCard /> },
    { label: "IFSC Code", value: account.ifscCode, icon: <FaUniversity /> },
    { label: "PAN Number", value: account.panNumber, icon: <FaIdBadge /> },
  ] : [];

  const renderSection = (title, icon, data) => (
    <div className="section-card">
      <div className="section-header">
        <h3 className="profile-card-h3">{icon} {title}</h3>
      </div>

      <div className="details-grid">
        {data.map((item, i) => (
          <div key={i} className="detail-item">
            <div className="detail-icon">{item.icon}</div>
            <div>
              <span>{item.label}</span>
              <p>{item.value || "N/A"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="profile-container">

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-info">
              <div className="profile-avatar">
                {user.fullName?.charAt(0)}
              </div>
              <div>
                <h2>{user.fullName}</h2>
                <span>{user.designation}</span>
              </div>
            </div>

            <button className="edit-btn" onClick={() => setOpenModal(true)}>
              Edit Profile
            </button>
          </div>

          <div className="profile-sections">
            {renderSection("Personal Details", <CgProfile />, personalDetails)}
            {renderSection("Company Details", <FaBuilding />, companyDetails)}
          </div>
        </div>

        <div className="profile-card">
          {renderSection("Account Details", <FaUniversity />, accountDetails)}
        </div>

      </div>

      {/* MODAL */}
      {openModal && (
        <div className="modal-overlay">
          <div className="modal-container">

            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button onClick={() => setOpenModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">

              <input name="fullName" value={formData.fullName} onChange={handleChange} />
              <input name="personalPhone" value={formData.personalPhone} onChange={handleChange} />
              <input name="ifsc" value={formData.ifsc} onChange={handleChange} />

              <div className="modal-footer">
                <button type="submit">Save</button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;