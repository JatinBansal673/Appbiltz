import React from 'react'
import { Link, useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
    const location=useLocation();
    const navigate=useNavigate();
    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };
  return (
    <div>
        {/* Landing */}
        {location.pathname==='/' && (
            <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-foreground tracking-tight">Meetify</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Log in
                    </Link>
                    <Link to="/signup" className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-sm">
                    Get Started Free
                    </Link>
                </div>
            </nav>
        )}

        {/* Dashboard */}
        {location.pathname==='/dashboard' && (
            <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-foreground">Meetify</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link to="/myBookings" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                            My Bookings
                        </Link>
                        <button onClick={logout} className="text-sm text-muted-foreground hover:text-destructive transition-colors font-medium">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
        )}

        {/* myBookings */}
        {location.pathname==='/myBookings' && (
            <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold text-foreground">Meetify</span>
                    </Link>
                    <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
                        Back to Dashboard
                    </Link>
                </div>
            </nav>
        )}

    </div>
  )
}
