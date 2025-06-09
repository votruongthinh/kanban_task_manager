import { useState } from "react";

export default function DeleteBoardModal({
  isOpen,
  onClose,
  onDelete,
  boardName,
}) {
  const [confirmationText, setConfirmationText] = useState("");

  const handleDelete = () => {
    if (confirmationText.toLowerCase() === "delete") {
      onDelete();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
              />
            </svg>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Delete or archive {boardName}?
            </h2>
          </div>
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
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You can choose to delete or archive this work item. Deleting is
          irreversible. It permanently removes the work item, comments and
          attachments.
        </p>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Type <span className="font-bold">delete</span> to continue
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 ${
              confirmationText.toLowerCase() === "delete"
                ? "text-red-500 dark:text-red-500"
                : "text-gray-800 dark:text-white"
            }`}
            placeholder="delete"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            Archive
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmationText.toLowerCase() !== "delete"}
            className={`px-4 py-2 rounded text-white ${
              confirmationText.toLowerCase() === "delete"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
