import { useEffect, useState } from 'react';

const announcements = [
  "Free shipping on orders over $100",
  "New arrivals: Spring/Summer",
  "Subscribe to our newsletter ",
  "Limited time offer"
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        <button
          className="announcement-nav announcement-prev"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
          aria-label="Previous announcement"
        >
          ‹
        </button>
        <div className="announcement-text">
          {announcements[currentIndex]}
        </div>
        <button
          className="announcement-nav announcement-next"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
          aria-label="Next announcement"
        >
          ›
        </button>
      </div>
      <div className="announcement-dots">
        {announcements.map((_, index) => (
          <button
            key={index}
            className={`announcement-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to announcement ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
