import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// Reusable animated dialog. Closes on Escape and backdrop click, locks body
// scroll while open, and traps nothing fancy — just enough for CRUD forms.
// Used across resource pages for create/edit/confirm.
const SIZES = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-3xl' };

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-xl border border-border bg-bg p-6 text-left shadow-card ${SIZES[size] ?? SIZES.md}`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-medium text-text-h">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text/60 transition-colors hover:bg-social-bg hover:text-text-h"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
