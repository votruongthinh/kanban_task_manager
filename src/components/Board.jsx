import { useState, useRef, useEffect, useMemo } from "react";
import {
  DndContext,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
  pointerWithin,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import Column from "./Column";
import Task from "./Task";
import DeleteColumnModal from "./DeleteColumnModal";
import AddUserModal from "./AddUserModal";
import DeleteUserModal from "./DeleteUserModal";

export default function Board({
  columns,
  tasks,
  moveTask,
  openTaskModal,
  setEditingTask,
  addColumn,
  updateColumn,
  currentBoard,
  onDeleteTask,
  deleteColumn,
  updateTask,
  onEditTask,
  onOpenSubtaskModal,
  users,
  addUserToBoard,
  removeUserFromBoard,
  getUserTaskCount,
  onViewTeam,
}) {
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleteColumnModalOpen, setIsDeleteColumnModalOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const formRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  );

  const customCollisionDetection = (args) => {
    const { active, droppableContainers, collisionRect } = args;

    const activeColumn = columns.find((col) => col.id === active.id);

    if (activeColumn) {
      const pointerCollisions = pointerWithin(args);

      if (pointerCollisions.length > 0) {
        const columnIds = columns.map((col) => col.id);
        const columnCollisions = pointerCollisions.filter((collision) =>
          columnIds.includes(collision.id)
        );

        if (columnCollisions.length > 0) {
          return [columnCollisions[0]];
        }
      }

      return closestCorners(args);
    }

    return rectIntersection(args);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    const column = columns.find((col) => col.id === active.id);

    if (task) {
      setActiveTask(task);
      setActiveColumn(null);
    } else if (column) {
      setActiveColumn(column);
      setActiveTask(null);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || !active) {
      setActiveTask(null);
      setActiveColumn(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id.toString();

    const activeColumnData = columns.find((col) => col.id === activeId);
    if (activeColumnData) {
      const overColumnData = columns.find((col) => col.id === overId);
      if (overColumnData && activeId !== overId) {
        const oldIndex = columns.findIndex((col) => col.id === activeId);
        const newIndex = columns.findIndex((col) => col.id === overId);
        const newColumns = arrayMove(columns, oldIndex, newIndex);
        updateColumn(newColumns.map((col, idx) => ({ ...col, position: idx })));
      }
      setActiveColumn(null);
      return;
    }

    const activeTaskData = tasks.find((t) => t.id === activeId);
    if (!activeTaskData) {
      setActiveTask(null);
      setActiveColumn(null);
      return;
    }

    let newStatus = activeTaskData.status;
    let newPosition = 0;
    let isCompleted = activeTaskData.completed;

    if (overId.includes("-droppable")) {
      newStatus = overId.replace("-droppable", "");
      const destinationTasks = tasks.filter(
        (t) => t.status === newStatus && t.boardId === currentBoard
      );
      newPosition = destinationTasks.length;
      isCompleted =
        columns.find((col) => col.id === newStatus)?.isDone || false;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
        const destinationTasks = tasks.filter(
          (t) => t.status === newStatus && t.boardId === currentBoard
        );
        const overIndex = destinationTasks.findIndex((t) => t.id === overId);
        newPosition = overIndex >= 0 ? overIndex : destinationTasks.length;
        isCompleted =
          columns.find((col) => col.id === newStatus)?.isDone || false;
        if (activeTaskData.status === newStatus) {
          const oldIndex = tasks.findIndex((t) => t.id === activeId);
          const newIndex = tasks.findIndex((t) => t.id === overId);
          if (oldIndex !== -1 && newIndex !== -1) {
            const movedTasks = arrayMove(tasks, oldIndex, newIndex).map(
              (task, idx) => ({
                ...task,
                position: idx,
                completed:
                  columns.find((col) => col.id === newStatus)?.isDone ||
                  task.completed,
              })
            );
            moveTask(movedTasks, currentBoard);
            setActiveTask(null);
            return;
          }
        }
      }
    }

    const updatedTasks = tasks.map((t) =>
      t.id === activeId
        ? {
            ...t,
            status: newStatus,
            position: newPosition,
            completed: isCompleted,
          }
        : t
    );
    moveTask(updatedTasks, currentBoard);
    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    setActiveColumn(null);
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) {
      setErrorMessage("Tên cột không được để trống");
      return;
    }

    try {
      addColumn({
        id: `col-${Date.now()}`,
        name: newColumnName.trim(),
        isDone: false,
      });
      setNewColumnName("");
      setIsAddingColumn(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteColumn = (column) => {
    if (columns.length <= 1) return;
    setColumnToDelete(column);
    setIsDeleteColumnModalOpen(true);
  };

  const handleConfirmDeleteUser = () => {
    if (userToDelete) {
      removeUserFromBoard(userToDelete.email);
      setIsDeleteUserModalOpen(false);
      setUserToDelete(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isAddingColumn &&
        formRef.current &&
        !formRef.current.contains(event.target)
      ) {
        setIsAddingColumn(false);
        setNewColumnName("");
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
  }, [isAddingColumn, isMenuOpen]);

  const columnItems = useMemo(() => columns.map((col) => col.id), [columns]);
  const renderColumns = useMemo(() => {
    return columns.map((column) => {
      const columnTasks = tasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      return (
        <Column
          key={column.id}
          column={column}
          tasks={columnTasks}
          openTaskModal={openTaskModal}
          setEditingTask={setEditingTask}
          updateColumn={updateColumn}
          columns={columns}
          isOverlay={false}
          onDeleteTask={onDeleteTask}
          onDeleteColumn={handleDeleteColumn}
          updateTask={updateTask}
          onEditTask={onEditTask}
          onOpenSubtaskModal={onOpenSubtaskModal}
        />
      );
    });
  }, [
    columns,
    tasks,
    openTaskModal,
    setEditingTask,
    updateColumn,
    onDeleteTask,
    updateTask,
    onEditTask,
    onOpenSubtaskModal,
  ]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col relative">
        <SortableContext
          items={columnItems}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex space-x-4 overflow-x-auto board-container">
            {renderColumns}
            <div className="w-64 flex-shrink-0">
              {isAddingColumn ? (
                <div
                  ref={formRef}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                >
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => {
                      setNewColumnName(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="Enter column name..."
                    className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    autoFocus
                    aria-label="Enter new column name"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={handleAddColumn}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                      aria-label="Xác nhận thêm cột"
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
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnName("");
                        setErrorMessage("");
                      }}
                      className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                      aria-label="Hủy thêm cột"
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
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label="Thêm cột mới"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </SortableContext>

        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full shadow-lg"
              aria-label="Teams menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute bottom-14 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 w-60"
              >
                <div className="flex justify-between items-center mb-2 border-b pb-2 dark:border-gray-700">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {users.length} Teams
                  </span>
                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onViewTeam();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  View Team Members
                </button>
              </div>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <Task
              task={activeTask}
              isOverlay
              onClick={() => {}}
              columnId={activeTask.status}
              onEdit={onEditTask}
              onDelete={() => {}}
              isDoneColumn={
                columns.find((col) => col.id === activeTask.status)?.isDone ||
                false
              }
            />
          ) : activeColumn ? (
            <Column
              column={activeColumn}
              tasks={tasks.filter((task) => task.status === activeColumn.id)}
              openTaskModal={openTaskModal}
              setEditingTask={setEditingTask}
              updateColumn={updateColumn}
              columns={columns}
              isOverlay
              onDeleteTask={onDeleteTask}
              onDeleteColumn={handleDeleteColumn}
              updateTask={updateTask}
              onEditTask={onEditTask}
              onOpenSubtaskModal={onOpenSubtaskModal}
            />
          ) : null}
        </DragOverlay>
        {isDeleteColumnModalOpen && (
          <DeleteColumnModal
            isOpen={isDeleteColumnModalOpen}
            onClose={() => {
              setIsDeleteColumnModalOpen(false);
              setColumnToDelete(null);
            }}
            onDelete={(columnToDelete, targetColumnId) => {
              if (deleteColumn(columnToDelete, targetColumnId)) {
                setIsDeleteColumnModalOpen(false);
                setColumnToDelete(null);
              }
            }}
            columnToDelete={columnToDelete}
            columns={columns}
            tasks={tasks}
            currentBoard={currentBoard}
          />
        )}
        {isAddUserModalOpen && (
          <AddUserModal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            onAddUser={addUserToBoard}
          />
        )}
        {isDeleteUserModalOpen && (
          <DeleteUserModal
            isOpen={isDeleteUserModalOpen}
            onClose={() => {
              setIsDeleteUserModalOpen(false);
              setUserToDelete(null);
            }}
            onDelete={handleConfirmDeleteUser}
            userEmail={userToDelete?.email || ""}
            taskCount={userToDelete?.taskCount || 0}
          />
        )}
      </div>
    </DndContext>
  );
}
//
