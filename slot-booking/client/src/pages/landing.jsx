import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Meetify</h1>
      <p className="mb-6">Book meetings instantly 🚀</p>

      <div className="space-x-4">
        <button onClick={() => nav("/login")} className="bg-blue-500 text-white px-4 py-2 rounded">
          Login
        </button>
        <button onClick={() => nav("/signup")} className="bg-green-500 text-white px-4 py-2 rounded">
          Signup
        </button>
      </div>
    </div>
  );
}