import { useState } from "react";
import api from "../api/api";

export default function Signup() {
  const [form, setForm] = useState({ name:"", email:"", password:"" });

  const signup = async () => {
    await api.post("/auth/signup", form);
    alert("Check email to verify");
  };

  return (
    <div className="p-10">
      <h2>Signup</h2>

      <input placeholder="Name" onChange={e => setForm({...form, name:e.target.value})}/>
      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password:e.target.value})}/>

      <button onClick={signup}>Signup</button>
    </div>
  );
}