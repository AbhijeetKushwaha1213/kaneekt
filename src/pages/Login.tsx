
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../auth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(email, password);
      if (result.userExists) {
        navigate("/profile");
      } else {
        setError("User does not exist. Create an account?");
      }
    } catch (err: any) {
      setError("Invalid login credentials. Create an account?");
      console.error("Login error:", err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && (
        <div>
          <p>{error}</p>
          <button onClick={() => navigate("/signup")}>Create an Account</button>
        </div>
      )}
    </div>
  );
};

export default Login;
