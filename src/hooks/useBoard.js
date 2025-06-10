import { useLocalStorage } from "./useLocalStorage";
import { initialBoards, initialTasks } from "../data/initialData";

export function useBoard() {
  const [bList, setBList] = useLocalStorage("boards", initialBoards);
  const [tList, setTList] = useLocalStorage("tasks", initialTasks);
  const [currBoard, setCurrBoard] = useLocalStorage("currentBoard", "");

  const currData = bList.find((b) => b.id === currBoard) || { columns: [] };
  const cList = currData.columns;

  const addBoard = (newB) => {
    const newCols = [
      { id: `col-${newB.id}-todo`, name: "To Do", isDone: false },
      { id: `col-${newB.id}-progress`, name: "Progress", isDone: false },
      { id: `col-${newB.id}-done`, name: "Done", isDone: true },
    ];
    setBList([...bList, { ...newB, columns: newCols }]);
    setCurrBoard(newB.id);
  };

  const updateBoard = (id, updB) =>
    setBList(bList.map((b) => (b.id === id ? { ...b, ...updB } : b)));

  const deleteBoard = (id) => {
    setBList(bList.filter((b) => b.id !== id));
    if (currBoard === id) setCurrBoard(bList[0]?.id || "");
  };

  const addTask = (newT) => {
    const colTasks = tList.filter(
      (t) => t.status === newT.status && t.boardId === currBoard
    );
    const isDone = cList.find((c) => c.id === newT.status)?.isDone;
    setTList([
      ...tList,
      {
        ...newT,
        position: colTasks.length,
        boardId: currBoard,
        deadline: newT.deadline || null,
        completed: isDone || false,
      },
    ]);
  };

  const updateTask = (id, updT) => {
    const isDone = cList.find((c) => c.id === updT.status)?.isDone;
    setTList(
      tList.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updT,
              deadline: updT.deadline || null,
              completed: isDone || updT.completed || false,
            }
          : t
      )
    );
  };

  const deleteTask = (id) => setTList(tList.filter((t) => t.id !== id));

  const moveTask = (tIdOrList, bId) => {
    const updTasks = Array.isArray(tIdOrList)
      ? [...tIdOrList]
      : tList.map((t) => (t.id === tIdOrList ? { ...t, position: 0 } : t));
    if (Array.isArray(tIdOrList)) {
      cList.forEach((c) => {
        const tasksInCol = updTasks
          .filter((t) => t.status === c.id && t.boardId === bId)
          .sort((a, b) => (a.position || 0) - (b.position || 0));
        tasksInCol.forEach((t, idx) => {
          const i = updTasks.findIndex((tt) => tt.id === t.id);
          if (i !== -1)
            updTasks[i] = {
              ...updTasks[i],
              position: idx,
              completed: c.isDone || updTasks[i].completed,
            };
        });
      });
    }
    setTList(updTasks);
  };

  const bTasks = tList
    .filter((t) => t.boardId === currBoard)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  return {
    boards: bList,
    currentBoard: currBoard,
    setCurrentBoard: setCurrBoard,
    addBoard,
    updateBoard,
    deleteBoard,
    columns: cList,
    tasks: bTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
