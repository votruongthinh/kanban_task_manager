import React from "react";

export default function SubtaskCompletionModal({
  isOpen,
  onClose,
  task,
  onUpdate,
  columns,
}) {
  if (!isOpen || !task) return null;

  const handleToggleSubtask = (index) => {
    const newSubtasks = [...task.subtasks];
    newSubtasks[index].completed = !newSubtasks[index].completed;
    onUpdate(task.id, { ...task, subtasks: newSubtasks });
  };

  const currentColumn = columns?.find((col) => col.id === task.status);
  const statusText = currentColumn ? currentColumn.name : "Unknown";

  // Generate avatar color and initial based on email
  const getAvatarInitial = (email) =>
    email ? email.charAt(0).toUpperCase() : "?";
  const getAvatarColor = (email) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#F28C82",
      "#FBBC04",
      "#34A853",
      "#4285F4",
      "#AB47BC",
      "#7CB342",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  // Format deadline for display
  const formatDeadline = (deadline) => {
    if (!deadline) return "No deadline yet";
    const date = new Date(deadline);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Priority icon component
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

  // Get priority label in Vietnamese
  const getPriorityLabel = (priority) => {
    const priorityMap = {
      Highest: "Highest",
      High: "High",
      Medium: "Medium",
      Low: "Low",
      Lowest: "Lowest",
    };
    return priorityMap[priority] || priority || "Chưa đặt";
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate pr-4">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition-all"
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

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Task Info */}
            <div className="col-span-5 space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Describe
                </h3>
                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  {task.description || "Chưa có mô tả."}
                </p>
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {statusText}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Priority Level
                  </div>
                  <div className="flex items-center space-x-2">
                    <PriorityIcon priority={task.priority} />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadline and Members */}
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Completion Time
                  </div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {formatDeadline(task.deadline)}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Members
                  </div>
                  <div className="flex items-center">
                    {task.assignedUsers?.length > 0 ? (
                      <div className="flex -space-x-2">
                        {task.assignedUsers.slice(0, 4).map((email, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800 shadow-sm"
                            style={{
                              backgroundColor: getAvatarColor(email),
                              zIndex: task.assignedUsers.length - idx,
                            }}
                            title={email}
                          >
                            {getAvatarInitial(email)}
                          </div>
                        ))}
                        {task.assignedUsers.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800">
                            +{task.assignedUsers.length - 4}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        No members yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Subtasks */}
            <div className="col-span-7">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Sub Tasks
                  </h3>
                  {task.subtasks?.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {task.subtasks.filter((st) => st.completed).length}/
                        {task.subtasks.length}
                      </span>
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full h-2 transition-all duration-300"
                          style={{
                            width: `${
                              (task.subtasks.filter((st) => st.completed)
                                .length /
                                task.subtasks.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2">
                  {task.subtasks?.length > 0 ? (
                    <div className="space-y-2">
                      {task.subtasks.map((subtask, index) => (
                        <div
                          key={subtask.id}
                          className={`group flex items-center p-3 rounded-lg border transition-all hover:shadow-sm ${
                            subtask.completed
                              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
                          }`}
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => handleToggleSubtask(index)}
                              className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full 
    checked:border-green-500 checked:bg-green-500 
    transition-all duration-200 cursor-pointer
    hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                            />
                            <svg
                              className="absolute w-3 h-3 left-1 top-1 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span
                            className={`ml-3 flex-grow text-sm transition-all ${
                              subtask.completed
                                ? "line-through text-gray-500 dark:text-gray-400"
                                : "text-gray-800 dark:text-gray-200"
                            }`}
                          >
                            {subtask.title}
                          </span>
                          {subtask.completed && (
                            <svg
                              className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                      <svg
                        className="w-12 h-12 mb-2 opacity-50"
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
                      <p className="text-sm">No sub tasks yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
