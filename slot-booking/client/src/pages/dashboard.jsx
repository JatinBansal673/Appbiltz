import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [slotInputs, setSlotInputs] = useState({});

  const fetchMeetings = async () => {
    const res = await api.get("/meeting/user");
    setMeetings(res.data);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);


  const createMeeting = async () => {
    if (!title || !slotStart || !slotEnd) {
      alert("Please enter meeting title and slot start/end.");
      return;
    }

    try {
      const res = await api.post("/meeting/create", {
        title,
        slots: [{
          startTime: slotStart, 
          endTime: slotEnd
        }]
      });

      alert("Meeting created successfully");
      fetchMeetings();

    } catch (err) {
      console.error("FULL ERROR:", err);

      if (err.response?.data?.error === "GOOGLE_NOT_CONNECTED") {
        alert("Please connect Google Calendar first");
        return;
      }

      alert(err.response?.data?.message || "Failed to create meeting");
    }
  
    setTitle("");
    setSlotStart("");
    setSlotEnd("");
    fetchMeetings();
  };

  const deleteMeeting = async (id) => {
    await api.post(`/meeting/cancel/meeting/${id}`);
    fetchMeetings();
  };

  const deleteSlot = async (slotId) => {
    await api.post(`/meeting/cancel/slot/${slotId}`);
    fetchMeetings();
  };

  const addSlot = async (meetingId) => {
    const { startTime, endTime } = slotInputs[meetingId] || {};
    if (!startTime || !endTime) {
      alert("Enter both start and end times for the new slot.");
      return;
    }

    await api.post(`/meeting/addSlot/${meetingId}`, { startTime, endTime });
    setSlotInputs((prev) => ({ ...prev, [meetingId]: { startTime: "", endTime: "" } }));
    fetchMeetings();
  };

  return (
    <div className="p-10">
      <h1>Dashboard</h1>

      <div className="mb-4">
        <input
          placeholder="Meeting Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          placeholder="Meeting Desc"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <input
          type="datetime-local"
          value={slotStart}
          onChange={e => setSlotStart(e.target.value)}
        />
        <input
          type="datetime-local"
          value={slotEnd}
          onChange={e => setSlotEnd(e.target.value)}
        />
        <button onClick={createMeeting}>Create Meeting</button>
      </div>

      {meetings.map(m => (
        <div key={m._id} className="border p-4 mt-4">
          <h3>{m.title}</h3>

          <button onClick={() => deleteMeeting(m._id)}>Delete</button>

          <div>
            {m.slots.map(s => (
              <div key={s.slotId} className="mb-2">
                <p>{new Date(s.startTime).toLocaleString()}</p>

                <button onClick={() => navigator.clipboard.writeText(`http://localhost:5173/book/${s.slotId}`)}>
                  Copy Booking Link
                </button>

                <button onClick={() => deleteSlot(s.slotId)}>
                  Delete Slot
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h4>Add slot</h4>
            <input
              type="datetime-local"
              value={slotInputs[m._id]?.startTime || ""}
              onChange={e => setSlotInputs(prev => ({
                ...prev,
                [m._id]: {
                  ...prev[m._id],
                  startTime: e.target.value
                }
              }))}
            />
            <input
              type="datetime-local"
              value={slotInputs[m._id]?.endTime || ""}
              onChange={e => setSlotInputs(prev => ({
                ...prev,
                [m._id]: {
                  ...prev[m._id],
                  endTime: e.target.value
                }
              }))}
            />
            <button onClick={() => addSlot(m._id)}>Add Slot</button>
          </div>
        </div>
      ))}
    </div>
  );
}