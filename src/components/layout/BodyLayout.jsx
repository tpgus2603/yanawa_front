// Layout.jsx
import React from "react";

const BodyLayout = ({ children }) => {
  return (
    <div className="w-full mt-3">
      <main className="px-4 py-6 mx-auto bg-white max-w-[768px] tablet:rounded-2xl">
        {children}
      </main>
    </div>
  );
};

export default BodyLayout;
