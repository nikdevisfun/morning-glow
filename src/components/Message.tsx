import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export type MessageType = 'success' | 'error';

interface MessageProps {
  open: boolean;
  type: MessageType;
  text: string;
  onClose?: () => void;
}

export function Message({ open, type, text, onClose }: MessageProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          className="fixed top-4 inset-x-0 z-[60] flex justify-center pointer-events-none"
        >
          <div
            className={`pointer-events-auto inline-flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium ${
              type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            {type === 'success' ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertTriangle size={18} className="shrink-0" />
            )}
            <span>{text}</span>
            <button
              type="button"
              onClick={onClose}
              className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
            >
              <X size={12} />
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

