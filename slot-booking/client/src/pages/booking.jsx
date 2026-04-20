import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/api";
import { useParams, Link } from "react-router-dom";
import ErrorModal from "../components/errorModal";

export default function BookingPage() {
  const { meetingId } = useParams();

  const [meeting, setMeeting] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [guest, setGuest] = useState({
    name: "",
    email: "",
    location: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/meeting/${meetingId}`);
        setMeeting(res.data);
      } catch (err) {
        setError({
          message:
            err.response?.data?.message ||
            "This meeting link is no longer available",
          status: err.response?.status || 404,
        });
      } finally {
        setPageLoading(false);
      }
    };

    if (meetingId) fetchMeeting();
  }, [meetingId]);

  const book = async () => {
    if (!selectedSlot) {
      setError({
        message: "Please select a slot",
        status: 400,
      });
      return;
    }

    if (!guest.name || !guest.email) {
      setError({
        message: "Please enter your name and email",
        status: 400,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/booking/book", {
        slotId: selectedSlot,
        guest,
      });

      setBooked(res.data.meetLink);
    } catch (err) {
      setError({
        message:
          err.response?.data?.message ||
          err.message ||
          "Booking failed",
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading page
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading meeting...
        </div>
      </div>
    );
  }

  // Meeting deleted / invalid
  if (!meeting) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-warning/10 flex items-center justify-center mb-6">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-warning"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              Meeting Not Found
            </h1>

            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              This booking link may have been deleted, expired,
              or is no longer available.
            </p>

            <Link
              to="/"
              className="inline-flex mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all text-sm"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>

        <ErrorModal
          open={!!error}
          message={error?.message}
          status={error?.status}
          onClose={() => setError(null)}
        />
      </>
    );
  }

  // Booking success
  if (booked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-6">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            You're booked!
          </h1>

          <p className="mt-2 text-muted-foreground">
            A confirmation has been sent to your email.
          </p>

          <a
            href={booked}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm text-sm"
          >
            Join Google Meet →
          </a>
        </motion.div>
      </div>
    );
  }

  const availableSlots = meeting.slots.filter((s) => !s.isBooked);

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-border bg-accent/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary-foreground"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>

                <span className="text-sm font-medium text-muted-foreground">
                  Meetify
                </span>
              </div>

              <h1 className="text-2xl font-bold text-foreground">
                {meeting.title}
              </h1>

              {meeting.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {meeting.description}
                </p>
              )}
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
              {/* Slots */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Select a Time
                </h2>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {availableSlots.map((s) => (
                    <label
                      key={s.slotId}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedSlot === s.slotId
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/30 hover:bg-accent/50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedSlot === s.slotId
                            ? "border-primary"
                            : "border-muted-foreground/30"
                        }`}
                      >
                        {selectedSlot === s.slotId && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>

                      <span className="text-sm font-medium text-foreground">
                        {new Date(s.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <input
                        type="radio"
                        className="sr-only"
                        checked={selectedSlot === s.slotId}
                        onChange={() => setSelectedSlot(s.slotId)}
                      />
                    </label>
                  ))}

                  {availableSlots.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No available slots
                    </p>
                  )}
                </div>
              </div>

              {/* Form */}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Your Details
                </h2>

                <div className="space-y-3">
                  {["name", "email", "location", "reason"].map((field) => (
                    <input
                      key={field}
                      type={field === "email" ? "email" : "text"}
                      placeholder={
                        field === "name"
                          ? "Your name"
                          : field === "email"
                          ? "you@example.com"
                          : field === "location"
                          ? "City, Country"
                          : "Reason for meeting"
                      }
                      value={guest[field]}
                      onChange={(e) =>
                        setGuest({
                          ...guest,
                          [field]: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
                    />
                  ))}

                  <button
                    onClick={book}
                    disabled={loading || availableSlots.length === 0}
                    className="w-full mt-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50 text-sm"
                  >
                    {loading ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Powered by Meetify
          </p>
        </motion.div>
      </div>

      <ErrorModal
        open={!!error}
        message={error?.message}
        status={error?.status}
        onClose={() => setError(null)}
      />
    </>
  );
}