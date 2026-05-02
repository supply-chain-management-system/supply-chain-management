import React, { useEffect, useState } from "react";
import api from "../../../api/api";

const CreateProduct = () => {
  const [form, setForm] = useState({
    product_name: "",
    target_qty: "",
    factory_id: "",
    created_by: "",
  });

  const[users,setuser]=useState([])

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(()=>{
  
    const fetch_user=async()=>{
  console.log('hai is wokrin')
          try{
            const res= await api.get('/production/factory/user')
            
                setuser(res.data)
                console.log('hai',res.data)
            
        }
        catch(err){
            console.error(err)
        }
        
    }
    fetch_user()
  },[])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/production/factory/product_create", {
        ...form,
        target_qty: Number(form.target_qty) || 0,
        factory_id: Number(form.factory_id),
        created_by: Number(form.created_by),
      });

      setMessage("✅ Product created successfully");

      setForm({
        product_name: "",
        target_qty: "",
        factory_id: "",
        created_by: "",
      });

    } catch (err) {
      setMessage(err.response?.data?.detail || "❌ Error creating product");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Create Production
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="product_name"
            placeholder="Product Name"
            value={form.product_name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="number"
            name="target_qty"
            placeholder="Target Quantity"
            value={form.target_qty}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="number"
            name="factory_id"
            placeholder="Factory ID"
            value={form.factory_id}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <select
  name="created_by"
  value={form.created_by}
  onChange={handleChange}
  className="w-full p-3 border rounded-lg"
  required
>
  <option value="">Select User</option>

  {users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))}
</select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>

        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {message}
          </p>
        )}

      </div>
    </div>
  );
};

export default CreateProduct;