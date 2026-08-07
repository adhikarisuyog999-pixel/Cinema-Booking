import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./Loading";

const CinemaLists = ({
  cinemas,
  selectedCinemaIndex,
  setSelectedCinemaIndex,
  fetchCinemas,
  auth,
  isFetchingCinemas = false,
}) => {
  const { register, handleSubmit, reset, watch } = useForm();
  const [isAdding, setIsAdding] = useState(false);

  const onAddCinema = async (data) => {
    try {
      setIsAdding(true);
      await axios.post("/cinema", data, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      reset();
      if (fetchCinemas) fetchCinemas(data.name);
      toast.success("Cinema added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add cinema");
    } finally {
      setIsAdding(false);
    }
  };

  const searchVal = watch("search")?.toLowerCase() || "";
  const filteredCinemas =
    cinemas?.filter((cinema) =>
      cinema.name?.toLowerCase().includes(searchVal)
    ) || [];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Cinemas
          </h2>
          <p className="text-xs text-slate-500">
            Browse available cinema locations
          </p>
        </div>

        {auth?.role === "admin" && (
          <form
            onSubmit={handleSubmit(onAddCinema)}
            className="flex items-center gap-2"
          >
            <input
              placeholder="Add new cinema name"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#3B4DDB] focus:bg-white focus:outline-none transition-colors"
              required
              {...register("name", { required: true })}
            />
            <button
              disabled={isAdding}
              className="flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #3B4DDB 0%, #4F5FE8 100%)" }}
            >
              <PlusIcon className="h-4 w-4" />
              <span>{isAdding ? "Adding..." : "Add"}</span>
            </button>
          </form>
        )}
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="search"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#3B4DDB] focus:bg-white focus:outline-none transition-colors"
          placeholder="Search cinema by name..."
          {...register("search")}
        />
      </div>

      {isFetchingCinemas ? (
        <Loading />
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {filteredCinemas.length ? (
            filteredCinemas.map((cinema, index) => {
              const isSelected =
                cinemas[selectedCinemaIndex]?._id === cinema._id;
              return (
                <button
                  key={cinema._id || index}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "text-white shadow-md"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                  style={isSelected ? { background: "linear-gradient(135deg, #3B4DDB 0%, #4F5FE8 100%)" } : {}}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCinemaIndex(null);
                      sessionStorage.setItem("selectedCinemaIndex", null);
                    } else {
                      setSelectedCinemaIndex(index);
                      sessionStorage.setItem("selectedCinemaIndex", index);
                    }
                  }}
                >
                  {cinema.name}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 py-2">No cinemas found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CinemaLists;
