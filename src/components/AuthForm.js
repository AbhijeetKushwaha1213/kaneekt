import React, { useState } from "react";
import { login, createAccount } from "../auth";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isNewUser) {
        // Create a new account
        const profileData = { name, address };
        const result = await createAccount(email, password, profileData);
        if (result.userCreated) {
          console.log("Account created:", result.userData);
        }
      } else {
        // Login existing user
        const result = await login(email, password);
        if (result.userExists) {
          console.log("User logged in:", result.userData);
        } else {
          setIsNewUser(true);
        }
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      {isNewUser && (
        <>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </>
      )}
      <button type="submit">{isNewUser ? "Create Account" : "Login"}</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default AuthForm;