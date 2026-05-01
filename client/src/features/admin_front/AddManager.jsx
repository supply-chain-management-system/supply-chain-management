import { useState } from "react";
import axios from "axios";
import apiClient from "../../api/api";

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
    <div>
      <h2>Add Manager</h2>

      <input
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="">Select Role</option>
        <option value="MANAGER">Manager</option>
        <option value="FACTORY_MANAGER">Factory Manager</option>
      </select>

      <button onClick={handleSubmit}>Send Invite</button>
    </div>
  );
}

export default AddManager;