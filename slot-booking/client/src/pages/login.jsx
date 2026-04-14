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
    const res = await api.get("/auth/google");
    window.location.href = res.data.url;
  }

  return (
    <div className="p-10">
      <h2>Login</h2>

      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password:e.target.value})}/>

      <button onClick={login}>Login</button>

      <button onClick={loginWithGoogle}>
        Login with Google
      </button>
    </div>
  );
}