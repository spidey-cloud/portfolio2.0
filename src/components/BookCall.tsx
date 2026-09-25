import { useState, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  Video,
  Globe,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  Mail,
  MessageSquare,
} from "lucide-react";
import { trackActivity } from "../lib/storage";
import {
  validateShortText,
  validateEmail,
  validateLongText,
  sanitizeText,
} from "../lib/validate";

export default function BookCall() {
  const today = new Date();

  // 1. Dynamic Date State initialization
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<number>(() => today.getDate());
  const [use24h, setUse24h] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState<boolean>(false);
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({ name: "", email: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Check if viewing the current month & year
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  // 2. Dynamic Calendar calculations
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const timeSlots = [
    { id: "1", time12: "10:00 AM", time24: "10:00", hours: 10, minutes: 0 },
    { id: "2", time12: "11:30 AM", time24: "11:30", hours: 11, minutes: 30 },
    { id: "3", time12: "02:00 PM", time24: "14:00", hours: 14, minutes: 0 },
    { id: "4", time12: "03:30 PM", time24: "15:30", hours: 15, minutes: 30 },
    { id: "5", time12: "05:00 PM", time24: "17:00", hours: 17, minutes: 0 },
  ];

  // Helper: Check if a given day in the current month is before today
  const isDateInPast = (day: number) => {
    const checkDate = new Date(year, month, day, 23, 59, 59, 999);
    return checkDate.getTime() < today.getTime();
  };

  // Helper: Check if a specific time slot on the selected date is in the past
  const isTimeSlotInPast = (hours: number, minutes: number) => {
    const slotDate = new Date(year, month, selectedDate, hours, minutes);
    return slotDate.getTime() <= today.getTime();
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (isCurrentMonth) return; // Prevent navigating to past months
    const prevDate = new Date(year, month - 1, 1);
    setCurrentDate(prevDate);

    // Default selection logic for new month
    if (prevDate.getFullYear() === today.getFullYear() && prevDate.getMonth() === today.getMonth()) {
      setSelectedDate(today.getDate());
    } else {
      setSelectedDate(1);
    }
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month + 1, 1);
    setCurrentDate(nextDate);

    if (nextDate.getFullYear() === today.getFullYear() && nextDate.getMonth() === today.getMonth()) {
      setSelectedDate(today.getDate());
    } else {
      setSelectedDate(1);
    }
    setSelectedTime(null);
  };

  const handleDateClick = (day: number) => {
    if (isDateInPast(day)) return;
    setSelectedDate(day);
    setSelectedTime(null);
  };

  const handleTimeClick = (time: string, isPast: boolean) => {
    if (isPast) return;
    setSelectedTime(time);
    trackActivity(
      "book_call_attempt",
      `Selected slot ${time} for ${monthName} ${selectedDate}, ${year}`,
    );
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const limits: Record<string, number> = { name: 80, email: 100, notes: 400 };
    const limited = value.slice(0, limits[name] ?? 200);
    setBookingDetails((prev) => ({ ...prev, [name]: limited }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBookMeeting = (e: FormEvent) => {
    e.preventDefault();
    const errors = { name: "", email: "" };

    const nameV = validateShortText(bookingDetails.name);
    const emailV = validateEmail(bookingDetails.email);
    const notesV = validateLongText(bookingDetails.notes);

    if (!nameV.ok) errors.name = nameV.error;
    if (!emailV.ok) errors.email = emailV.error;

    if (!nameV.ok || !emailV.ok) {
      setFormErrors(errors);
      return;
    }

    const safeNotes = notesV.ok
      ? notesV.value
      : sanitizeText(bookingDetails.notes).slice(0, 400);

    setIsBookingConfirmed(true);
    trackActivity(
      "book_call_success",
      `Meeting booked by ${nameV.value} (${emailV.value}) for ${getSelectedDayString()} @ ${selectedTime}${safeNotes ? ` — ${safeNotes.slice(0, 80)}` : ""}`,
    );
  };

  const handleResetBooking = () => {
    setSelectedTime(null);
    setIsBookingConfirmed(false);
    setBookingDetails({ name: "", email: "", notes: "" });
  };

  const getSelectedDayString = () => {
    const targetDate = new Date(year, month, selectedDate);
    const dayName = targetDate.toLocaleString("default", { weekday: "short" });
    return `${dayName} ${selectedDate.toString().padStart(2, "0")}`;
  };

  return (
    <section
      id="book-a-call"
      className="relative w-full py-[160px] bg-[#0B0B12] px-6 md:px-12 overflow-hidden border-b border-white/5"
    >
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center space-y-6 mb-16">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-[#F4EEE8] font-black tracking-[-0.03em] uppercase leading-none text-4xl sm:text-5xl md:text-6xl"
          >
            CONNECT WITH ME.
          </motion.h2>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[#A8A8B0] text-base md:text-lg font-light max-w-[750px] mx-auto leading-relaxed"
          >
            I am available for freelance work and full-time opportunities. Book
            a strategy call to discuss next big idea.
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full max-w-[1100px] mx-auto bg-[#171721] rounded-3xl border border-white/5 shadow-2xl p-6 md:p-10 overflow-hidden relative"
        >
          <AnimatePresence mode="wait">
            {!isBookingConfirmed ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Panel: Event Info */}
                <div className="lg:col-span-4 lg:border-r lg:border-white/5 lg:pr-10 space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <span className="text-purple-400 text-xs font-black">
                          RKD
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[#F4EEE8] font-bold text-sm tracking-wide">
                          ROHON KUMAR DUTTA
                        </h4>
                        <p className="text-[#A3A3AA] text-[11px] font-light">
                          Web development
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-[#F4EEE8] tracking-tight leading-tight">
                      30 Minute Strategy Call
                    </h3>

                    <div className="space-y-3.5 text-xs text-[#A8A8B0] font-light">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>30m</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Video className="w-4 h-4 text-purple-400" />
                        <span>Cal Video (Google Meet)</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span>Asia/Kolkata GMT+05:30</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-white/20 uppercase tracking-widest pt-4 lg:pt-0">
                    Cal.com Mockup
                  </div>
                </div>

                {/* Middle Panel: Calendar */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#F4EEE8] font-bold text-sm tracking-wide">
                      {monthName} {year}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevMonth}
                        disabled={isCurrentMonth}
                        className={`w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all ${isCurrentMonth
                            ? "opacity-20 cursor-not-allowed text-white/20"
                            : "hover:border-white/20 text-[#A8A8B0] hover:text-[#F4EEE8] cursor-pointer"
                          }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="w-8 h-8 rounded-full border border-white/5 hover:border-white/20 flex items-center justify-center text-[#A8A8B0] hover:text-[#F4EEE8] cursor-pointer transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekdays */}
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {weekDays.map((d) => (
                      <span
                        key={d}
                        className="text-[10px] text-white/30 font-bold tracking-wider"
                      >
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`blank-${i}`} className="aspect-square" />
                    ))}

                    {daysArray.map((day) => {
                      const isSelected = selectedDate === day;
                      const disabled = isDateInPast(day);

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          disabled={disabled}
                          className={`aspect-square rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 relative ${disabled
                              ? "text-white/10 opacity-30 cursor-not-allowed line-through"
                              : isSelected
                                ? "bg-[#F4EEE8] text-[#0B0B12] cursor-pointer"
                                : "text-[#F4EEE8] hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer"
                            }`}
                        >
                          {day}
                          {!disabled && (
                            <span
                              className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? "bg-purple-600" : "bg-emerald-400"
                                }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Panel: Time slots & booking panel */}
                <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[#F4EEE8] font-bold text-sm uppercase tracking-wider">
                        {getSelectedDayString()}
                      </h4>
                      <button
                        onClick={() => setUse24h(!use24h)}
                        className="text-[10px] text-[#A8A8B0] border border-white/10 px-2.5 py-1 rounded-full cursor-pointer hover:border-white/30 transition-all"
                      >
                        {use24h ? "24h" : "12h"}
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {!selectedTime ? (
                        <motion.div
                          key="times-list"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide"
                        >
                          {timeSlots.map((slot) => {
                            const isPast = isTimeSlotInPast(
                              slot.hours,
                              slot.minutes,
                            );
                            const displayTime = use24h
                              ? slot.time24
                              : slot.time12;

                            return (
                              <button
                                key={slot.id}
                                disabled={isPast}
                                onClick={() =>
                                  handleTimeClick(displayTime, isPast)
                                }
                                className={`w-full text-center py-3 rounded-xl border text-xs font-semibold tracking-wider transition-all duration-300 ${isPast
                                    ? "bg-[#20242F]/10 border-white/5 text-white/20 opacity-40 cursor-not-allowed line-through"
                                    : "border-white/5 bg-[#20242F]/30 hover:bg-[#20242F]/80 text-[#F4EEE8] cursor-pointer hover:border-white/20"
                                  }`}
                              >
                                {displayTime} {isPast && "(Passed)"}
                              </button>
                            );
                          })}
                        </motion.div>
                      ) : (
                        <motion.form
                          key="booking-form"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onSubmit={handleBookMeeting}
                          className="space-y-4"
                        >
                          <div className="text-xs text-[#A8A8B0] flex items-center gap-2 pb-2 border-b border-white/5">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span>Booking for {selectedTime}</span>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[#A8A8B0] font-bold tracking-wider uppercase flex items-center gap-1.5">
                              <User className="w-3 h-3 text-purple-400" /> Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={bookingDetails.name}
                              onChange={handleInputChange}
                              placeholder="Your full name"
                              className="w-full bg-[#20242F]/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400 transition-all"
                            />
                            {formErrors.name && (
                              <p className="text-rose-400 text-[10px] font-medium">
                                {formErrors.name}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[#A8A8B0] font-bold tracking-wider uppercase flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-purple-400" /> Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={bookingDetails.email}
                              onChange={handleInputChange}
                              placeholder="you@example.com"
                              className="w-full bg-[#20242F]/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400 transition-all"
                            />
                            {formErrors.email && (
                              <p className="text-rose-400 text-[10px] font-medium">
                                {formErrors.email}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-[#A8A8B0] font-bold tracking-wider uppercase flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3 text-purple-400" />{" "}
                              Notes
                            </label>
                            <textarea
                              name="notes"
                              value={bookingDetails.notes}
                              onChange={handleInputChange}
                              placeholder="Any details to share?"
                              rows={2}
                              className="w-full bg-[#20242F]/60 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#F4EEE8] outline-none focus:border-purple-400 transition-all resize-none"
                            />
                          </div>

                          <div className="flex items-center gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => setSelectedTime(null)}
                              className="w-1/3 text-center py-2.5 rounded-xl border border-white/5 text-[#A8A8B0] text-xs hover:border-white/15 transition-all cursor-pointer"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              className="w-2/3 text-center py-2.5 rounded-xl bg-[#F4EEE8] text-[#0B0B12] text-xs font-bold hover:bg-white transition-all cursor-pointer shadow-lg shadow-purple-500/10"
                            >
                              Confirm
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#F4EEE8] uppercase tracking-tight">
                    Booking Confirmed!
                  </h3>
                  <p className="text-sm text-[#A8A8B0] max-w-[450px] mx-auto font-light leading-relaxed">
                    Thank you{" "}
                    <strong className="text-[#F4EEE8] font-semibold">
                      {bookingDetails.name}
                    </strong>
                    , your meeting has been successfully booked for{" "}
                    <strong className="text-[#F4EEE8] font-semibold">
                      {getSelectedDayString()} {monthName} @ {selectedTime}
                    </strong>
                    . A calendar invite has been sent to{" "}
                    <strong className="text-[#F4EEE8] font-semibold">
                      {bookingDetails.email}
                    </strong>
                    .
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#20242F]/60 border border-white/5 flex flex-col space-y-2.5 text-xs text-[#A3A3AA] min-w-[280px]">
                  <div className="flex justify-between">
                    <span>Meeting Type:</span>
                    <span className="text-[#F4EEE8]">
                      30 Minute Strategy Call
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform:</span>
                    <span className="text-[#F4EEE8]">Google Meet</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400">Scheduled</span>
                  </div>
                </div>

                <button
                  onClick={handleResetBooking}
                  className="px-6 py-3 rounded-full border border-white/10 text-[#F4EEE8] hover:border-[#F4EEE8] transition-all text-xs font-semibold tracking-wider uppercase cursor-pointer"
                >
                  Schedule Another Meeting
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}