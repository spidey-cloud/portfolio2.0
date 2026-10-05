import { useState, ChangeEvent, FormEvent, useEffect } from "react";
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
  ExternalLink,
  Loader2,
} from "lucide-react";
import { trackActivity } from "../lib/storage";
import {
  validateShortText,
  validateEmail,
  validateLongText,
  sanitizeText,
} from "../lib/validate";

// Backend URL — falls back to same-origin if env not set
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Time slots definition ───────────────────────────────────────────────────
const TIME_SLOTS = [
  { id: "1", time12: "10:00 AM", time24: "10:00", hours: 10, minutes: 0 },
  { id: "2", time12: "11:30 AM", time24: "11:30", hours: 11, minutes: 30 },
  { id: "3", time12: "02:00 PM", time24: "14:00", hours: 14, minutes: 0 },
  { id: "4", time12: "03:30 PM", time24: "15:30", hours: 15, minutes: 30 },
  { id: "5", time12: "05:00 PM", time24: "17:00", hours: 17, minutes: 0 },
];

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function BookCall() {
  // ── Real today reference (never mutated) ──────────────────────────────────
  const [today] = useState(() => new Date());

  // ── Calendar navigation state ─────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<number>(() => today.getDate());
  const [use24h, setUse24h] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // ── Booking form state ────────────────────────────────────────────────────
  const [bookingDetails, setBookingDetails] = useState({ name: "", email: "", notes: "" });
  const [formErrors, setFormErrors] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [calendarLink, setCalendarLink] = useState("");
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<{date: string, time: string}[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/availability`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBookedSlots(data);
      })
      .catch(console.error);
  }, []);

  // ── Derived calendar values ───────────────────────────────────────────────
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName      = currentDate.toLocaleString("default", { month: "long" });
  const totalDays      = new Date(year, month + 1, 0).getDate();
  const daysArray      = Array.from({ length: totalDays }, (_, i) => i + 1);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  // ── Past-date helpers ─────────────────────────────────────────────────────
  const isDatePast = (day: number): boolean => {
    // A day is past if it's strictly before today's date (end of that day < now)
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
    return endOfDay < today;
  };

  const isTimePast = (hours: number, minutes: number): boolean => {
    const slotDate = new Date(year, month, selectedDate, hours, minutes);
    return slotDate <= today;
  };

  const isTimeBooked = (hours: number, minutes: number): boolean => {
    const slotDate = new Date(year, month, selectedDate, hours, minutes);
    return bookedSlots.some(b => {
      const bDate = new Date(b.date);
      return bDate.getTime() === slotDate.getTime();
    });
  };

  // ── Month navigation ──────────────────────────────────────────────────────
  const handlePrevMonth = () => {
    if (isCurrentMonth) return;
    const prev = new Date(year, month - 1, 1);
    setCurrentDate(prev);
    const isNowCurrentMonth =
      prev.getFullYear() === today.getFullYear() &&
      prev.getMonth() === today.getMonth();
    setSelectedDate(isNowCurrentMonth ? today.getDate() : 1);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    setCurrentDate(next);
    const isNowCurrentMonth =
      next.getFullYear() === today.getFullYear() &&
      next.getMonth() === today.getMonth();
    setSelectedDate(isNowCurrentMonth ? today.getDate() : 1);
    setSelectedTime(null);
  };

  // ── Date / time selection ─────────────────────────────────────────────────
  const handleDateClick = (day: number) => {
    if (isDatePast(day)) return;
    setSelectedDate(day);
    setSelectedTime(null);
  };

  const handleTimeClick = (slot: typeof TIME_SLOTS[0]) => {
    if (isTimePast(slot.hours, slot.minutes)) return;
    const display = use24h ? slot.time24 : slot.time12;
    setSelectedTime(display);
    trackActivity(
      "book_call_attempt",
      `Selected slot ${display} for ${monthName} ${selectedDate}, ${year}`,
    );
  };

  // ── Form ──────────────────────────────────────────────────────────────────
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const limits: Record<string, number> = { name: 80, email: 100, notes: 400 };
    setBookingDetails(prev => ({ ...prev, [name]: value.slice(0, limits[name] ?? 200) }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const handleBookMeeting = async (e: FormEvent) => {
    e.preventDefault();
    const errors = { name: "", email: "" };
    const nameV  = validateShortText(bookingDetails.name);
    const emailV = validateEmail(bookingDetails.email);
    const notesV = validateLongText(bookingDetails.notes);
    if (!nameV.ok)  errors.name  = nameV.error;
    if (!emailV.ok) errors.email = emailV.error;
    if (!nameV.ok || !emailV.ok) { setFormErrors(errors); return; }

    const safeNotes = notesV.ok
      ? notesV.value
      : sanitizeText(bookingDetails.notes).slice(0, 400);

    // Build ISO date string for the selected slot in IST
    // IST = UTC+5:30, so subtract 5h30m to get UTC equivalent
    const slotHours   = TIME_SLOTS.find(s => (use24h ? s.time24 : s.time12) === selectedTime)?.hours ?? 10;
    const slotMinutes = TIME_SLOTS.find(s => (use24h ? s.time24 : s.time12) === selectedTime)?.minutes ?? 0;
    // Create as local time (server treats as IST context)
    const bookingDateISO = new Date(year, month, selectedDate, slotHours, slotMinutes).toISOString();

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`${API_BASE}/api/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:  nameV.value,
          email: emailV.value,
          notes: safeNotes,
          date:  bookingDateISO,
          time:  selectedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data?.errors?.join(", ") || "Booking failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success
      if (data.calendarLink) setCalendarLink(data.calendarLink);
      setIsBookingConfirmed(true);
      trackActivity(
        "book_call_success",
        `Meeting booked by ${nameV.value} (${emailV.value}) for ${getSelectedDayString()} @ ${selectedTime}`,
      );
    } catch {
      setSubmitError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setSelectedTime(null);
    setIsBookingConfirmed(false);
    setCalendarLink("");
    setSubmitError("");
    setBookingDetails({ name: "", email: "", notes: "" });
  };

  const getSelectedDayString = () => {
    const d = new Date(year, month, selectedDate);
    return `${d.toLocaleString("default", { weekday: "short" })} ${String(selectedDate).padStart(2, "0")}`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      id="book-a-call"
      className="relative w-full py-[160px] bg-[#0B0B12] px-6 md:px-12 overflow-hidden border-b border-white/5"
    >
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
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
            a strategy call to discuss your next big idea.
          </motion.p>
        </div>

        {/* Calendar Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full max-w-[1100px] mx-auto bg-[#171721] rounded-3xl border border-white/5 shadow-2xl p-6 md:p-10 overflow-hidden relative"
        >
          <AnimatePresence mode="wait">

            {/* ── Booking Form ── */}
            {!isBookingConfirmed && (
              <motion.div
                key="booking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
              >
                {/* Left: Event info */}
                <div className="lg:col-span-4 lg:border-r lg:border-white/5 lg:pr-10 space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <span className="text-purple-400 text-xs font-black">RKD</span>
                      </div>
                      <div>
                        <h4 className="text-[#F4EEE8] font-bold text-sm tracking-wide">ROHON KUMAR DUTTA</h4>
                        <p className="text-[#A3A3AA] text-[11px] font-light">Web developer</p>
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-[#F4EEE8] tracking-tight leading-tight">
                      30 Minute Strategy Call
                    </h3>
                    <div className="space-y-3.5 text-xs text-[#A8A8B0] font-light">
                      <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-purple-400" /><span>30m</span></div>
                      <div className="flex items-center gap-2.5"><Video className="w-4 h-4 text-purple-400" /><span>Cal Video (Google Meet)</span></div>
                      <div className="flex items-center gap-2.5"><Globe className="w-4 h-4 text-purple-400" /><span>Asia/Kolkata GMT+05:30</span></div>
                    </div>
                  </div>
                  <div className="text-[10px] text-white/20 uppercase tracking-widest pt-4 lg:pt-0">
                    Cal.com Mockup
                  </div>
                </div>

                {/* Middle: Calendar */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Month nav */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#F4EEE8] font-bold text-sm tracking-wide">
                      {monthName} {year}
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevMonth}
                        disabled={isCurrentMonth}
                        className={`w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all ${
                          isCurrentMonth
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

                  {/* Weekday labels */}
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {WEEK_DAYS.map(d => (
                      <span key={d} className="text-[10px] text-white/30 font-bold tracking-wider">{d}</span>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`blank-${i}`} className="aspect-square" />
                    ))}
                    {daysArray.map(day => {
                      const isPast     = isDatePast(day);
                      const isSelected = selectedDate === day && !isPast;
                      const isToday    = isCurrentMonth && day === today.getDate();

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          disabled={isPast}
                          title={isPast ? "Date passed" : undefined}
                          className={`
                            aspect-square rounded-full flex items-center justify-center text-xs font-semibold
                            transition-all duration-200 relative select-none
                            ${isPast
                              ? "text-white/20 cursor-not-allowed"
                              : isSelected
                                ? "bg-[#F4EEE8] text-[#0B0B12] cursor-pointer shadow-lg"
                                : isToday
                                  ? "border border-purple-400/60 text-[#F4EEE8] hover:bg-white/5 cursor-pointer"
                                  : "text-[#F4EEE8] hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer"
                            }
                          `}
                        >
                          {day}
                          {/* Availability dot — only on future/today dates */}
                          {!isPast && (
                            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${
                              isSelected ? "bg-purple-600" : "bg-emerald-400"
                            }`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Time slots + booking form */}
                <div className="lg:col-span-3 space-y-4 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#F4EEE8] font-bold text-sm uppercase tracking-wider">
                      {getSelectedDayString()}
                    </h4>
                    <button
                      onClick={() => setUse24h(h => !h)}
                      className="text-[10px] text-[#A8A8B0] border border-white/10 px-2.5 py-1 rounded-full cursor-pointer hover:border-white/30 transition-all"
                    >
                      {use24h ? "24h" : "12h"}
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {!selectedTime ? (
                      /* Time slot list */
                      <motion.div
                        key="times"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-2.5 flex-1"
                      >
                        {TIME_SLOTS.map(slot => {
                          const past        = isTimePast(slot.hours, slot.minutes);
                          const booked      = isTimeBooked(slot.hours, slot.minutes);
                          const disabled    = past || booked;
                          const displayTime = use24h ? slot.time24 : slot.time12;
                          return (
                            <button
                              key={slot.id}
                              disabled={disabled}
                              onClick={() => handleTimeClick(slot)}
                              className={`
                                w-full text-center py-3 rounded-xl border text-xs font-semibold
                                tracking-wider transition-all duration-200
                                ${disabled
                                  ? "border-white/5 bg-transparent text-white/25 cursor-not-allowed"
                                  : "border-white/5 bg-[#20242F]/30 hover:bg-[#20242F]/80 text-[#F4EEE8] cursor-pointer hover:border-white/20"
                                }
                              `}
                            >
                              {displayTime}
                              {disabled && (
                                <span className="ml-2 text-[10px] text-white/20 font-normal normal-case tracking-normal">
                                  {booked ? "(Booked)" : "(Passed)"}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    ) : (
                      /* Booking form */
                      <motion.form
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleBookMeeting}
                        className="space-y-3 flex-1"
                      >
                        <div className="text-xs text-[#A8A8B0] flex items-center gap-2 pb-2 border-b border-white/5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Booking for {selectedTime}</span>
                        </div>

                        {/* Name */}
                        <div className="space-y-1">
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
                          {formErrors.name && <p className="text-rose-400 text-[10px]">{formErrors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
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
                          {formErrors.email && <p className="text-rose-400 text-[10px]">{formErrors.email}</p>}
                        </div>

                        {/* Notes */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-[#A8A8B0] font-bold tracking-wider uppercase flex items-center gap-1.5">
                            <MessageSquare className="w-3 h-3 text-purple-400" /> Notes
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

                        {/* Server error */}
                        {submitError && (
                          <p className="text-rose-400 text-[10px] font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                            {submitError}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setSelectedTime(null)}
                            disabled={isSubmitting}
                            className="w-1/3 text-center py-2.5 rounded-xl border border-white/5 text-[#A8A8B0] text-xs hover:border-white/15 transition-all cursor-pointer disabled:opacity-40"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-2/3 text-center py-2.5 rounded-xl bg-[#F4EEE8] text-[#0B0B12] text-xs font-bold hover:bg-white transition-all cursor-pointer shadow-lg shadow-purple-500/10 disabled:opacity-60 flex items-center justify-center gap-1.5"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Sending…
                              </>
                            ) : "Confirm"}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ── Confirmation Screen ── */}
            {isBookingConfirmed && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#F4EEE8] uppercase tracking-tight">
                    Booking Request Sent!
                  </h3>
                  <p className="text-sm text-[#A8A8B0] max-w-[480px] mx-auto font-light leading-relaxed">
                    Thank you{" "}
                    <strong className="text-[#F4EEE8] font-semibold">{bookingDetails.name}</strong>,
                    your request for a meeting on{" "}
                    <strong className="text-[#F4EEE8] font-semibold">
                      {getSelectedDayString()} {monthName} {year} @ {selectedTime}
                    </strong>{" "}
                    has been sent. You will receive a confirmation email once Rohon accepts it.
                  </p>
                </div>

                {/* Details card */}
                <div className="p-5 rounded-2xl bg-[#20242F]/60 border border-white/5 flex flex-col space-y-2.5 text-xs text-[#A3A3AA] min-w-[280px] w-full max-w-sm">
                  <div className="flex justify-between">
                    <span>Meeting type</span>
                    <span className="text-[#F4EEE8]">30 Minute Strategy Call</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="text-[#F4EEE8]">{getSelectedDayString()} {monthName} {year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span className="text-[#F4EEE8]">{selectedTime} IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform</span>
                    <span className="text-[#F4EEE8]">Google Meet</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="text-emerald-400 font-semibold">Scheduled ✓</span>
                  </div>
                </div>

                {/* Calendar CTA */}
                {calendarLink && (
                  <a
                    href={calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#F4EEE8] text-[#0B0B12] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white transition-all hover:scale-[1.03] shadow-lg cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Add to Google Calendar
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}

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
