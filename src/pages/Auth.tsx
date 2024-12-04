import React, { useState } from 'react';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import MockupWindow from '../components/MockupWindow';

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
                <h1 className="text-5xl font-bold">Spotify</h1>
                <p className="py-6">Start listening today</p>

                {/* Buttons to open the drawer */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="my-drawer" className="btn btn-accent" onClick={() => setActiveForm('login')}>
                    Login
                  </label>
                  <label htmlFor="my-drawer" className="btn btn-secondary" onClick={() => setActiveForm('signup')}>
                    Sign Up
                  </label>
                </div>
              </div>
            </div>

           
            <div className="lg:w-1/2 w-full px-10">
              <MockupWindow />
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Sidebar */}
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label> 
        <div className="flex items-center justify-center h-full bg-base-200">
          <div className="p-4 w-full max-w-md">
            {/* Tabs */}
            <div className="tabs tabs-boxed flex mb-6">
              <a 
                className={`tab flex-1 ${activeForm === 'login' ? 'tab-active' : ''}`}
                onClick={() => setActiveForm('login')}
              >
                Login
              </a>
              <a 
                className={`tab flex-1 ${activeForm === 'signup' ? 'tab-active' : ''}`}
                onClick={() => setActiveForm('signup')}
              >
                Sign Up
              </a>
            </div>

            {/* Forms */}
            <div className="form-container">
              {activeForm === 'login' ? <Login /> : <Signup />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;