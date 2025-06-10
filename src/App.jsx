import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Board from "./components/Board";
import TaskModal from "./components/TaskModal";
import DeleteTaskModal from "./components/DeleteTaskModal";
import SubtaskCompletionModal from "./components/SubtaskModal";

import { useTheme } from "./hooks/useTheme";
import { useBoard } from "./hooks/useBoard";

export default function App() {
  const { darkMode, toggleDarkMode } = useTheme();
  const {
    boards: initialBoards,
    currentBoard,
    setCurrentBoard,
    addBoard,
    updateBoard,
    deleteBoard: deleteBoardFromHook,
    columns,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useBoard();

  const [boards, setBoards] = useState(initialBoards);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskColumnId, setNewTaskColumnId] = useState(null);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    setBoards(initialBoards);
  }, [initialBoards]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openTaskModal = (columnId = null) => {
    if (boards.length === 0) {
      alert("Vui lòng tạo một bảng trước khi thêm nhiệm vụ.");
      return;
    }
    if (columns.length === 0) {
      alert("Vui lòng tạo ít nhất một cột trước khi thêm nhiệm vụ.");
      return;
    }
    setNewTaskColumnId(columnId || columns[0].id);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setNewTaskColumnId(null);
  };

  const handleSaveTask = (task) => {
    if (columns.length === 0) {
      alert("Không thể lưu nhiệm vụ: Không có cột nào tồn tại.");
      return;
    }

    const status = task.status || newTaskColumnId || columns[0].id;

    if (!status) {
      alert("Không thể lưu nhiệm vụ: Không tìm thấy cột hợp lệ.");
      return;
    }

    if (editingTask) {
      updateTask(task.id, { ...task, status });
    } else {
      addTask({
        ...task,
        boardId: currentBoard,
        status,
        position: tasks.filter(
          (t) => t.status === status && t.boardId === currentBoard
        ).length,
        assignedUsers: task.assignedUsers || [],
        deadline: task.deadline || null,
      });
    }
    closeTaskModal();
  };

  const handleDeleteBoard = (boardId) => {
    deleteBoardFromHook(boardId);
    setBoards((prevBoards) =>
      prevBoards.filter((board) => board.id !== boardId)
    );
    if (currentBoard === boardId) setCurrentBoard(boards[0]?.id || "");
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteTaskModalOpen(true);
  };

  const handleConfirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
    }
    setIsDeleteTaskModalOpen(false);
    setTaskToDelete(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenSubtaskModal = (task) => {
    setSelectedTask(task);
    setIsSubtaskModalOpen(true);
  };

  const handleCloseSubtaskModal = () => {
    setIsSubtaskModalOpen(false);
    setSelectedTask(null);
  };

  const currentBoardName =
    boards.find((b) => b.id === currentBoard)?.name || "";

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        boards={boards}
        currentBoard={currentBoard}
        setCurrentBoard={setCurrentBoard}
        addBoard={addBoard}
        updateBoard={updateBoard}
        onDeleteBoard={handleDeleteBoard}
        darkMode={darkMode}
      />

      <div
        className="transition-all duration-300 bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col"
        style={{
          marginLeft: sidebarOpen ? "16rem" : "0",
        }}
      >
        <Header
          className="fixed top-0 right-0 w-full z-10"
          style={{
            width: `calc(100% - ${sidebarOpen ? "16rem" : "0rem"})`,
          }}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          currentBoardName={currentBoardName}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <div className="mt-16">
          <main className="p-6 overflow-x-auto">
            {boards.length === 0 ? (
              <div className="text-center text-gray-600 dark:text-gray-300">
                <p className="text-lg mb-4">
                  There is no table yet. Please create a new one from the
                  sidebar.
                </p>
              </div>
            ) : (
              <div className="inline-flex space-x-6 min-w-max">
                <Board
                  tasks={tasks}
                  columns={columns}
                  moveTask={moveTask}
                  openTaskModal={openTaskModal}
                  setEditingTask={setEditingTask}
                  currentBoard={currentBoard}
                  onDeleteTask={handleDeleteTask}
                  updateTask={updateTask}
                  onEditTask={handleEditTask}
                  onOpenSubtaskModal={handleOpenSubtaskModal}
                />
              </div>
            )}
          </main>
        </div>
      </div>
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={closeTaskModal}
          onSave={handleSaveTask}
          editingTask={editingTask}
          columns={columns}
          defaultStatus={newTaskColumnId}
          tasks={tasks}
          currentBoard={currentBoard}
        />
      )}

      {isDeleteTaskModalOpen && (
        <DeleteTaskModal
          isOpen={isDeleteTaskModalOpen}
          onClose={() => {
            setIsDeleteTaskModalOpen(false);
            setTaskToDelete(null);
          }}
          onDelete={handleConfirmDeleteTask}
          taskTitle={taskToDelete?.title || ""}
        />
      )}

      {isSubtaskModalOpen && (
        <SubtaskCompletionModal
          isOpen={isSubtaskModalOpen}
          onClose={handleCloseSubtaskModal}
          task={selectedTask}
          onUpdate={updateTask}
          columns={columns}
        />
      )}
    </div>
  );
}
