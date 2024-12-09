import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg p-6 overflow-scroll bg-white rounded-lg h-3/4">
        <button
          className="absolute font-bold text-gray-600 top-2 right-3 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
