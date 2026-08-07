import { ClockIcon, TicketIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import ShowtimeDetails from "../components/ShowtimeDetails";
import { AuthContext } from "../context/AuthContext";

const Tickets = () => {
  const { auth } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/auth/tickets", {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });
      const ticketData = response.data?.data?.tickets || [];
      setTickets(
        ticketData.sort((a, b) => {
          if (!a.showtime?.showtime || !b.showtime?.showtime) return 0;
          return new Date(a.showtime.showtime) - new Date(b.showtime.showtime);
        })
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-6 text-white">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">My Cinema Tickets</h1>
            <p className="text-xs text-blue-100 mt-1">View and manage your reserved and purchased tickets</p>
          </div>
          <span className="rounded-lg bg-white/20 border border-white/30 px-3.5 py-1.5 text-xs text-white shadow-sm font-semibold">
            Total Tickets: {tickets.length}
=======
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">My Cinema Tickets</h1>
            <p className="text-xs text-slate-400 mt-1">View and manage your reserved and purchased tickets</p>
          </div>
          <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
            Total Tickets: <strong className="text-white">{tickets.length}</strong>
>>>>>>> Stashed changes
          </span>
        </div>

        {/* Policy alert */}
<<<<<<< Updated upstream
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center gap-3 mb-6 shadow-md">
          <ClockIcon className="h-5 w-5 flex-shrink-0 text-amber-600" />
          <span>
            <strong>Reminder:</strong> Unpurchased reservations MUST be bought at least 30 minutes before showtime; otherwise, the system releases them for anyone to buy.
=======
        <div className="rounded-xl border border-amber-800/80 bg-amber-950/40 p-4 text-xs text-amber-300 flex items-center gap-3 mb-6">
          <ClockIcon className="h-5 w-5 flex-shrink-0 text-amber-400" />
          <span>
            <strong>Reminder:</strong> Unpurchased reservations MUST be bought at least 30 minutes before showtime, otherwise the system releases them for anyone to buy.
>>>>>>> Stashed changes
          </span>
        </div>

        {loading ? (
<<<<<<< Updated upstream
          <div className="py-16 bg-white rounded-2xl shadow-xl">
            <Loading />
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-xl">
            <TicketIcon className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium">You haven't reserved or purchased any tickets yet.</p>
=======
          <div className="py-16">
            <Loading />
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
            <TicketIcon className="h-10 w-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm">You haven't reserved or purchased any tickets yet.</p>
>>>>>>> Stashed changes
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {tickets.map((ticket, index) => {
              const showtimeDate = ticket.showtime?.showtime
                ? new Date(ticket.showtime.showtime)
                : null;
              const now = new Date();
              const minsRemaining = showtimeDate
                ? (showtimeDate.getTime() - now.getTime()) / (1000 * 60)
                : 999;
              const isExpired = minsRemaining <= 30 && ticket.status !== "purchased";

              return (
                <div
                  key={index}
<<<<<<< Updated upstream
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500">Ticket #{index + 1}</span>
                    {ticket.status === "purchased" ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                        Purchased
                      </span>
                    ) : isExpired ? (
                      <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-700 uppercase">
                        Expired / Released
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
=======
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-400">Ticket #{index + 1}</span>
                    {ticket.status === "purchased" ? (
                      <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                        Purchased
                      </span>
                    ) : isExpired ? (
                      <span className="rounded-full bg-red-950 border border-red-800 px-2.5 py-0.5 text-[10px] font-bold text-red-400 uppercase">
                        Expired / Released
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-950 border border-amber-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
>>>>>>> Stashed changes
                        Reserved (Pending Payment)
                      </span>
                    )}
                  </div>

                  {ticket.showtime && (
                    <ShowtimeDetails showtime={ticket.showtime} />
                  )}

<<<<<<< Updated upstream
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Seats: </span>
                      <strong className="text-slate-900 font-mono font-bold">
                        {ticket.seats?.map((seat) => `${seat.row}${seat.number}`).join(", ")}
                      </strong>
                    </div>
                    <span className="text-slate-500 font-medium">({ticket.seats?.length || 0} seats)</span>
=======
                  <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Seats: </span>
                      <strong className="text-white font-mono font-bold">
                        {ticket.seats?.map((seat) => `${seat.row}${seat.number}`).join(", ")}
                      </strong>
                    </div>
                    <span className="text-slate-400">({ticket.seats?.length || 0} seats)</span>
>>>>>>> Stashed changes
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tickets;
