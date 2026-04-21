import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/api";
import { Navbar } from "../components/navbar";
import ErrorModal from "../components/errorModal";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error,setError]=useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchBookings = async () => {
    const res = await api.get("/booking/myBookings");
    setBookings(res.data);
  };

  useEffect(() => { fetchBookings(); }, []);

  const cancel = async (id) => {
    try {
      await api.post("/booking/cancel", { bookingId: id });
      fetchBookings();
      setSuccessMessage("Booking cancelled successfully.");
    } catch(err) {
      setError({message: err.response?.data?.message || "Cancellation Failed", status: err.response?.status});
    }
  };

  return (
    <>
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <Navbar/>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Your Bookings</h1>
        <p className="text-sm text-muted-foreground mb-8">Meetings booked with others</p>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">No bookings yet</h3>
            <p className="text-sm text-muted-foreground mt-1">When you book a meeting, it will show up here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-1 h-10 rounded-full bg-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{b.meeting?.title || "Meeting"}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.slot?.startTime ? new Date(b.slot.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Time TBD"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmCancel(b._id)}
                  className="px-4 py-2 text-xs font-medium text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/10 transition-all"
                >
                  Cancel
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
    {/* Confirmation Modal */}
    <ErrorModal 
        open={!!confirmCancel} 
        variant="warning" 
        title="Confirm Cancellation" 
        message="Are you sure you want to cancel this booking?" 
        type="confirm" 
        onConfirm={() => {
            cancel(confirmCancel);
            setConfirmCancel(null);
        }} 
        onClose={() => setConfirmCancel(null)} 
        confirmText="Yes, Cancel" 
        cancelText="No" 
    />
    {/* Success Modal */}
    <ErrorModal 
        open={!!successMessage} 
        variant="success" 
        message={successMessage} 
        onClose={() => setSuccessMessage(null)} 
    />
    <ErrorModal open={!!error} message={error?.message} status={error?.status} onClose={() => setError(null)} />
    </>
  );
}