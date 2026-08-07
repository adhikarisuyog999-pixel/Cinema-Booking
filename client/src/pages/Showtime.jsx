import { ClockIcon, TicketIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { Fragment, useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
          headers: { Authorization: `Bearer ${auth.token}` },
        });
      } else {
        response = await axios.get(`/showtime/${id}`);
      }
      setShowtime(response.data.data || {});
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load showtime details");
    } finally {
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
        i <= (k === row.charCodeAt(0) || row.length === 1
          ? row.charCodeAt(row.length - 1)
          : 90);
        i++
      ) {
        const letter = k === 64 ? String.fromCharCode(i) : String.fromCharCode(k) + String.fromCharCode(i);
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
  const minsRemaining = showtimeDate
    ? (showtimeDate.getTime() - now.getTime()) / (1000 * 60)
    : 999;
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
    setIsSubmitting(true);
    try {
      await axios.post(
        `/showtime/${id}`,
        { seats: sortedSelectedSeat, isPurchased },
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );
      toast.success(
        isPurchased
          ? "Ticket purchased successfully!"
          : "Ticket booked successfully! Remember to buy before 30 min of showtime.",
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
    <div className="min-h-screen bg-white text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="py-16 text-center">
            <Loading />
          </div>
        ) : showtime.showtime ? (
          <div className="space-y-6">
            <ShowtimeDetails
              showtime={showtime}
              showDeleteBtn={true}
              fetchShowtime={fetchShowtime}
            />

            {/* Policy Alert */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center gap-3 shadow-md">
              <ClockIcon className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <div>
                <strong>Ticket Booking Policy:</strong> You can reserve tickets without instant payment, but they must be purchased at least 30 minutes before the showtime; otherwise the reservation expires and becomes available for anyone.
                { !canReserveOnly && !isPast && (
                  <span className="block mt-1 font-semibold text-red-600">
                    Less than 30 minutes remaining – reservations closed; please buy directly.
                  </span>
                )}
              </div>
            </div>

            {/* Seat Selection */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-block w-full max-w-md rounded-t-xl bg-gradient-to-b from-slate-300 to-slate-400 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-700 shadow-md">
                  Cinema Screen
                </div>
              </div>

              <div className="overflow-x-auto pb-4">
                <div className="mx-auto w-fit space-y-1">
                  {/* Column Header */}
                  <div className="flex items-center gap-1 pl-8 mb-2">
                    {colNumber.map((col) => (
                      <div key={col} className="w-7 text-center text-[10px] font-bold text-slate-600">
                        {col}
                      </div>
                    ))}
                  </div>
                  {/* Seat Rows */}
                  {[...rowLetters].reverse().map((rowLetter) => (
                    <div key={rowLetter} className="flex items-center gap-1">
                      <div className="w-7 text-xs font-bold text-slate-600 text-center">{rowLetter}</div>
                      {colNumber.map((col) => (
                        <Seat
                          key={`${rowLetter}${col}`}
                          seat={{ row: rowLetter, number: col }}
                          setSelectedSeats={setSelectedSeats}
                          selectable={!isPast}
                          isAvailable={!showtime.seats?.find((s) => s.row === rowLetter && s.number === col)}
                        />
                      ))}
                      <div className="w-7 text-xs font-bold text-slate-600 text-center">{rowLetter}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 border-t border-slate-200 pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-slate-400 bg-white"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-orange-600 bg-orange-500"></div>
                  <span>Selected ({selectedSeats.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-slate-600 bg-slate-700"></div>
                  <span>Booked / Unavailable</span>
                </div>
              </div>

              {/* Action Bar */}
              {selectedSeats.length > 0 && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-600">Selected Seats: </span>
                    <strong className="text-sm text-slate-900 font-mono">{sortedSelectedSeat.join(", ")}</strong>
                    <span className="text-xs text-slate-600 ml-2">({selectedSeats.length} seats)</span>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {canReserveOnly && (
                      <button
                        onClick={() => handleAction(false)}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                      >
                        Reserve (Pay Later)
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(true)}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                      <TicketIcon className="h-4 w-4" />
                      <span>{isSubmitting ? "Processing..." : "Buy Ticket Now"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Booked Seats List */}
            {auth.role === "admin" && showtime.seats?.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Booked Seats Summary (Admin)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Seat</th>
                        <th className="px-3 py-2">User</th>
                        <th className="px-3 py-2">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {showtime.seats.map((st, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-mono font-bold text-slate-900">{st.row}{st.number}</td>
                          <td className="px-3 py-2">{st.user?.username || "Reserved"}</td>
                          <td className="px-3 py-2 text-slate-500">{st.user?.email || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-600">Showtime details unavailable.</div>
        )}
      </main>
    </div>
  );
};

export default Showtime;
