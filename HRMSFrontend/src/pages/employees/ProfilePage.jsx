import React from "react";
import {
  FaPhone,
  FaVenusMars,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaBuilding,
  FaEnvelope,
  FaUserTie,
  FaIdBadge,
  FaMoneyBillWave,
  FaUniversity,
  FaCreditCard,
  FaPhoneAlt,
  FaClock,
  FaUser,
  FaCodeBranch,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import "../../assets/styles/ProfilePage.css";

const Profile = () => {
  const [openModal, setOpenModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    fullName: "Kratika Sharma",
    personalPhone: "0101010101",
    companyPhone: "+91 9876543210",
    dob: "2000-03-14",
    gender: "Female",
    address: "Indore",
    ifsc: "HDFC0001234",
    accountNumber: "193992329438388",
    pan: "ABCDE1234F",
    beneficiary: "Kratika Sharma",
    bankName: "HDFC Bank",
    branchName: "Indore Main Branch",

  });

  const personalDetails = [
    { label: "Phone", value: "0101010101", icon: <FaPhone /> },
    { label: "Gender", value: "Female", icon: <FaVenusMars /> },
    { label: "Date of Birth", value: "March 14, 2000", icon: <FaBirthdayCake /> },
    { label: "Address", value: "Indore", icon: <FaMapMarkerAlt /> },
  ];

  const companyDetails = [
    { label: "Joining Date", value: "August 16, 2024", icon: <FaBuilding /> },
    { label: "Company Phone", value: "+91 9876543210", icon: <FaPhoneAlt /> },
    { label: "Email", value: "test@mail.in", icon: <FaEnvelope /> },
    { label: "Department", value: "Information Technology", icon: <FaBuilding /> },
    { label: "Designation", value: "Dot Net Developer", icon: <FaUserTie /> },
    { label: "Reporting Manager", value: "Kashiram", icon: <FaUserTie /> },
    { label: "Employee ID", value: "SGH2", icon: <FaIdBadge /> },
    { label: "Last Login", value: "19 Feb 2026, 09:42 AM", icon: <FaClock /> },
    { label: "Salary", value: "₹17,500", icon: <FaMoneyBillWave /> },
  ];

  const accountDetails = [
    { label: "Bank Name", value: "HDFC Bank", icon: <FaUniversity /> },
    { label: "Branch Name", value: "Indore Main Branch", icon: <FaCodeBranch /> },
    { label: "Beneficiary Name", value: "Kratika Sharma", icon: <FaUser /> },
    { label: "Account Number", value: "1939 9232 9438 8388", icon: <FaCreditCard /> },
    { label: "IFSC Code", value: "HDFC0001234", icon: <FaUniversity /> },
    { label: "PAN Number", value: "ABCDE1234F", icon: <FaIdBadge /> },
  ];



  const openEditModal = () => {
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // simple required validation
    for (let key in formData) {
      if (!formData[key]) {
        alert("All fields are required!");
        return;
      }
    }

    console.log("Updated Data:", formData);

    setOpenModal(false);
  };







  const renderSection = (title, icon, data) => (
    <div className="section-card">
      <div className="section-header">
    
        <h3 className="profile-card-h3"> {icon} {title}</h3>
      </div>

      <div className="details-grid">
        {data.map((item, index) => (
          <div className="detail-item" key={index}>
            <div className="detail-icon">{item.icon}</div>
            <div className="detail-text">
              <span>{item.label}</span>
              <p>{item.value}</p>
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
              <div className="profile-avatar">KS</div>
              <div>
                <h2>Kratika Sharma</h2>
                <span className="profile-type">Full Time • Dot Net Developer</span>
              </div>
            </div>
            <button className="edit-btn" onClick={openEditModal}>
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
      {openModal && (
        <div className="modal-overlay">
          <div className="modal-container">

            {/* Header */}
            <div className="modal-header">
              <h2>Edit Profile Details</h2>
              <button className="close-icon" onClick={closeModal}>×</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="modal-body">

              <div className="form-grids">

                <div className="input-group">
                  <span className="input-addon">Profile Image</span>
                  <input type="file" />
                </div>

                <div className="input-group">
                  <span className="input-addon">Full Name</span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">Personal Phone</span>
                  <input
                    type="text"
                    name="personalPhone"
                    value={formData.personalPhone}
                    onChange={handleChange}
                    placeholder="Enter personal phone"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">Company Phone</span>
                  <input
                    type="text"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    placeholder="Enter company phone"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">Date of Birth</span>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">Gender</span>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="input-group full-width">
                  <span className="input-addon">Address</span>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">IFSC Code</span>
                  <input
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    placeholder="Enter IFSC code"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">Account Number</span>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">PAN Number</span>
                  <input
                    type="text"
                    name="pan"
                    value={formData.pan}
                    onChange={handleChange}
                    placeholder="Enter PAN number"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">Beneficiary Name</span>
                  <input
                    type="text"
                    name="beneficiary"
                    value={formData.beneficiary}
                    onChange={handleChange}
                    placeholder="Enter beneficiary name"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">Bank Name</span>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="input-group">
                  <span className="input-addon">Branch Name</span>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder="Enter branch name"
                  />
                </div>

              </div>


              {/* Footer */}
              <div className="modal-footer">
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
                <button type="button" className="close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </>
  );
};

export default Profile;
