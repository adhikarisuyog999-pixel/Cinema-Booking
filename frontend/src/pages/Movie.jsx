import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import MovieLists from "../components/MovieLists";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Movie = () => {
  const { auth } = useContext(AuthContext);
  const { register, handleSubmit, reset, watch } = useForm();

  const [movies, setMovies] = useState([]);
  const [isFetchingMoviesDone, setIsFetchingMoviesDone] = useState(false);
  const [isAddingMovie, setIsAddingMovie] = useState(false);

  const token = auth?.token ?? auth?.user?.token ?? "";

  const fetchMovies = async () => {
    try {
      setIsFetchingMoviesDone(false);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get("/movie", { headers });
      setMovies(response.data?.data || []);
    } catch (error) {
      console.error("fetchMovies error:", error?.response?.data || error);
      toast.error("Failed to load movies, try again");
    } finally {
      setIsFetchingMoviesDone(true);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [token]);

  const onAddMovie = async (data) => {
    try {
      setIsAddingMovie(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post("/movie", data, { headers });
      toast.success("Movie added successfully");
      reset();
      fetchMovies();
    } catch (error) {
      console.error("onAddMovie error:", error?.response?.data || error);
      toast.error("Failed to add movie");
    } finally {
      setIsAddingMovie(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`/movie/${id}`, { headers });
      toast.success("Movie deleted");
      fetchMovies();
    } catch (error) {
      console.error("handleDelete error:", error?.response?.data || error);
      toast.error("Failed to delete movie");
    }
  };

  const hr = parseInt(watch("lengthHr"), 10) || 0;
  const min = parseInt(watch("lengthMin"), 10) || 0;
  const sumMin = hr * 60 + min;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Movie Management
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Add new movies and manage active titles
            </p>
          </div>
          <span className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
            Total: <strong className="text-slate-900">{movies.length}</strong>{" "}
            Movies
          </span>
        </div>

        {/* Add Movie Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 text-slate-900">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            Add New Movie
          </h2>

          <form
            onSubmit={handleSubmit(onAddMovie)}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Movie Name
                </label>
                <input
                  required
                  placeholder="e.g. Inception"
                  className="w-full rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  {...register("name", { required: true })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Poster Image URL
                </label>
                <input
                  required
                  placeholder="https://example.com/poster.jpg"
                  className="w-full rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  {...register("img", { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Duration (Hours / Mins)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Hours"
                      min="0"
                      className="w-1/2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      {...register("lengthHr")}
                    />
                    <input
                      type="number"
                      placeholder="Mins"
                      min="0"
                      className="w-1/2 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                      {...register("lengthMin")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Price (NPR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10.00"
                    className="w-full rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    {...register("price")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis..."
                  className="w-full rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 text-xs text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  {...register("description")}
                />
              </div>
            </div>

            {/* Poster preview & Submit */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2 overflow-hidden min-h-[180px]">
                {watch("img") ? (
                  <img
                    src={watch("img")}
                    alt="poster preview"
                    className="h-44 w-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-xs text-slate-500 text-center">
                    Image Preview
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-700 text-center">
                Total Length:{" "}
                <strong className="text-slate-900">
                  {hr}h {min}m ({sumMin} mins)
                </strong>
              </div>

              <button
                type="submit"
                disabled={isAddingMovie}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-red-500 transition-colors disabled:opacity-50"
              >
                <PlusIcon className="h-4 w-4" />
                <span>{isAddingMovie ? "Adding..." : "Add Movie"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Search & Movie List */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="search"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              placeholder="Search movie title..."
              {...register("search")}
            />
          </div>

          {isFetchingMoviesDone ? (
            <MovieLists
              movies={movies}
              search={watch("search")}
              handleDelete={handleDelete}
            />
          ) : (
            <Loading />
          )}
        </div>
      </main>
    </div>
  );
};

export default Movie;
