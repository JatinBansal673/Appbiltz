import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/api";
import { MeetingCard } from "../components/meetingCard";
import { Navbar } from "../components/navbar";
import ErrorModal from "../components/errorModal";


export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [connectGoogle, setConnectGoogle] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error,setError] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const fetchMeetings = async () => {
    const res = await api.get("/meeting/user");
    setMeetings(res.data);
  };

  useEffect(() => { fetchMeetings(); }, []);

  const createMeeting = async () => {
    if (!title || !slotStart || !slotEnd) {
      setError({message:"Please fill in all the required details",status:400});
      return;
    }
    try {
      await api.post("/meeting/create", {
        title, 
        description: desc,
        slots: [{ startTime: slotStart, endTime: slotEnd }]
      });
      setError({message:"Meeting created successfully",status:201});
    } catch (err) {
      if (err.response?.data?.error === "GOOGLE_NOT_CONNECTED") {
        setError({message:"Please connect Google Calendar first", status:err.response?.status});
        setConnectGoogle(true);
        return;
      }
      setError({message: err.response?.data?.message || "Failed to create meeting", status: err.response?.status});
    }
    setTitle(""); setDesc(""); setSlotStart(""); setSlotEnd("");
    setShowCreate(false);
    fetchMeetings();
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/google');
      window.location.href = res.data.url;
    }catch(err) {
      setError({message: err.response?.data?.message || "Login Failed", status: err.response?.status});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <Navbar/>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Meetings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your meeting types and availability</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm text-sm flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Meeting
          </button>
        </div>

        {/* Google connect banner */}
        {connectGoogle && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium text-warning-foreground">Connect Google Calendar to create meetings with Meet links</p>
            </div>
            <button onClick={loginWithGoogle} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-all">
              Connect Google
            </button>
          </motion.div>
        )}

        {/* Create meeting form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Create a new meeting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                    <input
                      placeholder="e.g. 30-min Discovery Call"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                    <input
                      placeholder="What's this meeting about?"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Slot start</label>
                    <input
                      type="datetime-local"
                      value={slotStart}
                      onChange={(e) => setSlotStart(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Slot end</label>
                    <input
                      type="datetime-local"
                      value={slotEnd}
                      onChange={(e) => setSlotEnd(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <button onClick={createMeeting} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all text-sm">
                    Create Meeting
                  </button>
                  <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 border border-border text-foreground rounded-xl hover:bg-accent transition-all text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meetings list */}
        <MeetingCard meetings={meetings} fetchMeetings={fetchMeetings}/>
      </div>
    </div>
    <ErrorModal open={!!error} message={error?.message} status={error?.status} onClose={() => setError(null)} />
    </>
  );
}