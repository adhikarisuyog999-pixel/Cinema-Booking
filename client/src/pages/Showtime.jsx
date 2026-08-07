import { ClockIcon, TicketIcon } from "@heroicons/react/24/solid";
import axios from "axios";
<<<<<<< Updated upstream
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
=======
import { Fragment, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
>>>>>>> Stashed changes
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import Seat from "../components/Seat";
import ShowtimeDetails from "../components/ShowtimeDetails";
import { AuthContext } from "../context/AuthContext";

const Showtime = () => {
  const { auth } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShowtime = async () => {
    try {
      setLoading(true);
      let response;
      if (auth.role === "admin") {
        response = await axios.get(`/showtime/user/${id}`, {
<<<<<<< Updated upstream
          headers: { Authorization: `Bearer ${auth.token}` }
=======
          headers: { Authorization: `Bearer ${auth.token}` },
>>>>>>> Stashed changes
        });
      } else {
        response = await axios.get(`/showtime/${id}`);
      }
<<<<<<< Updated upstream
      setShowtime(response.data?.data || {});
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load showtime details");
    } finally {
=======
      setShowtime(response.data.data || {});
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to load showtime details",
      );
    }
    fontally: {
>>>>>>> Stashed changes
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtime();
  }, [id]);

  const row = showtime?.theater?.seatPlan?.row;
  let rowLetters = [];
  if (row) {
    for (let k = 64; k <= (row.length === 2 ? row.charCodeAt(0) : 64); k++) {
      for (
        let i = 65;
<<<<<<< Updated upstream
        i <= (k === row.charCodeAt(0) || row.length === 1 ? row.charCodeAt(row.length - 1) : 90);
        i++
      ) {
        const letter = k === 64 ? String.fromCharCode(i) : String.fromCharCode(k) + String.fromCharCode(i);
=======
        i <=
        (k === row.charCodeAt(0) || row.length === 1
          ? row.charCodeAt(row.length - 1)
          : 90);
        i++
      ) {
        const letter =
          k === 64
            ? String.fromCharCode(i)
            : String.fromCharCode(k) + String.fromCharCode(i);
>>>>>>> Stashed changes
        rowLetters.push(letter);
      }
    }
  }

  const column = showtime?.theater?.seatPlan?.column || 0;
  let colNumber = [];
  for (let k = 1; k <= column; k++) {
    colNumber.push(k);
  }

  const now = new Date();
  const showtimeDate = showtime?.showtime ? new Date(showtime.showtime) : null;
  const isPast = showtimeDate ? showtimeDate < now : false;
<<<<<<< Updated upstream
  const minsRemaining = showtimeDate ? (showtimeDate.getTime() - now.getTime()) / (1000 * 60) : 999;
  const canReserveOnly = minsRemaining > 30;

  const sortedSelectedSeat = [...selectedSeats].sort((a, b) => {
    const matchA = a.match(/([A-Za-z]+)(\d+)/);
    const matchB = b.match(/([A-Za-z]+)(\d+)/);
    if (!matchA || !matchB) return 0;
    const [, rowA, numA] = matchA;
    const [, rowB, numB] = matchB;
    if (rowA === rowB) return parseInt(numA) - parseInt(numB);
    return rowA.localeCompare(rowB);
  });

  const handleAction = async (isPurchased) => {
    if (!auth.token) {
      navigate("/login");
      return;
    }
    if (!selectedSeats.length) {
      toast.info("Please select at least one seat.");
      return;
    }

=======
  const minsRemaining = showtimeDate
    ? (showtimeDate.getTime() - now.getTime()) / (1000 * 60)
    : 999;

  // Rule: Can reserve if > 30 minutes before showtime. If <= 30 mins, MUST buy directly.
  const canReserveOnly = minsRemaining > 30;

  const sortedSelectedSeat = [...selectedSeats].sort((a, b) => {
    const matchA = a.match(/([A-Za-z]+)(\d+)/);
    const matchB = b.match(/([A-Za-z]+)(\d+)/);
    if (!matchA || !matchB) return 0;
    const [, rowA, numA] = matchA;
    const [, rowB, numB] = matchB;
    if (rowA === rowB) return parseInt(numA) - parseInt(numB);
    return rowA.localeCompare(rowB);
  });

  const handleAction = async (isPurchased) => {
    if (!auth.token) {
      navigate("/login");
      return;
    }
    if (!selectedSeats.length) {
      toast.info("Please select at least one seat.");
      return;
    }

>>>>>>> Stashed changes
    setIsSubmitting(true);
    try {
      await axios.post(
        `/showtime/${id}`,
        { seats: sortedSelectedSeat, isPurchased },
<<<<<<< Updated upstream
        { headers: { Authorization: `Bearer ${auth.token}` } }
=======
        { headers: { Authorization: `Bearer ${auth.token}` } },
>>>>>>> Stashed changes
      );

      toast.success(
        isPurchased
          ? "Ticket purchased successfully!"
<<<<<<< Updated upstream
          : "Ticket booked successfully! Remember to buy before 30 min of showtime."
=======
          : "Ticket booked successfully! Remember to buy before 30 min of showtime.",
>>>>>>> Stashed changes
      );
      navigate("/ticket");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Operation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen text-slate-800 flex flex-col">
=======
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
>>>>>>> Stashed changes
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
<<<<<<< Updated upstream
          <div className="py-16 bg-white rounded-2xl shadow-xl">
=======
          <div className="py-16">
>>>>>>> Stashed changes
            <Loading />
          </div>
        ) : showtime.showtime ? (
          <div className="space-y-6">
            <ShowtimeDetails
              showtime={showtime}
              showDeleteBtn={true}
              fetchShowtime={fetchShowtime}
            />

<<<<<<< Updated upstream
            {/* 30 Minute Policy Alert */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-md">
              <ClockIcon className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-950">Ticket Booking Policy:</strong> You can reserve tickets without instant payment. However, tickets MUST be purchased/confirmed at least 30 minutes before showtime; otherwise, the reservation expires and becomes available for anyone to buy.
                {!canReserveOnly && !isPast && (
                  <span className="block mt-1 font-bold text-red-600">
                    Less than 30 minutes remaining before showtime! Reservations are closed; tickets must be purchased directly.
=======
            {/* 30 Minute Expiration Notice */}
            <div className="rounded-xl border border-amber-800/80 bg-amber-950/40 p-4 text-xs text-amber-300 flex items-center gap-3">
              <ClockIcon className="h-5 w-5 flex-shrink-0 text-amber-400" />
              <div>
                <strong className="text-amber-200">
                  Ticket Booking Policy:
                </strong>{" "}
                You can reserve tickets without instant payment. However,
                tickets MUST be purchased/confirmed at least 30 minutes before
                showtime, otherwise the reservation expires and becomes
                available for anyone to buy.
                {!canReserveOnly && !isPast && (
                  <span className="block mt-1 font-semibold text-red-400">
                    Less than 30 minutes remain before showtime! Reservations
                    are closed; tickets must be purchased directly.
>>>>>>> Stashed changes
                  </span>
                )}
              </div>
            </div>

<<<<<<< Updated upstream
            {/* Seat Plan Screen Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-block w-full max-w-md rounded-t-xl bg-gradient-to-b from-blue-600 to-indigo-700 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md">
=======
            {/* Seat Selection Container */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-md">
              <div className="text-center mb-6">
                <div className="inline-block w-full max-w-md rounded-t-xl bg-gradient-to-b from-slate-700 to-slate-800 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-300 shadow-md">
>>>>>>> Stashed changes
                  Cinema Screen
                </div>
              </div>

<<<<<<< Updated upstream
              {/* Theater Grid */}
              <div className="overflow-x-auto pb-4">
                <div className="mx-auto w-fit space-y-1">
                  <div className="flex items-center gap-1 pl-8 mb-2">
                    {colNumber.map((col) => (
                      <div key={col} className="w-7 text-center text-[10px] font-bold text-slate-400">
=======
              {/* Theater Seat Plan Grid */}
              <div className="overflow-x-auto pb-4">
                <div className="mx-auto w-fit space-y-1">
                  {/* Column numbers header */}
                  <div className="flex items-center gap-1 pl-8 mb-2">
                    {colNumber.map((col) => (
                      <div
                        key={col}
                        className="w-7 text-center text-[10px] font-bold text-slate-500"
                      >
>>>>>>> Stashed changes
                        {col}
                      </div>
                    ))}
                  </div>

<<<<<<< Updated upstream
                  {rowLetters.reverse().map((rowLetter) => (
                    <div key={rowLetter} className="flex items-center gap-1">
                      <div className="w-7 text-xs font-bold text-slate-500 text-center">{rowLetter}</div>
=======
                  {/* Seat rows */}
                  {rowLetters.reverse().map((rowLetter) => (
                    <div key={rowLetter} className="flex items-center gap-1">
                      <div className="w-7 text-xs font-bold text-slate-400 text-center">
                        {rowLetter}
                      </div>
>>>>>>> Stashed changes
                      {colNumber.map((col) => (
                        <Seat
                          key={`${rowLetter}${col}`}
                          seat={{ row: rowLetter, number: col }}
                          setSelectedSeats={setSelectedSeats}
                          selectable={!isPast}
                          isAvailable={
                            !showtime.seats?.find(
<<<<<<< Updated upstream
                              (s) => s.row === rowLetter && s.number === col
=======
                              (s) => s.row === rowLetter && s.number === col,
>>>>>>> Stashed changes
                            )
                          }
                        />
                      ))}
<<<<<<< Updated upstream
                      <div className="w-7 text-xs font-bold text-slate-500 text-center">{rowLetter}</div>
=======
                      <div className="w-7 text-xs font-bold text-slate-400 text-center">
                        {rowLetter}
                      </div>
>>>>>>> Stashed changes
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
<<<<<<< Updated upstream
              <div className="mt-6 border-t border-slate-100 pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-slate-300 bg-white shadow-sm"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-orange-600 bg-orange-500 shadow-sm"></div>
                  <span>Selected ({selectedSeats.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-slate-400 bg-slate-300"></div>
=======
              <div className="mt-6 border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-slate-700 bg-slate-900"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-red-500 bg-red-600"></div>
                  <span>Selected ({selectedSeats.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-slate-700 bg-slate-800"></div>
>>>>>>> Stashed changes
                  <span>Booked / Unavailable</span>
                </div>
              </div>

              {/* Action Bar */}
              {selectedSeats.length > 0 && (
<<<<<<< Updated upstream
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Selected Seats: </span>
                    <strong className="text-sm text-slate-900 font-mono">{sortedSelectedSeat.join(", ")}</strong>
                    <span className="text-xs text-slate-500 ml-2">({selectedSeats.length} seats)</span>
=======
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400">
                      Selected Seats:{" "}
                    </span>
                    <strong className="text-sm text-white font-mono">
                      {sortedSelectedSeat.join(", ")}
                    </strong>
                    <span className="text-xs text-slate-400 ml-2">
                      ({selectedSeats.length} seats)
                    </span>
>>>>>>> Stashed changes
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {canReserveOnly && (
                      <button
                        onClick={() => handleAction(false)}
                        disabled={isSubmitting}
<<<<<<< Updated upstream
                        className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50"
=======
                        className="flex-1 sm:flex-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
>>>>>>> Stashed changes
                      >
                        Reserve (Pay Later)
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(true)}
                      disabled={isSubmitting}
<<<<<<< Updated upstream
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      <TicketIcon className="h-4 w-4" />
                      <span>{isSubmitting ? "Processing..." : "Buy Ticket Now"}</span>
=======
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      <TicketIcon className="h-4 w-4" />
                      <span>
                        {isSubmitting ? "Processing..." : "Buy Ticket Now"}
                      </span>
>>>>>>> Stashed changes
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Booked Seats List */}
            {auth.role === "admin" && showtime.seats?.length > 0 && (
<<<<<<< Updated upstream
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Booked Seats Summary (Admin)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold uppercase text-[10px]">
=======
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-3">
                  Booked Seats Summary (Admin)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
>>>>>>> Stashed changes
                      <tr>
                        <th className="px-3 py-2">Seat</th>
                        <th className="px-3 py-2">User</th>
                        <th className="px-3 py-2">Email</th>
                      </tr>
                    </thead>
<<<<<<< Updated upstream
                    <tbody className="divide-y divide-slate-100">
                      {showtime.seats.map((st, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-mono font-bold text-slate-900">{st.row}{st.number}</td>
                          <td className="px-3 py-2">{st.user?.username || "Reserved"}</td>
                          <td className="px-3 py-2 text-slate-500">{st.user?.email || "-"}</td>
=======
                    <tbody className="divide-y divide-slate-800/50">
                      {showtime.seats.map((st, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-mono font-bold text-white">
                            {st.row}
                            {st.number}
                          </td>
                          <td className="px-3 py-2">
                            {st.user?.username || "Reserved"}
                          </td>
                          <td className="px-3 py-2 text-slate-400">
                            {st.user?.email || "-"}
                          </td>
>>>>>>> Stashed changes
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
<<<<<<< Updated upstream
          <div className="text-center py-12 text-white font-medium">Showtime details unavailable.</div>
=======
          <div className="text-center py-12 text-slate-400">
            Showtime details unavailable.
          </div>
>>>>>>> Stashed changes
        )}
      </main>
    </div>
  );
};

export default Showtime;
