import React, { useState } from 'react';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';

const Auth: React.FC = () => {
  const [activeForm, setActiveForm] = useState<'login' | 'signup'>('login');

  return (
    <div className="drawer drawer-left">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
          <div className="hero min-h-screen bg-primary flex flex-col lg:flex-row items-center justify-center">
            <div className="hero-content text-center lg:text-left lg:w-1/2">
              <div className="max-w-md mx-auto">
                <h1 className="text-5xl font-bold">Welcome</h1>
                <p className="py-6">Please login or sign up to continue.</p>

                {/* Buttons to open the drawer */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="my-drawer" className="btn btn-secondary" onClick={() => setActiveForm('login')}>
                    Login
                  </label>
                  <label htmlFor="my-drawer" className="btn btn-secondary" onClick={() => setActiveForm('signup')}>
                    Sign Up
                  </label>
                </div>
              </div>
            </div>

            {/* Placeholder for future images */}
            <div className="lg:w-1/2 lg:flex lg:justify-center lg:items-center">
              <div className="mockup-window border bg-base-300">
                <div className="flex justify-center px-4 py-16 bg-base-200">
                  <p>Image Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Sidebar */}
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay bg-black opacity-50"></label> 
        <div className="flex items-center justify-center h-full bg-base-200">
          <ul className="menu p-4 w-full max-w-md">
            <div className="form-container transition-transform duration-700">
              {activeForm === 'login' ? <Login /> : <Signup />}
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Auth;