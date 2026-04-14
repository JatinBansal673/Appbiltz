import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

export default function BookingPage() {
  const { slotId } = useParams();
  const [data, setData] = useState({});
  const [guest, setGuest] = useState({ name:"", email:"" });

  useEffect(() => {
    api.get(`/meeting/slot/${slotId}`).then(res => setData(res.data));
  }, []);

  const book = async () => {
    const res = await api.post("/booking/book", {
      slotId,
      guest
    });

    alert("Booked! Meet link: " + res.data.meetLink);
  };

  return (
    <div className="p-10">
      <h2>{data.title}</h2>

      <p>{new Date(data?.slot?.startTime).toLocaleString()}</p>

      <input placeholder="Name" onChange={e => setGuest({...guest, name:e.target.value})}/>
      <input placeholder="Email" onChange={e => setGuest({...guest, email:e.target.value})}/>

      <button onClick={book}>Book Slot</button>
    </div>
  );
}