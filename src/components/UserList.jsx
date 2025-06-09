import { useState } from "react";

export default function UserList({
  users,
  onBack,
  onAddUser,
  setIsAddUserModalOpen,
  onRemoveUser,
  getUserTaskCount,
  setIsDeleteUserModalOpen,
  setUserToDelete,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleRemoveUser = (email) => {
    const taskCount = getUserTaskCount(email);
    if (taskCount > 0) {
      setUserToDelete({ email, taskCount });
      setIsDeleteUserModalOpen(true);
    } else {
      onRemoveUser(email);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-gray-600 dark:text-gray-300"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Team Members
          </h2>
        </div>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add people
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search teams"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          People you work with
        </h3>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium mr-4"
                  style={{ backgroundColor: getAvatarColor(user.email) }}
                >
                  {getAvatarInitial(user.email)}
                </div>
                <div>
                  <p className="text-gray-800 dark:text-white font-medium">
                    {user.email.split("@")[0]}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveUser(user.email)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium"
                aria-label={`Remove ${user.email} from project`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">
          No team members found.
        </p>
      )}
    </div>
  );
}
