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
  // State
  const [task, setTask] = useState({
    id: "",
    title: "",
    description: "",
    status: defaultStatus || columns[0]?.id || "",
    subtasks: [],
    priority: "Trung bình",
    assignedUsers: [],
    deadline: null,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

  // Effects
  useEffect(() => {
    if (editingTask) {
      setTask({
        ...editingTask,
        priority: ["Cao", "Trung bình", "Thấp"].includes(editingTask.priority)
          ? editingTask.priority
          : "Trung bình",
      });
    } else {
      setTask({
        id: `task-${Date.now()}`,
        title: "",
        description: "",
        status: defaultStatus || columns[0]?.id || "",
        subtasks: [],
        priority: "Trung bình",
        assignedUsers: [],
        deadline: null,
      });
    }
  }, [editingTask, isOpen, columns, defaultStatus]);

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

  // Handlers
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
    const newSubtasks = task.subtasks.filter((_, i) => i !== index);
    setTask((prev) => ({ ...prev, subtasks: newSubtasks }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (columns.length === 0) {
      setErrorMessage("Vui lòng tạo ít nhất một cột trước khi thêm công việc.");
      return;
    }
    if (!task.title.trim()) {
      setErrorMessage("Tiêu đề không được để trống");
      return;
    }
    const isDuplicateTitle = tasks.some(
      (t) =>
        t.boardId === currentBoard &&
        t.title.toLowerCase() === task.title.trim().toLowerCase() &&
        t.id !== (editingTask?.id || "")
    );
    if (isDuplicateTitle) {
      setErrorMessage("Tiêu đề công việc đã tồn tại");
      return;
    }
    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        setErrorMessage("Thời hạn không được là ngày trong quá khứ.");
        return;
      }
    }
    onSave(task);
    onClose();
  };

  // UI Constants
  const priorityOptions = [
    { value: "Cao", label: "Cao", color: "text-red-500" },
    { value: "Trung bình", label: "Trung bình", color: "text-orange-500" },
    { value: "Thấp", label: "Thấp", color: "text-blue-500" },
  ];

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
      className,
    };
    const option = priorityOptions.find((opt) => opt.value === priority);
    const colorClass = option?.color || "text-gray-400";

    switch (priority) {
      case "Cao":
        return (
          <svg {...iconProps} className={`${colorClass} ${className}`}>
            <path d="M12 19V5" />
            <path d="M5 12l7-7 7 7" />
            <path d="M12 5l3-3 3 3" />
          </svg>
        );
      case "Trung bình":
        return (
          <svg {...iconProps} className={`${colorClass} ${className}`}>
            <path d="M4 8h16" />
            <path d="M4 12h16" />
            <path d="M4 16h16" />
          </svg>
        );
      case "Thấp":
        return (
          <svg {...iconProps} className={`${colorClass} ${className}`}>
            <path d="M12 5v14" />
            <path d="M19 12l-7 7-7-7" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps} className={`${colorClass} ${className}`}>
            <circle cx="12" cy="12" r="1" />
          </svg>
        );
    }
  };

  // Render
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {editingTask ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {columns.length === 0 ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">
              Vui lòng tạo ít nhất một cột trước khi thêm công việc.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                name="title"
                value={task.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Nhập tiêu đề công việc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                value={task.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Nhập mô tả công việc"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thời hạn
              </label>
              <input
                type="date"
                name="deadline"
                value={task.deadline || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mức độ ưu tiên
              </label>
              <div className="relative priority-dropdown">
                <div
                  onClick={() =>
                    setIsPriorityDropdownOpen(!isPriorityDropdownOpen)
                  }
                  className="w-full p-2 pl-8 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm cursor-pointer flex items-center"
                >
                  <span>
                    {priorityOptions.find((opt) => opt.value === task.priority)
                      ?.label || task.priority}
                  </span>
                </div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <PriorityIcon priority={task.priority} />
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
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
                        className={`p-2 pl-8 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center text-sm ${
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <select
                name="status"
                value={task.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nhiệm vụ con
              </label>
              <div className="max-h-32 overflow-y-auto space-y-2 mb-2">
                {task.subtasks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">
                    Nhấn "Thêm nhiệm vụ con" để tạo
                  </p>
                ) : (
                  task.subtasks.map((subtask, index) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={subtask.title}
                        onChange={(e) =>
                          updateSubtask(index, "title", e.target.value)
                        }
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Tiêu đề nhiệm vụ con"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeSubtask(index)}
                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="Xóa nhiệm vụ con"
                      >
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
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                onClick={addSubtask}
                className="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                + Thêm nhiệm vụ con
              </button>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                {editingTask ? "Lưu thay đổi" : "Tạo công việc"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
