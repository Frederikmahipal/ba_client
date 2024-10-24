import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const { login, spotifyLogin, loginError } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    login({ email, password });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col space-y-4 bg-base-100 p-8 rounded-lg shadow-md"
    >
      {loginError && (
        <div className="alert alert-error">
          <div className="flex-1">
            <label>{loginError}</label>
          </div>
        </div>
      )}
      <div className="form-control">
        <label htmlFor="login-email" className="label">
          <span className="label-text">Email:</span>
        </label>
        <input
          type="email"
          id="login-email"
          name="email"
          placeholder="email@example.com"
          className="input input-bordered"
          required
        />
      </div>
      <div className="form-control">
        <label htmlFor="login-password" className="label">
          <span className="label-text">Password:</span>
        </label>
        <input
          type="password"
          id="login-password"
          name="password"
          placeholder="password"
          className="input input-bordered"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-full">Login</button>
      <button type="button" onClick={spotifyLogin} className="btn btn-secondary w-full">
        Login with Spotify
      </button>
    </form>
  );
};

export default Login;