import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

export default function BookingPage() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [guest, setGuest] = useState({ name:"", email:"" , location:"", reason:""});

  useEffect(() => {
    api.get(`/meeting/${meetingId}`).then(res => setMeeting(res.data));
  }, []);

  const book = async () => {
    const res = await api.post("/booking/book", {
      slotId: selectedSlot,
      guest
    });

    alert("Booked! Meet link: " + res.data.meetLink);
  };

  if (!meeting) return <p>Loading...</p>;

  return (
    <div className="p-10">
      <h2>{meeting.title}</h2>

      {meeting.slots.map(s => (
        !s.isBooked && (
          <button key={s.slotId} onClick={() => setSelectedSlot(s.slotId)}>
            {new Date(s.startTime).toLocaleString()}
          </button>
        )
      ))}

      <input placeholder="Name" onChange={e => setGuest({...guest, name:e.target.value})}/>
      <input placeholder="Email" onChange={e => setGuest({...guest, email:e.target.value})}/>
      <input placeholder="Location" onChange={e => setGuest({...guest, location:e.target.value})}/>
      <input placeholder="Reason" onChange={e => setGuest({...guest, reason:e.target.value})}/>

      <button onClick={book}>Book</button>
    </div>
  );
}