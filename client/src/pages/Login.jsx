import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import useAuthStore from "../store/useAuthStore";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isLogin ? "/users/login" : "/users/register";
      const { data } = await API.post(endpoint, formData);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-whatsapp-dark">
      <div className="bg-whatsapp-header p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            className="w-16 h-16 mb-4"
          />
          <h1 className="text-2xl font-bold text-white">WhatsApp Web Clone</h1>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-whatsapp-light mb-1">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                className="w-full bg-whatsapp-sidebar border-none text-white rounded p-3 focus:ring-2 focus:ring-whatsapp-green outline-none"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-whatsapp-light mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full bg-whatsapp-sidebar border-none text-white rounded p-3 focus:ring-2 focus:ring-whatsapp-green outline-none"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-whatsapp-light mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full bg-whatsapp-sidebar border-none text-white rounded p-3 focus:ring-2 focus:ring-whatsapp-green outline-none"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-whatsapp-green text-whatsapp-dark font-bold py-3 rounded hover:bg-opacity-90 transition duration-200"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-6 text-whatsapp-gray">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-whatsapp-green hover:underline"
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
