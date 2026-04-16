import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/navbar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <Navbar/>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wider uppercase bg-accent text-primary rounded-full">
              Easy Scheduling
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
              Schedule meetings
              <br />
              <span className="text-primary">without the hassle</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Meetify makes it simple to share your availability, let others pick a time, and get a meeting link — all in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25">
              Start Scheduling — It's Free
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold border border-border text-foreground rounded-xl hover:bg-accent transition-all">
              I already have an account
            </Link>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: "🗓️", title: "Create Meetings", desc: "Set up meeting types with available time slots in seconds." },
              { icon: "🔗", title: "Share Your Link", desc: "Send your unique booking link and let guests pick a time." },
              { icon: "🎥", title: "Auto Meet Links", desc: "Google Meet links are generated automatically when booked." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border text-left hover:shadow-lg transition-shadow">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12 text-center">
        <p className="text-sm text-muted-foreground">© 2026 Meetify. Schedule smarter.</p>
      </footer>
    </div>
  );
}