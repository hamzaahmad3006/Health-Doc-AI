import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      // Mock API call
      console.log("Logging in with:", { email, password });
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay

      // Navigate to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
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
