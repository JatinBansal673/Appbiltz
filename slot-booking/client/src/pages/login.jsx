import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const login = async () => {
    const res = await api.post("/auth/login", form);
    // console.log(res)
    localStorage.setItem("token", res.data.token);
    nav("/dashboard");
  };

  const loginWithGoogle = async () => {
    const email = prompt("Enter your email (optional)");
    const res = await api.get(`/auth/google?email=${email || ""}`);
    window.location.href = res.data.url;
  }

  return (
    <div className="p-10">
      <h2 className="text-xl mb-4">Login</h2>

      <input
        className="border p-2 block mb-2"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        className="border p-2 block mb-2"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={login} className="bg-blue-500 text-white px-4 py-2 mr-2">
        Login
      </button>

      <button onClick={loginWithGoogle} className="bg-red-500 text-white px-4 py-2">
        Login with Google
      </button>
    </div>
  );
}