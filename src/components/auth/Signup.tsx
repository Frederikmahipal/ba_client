import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Signup: React.FC = () => {
  const { signup, signupError } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    signup({ name, email, password });
  };

  return (
    <div className="min-h-[450px]"> 
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col space-y-4 bg-base-100 p-6 rounded-lg"
      >
        {signupError && (
          <div className="alert alert-error">
            <div className="flex-1">
              <label>{signupError}</label>
            </div>
          </div>
        )}
        <div className="form-control">
          <label htmlFor="signup-name" className="label">
            <span className="label-text">Your Name:</span>
          </label>
          <input
            type="text"
            id="signup-name"
            name="name"
            placeholder="Your Name"
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="signup-email" className="label">
            <span className="label-text">Email:</span>
          </label>
          <input
            type="email"
            id="signup-email"
            name="email"
            placeholder="email@example.com"
            className="input input-bordered"
            required
          />
        </div>
        <div className="form-control">
          <label htmlFor="signup-password" className="label">
            <span className="label-text">Password:</span>
          </label>
          <input
            type="password"
            id="signup-password"
            name="password"
            placeholder="Password"
            className="input input-bordered"
            required
          />
        </div>
        <div className="mt-auto pt-4"> {/* Push button to bottom */}
          <button type="submit" className="btn btn-primary w-full">Sign Up</button>
        </div>
      </form>
    </div>
  );
};

export default Signup;