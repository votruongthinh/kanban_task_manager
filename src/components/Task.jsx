import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useRef } from "react";

export default function Task({
  task,
  onClick,
  columnId,
  isOverlay,
  index,
  totalTasks,
  onDelete,
  onEdit,
  isDoneColumn,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
      index,
      columnId,
    },
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isDoneEffect, setIsDoneEffect] = useState(false);

  // Check if task is overdue
  const isOverdue = task.deadline && new Date(task.deadline) < new Date();
  // Task is completed if in Done column, marked as completed, or overdue
  const isCompleted = isDoneColumn || task.completed || isOverdue;

  // Trigger done effect when moved to Done column
  useEffect(() => {
    if (isDoneColumn && !isOverlay && !isDragging) {
      setIsDoneEffect(true);
      const timer = setTimeout(() => setIsDoneEffect(false), 1000); // Effect lasts 1 second
      return () => clearTimeout(timer);
    }
  }, [isDoneColumn, isOverlay, isDragging]);

  const style = {
    transform: CSS.Transform.toString(
      isOverlay ? { ...transform, scaleX: 1.05, scaleY: 1.05 } : transform
    ),
    transition: transition || "transform 200ms ease, opacity 200ms ease",
    zIndex: isDragging || isOverlay ? 100 : 1,
    opacity: isDragging ? 0.6 : isOverdue ? 0.6 : 1,
  };

  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.completed)?.length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const isFirstTask = index === 0;
  const isLastTask = index === totalTasks - 1;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 5,
        left: rect.right - 96,
      });
    }
  }, [isMenuOpen]);

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

  const visibleAvatars = task.assignedUsers?.slice(0, 3) || [];
  const extraMembers = Math.max(0, (task.assignedUsers?.length || 0) - 3);

  // Format deadline for display
  const formatDeadline = (deadline) => {
    if (!deadline) return "";
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
      width: "14",
      height: "14",
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
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
    relative ${
      isDoneColumn
        ? "bg-green-100 dark:bg-green-900/20"
        : "bg-gray-100 dark:bg-gray-700"
    } p-3 rounded-md shadow-sm
    hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200
    ${isDragging ? "shadow-lg ring-2 ring-blue-500 ring-opacity-50" : ""}
    ${
      isOverlay
        ? "shadow-xl ring-2 ring-blue-500 cursor-grabbing"
        : "cursor-grab"
    }
    ${isDoneEffect ? "animate-pulse bg-green-100 dark:bg-green-900/30" : ""}
    active:cursor-grabbing
    touch-manipulation
    min-h-[80px] max-h-40 overflow-hidden
  `}
      data-column-id={columnId}
      role="button"
      aria-label={`Task ${
        task.title
      }, ${completedSubtasks} trên ${totalSubtasks} subtasks hoàn thành${
        task.deadline ? `, thời hạn ${formatDeadline(task.deadline)}` : ""
      }${isCompleted ? ", đã hoàn thành" : ""}${
        task.priority ? `, ưu tiên ${task.priority.toLowerCase()}` : ""
      }`}
    >
      {!isOverlay && !isDragging && (
        <>
          <div
            className={`absolute -top-3 left-0 right-0 h-4 bg-blue-500 rounded opacity-0 transition-opacity
              ${
                over && over.id !== task.id && isFirstTask ? "opacity-100" : ""
              }`}
          />
          <div
            className={`absolute -bottom-3 left-0 right-0 h-4 bg-blue-500 rounded opacity-0 transition-opacity
              ${
                over && over.id !== task.id && isLastTask ? "opacity-100" : ""
              }`}
          />
        </>
      )}
      <div
        className="task-content"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <div className="relative">
          <h3
            className={`text-sm font-medium text-gray-800 dark:text-white mb-2 pr-6 break-words line-clamp-3
              ${isCompleted ? "line-through" : ""}`}
            title={task.title}
          >
            {task.title}
          </h3>
          {task.deadline && (
            <p
              className={`text-xs ${
                isOverdue
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Hạn: {formatDeadline(task.deadline)}
            </p>
          )}
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{
                width: `${
                  totalSubtasks > 0
                    ? (completedSubtasks / totalSubtasks) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {completedSubtasks}/{totalSubtasks} subtasks
            </span>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {visibleAvatars.map((email, idx) => (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{
                      backgroundColor: getAvatarColor(email),
                      zIndex: visibleAvatars.length - idx,
                    }}
                  >
                    {getAvatarInitial(email)}
                  </div>
                ))}
                {extraMembers > 0 && (
                  <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                    +{extraMembers}
                  </div>
                )}
              </div>
              {task.priority && (
                <PriorityIcon
                  priority={task.priority}
                  className="flex-shrink-0"
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <div className="relative">
          <button
            ref={menuButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="w-5 h-5 flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-200"
          >
            <div className="w-3 h-0.5 bg-gray-500 mb-0.5"></div>
            <div className="w-3 h-0.5 bg-gray-500 mb-0.5"></div>
            <div className="w-3 h-0.5 bg-gray-500"></div>
          </button>
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="w-24 bg-gray-900 rounded shadow-lg z-50"
              style={{
                position: "fixed",
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onEdit(task);
                }}
                className="w-full text-left px-3 py-1 text-sm text-blue-400 hover:bg-gray-800 rounded"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onDelete(task);
                }}
                className="w-full text-left px-3 py-1 text-sm text-red-400 hover:bg-gray-800 rounded"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
