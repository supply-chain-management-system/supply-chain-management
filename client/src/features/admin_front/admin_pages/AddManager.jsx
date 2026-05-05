import { useState } from "react";
import axios from "axios";
import './AddManager.css'
import api from "../../../api/api";
function AddManager() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);


  const handleSubmit = (e) => {
     e.preventDefault();
    api
      .post("/invite", {
        email,
        role,
      })
      .then((res) => {
        alert("send successfully");
      })
      .catch((err) => {
        console.error("Error:", err.response?.data || err.message);
      });
  };

  return (
   <div className="invite-container">
      <div className="invite-card">
        <h2>Add Manager</h2>

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="MANAGER">Manager</option>
              <option value="FACTORY_MANAGER">Factory Manager</option>
            </select>
          </div>

          <button   type="submit" className="invite-btn">
            Send Invite
          </button>

        </form>

      </div>
    </div>
  );
}

export default AddManager;