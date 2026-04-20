import { motion, AnimatePresence } from "framer-motion";

/**
 * Status-aware modal.
 * Pass either:
 *   - `status` (HTTP status code, e.g. 400, 401, 404, 409, 500), or
 *   - `variant` ("error" | "warning" | "success" | "info")
 * `title` and `message` are optional overrides.
 * `type` can be "alert" (single button) or "confirm" (two buttons).
 */

const VARIANTS = {
  error: {
    title: "Something went wrong",
    accent: "bg-destructive",
    accentSoft: "bg-destructive/10",
    text: "text-destructive",
    btn: "bg-destructive text-destructive-foreground",
    gradient: "from-destructive via-destructive/80 to-destructive",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
  },
  warning: {
    title: "Heads up",
    accent: "bg-warning",
    accentSoft: "bg-warning/10",
    text: "text-warning",
    btn: "bg-warning text-warning-foreground",
    gradient: "from-warning via-warning/80 to-warning",
    icon: (
      <>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  success: {
    title: "All set",
    accent: "bg-success",
    accentSoft: "bg-success/10",
    text: "text-success",
    btn: "bg-success text-success-foreground",
    gradient: "from-success via-success/80 to-success",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 12 15 16 10" />
      </>
    ),
  },
  info: {
    title: "Notice",
    accent: "bg-primary",
    accentSoft: "bg-primary/10",
    text: "text-primary",
    btn: "bg-primary text-primary-foreground",
    gradient: "from-primary via-primary/80 to-primary",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
  },
};

const STATUS_MAP = {
  // 2xx
  200: { variant: "success", title: "Success" },
  201: { variant: "success", title: "Created" },
  // 4xx
  400: { variant: "warning", title: "Invalid request" },
  401: { variant: "warning", title: "Unauthorized" },
  403: { variant: "warning", title: "Access denied" },
  404: { variant: "warning", title: "Not found" },
  408: { variant: "warning", title: "Request timed out" },
  409: { variant: "warning", title: "Conflict" },
  410: { variant: "warning", title: "No longer available" },
  422: { variant: "warning", title: "Validation failed" },
  429: { variant: "warning", title: "Too many requests" },
  // 5xx
  500: { variant: "error", title: "Server error" },
  502: { variant: "error", title: "Bad gateway" },
  503: { variant: "error", title: "Service unavailable" },
  504: { variant: "error", title: "Gateway timeout" },
};

function resolveVariant(status, variantProp) {
  if (variantProp && VARIANTS[variantProp]) {
    return { key: variantProp, mapped: null };
  }
  if (typeof status === "number") {
    const mapped = STATUS_MAP[status];
    if (mapped) return { key: mapped.variant, mapped };
    if (status >= 200 && status < 300) return { key: "success", mapped: null };
    if (status >= 300 && status < 400) return { key: "info", mapped: null };
    if (status >= 400 && status < 500) return { key: "warning", mapped: null };
    if (status >= 500) return { key: "error", mapped: null };
  }
  return { key: "error", mapped: null };
}

export default function ErrorModal({
  open,
  message,
  onClose,
  title,
  status,
  variant,
  type = "alert", // "alert" or "confirm"
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  const { key, mapped } = resolveVariant(status, variant);
  const v = VARIANTS[key];
  const resolvedTitle = title || mapped?.title || v.title;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="error-modal-title"
            aria-describedby="error-modal-desc"
            className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Top accent bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${v.gradient}`} />

            <div className="p-6 md:p-7">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`shrink-0 w-12 h-12 rounded-full ${v.accentSoft} flex items-center justify-center`}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={v.text}
                  >
                    {v.icon}
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2
                      id="error-modal-title"
                      className="text-lg font-semibold text-foreground leading-tight"
                    >
                      {resolvedTitle}
                    </h2>
                    {typeof status === "number" && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${v.accentSoft} ${v.text}`}>
                        {status}
                      </span>
                    )}
                  </div>
                  <p
                    id="error-modal-desc"
                    className="mt-1.5 text-sm text-muted-foreground leading-relaxed break-words"
                  >
                    {message}
                  </p>
                </div>

                {/* Close (X) */}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 -mr-1 -mt-1 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                {type === "confirm" ? (
                  <>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold hover:bg-muted/80 transition-all shadow-sm"
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={onConfirm}
                      autoFocus
                      className={`px-5 py-2.5 rounded-xl ${v.btn} text-sm font-semibold hover:opacity-90 transition-all shadow-sm`}
                    >
                      {confirmText}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    autoFocus
                    className={`px-5 py-2.5 rounded-xl ${v.btn} text-sm font-semibold hover:opacity-90 transition-all shadow-sm`}
                  >
                    Got it
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
