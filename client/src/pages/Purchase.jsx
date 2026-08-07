import { ClockIcon, TicketIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import ShowtimeDetails from "../components/ShowtimeDetails";
import { AuthContext } from "../context/AuthContext";

const Purchase = () => {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const { id } = useParams();

  const initialState = location.state || {};
  const [showtime, setShowtime] = useState(initialState.showtime || null);
  const [selectedSeats] = useState(initialState.selectedSeats || []);
  const [loadingShowtime, setLoadingShowtime] = useState(
    !initialState.showtime && Boolean(id)
  );
  const [fetchError, setFetchError] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (!showtime && id) {
      setLoadingShowtime(true);
      setFetchError(null);

      axios
        .get(`/showtime/${id}`)
        .then((response) => {
          setShowtime(response.data?.data || null);
        })
        .catch((error) => {
          console.error(error);
          setFetchError(
            error?.response?.data?.message || "Unable to load showtime details."
          );
        })
        .finally(() => setLoadingShowtime(false));
    }
  }, [id, showtime]);

  const showtimeDate = showtime?.showtime ? new Date(showtime.showtime) : null;
  const minsRemaining = showtimeDate ? (showtimeDate.getTime() - Date.now()) / (1000 * 60) : 999;
  const canBuy = minsRemaining > 0;

  const onPurchase = async (isPurchased = true) => {
    if (!showtime || !auth?.token) return;
    const showtimeId = showtime._id || showtime.id;
    if (!showtimeId) return;

    setIsPurchasing(true);
    try {
      await axios.post(
        `/showtime/${showtimeId}`,
        { seats: selectedSeats, isPurchased },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      toast.success(isPurchased ? "Ticket purchased successfully!" : "Ticket reserved successfully!");
      navigate("/ticket");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Unable to complete transaction");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loadingShowtime) {
    return (
      <div className="min-h-screen text-slate-800 flex flex-col">
        <Navbar />
        <div className="py-16 text-center bg-white shadow-xl rounded-2xl max-w-2xl mx-auto my-12">
          <Loading />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen text-slate-800 flex flex-col">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border border-red-200 bg-white p-6 text-center text-red-600 shadow-xl">
            <p>{fetchError}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!showtime) return null;

  return (
    <div className="min-h-screen text-slate-800 flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Confirm Ticket Order</h1>

          <ShowtimeDetails showtime={showtime} />

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Order Summary</h3>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Selected Seats</span>
              <span className="font-mono font-bold text-slate-900">{selectedSeats.join(", ") || "None"}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Seats Count</span>
              <span className="font-semibold text-slate-800">{selectedSeats.length} seats</span>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center gap-3">
              <ClockIcon className="h-5 w-5 flex-shrink-0 text-amber-600" />
              <span>
                <strong>Requirement:</strong> Reserved tickets must be purchased at least 30 minutes before showtime, otherwise the reservation expires and becomes available for anyone to buy.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {minsRemaining > 30 && (
                <button
                  disabled={isPurchasing}
                  onClick={() => onPurchase(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50"
                >
                  Reserve Only (Pay Later)
                </button>
              )}
              <button
                disabled={isPurchasing || !canBuy}
                onClick={() => onPurchase(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <TicketIcon className="h-4 w-4" />
                <span>{isPurchasing ? "Processing..." : "Confirm & Buy Ticket"}</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Purchase;
