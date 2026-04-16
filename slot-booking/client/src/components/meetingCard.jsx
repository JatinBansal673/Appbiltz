import React, { useState } from 'react'
import api from '../api/api';
import { motion, AnimatePresence } from "framer-motion";


export const MeetingCard = ({meetings,fetchMeetings}) => {

    const [rescheduleOpen, setRescheduleOpen] = useState({});
    const [copied, setCopied] = useState(null);
    const [rescheduleInputs, setRescheduleInputs] = useState({});
    const [slotInputs, setSlotInputs] = useState({});

    const deleteMeeting = async (id) => {
        await api.post(`/meeting/cancel/${id}`);
        fetchMeetings();
    };


    const deleteSlot = async (slotId) => {
        await api.post(`/meeting/slot/cancel/${slotId}`);
        fetchMeetings();
    };

    const addSlot = async (meetingId) => {
        const { startTime, endTime } = slotInputs[meetingId] || {};
        if (!startTime || !endTime) { alert("Enter both start and end times."); return; }
        await api.post(`/meeting/slot/add/${meetingId}`, { startTime, endTime });
        setSlotInputs((prev) => ({ ...prev, [meetingId]: { startTime: "", endTime: "" } }));
        fetchMeetings();
    };

    const rescheduleSlot = async (slotId) => {
        const { startTime, endTime } = rescheduleInputs[slotId] || {};
        if (!startTime || !endTime) { alert("Please select new start and end time"); return; }
        await api.post(`/meeting/slot/reschedule/${slotId}`, { startTime, endTime });
        setRescheduleInputs((prev) => ({ ...prev, [slotId]: { startTime: "", endTime: "" } }));
        setRescheduleOpen((prev) => ({ ...prev, [slotId]: false }));
        fetchMeetings();
    };

    const copyLink = (id) => {
        navigator.clipboard.writeText(`${import.meta.env.VITE_APP_FRONTEND_URL}/book/${id}`);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

  return (
    <div className="grid gap-5">
    {meetings.map((m) => (
        <motion.div
        key={m._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
        >
        {/* Meeting header */}
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
            <div className="w-1 h-12 rounded-full bg-primary mt-0.5" />
            <div>
                <h3 className="text-lg font-semibold text-foreground">{m.title}</h3>
                {m.description && <p className="text-sm text-muted-foreground mt-0.5">{m.description}</p>}
            </div>
            </div>
            <div className="flex items-center gap-2">
            <button
                onClick={() => copyLink(m._id)}
                className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-all flex items-center gap-1.5 text-foreground"
            >
                {copied === m._id ? (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                ) : (
                <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copy Link</>
                )}
            </button>
            <button
                onClick={() => deleteMeeting(m._id)}
                className="px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/10 transition-all"
            >
                Delete
            </button>
            </div>
        </div>

        {/* Slots */}
        <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time Slots</p>
            {m.slots.map((s) => (
            <div key={s.slotId} className="p-3 rounded-xl bg-background border border-border">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.isBooked ? "bg-destructive" : "bg-success"}`} />
                    <div>
                    <p className="text-sm font-medium text-foreground">
                        {new Date(s.startTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {s.isBooked && s.meetLink && (
                        <a href={s.meetLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-0.5 inline-block">
                        Join Meet →
                        </a>
                    )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${s.isBooked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                    {s.isBooked ? "Booked" : "Available"}
                    </span>
                    <button
                    onClick={() => setRescheduleOpen((prev) => ({ ...prev, [s.slotId]: !prev[s.slotId] }))}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                    {rescheduleOpen[s.slotId] ? "Cancel" : "Reschedule"}
                    </button>
                    <button
                    onClick={() => deleteSlot(s.slotId)}
                    className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                    >
                    Remove
                    </button>
                </div>
                </div>

                {/* Reschedule form */}
                <AnimatePresence>
                {rescheduleOpen[s.slotId] && (
                    <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                    >
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-end gap-3">
                        <div>
                        <label className="block text-xs text-muted-foreground mb-1">New start</label>
                        <input
                            type="datetime-local"
                            value={rescheduleInputs[s.slotId]?.startTime || ""}
                            onChange={(e) => setRescheduleInputs((prev) => ({ ...prev, [s.slotId]: { ...prev[s.slotId], startTime: e.target.value } }))}
                            className="px-3 py-2 rounded-lg border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        </div>
                        <div>
                        <label className="block text-xs text-muted-foreground mb-1">New end</label>
                        <input
                            type="datetime-local"
                            value={rescheduleInputs[s.slotId]?.endTime || ""}
                            onChange={(e) => setRescheduleInputs((prev) => ({ ...prev, [s.slotId]: { ...prev[s.slotId], endTime: e.target.value } }))}
                            className="px-3 py-2 rounded-lg border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        </div>
                        <button
                        onClick={() => rescheduleSlot(s.slotId)}
                        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:opacity-90 transition-all"
                        >
                        Update
                        </button>
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            ))}
        </div>

        {/* Add slot */}
        <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Add a slot</p>
            <div className="flex flex-wrap items-end gap-3">
            <div>
                <label className="block text-xs text-muted-foreground mb-1">Start</label>
                <input
                type="datetime-local"
                value={slotInputs[m._id]?.startTime || ""}
                onChange={(e) => setSlotInputs((prev) => ({ ...prev, [m._id]: { ...prev[m._id], startTime: e.target.value } }))}
                className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
            <div>
                <label className="block text-xs text-muted-foreground mb-1">End</label>
                <input
                type="datetime-local"
                value={slotInputs[m._id]?.endTime || ""}
                onChange={(e) => setSlotInputs((prev) => ({ ...prev, [m._id]: { ...prev[m._id], endTime: e.target.value } }))}
                className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
            <button
                onClick={() => addSlot(m._id)}
                className="px-4 py-2 border border-border text-foreground text-xs font-medium rounded-lg hover:bg-accent transition-all flex items-center gap-1.5"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Slot
            </button>
            </div>
        </div>
        </motion.div>
    ))}
    </div>
  )
}
