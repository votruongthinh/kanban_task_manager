import { useState } from "react";

export default function DeleteColumnModal({
  isOpen,
  onClose,
  onDelete,
  columnToDelete,
  columns,
  tasks,
  currentBoard,
}) {
  const [targetColumnId, setTargetColumnId] = useState(
    columns.find((col) => col.id !== columnToDelete.id)?.id || ""
  );

  const handleDelete = () => {
    if (columns.length > 1) {
      onDelete(columnToDelete, targetColumnId);
      onClose();
    }
  };

  if (!isOpen) return null;

  const tasksInDeletedColumn = tasks.filter(
    (task) => task.status === columnToDelete.id && task.boardId === currentBoard
  ).length;

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
              Move work from {columnToDelete.name} column?
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
        {columns.length > 1 ? (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Select a new home for any work with the {columnToDelete.name}{" "}
              status, including work in the backlog.
              {tasksInDeletedColumn > 0 &&
                ` (${tasksInDeletedColumn} task(s) will be moved.)`}
            </p>
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                This status will be deleted:
              </p>
              <p className="text-red-500 mb-2">{columnToDelete.name}</p>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Move existing work items to:
              </label>
              <select
                value={targetColumnId}
                onChange={(e) => setTargetColumnId(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              >
                {columns
                  .filter((col) => col.id !== columnToDelete.id)
                  .map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The last column can't be deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
