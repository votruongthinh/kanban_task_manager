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

export default function Board({
  columns,
  tasks,
  moveTask,
  openTaskModal,
  setEditingTask,
  currentBoard,
  onDeleteTask,
  updateTask,
  onEditTask,
  onOpenSubtaskModal,
}) {
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);

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
          columns={columns}
          isOverlay={false}
          onDeleteTask={onDeleteTask}
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
            <div className="w-64 flex-shrink-0"></div>
          </div>
        </SortableContext>

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
      </div>
    </DndContext>
  );
}
//
