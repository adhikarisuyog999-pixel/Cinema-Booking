import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

const Search = () => {
  const { auth } = useContext(AuthContext);
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCinema, setSelectedCinema] = useState("all");
  const [selectedMovie, setSelectedMovie] = useState("all");
  const [selectedRelease, setSelectedRelease] = useState("all");
  const [sortField, setSortField] = useState("showtime");
  const [sortAsc, setSortAsc] = useState(true);

  const fetchInitialData = async () => {
    setLoading(true);
    const headers = auth.token ? { Authorization: `Bearer ${auth.token}` } : {};

    // Safe individual requests to avoid cascading failures
    try {
      // 1. Fetch Showtimes
      let stData = [];
      try {
        const res = auth.role === "admin"
          ? await axios.get("/showtime/unreleased", { headers })
          : await axios.get("/showtime");
        stData = res.data?.data || [];
      } catch (err) {
        const fallbackRes = await axios.get("/showtime");
        stData = fallbackRes.data?.data || [];
      }
      setShowtimes(stData);

      // 2. Fetch Cinemas
      let cinData = [];
      try {
        const res = auth.role === "admin"
          ? await axios.get("/cinema/unreleased", { headers })
          : await axios.get("/cinema");
        cinData = res.data?.data || [];
      } catch (err) {
        const fallbackRes = await axios.get("/cinema");
        cinData = fallbackRes.data?.data || [];
      }
      setCinemas(cinData);

      // 3. Fetch Movies
      try {
        const res = await axios.get("/movie");
        setMovies(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load movies:", err);
      }

    } catch (error) {
      console.error("Error loading search data:", error);
      toast.error("Failed to load some search data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleToggleRelease = async (id, currentStatus) => {
    try {
      await axios.put(
        `/showtime/${id}`,
        { isRelease: !currentStatus },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success(
        `Showtime ${!currentStatus ? "released" : "unreleased"} successfully`
      );
      setShowtimes((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isRelease: !currentStatus } : s))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update showtime release status.");
    }
  };

  const handleDeleteShowtime = async (id) => {
    if (!window.confirm("Are you sure you want to delete this showtime?")) return;
    try {
      await axios.delete(`/showtime/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      toast.success("Showtime deleted");
      setShowtimes((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete showtime.");
    }
  };

  // Filtered showtimes
  const filteredShowtimes = showtimes.filter((s) => {
    if (!s || !s.movie || !s.theater || !s.theater.cinema) return false;

    const movieTitle = s.movie.name?.toLowerCase() || "";
    const cinemaName = s.theater.cinema.name?.toLowerCase() || "";
    const q = searchQuery.toLowerCase().trim();

    const matchesQuery = !q || movieTitle.includes(q) || cinemaName.includes(q);
    const matchesCinema =
      selectedCinema === "all" || s.theater.cinema._id === selectedCinema;
    const matchesMovie =
      selectedMovie === "all" || s.movie._id === selectedMovie;
    const matchesRelease =
      selectedRelease === "all" ||
      (selectedRelease === "released" && s.isRelease) ||
      (selectedRelease === "unreleased" && !s.isRelease);

    return matchesQuery && matchesCinema && matchesMovie && matchesRelease;
  });

  // Sorted showtimes
  const sortedShowtimes = [...filteredShowtimes].sort((a, b) => {
    let valA, valB;
    if (sortField === "movie") {
      valA = a.movie?.name || "";
      valB = b.movie?.name || "";
    } else if (sortField === "cinema") {
      valA = a.theater?.cinema?.name || "";
      valB = b.theater?.cinema?.name || "";
    } else if (sortField === "theater") {
      valA = a.theater?.number || 0;
      valB = b.theater?.number || 0;
    } else {
      valA = new Date(a.showtime).getTime();
      valB = new Date(b.showtime).getTime();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCinema("all");
    setSelectedMovie("all");
    setSelectedRelease("all");
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-white">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              Showtime Search & Management
            </h1>
            <p className="text-xs text-blue-100 mt-1">
              Search, filter, and manage showtimes across all cinemas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1.5 text-xs text-white shadow-sm">
              Total: <strong className="text-white font-bold">{sortedShowtimes.length}</strong> showtimes
            </span>
          </div>
        </div>

        {/* Filter Controls Panel - Crisp White Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl mb-6">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-800 pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-orange-500" />
              <span>Search & Filter Options</span>
            </div>
            {(searchQuery || selectedCinema !== "all" || selectedMovie !== "all" || selectedRelease !== "all") && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1"
              >
                <XMarkIcon className="h-4 w-4" /> Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Text Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Search Title or Cinema
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Avatar or Grand Cinema"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Cinema Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cinema
              </label>
              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
              >
                <option value="all">All Cinemas</option>
                {cinemas.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Movie Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Movie
              </label>
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
              >
                <option value="all">All Movies</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Release Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Release Status
              </label>
              <select
                value={selectedRelease}
                onChange={(e) => setSelectedRelease(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="released">Released Only</option>
                <option value="unreleased">Unreleased Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="py-12 bg-white rounded-2xl shadow-xl">
            <Loading />
          </div>
        ) : sortedShowtimes.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-xl">
            <p className="text-sm font-medium">No showtimes found matching your filter criteria.</p>
            <button
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase font-semibold text-[11px]">
                  <tr>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                      onClick={() => handleSort("movie")}
                    >
                      <div className="flex items-center gap-1">
                        Movie
                        {sortField === "movie" &&
                          (sortAsc ? (
                            <ChevronUpIcon className="h-3 w-3 text-orange-500" />
                          ) : (
                            <ChevronDownIcon className="h-3 w-3 text-orange-500" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                      onClick={() => handleSort("cinema")}
                    >
                      <div className="flex items-center gap-1">
                        Cinema
                        {sortField === "cinema" &&
                          (sortAsc ? (
                            <ChevronUpIcon className="h-3 w-3 text-orange-500" />
                          ) : (
                            <ChevronDownIcon className="h-3 w-3 text-orange-500" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                      onClick={() => handleSort("theater")}
                    >
                      <div className="flex items-center gap-1">
                        Theater
                        {sortField === "theater" &&
                          (sortAsc ? (
                            <ChevronUpIcon className="h-3 w-3 text-orange-500" />
                          ) : (
                            <ChevronDownIcon className="h-3 w-3 text-orange-500" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3.5 cursor-pointer hover:text-slate-900"
                      onClick={() => handleSort("showtime")}
                    >
                      <div className="flex items-center gap-1">
                        Showtime
                        {sortField === "showtime" &&
                          (sortAsc ? (
                            <ChevronUpIcon className="h-3 w-3 text-orange-500" />
                          ) : (
                            <ChevronDownIcon className="h-3 w-3 text-orange-500" />
                          ))}
                      </div>
                    </th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedShowtimes.map((s) => {
                    const dt = new Date(s.showtime);
                    const formattedDate = dt.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                    const formattedTime = dt.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-slate-900">
                          <Link
                            to={`/showtime/${s._id}`}
                            className="hover:text-orange-600 transition-colors"
                          >
                            {s.movie?.name || "Unknown"}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5 font-medium">{s.theater?.cinema?.name || "N/A"}</td>
                        <td className="px-4 py-3.5">Theater #{s.theater?.number}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-900">{formattedDate}</div>
                          <div className="text-[11px] text-slate-500">{formattedTime}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          {s.isRelease ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              <CheckIcon className="h-3 w-3" /> Released
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                              Unreleased
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/showtime/${s._id}`}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              Seats
                            </Link>
                            <button
                              onClick={() => handleToggleRelease(s._id, s.isRelease)}
                              className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                s.isRelease
                                  ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              }`}
                            >
                              {s.isRelease ? "Unrelease" : "Release"}
                            </button>
                            <button
                              onClick={() => handleDeleteShowtime(s._id)}
                              className="rounded-lg border border-red-200 bg-red-50 p-1 text-red-600 hover:bg-red-100 transition-colors"
                              title="Delete Showtime"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
