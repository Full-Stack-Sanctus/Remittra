// @/components/Modal.tsx
"use client";

import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error";
}

export default function Modal({ isOpen, onClose, title, message, type }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto ${
          type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}>
          {type === "success" ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          )}
        </div>
        <h3 className="text-2xl font-black text-center text-gray-900 mb-2">{title}</h3>
        <p className="text-center text-gray-500 mb-8 leading-relaxed">{message}</p>
        <button 
          onClick={onClose}
          className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}