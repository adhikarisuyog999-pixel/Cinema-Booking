import {
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  EyeSlashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDraggable } from "react-use-draggable-scroll";
import { AuthContext } from "../context/AuthContext";

const safeShowtimeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const getLength = (showtime) => {
  return Number(showtime?.movie?.length) || 90;
};

const getRowStart = (showtime) => {
  const date = safeShowtimeDate(showtime);
  if (!date) return 1;
  const hour = date.getHours();
  const min = date.getMinutes();
  return Math.round((60 * hour + min) / 5);
};

const getRowSpan = (length) => {
  return Math.max(1, Math.round(length / 5));
};

const rowToNumber = (column) => {
  if (!column) return 0;
  let result = 0;
  for (let i = 0; i < column.length; i++) {
    const charCode = column.charCodeAt(i) - 64;
    result = result * 26 + charCode;
  }
  return result;
};

const ScheduleTable = ({ cinema, selectedDate }) => {
  const ref = useRef(null);
  const { auth } = useContext(AuthContext);
  const { events } = useDraggable(ref);
  const navigate = useNavigate();

  const getTodayShowtimes = (theater) => {
    return (theater?.showtimes || []).filter((showtime) => {
      const date = safeShowtimeDate(showtime?.showtime);
      return date && showtime?.movie && isSameDay(date, selectedDate);
    });
  };

  const getRowStartRange = () => {
    let firstRowStart = Infinity;
    let lastRowEnd = 0;
    let showtimeCount = 0;

    (cinema?.theaters || []).forEach((theater) => {
      (theater?.showtimes || []).forEach((showtime) => {
        const date = safeShowtimeDate(showtime?.showtime);
        if (!date || !showtime?.movie) return;

        const rowStart = getRowStart(showtime.showtime);
        const rowSpan = getRowSpan(getLength(showtime));
        firstRowStart = Math.min(firstRowStart, rowStart);
        lastRowEnd = Math.max(lastRowEnd, rowStart + rowSpan);
        showtimeCount += 1;
      });
    });

    if (firstRowStart === Infinity) firstRowStart = 1;
    return [firstRowStart, lastRowEnd, showtimeCount];
  };

  const [firstRowStart, lastRowEnd, showtimeCount] = getRowStartRange();
  const gridRows = Math.max(1, lastRowEnd - firstRowStart);
  const shiftStart = 3;
  const shiftEnd = 2;
  const theaterCount = (cinema?.theaters || []).length || 1;

  const isPast = (date) => {
    const showtimeDate = safeShowtimeDate(date);
    return showtimeDate ? showtimeDate < new Date() : true;
  };

  return (
    <div
      ref={ref}
      {...events}
      className="grid min-h-[50vh] max-h-screen overflow-x-auto rounded-md bg-gradient-to-br from-indigo-100 to-white"
      style={{
        gridTemplateColumns: `repeat(${theaterCount}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridRows + shiftEnd}, minmax(0, auto))`,
      }}
    >
      {(cinema?.theaters || []).map((theater, theaterIndex) => {
        return getTodayShowtimes(theater).map((showtime, showtimeIndex) => {
          const rowStart =
            getRowStart(showtime.showtime) - firstRowStart + shiftStart;
          const rowSpan = getRowSpan(getLength(showtime));
          const timeStart = safeShowtimeDate(showtime.showtime);
          const endTime = timeStart
            ? new Date(timeStart.getTime() + getLength(showtime) * 60000)
            : null;
          const timeLabel = timeStart
            ? `${timeStart.getHours().toString().padStart(2, "0")} : ${timeStart
                .getMinutes()
                .toString()
                .padStart(2, "0")} - ${endTime
                .getHours()
                .toString()
                .padStart(2, "0")} : ${endTime
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
            : "Unknown";

          return (
            <button
              type="button"
              title={`${showtime.movie.name}\n${timeLabel}`}
              key={`${theaterIndex}-${showtimeIndex}`}
              style={{
                gridColumnStart: theater.number || theaterIndex + 1,
                gridRowStart: rowStart,
                gridRowEnd: rowStart + rowSpan,
              }}
              className={`flex flex-col items-center overflow-hidden rounded p-1 text-center drop-shadow-md ${
                !isPast(showtime.showtime)
                  ? "bg-white hover:bg-gray-100"
                  : `bg-gray-200 ${
                      auth.role === "admin"
                        ? "hover:bg-gray-300"
                        : "cursor-not-allowed"
                    }`
              } ${
                !showtime.isRelease ? "ring-2 ring-inset ring-gray-800" : ""
              }`}
              onClick={() => {
                if (!isPast(showtime.showtime) || auth.role === "admin") {
                  navigate(`/showtime/${showtime._id}`);
                }
              }}
            >
              {!showtime.isRelease && (
                <EyeSlashIcon
                  className="mx-auto h-5 w-5 stroke-2"
                  title="Unreleased showtime"
                />
              )}
              <p className="text-sm font-bold">{showtime.movie.name}</p>
              <p className="text-sm leading-3">{timeLabel}</p>
            </button>
          );
        });
      })}

      {showtimeCount === 0 && (
        <div className="col-span-full row-start-3 flex items-center justify-center text-xl font-semibold text-gray-700">
          There are no showtimes available
        </div>
      )}

      {(cinema?.theaters || []).map((theater, index) => (
        <div
          key={index}
          className="sticky top-0 row-span-1 row-start-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700 py-1 text-white"
        >
          <p className="text-2xl font-semibold leading-7">{index + 1}</p>
          {auth.role === "admin" && (
            <>
              <div className="flex gap-1 text-xs">
                <p className="flex items-center gap-1">
                  <ArrowsUpDownIcon className="h-3 w-3" />
                  {theater?.seatPlan?.row || "A"}
                </p>
                <p className="flex items-center gap-1">
                  <ArrowsRightLeftIcon className="h-3 w-3" />
                  {theater?.seatPlan?.column || 1}
                </p>
              </div>
              <p className="flex items-center gap-1 text-sm">
                <UserIcon className="h-4 w-4" />
                {(
                  rowToNumber(theater?.seatPlan?.row || "A") *
                  (theater?.seatPlan?.column || 1)
                ).toLocaleString("en-US")}{" "}
                Seats
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScheduleTable;
