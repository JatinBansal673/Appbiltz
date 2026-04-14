import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-4">Meetify</h1>
      <p className="mb-6">Schedule meetings effortlessly</p>

      <div className="flex gap-4">
        <button onClick={() => nav("/login")} className="bg-blue-500 px-6 py-2 rounded">
          Login
        </button>
        <button onClick={() => nav("/signup")} className="bg-green-500 px-6 py-2 rounded">
          Signup
        </button>
      </div>
    </div>
  );
}