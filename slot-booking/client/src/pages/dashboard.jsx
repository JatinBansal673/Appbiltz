import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const nav = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [slotInputs, setSlotInputs] = useState({});
  const [connectGoogle, setConnectGoogle] = useState(false);

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
        desc,
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
        setConnectGoogle(true);
        return;
      }

      alert(err.response?.data?.message || "Failed to create meeting");
    }
  
    setTitle("");
    setDesc("");
    setSlotStart("");
    setSlotEnd("");
    fetchMeetings();
  };

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
    if (!startTime || !endTime) {
      alert("Enter both start and end times for the new slot.");
      return;
    }

    await api.post(`/meeting/slot/add/${meetingId}`, { startTime, endTime });
    setSlotInputs((prev) => ({ ...prev, [meetingId]: { startTime: "", endTime: "" } }));
    fetchMeetings();
  };

  const rescheduleSlot = async (slotId) => {
    const start = prompt("Enter new start (YYYY-MM-DDTHH:mm)");
    const end = prompt("Enter new end (YYYY-MM-DDTHH:mm)");
    await api.post(`/meeting/slot/reschedule/${slotId}`, {
      startTime: start,
      endTime: end
    });
    fetchMeetings();
  };

  const loginWithGoogle = async () => {
    const res = await api.get("/auth/google");
    window.location.href = res.data.url;
  }

  return (
    <div className="p-10">
      <h1>Dashboard</h1> 
      <button onClick={() => { 
        localStorage.removeItem("token")
        nav("/")
        }}>Logout</button>

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

        {connectGoogle && (
          <div className="bg-yellow-100 p-3 mt-4 rounded">
            <p className="text-sm">
              Connect Google to create meetings
            </p>
            <button
              className="bg-blue-500 text-white px-3 py-1 mt-2 rounded"
              onClick={loginWithGoogle}
            >
              Connect To Google
            </button>
          </div>
        )}

      {meetings.map(m => (
        <div key={m._id} className="border p-4 mt-4">
          <h3>{m.title}</h3>
          <h4>{m.desc}</h4>

          <button onClick={() => navigator.clipboard.writeText(`http://localhost:5173/book/${m._id}`)}>
                  Copy Meeting Link
          </button>

          <button onClick={() => deleteMeeting(m._id)}>Delete</button>

          <div>
            {m.slots.map(s => (
              <div key={s.slotId} className="mb-2">
                <p>{new Date(s.startTime).toLocaleString()}</p>
                {s.isBooked && (
                  <p className="text-blue-600">
                    Meet Link: {s.meetLink}
                  </p>
                )}

                <p className={`text-sm ${s.isBooked ? "text-red-500" : "text-green-600"}`}>
                  {s.isBooked ? "Booked" : "Available"}
                </p>

                <button onClick={() => deleteSlot(s.slotId)}>
                  Delete Slot
                </button>

                <button onClick={() =>
                  rescheduleSlot(s.slotId)
                }>
                  Reschedule
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