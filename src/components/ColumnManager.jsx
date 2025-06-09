import { useState } from "react";

export default function ColumnManager({ columns, onAdd, onUpdate, onDelete }) {
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [newColumnName, setNewColumnName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleStartEdit = (column) => {
    setEditingColumn(column.id);
    setEditingName(column.name);
  };

  const handleFinishEdit = () => {
    if (editingName.trim() && editingColumn) {
      onUpdate(editingColumn, editingName.trim());
      setEditingColumn(null);
      setEditingName("");
    }
  };

  const handleAddNew = () => {
    if (newColumnName.trim()) {
      onAdd({ name: newColumnName.trim() });
      setNewColumnName("");
      setIsAddingNew(false);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            {editingColumn === column.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  autoFocus
                />
                <button
                  onClick={handleFinishEdit}
                  className="text-green-600 hover:text-green-700"
                >
                  ✓
                </button>
                <button
                  onClick={() => setEditingColumn(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                className="font-medium text-gray-800 dark:text-white cursor-pointer hover:text-purple-600"
                onClick={() => handleStartEdit(column)}
              >
                {column.name}
              </div>
            )}
            <div className="text-gray-500">{/* Số task trong cột */}</div>
          </div>
        </div>
      ))}

      {isAddingNew ? (
        <div className="flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Tên cột mới"
              className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
              autoFocus
            />
            <button
              onClick={handleAddNew}
              className="text-green-600 hover:text-green-700"
            >
              ✓
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-red-600 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center text-2xl text-purple-600 hover:text-purple-700"
        >
          +
        </button>
      )}
    </div>
  );
}
