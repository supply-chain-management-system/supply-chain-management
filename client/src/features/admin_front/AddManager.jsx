import { useState } from "react";
import axios from "axios";
import apiClient from "../../api/api";
import './AddManager.css'
function AddManager() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = async () => {
      apiClient
    .post("/invite", {
      email,
      role,
    })
    .then((res) => {
      alert("Invite Link: " + res.data.invite_link);
    })
    .catch((err) => {
      console.error("Error:", err.response?.data || err.message);
    });
  };

  return (
    <div class="invite-container">
  <div class="invite-card">
    <h2>Add Manager</h2>

    <div class="form-group">
      <label>Email</label>
      <input
        type="email"
        placeholder="Enter email address"
      />
    </div>

    <div class="form-group">
      <label>Role</label>
      <select>
        <option value="">Select Role</option>
        <option value="MANAGER">Manager</option>
        <option value="FACTORY_MANAGER">Factory Manager</option>
      </select>
    </div>

    <button class="invite-btn">Send Invite</button>
  </div>
</div>
  );
}

export default AddManager;