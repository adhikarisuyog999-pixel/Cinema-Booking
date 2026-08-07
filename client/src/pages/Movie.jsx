import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import MovieLists from "../components/MovieLists";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

const Movie = () => {
  const { auth } = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    reset,
    watch,
  } = useForm();

  const [movies, setMovies] = useState([]);
  const [isFetchingMoviesDone, setIsFetchingMoviesDone] = useState(false);
  const [isAddingMovie, setIsAddingMovie] = useState(false);

  const fetchMovies = async () => {
    try {
      setIsFetchingMoviesDone(false);
      const response = await axios.get("/movie");
      reset();
      setMovies(response.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingMoviesDone(true);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const onAddMovie = async (data) => {
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price) || 0,
        language: data.language?.trim() || "English",
        description: data.description?.trim() || "",
        poster: data.img,
        length:
          (parseInt(data.lengthHr, 10) || 0) * 60 +
          (parseInt(data.lengthMin, 10) || 0),
      };
      setIsAddingMovie(true);
      await axios.post("/movie", payload, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      fetchMovies();
      toast.success("Movie added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add movie.");
    } finally {
      setIsAddingMovie(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await axios.delete(`/movie/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      toast.success("Movie deleted successfully!");
      fetchMovies();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete movie.");
    }
  };

  const hr = parseInt(watch("lengthHr"), 10) || 0;
  const min = parseInt(watch("lengthMin"), 10) || 0;
  const sumMin = hr * 60 + min;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Movie Management</h1>
            <p className="text-xs text-slate-400 mt-1">Add new movies and manage active titles</p>
          </div>
          <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
            Total: <strong className="text-white">{movies.length}</strong> Movies
          </span>
        </div>

        {/* Add Movie Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
            Add New Movie
          </h2>

          <form onSubmit={handleSubmit(onAddMovie)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Movie Name</label>
                <input
                  required
                  placeholder="e.g. Inception"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  {...register("name", { required: true })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Poster Image URL</label>
                <input
                  required
                  placeholder="https://example.com/poster.jpg"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  {...register("img", { required: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Hours / Mins)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Hours"
                      min="0"
                      className="w-1/2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                      {...register("lengthHr")}
                    />
                    <input
                      type="number"
                      placeholder="Mins"
                      min="0"
                      className="w-1/2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                      {...register("lengthMin")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10.00"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    {...register("price")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief synopsis..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  {...register("description")}
                />
              </div>
            </div>

            {/* Poster preview & Submit */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-2 overflow-hidden min-h-[180px]">
                {watch("img") ? (
                  <img
                    src={watch("img")}
                    alt="poster preview"
                    className="h-44 w-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-xs text-slate-600 text-center">Image Preview</span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                Total Length: <strong className="text-slate-200">{hr}h {min}m ({sumMin} mins)</strong>
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
