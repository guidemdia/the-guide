import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === "theguide" && password === "723723") {
      localStorage.setItem("loggedIn", "true");
      navigate("/dashboard");
    } else {
      alert("Incorrect username or password!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-900 p-6">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full max-w-sm shadow-xl">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Welcome to the website
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="User Name"
            className="w-full px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/20 placeholder-white text-white focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-white text-purple-700 py-3 rounded-xl font-semibold hover:bg-purple-100 transition"
          >
            Login
          </button>
        </form>

   
      </div>
    </div>
  );
}
