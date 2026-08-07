import axios from "axios";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import CinemaLists from "../components/CinemaLists";
import DateSelector from "../components/DateSelector";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
// import ScheduleTable from "../components/ScheduleTable";
import TheaterListsByCinema from "../components/TheaterListsByCinema";
import { AuthContext } from "../context/AuthContext";

const parseShowtimeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object") {
    if (value.$date) return parseShowtimeDate(value.$date);
    const candidates = [
      value.showtime,
      value.startTime,
      value.time,
      value.datetime,
      value.date,
      value.start,
      value.when,
    ];
    for (const candidate of candidates) {
      const parsed = parseShowtimeDate(candidate);
      if (parsed) return parsed;
    }
  }
  return null;
};

const Schedule = () => {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(
    (sessionStorage.getItem("selectedDate") &&
      new Date(sessionStorage.getItem("selectedDate"))) ||
      new Date(),
  );
  const [selectedCinemaIndex, setSelectedCinemaIndex] = useState(
    parseInt(sessionStorage.getItem("selectedCinemaIndex")) || 0,
  );
  const [cinemas, setCinemas] = useState([]);
  const [isFetchingCinemas, setIsFetchingCinemas] = useState(true);
  const [movies, setMovies] = useState([]);
  const [isFetchingMovies, setIsFetchingMovies] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const showtimeSectionRef = useRef(null);

  const fetchCinemas = async (newSelectedCinema) => {
    try {
      setIsFetchingCinemas(true);
      const res =
        auth.role === "admin"
          ? await axios.get("/cinema/unreleased", {
              headers: { Authorization: `Bearer ${auth.token}` },
            })
          : await axios.get("/cinema");

      const cinemaData = res.data?.data || [];
      setCinemas(cinemaData);

      if (newSelectedCinema) {
        cinemaData.forEach((cinema, index) => {
          if (cinema.name === newSelectedCinema) {
            setSelectedCinemaIndex(index);
            sessionStorage.setItem("selectedCinemaIndex", index);
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingCinemas(false);
    }
  };

  const fetchMoviesAndShowtimes = async () => {
    setIsFetchingMovies(true);
    const headers = auth.token
      ? { Authorization: `Bearer ${auth.token}` }
      : {};
    let fetchedMovies = [];
    let fetchedShowtimes = [];
    let hadError = false;

    try {
      const moviesRes = await axios.get("/movie", { headers });
      fetchedMovies = moviesRes.data?.data || [];
      setMovies(fetchedMovies);
    } catch (error) {
      console.error("Failed to load movies:", error);
      hadError = true;
    }

    try {
      const showtimesRes =
        auth.role === "admin"
          ? await axios.get("/showtime/unreleased", { headers })
          : await axios.get("/showtime");
      fetchedShowtimes = showtimesRes.data?.data || [];
      setShowtimes(fetchedShowtimes);
    } catch (error) {
      console.error("Failed to load showtimes:", error);
      try {
        const fallbackRes = await axios.get("/showtime");
        fetchedShowtimes = fallbackRes.data?.data || [];
        setShowtimes(fetchedShowtimes);
      } catch (fallbackError) {
        console.error("Failed to load showtimes fallback:", fallbackError);
        hadError = true;
      }
    }

    if (fetchedMovies.length > 0 && !selectedMovieId) {
      setSelectedMovieId(fetchedMovies[0]._id);
    }

    if (hadError) {
      toast.error("Failed to load movies. Please try again.");
    }

    setIsFetchingMovies(false);
  };

  useEffect(() => {
    fetchCinemas();
    fetchMoviesAndShowtimes();
  }, [auth.role, auth.token]);

  const selectedMovie = useMemo(() => {
    return (
      movies.find((movie) => movie._id === selectedMovieId) || movies[0] || null
    );
  }, [movies, selectedMovieId]);

  const activeShowtime = useMemo(() => {
    if (!selectedMovie) return null;

    const movieShowtimes = showtimes
      .filter((st) => (st.movie?._id || st.movie) === selectedMovie._id)
      .map((st) => ({
        ...st,
        startTime: parseShowtimeDate(st.showtime || st.startTime || st),
        cinemaName: st.theater?.cinema?.name || "Cinema",
        theaterNumber: st.theater?.number || 1,
      }))
      .filter((st) => st.startTime && !Number.isNaN(st.startTime.getTime()))
      .sort((a, b) => a.startTime - b.startTime);

    return movieShowtimes;
  }, [selectedMovie, showtimes]);

  const now = new Date();
  const canBook = activeShowtime?.startTime
    ? (activeShowtime.startTime.getTime() - now.getTime()) / (1000 * 60) > 30
    : false;

  const handleBookTicket = (showtime) => {
    if (!auth.token) {
      navigate("/login");
      return;
    }
    if (!showtime?._id) {
      toast.info("No available showtime selected");
      return;
    }

    navigate(`/showtime/${showtime._id}`);
  };

  const cinemaProps = {
    cinemas,
    selectedCinemaIndex,
    setSelectedCinemaIndex,
    fetchCinemas,
    auth,
    isFetchingCinemas,
  };

  useEffect(() => {
    if (
      selectedMovie &&
      activeShowtime?.length > 0 &&
      showtimeSectionRef.current
    ) {
      showtimeSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedMovie?._id, activeShowtime?.length]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #EAF2FF 0%, #D6E4FF 100%)",
      }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Movie Schedules & Booking
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Select dates and cinemas to check showtimes
          </p>
        </div>

        <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-xl space-y-6">
          <DateSelector
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
              Available Movies
            </h2>

            {isFetchingMovies ? (
              <div className="py-12 flex justify-center">
                <Loading />
              </div>
            ) : movies.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {movies.map((movie) => {
                  const isSelected = selectedMovie?._id === movie._id;
                  return (
                    <div
                      key={movie._id}
                      onClick={() => {
                        setSelectedMovieId(movie._id);
                        sessionStorage.setItem("selectedMovieId", movie._id);
                      }}
                      className={`group flex flex-col overflow-hidden rounded-3xl border-2 cursor-pointer transition-all duration-300 transform bg-white shadow-sm ${
                        isSelected
                          ? "border-orange-500 ring-2 ring-orange-500/50 shadow-lg"
                          : "border-blue-200 hover:border-orange-400 hover:bg-blue-50 hover:shadow-xl"
                      }`}
                    >
                      <div className="relative overflow-hidden bg-white h-48">
                        <img
                          src={movie.img}
                          alt={movie.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                            <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold uppercase shadow-lg">
                              ✓ Selected
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-xl">
                          <p className="text-xs font-semibold text-slate-800">
                            {movie.length || 120} min
                          </p>
                        </div>
                      </div>

                      <div
                        className={`flex flex-col justify-between flex-1 p-4 transition-colors duration-300 ${
                          isSelected
                            ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white"
                            : "bg-slate-50 text-slate-900 group-hover:bg-sky-100"
                        }`}
                      >
                        <div>
                          <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                            {movie.name}
                          </h3>
                          <p
                            className={`text-xs ${
                              isSelected ? "text-sky-100" : "text-slate-600"
                            }`}
                          >
                            Click to view showtimes
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span
                            className={`text-[10px] font-semibold uppercase ${
                              isSelected
                                ? "text-blue-200"
                                : "text-orange-600 group-hover:text-orange-700"
                            }`}
                          >
                            {isSelected
                              ? "✓ Viewing Details"
                              : "→ Select Movie"}
                          </span>
                          <div className="text-xl transition-transform group-hover:scale-125">
                            {isSelected ? "🎬" : "🎞️"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-8 text-center shadow-xl">
                <p className="text-sm font-semibold text-slate-700">
                  No movies available for this date.
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Try another day or check back later.
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedMovie && activeShowtime && activeShowtime.length > 0 && (
          <div
            ref={showtimeSectionRef}
            className="rounded-2xl border-2 border-white bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
                Showtimes — {selectedMovie.name}
              </h2>
              <button
                onClick={() => setSelectedMovieId(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border-2 border-blue-200">
              <table className="w-full">
                {/* Table Header */}
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Cinema Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Theater
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      End Time
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-blue-100">
                  {activeShowtime.map((showtime, index) => {
                    const endTime = showtime.startTime
                      ? new Date(
                          showtime.startTime.getTime() +
                            (selectedMovie?.length || 120) * 60 * 1000,
                        )
                      : null;

                    return (
                      <tr
                        key={showtime._id}
                        className={`transition-all hover:shadow-md ${
                          index % 2 === 0
                            ? "bg-blue-50 hover:bg-blue-100"
                            : "bg-white hover:bg-blue-50"
                        }`}
                      >
                        {/* Cinema Name */}
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                          {showtime.cinemaName}
                        </td>

                        {/* Theater */}
                        <td className="px-4 py-3 text-sm text-slate-700">
                          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                            Theater {showtime.theaterNumber}
                          </span>
                        </td>

                        {/* Start Time */}
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {showtime.startTime?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) || "N/A"}
                        </td>

                        {/* End Time */}
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {endTime?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) || "N/A"}
                        </td>

                        {/* Book Now Button */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleBookTicket(showtime)}
                            disabled={isBooking}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>🎫</span>
                            {isBooking ? "Booking..." : "Book Now"}
                          </button>
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

export default Schedule;
