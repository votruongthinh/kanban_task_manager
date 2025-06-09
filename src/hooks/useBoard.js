import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { initialBoards, initialTasks } from "../data/initialData";

export function useBoard() {
  const [boards, setBoards] = useLocalStorage("boards", initialBoards);
  const [tasks, setTasks] = useLocalStorage("tasks", initialTasks);
  const [currentBoard, setCurrentBoard] = useLocalStorage("currentBoard", "");

  const currentBoardData = boards.find(
    (board) => board.id === currentBoard
  ) || { columns: [], users: [] };
  const currentColumns = currentBoardData.columns || [];
  const currentUsers = currentBoardData.users || [];

  const addBoard = (newBoard) => {
    const newColumns = [
      { id: `col-${newBoard.id}-todo`, name: "To Do", isDone: false },
      { id: `col-${newBoard.id}-progress`, name: "Progress", isDone: false },
      { id: `col-${newBoard.id}-done`, name: "Done", isDone: true },
    ];
    const updatedBoards = [
      ...boards,
      { ...newBoard, columns: newColumns, users: [] },
    ];
    setBoards(updatedBoards);
    setCurrentBoard(newBoard.id);
  };

  const updateBoard = (id, updatedBoard) => {
    setBoards(
      boards.map((board) =>
        board.id === id ? { ...board, ...updatedBoard } : board
      )
    );
  };

  const deleteBoard = (id) => {
    setBoards(boards.filter((board) => board.id !== id));
    if (currentBoard === id) {
      setCurrentBoard(boards[0]?.id || "");
    }
  };

  const addTask = (newTask) => {
    const columnTasks = tasks.filter(
      (t) => t.status === newTask.status && t.boardId === currentBoard
    );
    const isDoneColumn = currentColumns.find(
      (col) => col.id === newTask.status
    )?.isDone;
    setTasks([
      ...tasks,
      {
        ...newTask,
        position: columnTasks.length,
        boardId: currentBoard,
        assignedUsers: newTask.assignedUsers || [],
        deadline: newTask.deadline || null,
        completed: isDoneColumn || false,
      },
    ]);
  };

  const updateTask = (id, updatedTask) => {
    const isDoneColumn = currentColumns.find(
      (col) => col.id === updatedTask.status
    )?.isDone;
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updatedTask,
              assignedUsers: updatedTask.assignedUsers || [],
              deadline: updatedTask.deadline || null,
              completed: isDoneColumn || updatedTask.completed || false,
            }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const moveTask = (taskIdOrTasks, boardId) => {
    if (Array.isArray(taskIdOrTasks)) {
      const updatedTasks = [...taskIdOrTasks];
      const columnIds = currentColumns.map((col) => col.id);
      columnIds.forEach((columnId) => {
        const tasksInColumn = updatedTasks
          .filter((t) => t.status === columnId && t.boardId === boardId)
          .sort((a, b) => (a.position || 0) - (b.position || 0));
        tasksInColumn.forEach((task, index) => {
          const taskIndex = updatedTasks.findIndex((t) => t.id === task.id);
          if (taskIndex !== -1) {
            const isDoneColumn = currentColumns.find(
              (col) => col.id === columnId
            )?.isDone;
            updatedTasks[taskIndex] = {
              ...updatedTasks[taskIndex],
              position: index,
              completed: isDoneColumn || updatedTasks[taskIndex].completed,
            };
          }
        });
      });
      setTasks(updatedTasks);
    } else {
      const taskIndex = tasks.findIndex((t) => t.id === taskIdOrTasks);
      if (taskIndex !== -1) {
        const isDoneColumn = currentColumns.find(
          (col) => col.id === tasks[taskIndex].status
        )?.isDone;
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          position: 0,
          completed: isDoneColumn || updatedTasks[taskIndex].completed,
        };
        setTasks(updatedTasks);
      }
    }
  };

  const addColumn = (newColumn) => {
    const existingColumn = currentColumns.find(
      (col) => col.name.toLowerCase() === newColumn.name.toLowerCase()
    );
    if (existingColumn) {
      throw new Error("Tên cột đã tồn tại");
    }
    const hasDoneColumn = currentColumns.some((col) => col.isDone);
    setBoards(
      boards.map((board) =>
        board.id === currentBoard
          ? {
              ...board,
              columns: [
                ...(board.columns || []),
                { ...newColumn, isDone: !hasDoneColumn },
              ],
            }
          : board
      )
    );
  };

  const updateColumn = (idOrColumns, updatedColumn) => {
    if (Array.isArray(idOrColumns)) {
      const updatedColumns = idOrColumns.map((col, idx) => ({
        ...col,
        isDone:
          idx === idOrColumns.length - 1 && !idOrColumns.some((c) => c.isDone)
            ? true
            : col.isDone,
      }));
      setBoards(
        boards.map((board) =>
          board.id === currentBoard
            ? { ...board, columns: updatedColumns }
            : board
        )
      );
    } else {
      const existingColumn = currentColumns.find(
        (col) =>
          col.id !== idOrColumns &&
          col.name.toLowerCase() === updatedColumn.name.toLowerCase()
      );
      if (existingColumn) {
        throw new Error("Tên cột đã tồn tại");
      }
      setBoards(
        boards.map((board) =>
          board.id === currentBoard
            ? {
                ...board,
                columns: board.columns.map((col) =>
                  col.id === idOrColumns ? { ...col, ...updatedColumn } : col
                ),
              }
            : board
        )
      );
    }
  };

  const deleteColumn = (columnToDelete, targetColumnId) => {
    if (currentColumns.length <= 1) return false;
    const isDoneColumn = columnToDelete.isDone;
    const updatedColumns = currentColumns.filter(
      (col) => col.id !== columnToDelete.id
    );

    if (isDoneColumn && updatedColumns.length > 0) {
      updatedColumns[0].isDone = true;
    }

    const updatedBoards = boards.map((board) =>
      board.id === currentBoard ? { ...board, columns: updatedColumns } : board
    );
    setBoards(updatedBoards);

    if (targetColumnId) {
      const tasksInDeletedColumn = tasks.filter(
        (task) =>
          task.status === columnToDelete.id && task.boardId === currentBoard
      );
      if (tasksInDeletedColumn.length > 0) {
        const tasksInTargetColumn = tasks.filter(
          (task) =>
            task.status === targetColumnId && task.boardId === currentBoard
        );
        const isTargetDone = currentColumns.find(
          (col) => col.id === targetColumnId
        )?.isDone;
        const updatedTasks = tasks.map((task) =>
          tasksInDeletedColumn.includes(task)
            ? {
                ...task,
                status: targetColumnId,
                position:
                  tasksInTargetColumn.length +
                  tasksInDeletedColumn.indexOf(task),
                completed: isTargetDone || task.completed,
              }
            : task
        );
        setTasks(updatedTasks);
      }
    }
    return true;
  };

  const addUserToBoard = (email) => {
    setBoards(
      boards.map((board) =>
        board.id === currentBoard
          ? {
              ...board,
              users: [
                ...(board.users || []),
                { id: `user-${Date.now()}`, email },
              ],
            }
          : board
      )
    );
  };

  const removeUserFromBoard = (email) => {
    const updatedBoards = boards.map((board) =>
      board.id === currentBoard
        ? {
            ...board,
            users: board.users.filter((user) => user.email !== email),
          }
        : board
    );
    setBoards(updatedBoards);

    const updatedTasks = tasks.map((task) =>
      task.boardId === currentBoard
        ? {
            ...task,
            assignedUsers: task.assignedUsers.filter(
              (userEmail) => userEmail !== email
            ),
          }
        : task
    );
    setTasks(updatedTasks);
  };

  const getUserTaskCount = (email) => {
    return tasks.filter(
      (task) =>
        task.boardId === currentBoard && task.assignedUsers.includes(email)
    ).length;
  };

  const boardTasks = tasks
    .filter((task) => task.boardId === currentBoard)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  return {
    boards,
    currentBoard,
    setCurrentBoard,
    addBoard,
    updateBoard,
    deleteBoard,
    columns: currentColumns,
    tasks: boardTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumn,
    deleteColumn,
    users: currentUsers,
    addUserToBoard,
    removeUserFromBoard,
    getUserTaskCount,
  };
}
