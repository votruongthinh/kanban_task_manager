import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useEffect, useRef, useMemo } from "react";
import Task from "./Task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Column({
  column,
  tasks,
  openTaskModal,
  setEditingTask,
  columns,
  isOverlay,
  onDeleteTask,
  updateTask,
  onEditTask,
  onOpenSubtaskModal,
}) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `${column.id}-droppable`,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newColumnName, setNewColumnName] = useState(column.name);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const formRef = useRef(null);
  const columnRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  useEffect(() => {
    const calculateMaxHeight = () => {
      const container = document.querySelector(".board-container");
      if (container) {
        const columnElements = container.querySelectorAll("[data-column-id]");
        if (columnElements.length > 0) {
          const heights = Array.from(columnElements).map(
            (col) => col.scrollHeight
          );
          const maxHeight = Math.max(...heights, 300);
          setContainerHeight(maxHeight);
        }
      }
    };

    calculateMaxHeight();
    window.addEventListener("resize", calculateMaxHeight);
    return () => window.removeEventListener("resize", calculateMaxHeight);
  }, [tasks.length]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.6 : 1,
    minHeight: isOverlay ? `${containerHeight}px` : "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  };

  const handleEditColumn = () => {
    setIsEditing(true);
    setNewColumnName(column.name);
    setErrorMessage("");
  };

  const handleSaveEditColumn = () => {
    if (!newColumnName.trim()) {
      setErrorMessage("Column name cannot be blank");
      return;
    }
    if (
      columns.some(
        (col) =>
          col.id !== column.id &&
          col.name.toLowerCase() === newColumnName.trim().toLowerCase()
      )
    ) {
      setErrorMessage("Column name already exists");
      return;
    }
    updateColumn(column.id, { name: newColumnName.trim() });
    setIsEditing(false);
  };

  const handleCancelEditColumn = () => {
    setIsEditing(false);
    setNewColumnName(column.name);
    setErrorMessage("");
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    openTaskModal(column.id);
  };

  const handleDeleteColumn = () => {
    if (columns.length <= 1) return;
    setIsMenuOpen(false);
    onDeleteColumn(column);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isEditing &&
        formRef.current &&
        !formRef.current.contains(event.target)
      ) {
        setIsEditing(false);
        setNewColumnName(column.name);
        setErrorMessage("");
      }
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, isMenuOpen, column.name]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [tasks]);

  const isLastColumn = columns.length <= 1;

  return (
    <div
      ref={isOverlay ? null : setSortableRef}
      style={style}
      {...(!isOverlay && !isDragging ? attributes : {})}
      {...(!isOverlay && !isDragging ? listeners : {})}
      className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm w-64 relative transition-colors duration-200 ${
        isOver
          ? "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20"
          : ""
      } ${isDragging ? "opacity-50" : ""}`}
      data-column-id={column.id}
      role="region"
      aria-label={`Column ${column.name}`}
    >
      {isEditing ? (
        <div ref={formRef} className="mb-4">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            autoFocus
            aria-label="edit column name"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={handleSaveEditColumn}
              className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              aria-label="Save column name"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              onClick={handleCancelEditColumn}
              className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              aria-label="Cancel editing column name"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
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
          {errorMessage && (
            <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <h2
              onClick={handleEditColumn}
              className="text-base font-medium text-gray-800 dark:text-white cursor-pointer"
              aria-label={`Edit column name ${column.name}`}
            >
              {column.name}{" "}
              {tasks.length > 0 && (
                <span className="text-gray-500 text-sm ml-1">
                  ({tasks.length})
                </span>
              )}
            </h2>
            {column.isDone && (
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label="Open column menu"
            ></button>
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-20 bg-white dark:bg-gray-800 rounded shadow-lg z-10"
              ></div>
            )}
          </div>
        </div>
      )}
      <div ref={setDroppableRef} className="space-y-3 min-h-[100px] flex-1">
        <SortableContext
          items={sortedTasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                onClick={() => onOpenSubtaskModal(task)}
                columnId={column.id}
                index={index}
                totalTasks={sortedTasks.length}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                isDoneColumn={column.isDone} // Pass isDone status to Task
              />
            ))
          ) : (
            <div className="h-20 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md">
              Drag card here
            </div>
          )}
        </SortableContext>
        <button
          onClick={handleCreateTask}
          className="w-full px-3 py-1 border border-gray-300 text-gray-600 text-num rounded hover:bg-gray-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-opacity duration-200"
          aria-label="Create new task"
        >
          + Create Task
        </button>
      </div>
    </div>
  );
}
//
