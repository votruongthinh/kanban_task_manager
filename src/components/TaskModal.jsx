import { useState, useEffect } from "react";

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  editingTask,
  columns,
  defaultStatus,
  tasks,
  currentBoard,
}) {
  const [task, setTask] = useState({
    id: "",
    title: "",
    description: "",
    status: defaultStatus || columns[0]?.id || "",
    subtasks: [],
    priority: "Medium",
    assignedUsers: [],
    deadline: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isPriorityDropdownOpen &&
        !event.target.closest(".priority-dropdown")
      ) {
        setIsPriorityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPriorityDropdownOpen]);

  useEffect(() => {
    if (editingTask) {
      setTask(editingTask);
    } else {
      setTask({
        id: `task-${Date.now()}`,
        title: "",
        description: "",
        status: defaultStatus || columns[0]?.id || "",
        subtasks: [],
        priority: "Medium",
        assignedUsers: [],
        deadline: null,
      });
    }
  }, [editingTask, isOpen, columns, defaultStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
    if (name === "title") setErrorMessage("");
  };

  const addSubtask = () => {
    setTask((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: `sub-${Date.now()}`, title: "", completed: false },
      ],
    }));
  };

  const updateSubtask = (index, field, value) => {
    const newSubtasks = [...task.subtasks];
    newSubtasks[index][field] = value;
    setTask((prev) => ({ ...prev, subtasks: newSubtasks }));
  };

  const removeSubtask = (index) => {
    const newSubtasks = [...task.subtasks];
    newSubtasks.splice(index, 1);
    setTask((prev) => ({ ...prev, subtasks: newSubtasks }));
  };

  const toggleUserAssignment = (email) => {
    setTask((prev) => {
      if (prev.assignedUsers.includes(email)) {
        return {
          ...prev,
          assignedUsers: prev.assignedUsers.filter((u) => u !== email),
        };
      } else {
        return { ...prev, assignedUsers: [...prev.assignedUsers, email] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (columns.length === 0) {
      setErrorMessage("Please create at least one column before adding tasks.");
      return;
    }

    if (!task.title.trim()) {
      setErrorMessage("Title cannot be blank");
      return;
    }

    const isDuplicateTitle = tasks.some(
      (t) =>
        t.boardId === currentBoard &&
        t.title.toLowerCase() === task.title.trim().toLowerCase() &&
        t.id !== (editingTask?.id || "")
    );
    if (isDuplicateTitle) {
      setErrorMessage("Task title already exists");
      return;
    }

    // Validate deadline (cannot be in the past)
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      if (deadlineDate < today) {
        setErrorMessage("The completion time cannot be a date in the past.");
        return;
      }
    }

    onSave(task);
    onClose();
  };

  // Priority options with Vietnamese labels
  const priorityOptions = [
    { value: "Highest", label: "Highest" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
    { value: "Lowest", label: "Lowest" },
  ];

  const getPriorityLabel = (value) => {
    const option = priorityOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };
  const PriorityIcon = ({ priority, className = "" }) => {
    const iconProps = {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: className,
    };

    switch (priority) {
      case "Highest":
        return (
          <svg {...iconProps} className={`text-red-600 ${className}`}>
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        );
      case "High":
        return (
          <svg {...iconProps} className={`text-red-500 ${className}`}>
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
          </svg>
        );
      case "Medium":
        return (
          <svg {...iconProps} className={`text-orange-500 ${className}`}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <path d="M9 9h6v6H9z" />
          </svg>
        );
      case "Low":
        return (
          <svg {...iconProps} className={`text-blue-500 ${className}`}>
            <path d="M12 5v14" />
            <path d="M19 12l-7 7-7-7" />
          </svg>
        );
      case "Lowest":
        return (
          <svg {...iconProps} className={`text-green-500 ${className}`}>
            <path d="M17 7L7 17" />
            <path d="M17 17H7V7" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps} className={`text-gray-400 ${className}`}>
            <circle cx="12" cy="12" r="1" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {editingTask ? "Edit Task" : "Add new task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {columns.length === 0 ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">
              Please create at least one column before adding tasks.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-4">
              {/* Left Column */}
              <div className="col-span-2">
                <div className="mb-3">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={task.title}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                    Describe
                  </label>
                  <textarea
                    name="description"
                    value={task.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    rows="2"
                  />
                </div>

                {/* Tab navigation for Subtasks/Users */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    className={`py-2 px-4 text-sm font-medium ${
                      activeTab === "details"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    SubTasks
                  </button>
                </div>

                {/* Subtasks Tab */}
                {activeTab === "details" && (
                  <div className="mt-3 mb-3">
                    <div className="max-h-24 overflow-y-auto mb-2">
                      {task.subtasks.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center py-2">
                          Click "Add Sub-Task" to create a sub-quest
                        </div>
                      ) : (
                        task.subtasks.map((subtask, index) => (
                          <div
                            key={subtask.id}
                            className="flex mb-2 items-center relative"
                          >
                            <input
                              type="text"
                              value={subtask.title}
                              onChange={(e) =>
                                updateSubtask(index, "title", e.target.value)
                              }
                              className="flex-grow p-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                              placeholder="Tiêu đề nhiệm vụ con"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeSubtask(index)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              aria-label="Remove subtask"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={addSubtask}
                      className="mt-1 w-full p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 font-medium text-sm"
                    >
                      + Add Sub Task
                    </button>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                  <div className="mt-3 mb-3">
                    <div className="max-h-24 overflow-y-auto grid grid-cols-2 gap-2">
                      {users.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400 text-sm col-span-2 text-center py-4">
                          There are no members in the table yet. Please add
                          members first.
                        </div>
                      ) : (
                        users.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => toggleUserAssignment(user.email)}
                            className={`p-2 rounded-md border text-sm cursor-pointer transition-colors flex items-center justify-between
                              ${
                                task.assignedUsers.includes(user.email)
                                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              }`}
                          >
                            <span className="truncate">{user.email}</span>
                            {task.assignedUsers.includes(user.email) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-purple-500"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="col-span-1 space-y-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                    Completion time
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={task.deadline || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                    min={new Date().toISOString().split("T")[0]} // Prevent past dates
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                    Priority Level
                  </label>
                  <div className="relative priority-dropdown">
                    <div
                      onClick={() =>
                        setIsPriorityDropdownOpen(!isPriorityDropdownOpen)
                      }
                      className="w-full p-2 pl-8 pr-8 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm cursor-pointer flex items-center justify-between"
                    >
                      <span>{getPriorityLabel(task.priority)}</span>
                    </div>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <PriorityIcon priority={task.priority} />
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isPriorityDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>

                    {isPriorityDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                        {priorityOptions.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              setTask((prev) => ({
                                ...prev,
                                priority: option.value,
                              }));
                              setIsPriorityDropdownOpen(false);
                            }}
                            className={`p-2 pl-8 pr-4 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center text-sm relative
                              ${
                                task.priority === option.value
                                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                  : "text-gray-800 dark:text-white"
                              }`}
                          >
                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                              <PriorityIcon priority={option.value} />
                            </div>
                            <span>{option.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={task.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                  >
                    {columns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
              >
                {editingTask ? "Save changes" : "Create Task"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
