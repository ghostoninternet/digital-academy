import React, { useState } from "react";
import "../Auth/SignUpForm.jsx";
import { Link, useNavigate } from "react-router-dom";
function SignupForm() {
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [message, setMessage] = useState();
  const navigate = useNavigate();

  const validateEmail = (e) => {
    const input = e.target;
    input.setCustomValidity("");
    setEmail(input.value);

    if (!input.validity.valid) {
      return;
    }

    // Add custom domain constraint
    if (!input.value.endsWith("@gmail.com")) {
      input.setCustomValidity(
        "Please enter an email address ending with @gmail.com"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = "http://localhost:8000/api/auth/register";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const json = await response.json();
      console.log(json);

      if (json.statusCode === "400") {
        setMessage(json.message);
      } else {
        navigate("/signin");
      }
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-3">Sign up</h2>
        <p className="mb-8 text-center">
          Have an account?{" "}
          <Link to={"/signin"} className="hover:text-blue-400 hover:underline">
            Sign in here!
          </Link>
        </p>
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Enter your full name"
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              onChange={validateEmail}
              value={email}
              placeholder="Enter your email"
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Enter your password"
              className="w-full border rounded-md p-2"
            />
            <small className="text-gray-500">Between 8-24 characters</small>
          </div>
          <div className="flex flex-col justify-between gap-x-3 mb-7">
            <p className="font-semibold">Role</p>
            <select className="p-2 border-2 border-gray-300 rounded-md w-full">
              <option>Instrutor</option>
              <option>Student</option>
            </select>
          </div>
          {/* Join Button */}
          <button className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Join for free
          </button>
          <div className="text-red-600 italic">{message}</div>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
