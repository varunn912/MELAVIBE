import React from 'react';
import { Announcement } from '../types';

interface AnnouncementBannerProps {
  announcement: Announcement;
  onDismiss: (id: number) => void;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement, onDismiss }) => {
  return (
    <div className="bg-primary/90 text-white p-3 rounded-lg shadow-lg mb-6 flex items-center justify-between gap-4 animate-slide-in-top">
      <div className="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584C18.354 1.832 18 1.077 18 0H5a2 2 0 00-2 2v1m0 11.883v1.448a1.76 1.76 0 002.573 1.616L9.5 19.53M16 13a3 3 0 100-6h-1.268" />
        </svg>
        <p className="text-sm font-medium">{announcement.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(announcement.id)} 
        className="text-white/70 hover:text-white text-2xl font-light flex-shrink-0"
        aria-label="Dismiss announcement"
      >
        &times;
      </button>
    </div>
  );
};

export default AnnouncementBanner;