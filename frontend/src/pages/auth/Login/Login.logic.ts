import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const useLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/login", { email, password });
      
      if (response.data.status === "success") {
        // Save token and user info
        localStorage.setItem("token", "mock-jwt-token-123"); 
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin,
  };
};
