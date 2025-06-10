import { useState } from "react";

export default function SubtaskCompletionModal({
  isOpen,
  onClose,
  task,
  onUpdate,
  columns,
}) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen || !task) return null;

  const handleToggleSubtask = (index) => {
    const newSubtasks = [...task.subtasks];
    newSubtasks[index].completed = !newSubtasks[index].completed;
    onUpdate(task.id, { ...task, subtasks: newSubtasks });
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
      className,
    };
    const priorityMap = {
      Cao: {
        color: "text-red-500",
        paths: [
          <path key="1" d="M12 19V5" />,
          <path key="2" d="M5 12l7-7 7 7" />,
          <path key="3" d="M12 5l3-3 3 3" />,
        ],
      },
      "Trung bình": {
        color: "text-orange-500",
        paths: [
          <path key="1" d="M4 8h16" />,
          <path key="2" d="M4 12h16" />,
          <path key="3" d="M4 16h16" />,
        ],
      },
      Thấp: {
        color: "text-blue-500",
        paths: [
          <path key="1" d="M12 5v14" />,
          <path key="2" d="M19 12l-7 7-7-7" />,
        ],
      },
    };
    const { color, paths } = priorityMap[priority] || {
      color: "text-gray-400",
      paths: [<circle key="1" cx="12" cy="12" r="1" />],
    };
    return (
      <svg {...iconProps} className={`${color} ${className}`}>
        {paths}
      </svg>
    );
  };

  const statusText =
    columns?.find((col) => col.id === task.status)?.name || "Không xác định";
  const completedCount = task.subtasks.filter((st) => st.completed).length;
  const progress = task.subtasks.length
    ? (completedCount / task.subtasks.length) * 100
    : 0;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 ${
        isClosing ? "animate-fade-out" : "animate-slide-in"
      }`}
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {task.title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-full p-1 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Mô tả
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                {task.description || "Chưa có mô tả."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Trạng thái
                </span>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {statusText}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Ưu tiên
                </span>
                <div className="flex items-center gap-2">
                  <PriorityIcon priority={task.priority} />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {task.priority || "Chưa đặt"}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Thời hạn
                </span>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Chưa đặt"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nhiệm vụ con
              </h3>
              {task.subtasks.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {completedCount}/{task.subtasks.length}
                  </span>
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {task.subtasks.length ? (
                task.subtasks.map((subtask, index) => (
                  <div
                    key={subtask.id}
                    className={`flex items-center p-2 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      subtask.completed
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => handleToggleSubtask(index)}
                      className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded checked:bg-green-500 checked:border-green-500 focus:ring-2 focus:ring-green-500/50 cursor-pointer"
                    />
                    <span
                      className={`ml-2 flex-grow text-sm ${
                        subtask.completed
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-24 text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-8 h-8 mb-1 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-sm">Chưa có nhiệm vụ con</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
