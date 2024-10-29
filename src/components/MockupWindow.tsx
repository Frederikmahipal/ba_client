import React from 'react';

const MockupWindow: React.FC = () => {
  return (
    <div className="mockup-window border bg-base-300 w-full max-w-3xl shadow-xl">
      <div className="flex flex-col gap-2 p-4 bg-base-200">
        {/* Header Mock */}
        <div className="w-full bg-secondary/20 rounded-lg p-4 flex items-center justify-between">
          <div className="w-20 h-8 bg-secondary/30 rounded"></div>
          <div className="w-48 h-8 bg-secondary/30 rounded"></div>
          <div className="w-10 h-10 bg-secondary/30 rounded-full"></div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Left Box */}
          <div className="w-full lg:w-1/4">
            <div className="bg-primary/20 rounded-lg p-4 h-[500px] flex items-center justify-center">
            </div>
          </div>

          {/* Middle Box */}
          <div className="w-full lg:w-2/4">
            <div className="bg-secondary/20 rounded-lg p-4 h-[500px] flex items-center justify-center">
            </div>
          </div>

          {/* Right Box */}
          <div className="w-full lg:w-1/4">
            <div className="bg-accent/20 rounded-lg p-4 h-[500px] flex items-center justify-center">
              
            </div>
          </div>
        </div>

        {/* Footer Mock */}
        <div className="w-full bg-neutral/20 rounded-lg p-2 flex items-center justify-center">
          <span className="text-neutral-content/50">Footer</span>
        </div>
      </div>
    </div>
  );
};

export default MockupWindow;