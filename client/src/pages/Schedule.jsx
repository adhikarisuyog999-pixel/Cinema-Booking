import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import CinemaLists from "../components/CinemaLists";
import DateSelector from "../components/DateSelector";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import ScheduleTable from "../components/ScheduleTable";
import { AuthContext } from "../context/AuthContext";

const parseShowtimeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object") {
    if (value.$date) return parseShowtimeDate(value.$date);
    const candidates = [value.showtime, value.startTime, value.time, value.datetime, value.date, value.start, value.when];
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
    (sessionStorage.getItem("selectedDate") && new Date(sessionStorage.getItem("selectedDate"))) || new Date()
  );
  const [selectedCinemaIndex, setSelectedCinemaIndex] = useState(
    parseInt(sessionStorage.getItem("selectedCinemaIndex")) || 0
  );
  const [cinemas, setCinemas] = useState([]);
  const [isFetchingCinemas, setIsFetchingCinemas] = useState(true);
  const [movies, setMovies] = useState([]);
  const [isFetchingMovies, setIsFetchingMovies] = useState(true);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  const fetchCinemas = async (newSelectedCinema) => {
    try {
      setIsFetchingCinemas(true);
      const res = auth.role === "admin"
        ? await axios.get("/cinema/unreleased", { headers: { Authorization: `Bearer ${auth.token}` } })
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
    try {
      setIsFetchingMovies(true);
      const [moviesRes, showtimesRes] = await Promise.all([
        auth.role === "admin"
          ? axios.get("/movie/unreleased/showing", { headers: { Authorization: `Bearer ${auth.token}` } })
          : axios.get("/movie/showing"),
        axios.get("/showtime")
      ]);

      const fetchedMovies = moviesRes.data?.data || [];
      const fetchedShowtimes = showtimesRes.data?.data || [];

      setMovies(fetchedMovies);
      setShowtimes(fetchedShowtimes);

      if (fetchedMovies.length > 0 && !selectedMovieId) {
        setSelectedMovieId(fetchedMovies[0]._id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingMovies(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
    fetchMoviesAndShowtimes();
  }, []);

  const selectedMovie = useMemo(() => {
    return movies.find((movie) => movie._id === selectedMovieId) || movies[0] || null;
  }, [movies, selectedMovieId]);

  const activeShowtime = useMemo(() => {
    if (!selectedMovie) return null;

    const movieShowtimes = showtimes
      .filter((st) => (st.movie?._id || st.movie) === selectedMovie._id)
      .map((st) => ({
        ...st,
        startTime: parseShowtimeDate(st.showtime || st.startTime || st),
        cinemaName: st.theater?.cinema?.name || "Cinema",
        theaterNumber: st.theater?.number || 1
      }))
      .filter((st) => st.startTime && !Number.isNaN(st.startTime.getTime()))
      .sort((a, b) => a.startTime - b.startTime);

    return movieShowtimes[0] || null;
  }, [selectedMovie, showtimes]);

  const now = new Date();
  const canBook = activeShowtime?.startTime
    ? (activeShowtime.startTime.getTime() - now.getTime()) / (1000 * 60) > 30
    : false;

  const handleBookTicket = async () => {
    if (!auth.token) {
      navigate("/login");
      return;
    }
    if (!activeShowtime?._id) {
      toast.info("No available showtime selected");
      return;
    }

    navigate(`/showtime/${activeShowtime._id}`);
  };

  const cinemaProps = {
    cinemas,
    selectedCinemaIndex,
    setSelectedCinemaIndex,
    fetchCinemas,
    auth,
    isFetchingCinemas
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Movie Schedules & Booking</h1>
          <p className="text-xs text-slate-400 mt-1">Select dates and cinemas to check showtimes</p>
        </div>

        <CinemaLists {...cinemaProps} />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-6">
          <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Movie List Section */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Available Movies</h2>
              {isFetchingMovies ? (
                <Loading />
              ) : movies.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {movies.map((movie) => {
                    const isSelected = selectedMovie?._id === movie._id;
                    return (
                      <div
                        key={movie._id}
                        onClick={() => setSelectedMovieId(movie._id)}
                        className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-red-500 bg-red-950/30 shadow-md ring-1 ring-red-500"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <img
                          src={movie.img}
                          alt={movie.name}
                          className="h-24 w-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">{movie.name}</h3>
                            <p className="text-xs text-slate-400 mt-1">{movie.length ? `${movie.length} min` : "120 min"}</p>
                          </div>
                          <span className="text-[10px] font-semibold uppercase text-red-400">
                            {isSelected ? "Selected" : "Click to view"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No movies scheduled for this day.</p>
              )}
            </div>

            {/* Movie Detail & Quick Booking Sidebar */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4">
              {selectedMovie ? (
                <>
                  <div className="space-y-2">
                    <img
                      src={selectedMovie.img}
                      alt={selectedMovie.name}
                      className="h-44 w-full object-cover rounded-lg border border-slate-800"
                    />
                    <h3 className="text-lg font-bold text-white mt-2">{selectedMovie.name}</h3>
                    <p className="text-xs text-slate-400">Duration: {selectedMovie.length || 120} minutes</p>
                  </div>

                  {activeShowtime ? (
                    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Next Showtime</span>
                      <p className="font-semibold text-white">
                        {activeShowtime.startTime.toLocaleString()}
                      </p>
                      <p className="text-slate-400">
                        {activeShowtime.cinemaName} (Theater #{activeShowtime.theaterNumber})
                      </p>
                      <button
                        type="button"
                        onClick={handleBookTicket}
                        className="w-full mt-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 transition-colors"
                      >
                        Select Seats & Book
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-2">No active showtime found for this movie.</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500">Select a movie from the list.</p>
              )}
            </div>
          </div>
        </div>

        {cinemas[selectedCinemaIndex]?._id && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <h2 className="text-base font-bold text-white mb-4">
              Theater Schedule ({cinemas[selectedCinemaIndex]?.name})
            </h2>
            <ScheduleTable
              cinema={cinemas[selectedCinemaIndex]}
              selectedDate={selectedDate}
              auth={auth}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Schedule;
