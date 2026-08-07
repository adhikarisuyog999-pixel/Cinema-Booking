import {
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import ShowtimeDetails from "../components/ShowtimeDetails";
import { AuthContext } from "../context/AuthContext";

const User = () => {
  const { auth } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/auth/user", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setUsers(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onUpdateUser = async (data) => {
    try {
      setIsUpdating(true);
      const response = await axios.put(`/auth/user/${data.id}`, data, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      fetchUsers();
      toast.success(
        `Updated ${response.data.data.username} to ${response.data.data.role} successfully!`
      );
    } catch (error) {
      console.error(error);
      toast.error("Error updating user");
    } finally {
      setIsUpdating(false);
    }
  };

  const onDeleteUser = async (data) => {
    if (!window.confirm(`Are you sure you want to delete user "${data.username}"?`)) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/auth/user/${data.id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      fetchUsers();
      if (selectedUser?._id === data.id) {
        setSelectedUser(null);
        setTickets([]);
      }
      toast.success(`Deleted user "${data.username}" successfully!`);
    } catch (error) {
      console.error(error);
      toast.error("Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectUser = (user) => {
    if (selectedUser?._id === user._id) {
      setSelectedUser(null);
      setTickets([]);
      return;
    }

    setSelectedUser(user);
    const userTickets = user.tickets || [];
    setTickets(userTickets);
  };

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      user.username?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
            <p className="text-xs text-slate-400 mt-1">Manage user roles and inspect user tickets</p>
          </div>
          <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
            Total Users: <strong className="text-white">{users.length}</strong>
          </span>
        </div>

        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
            placeholder="Search by username, email or role..."
          />
        </div>

        {/* User table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Tickets</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{u.username}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.role === "admin" ? (
                        <span className="rounded bg-red-950 border border-red-800 px-2 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                          Admin
                        </span>
                      ) : (
                        <span className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-300 uppercase">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{u.tickets?.length || 0} tickets</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSelectUser(u)}
                          className={`flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            selectedUser?._id === u._id
                              ? "border-red-500 bg-red-600 text-white"
                              : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                          }`}
                        >
                          <TicketIcon className="h-3.5 w-3.5" />
                          <span>Tickets</span>
                        </button>

                        {u.role === "user" ? (
                          <button
                            onClick={() => onUpdateUser({ id: u._id, role: "admin" })}
                            disabled={isUpdating}
                            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                          >
                            <ChevronDoubleUpIcon className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Make Admin</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateUser({ id: u._id, role: "user" })}
                            disabled={isUpdating}
                            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                          >
                            <ChevronDoubleDownIcon className="h-3.5 w-3.5 text-amber-400" />
                            <span>Demote</span>
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteUser({ id: u._id, username: u.username })}
                          disabled={isDeleting}
                          className="rounded border border-red-900/80 bg-red-950/60 p-1 text-red-400 hover:bg-red-900 hover:text-white transition-colors"
                          title="Delete User"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-xs text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Viewing selected user tickets */}
        {selectedUser && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Tickets for {selectedUser.username}</h3>
                <p className="text-xs text-slate-400">Email: {selectedUser.email}</p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                {tickets.length} total tickets
              </span>
            </div>

            {tickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">This user has not reserved or purchased any tickets yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {tickets.map((t, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                    {t.showtime && <ShowtimeDetails showtime={t.showtime} />}
                    <div className="text-xs text-slate-300">
                      <span>Seats: </span>
                      <strong className="text-white font-mono">{t.seats?.map((s) => `${s.row}${s.number}`).join(", ")}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default User;
