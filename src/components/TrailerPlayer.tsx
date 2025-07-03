import React from 'react';
import '../styles/TrailerPlayer.css';

interface TrailerPlayerProps {
  videoUrl: string;
  onClose: () => void;
}

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : '';
};

const TrailerPlayer: React.FC<TrailerPlayerProps> = ({ videoUrl, onClose }) => {
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) return null;

  return (
    <div className="trailer-modal">
      <div className="trailer-content">
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
        <div className="video-wrapper">
          <iframe
            src={embedUrl}
            title="Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default TrailerPlayer;
