import React from "react";
import "../Auth/SignUpForm.jsx";
import { Link } from "react-router-dom";
function SignupForm() {
  const validateEmail = (e) => {
    const input = e.target;
    input.setCustomValidity("");

    if (!input.validity.valid) {
      return;
    }

    // Add custom domain constraint
    if (!input.value.endsWith("@example.com")) {
      input.setCustomValidity(
        "Please enter an email address ending with @example.com"
      );
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
        <form>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              onChange={validateEmail}
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
              placeholder="Enter your email"
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Join for free
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
