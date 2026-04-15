import { useEffect, useState } from "react";
import api from "../api/api";

export default function myBookings() {
  const [bookings, setBookings] = useState([]);

  const fetch = async () => {
    const res = await api.get("/booking/myBookings");
    setBookings(res.data);
  };

  useEffect(() => {
    fetch();
  }, []);

  const cancel = async (id) => {
    await api.post("/booking/cancel", { bookingId: id });
    fetch();
  };

  return (
    <div className="p-10">
      <h2>My Bookings</h2>

      {bookings.map(b => (
        <div key={b._id}>
          <p>{b.meeting.title}</p>
          <button onClick={() => cancel(b._id)}>Cancel</button>
        </div>
      ))}
    </div>
  );
}