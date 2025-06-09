import { useState } from "react";

export default function AddUserModal({ isOpen, onClose, onAddUser }) {
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!emailInput.trim()) {
      setError("Please enter name or email");
      return;
    }
    setError("");
    onAddUser(emailInput.trim());
    setEmailInput("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Add members to the project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Name or emails *
          </label>
          <input
            type="text"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setError("");
            }}
            className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
              error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="e.g., Maria, maria@company.com"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
          This site is protected by reCAPTCHA and the Google{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="underline">
            Terms of Service
          </a>{" "}
          apply.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
