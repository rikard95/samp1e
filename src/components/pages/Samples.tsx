import React, { useState, useEffect, useRef, useMemo } from 'react';
// @ts-ignore
import './Samples.css';

export function Samples() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlayingId, setIsPlayingId] = useState(null);
  const [progress, setProgress] = useState(0); 
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef(null);

  // Läs in filer
  const audioFiles = import.meta.glob('/public/audio/*.wav', { eager: true });

  // Memoize för att undvika att beräkna om listan vid varje render
  const sampleList = useMemo(() => {
    return Object.keys(audioFiles).map((path, index) => {
      const fileName = path.split('/').pop() || "Unknown_Sample.wav";
      const fileUrl = path.replace('/public', '');
      const isDrum = /drum|snare|kick|hat|perc|loop/i.test(fileName);
      return {
        id: index + 1,
        name: fileName,
        type: isDrum ? "Drum" : "Melody",
        size: "WAV",
        bpm: "-",    
        fileUrl: fileUrl
      };
    });
  }, [audioFiles]);

  // Filtrera baserat på sökterm
  const filteredSamples = useMemo(() => {
  if (!searchTerm.trim()) return sampleList;

  const searchTerms = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);

  return sampleList.filter((sample) => {
    const nameLower = sample.name.toLowerCase();
    // Kontrollera att ALLA sökord finns i filnamnet
    return searchTerms.every(term => nameLower.includes(term));
  });
}, [sampleList, searchTerm]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(current);
    setDuration(dur);
    setProgress(dur > 0 ? (current / dur) * 100 : 0);
  };

  const handlePlay = (id, fileUrl) => {
    if (isPlayingId === id && audioRef.current) {
      if (!audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlayingId(null);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
    }

    const audio = new Audio(fileUrl);
    audioRef.current = audio;
    setIsPlayingId(id);
    setProgress(0);
    setCurrentTime(0);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended = () => { setIsPlayingId(null); setProgress(0); setCurrentTime(0); };

    audio.play().catch(err => console.error("Playback failed:", err));
  };

  const handleScrub = (e) => {
    if (!audioRef.current || !duration) return;
    const newPercentage = parseFloat(e.target.value);
    const newTime = (newPercentage / 100) * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newPercentage);
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="samples-page">
      <h2>Browse Handcrafted Samples</h2>
      
      {/* Sökfält */}
      <div className="search-bar-container">
        <input 
          type="text" 
          placeholder="Search sounds (e.g. vocal, drum)..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="samples-container">
        {filteredSamples.length === 0 ? (
          <p style={{ color: 'white', padding: '20px' }}>No matches found for "{searchTerm}"</p>
        ) : (
          filteredSamples.map((sample) => {
            const isCurrent = isPlayingId === sample.id;
            return (
              <div key={sample.id} className={`sample-card ${isCurrent ? 'active-card' : ''}`}>
                <div className="sample-info">
                  <button className="play-button" onClick={() => handlePlay(sample.id, sample.fileUrl)}>
                    <span className="play-icon">{isCurrent ? "⏸" : "▶"}</span>
                  </button>
                  <div className="sample-text">
                    <span className="sample-name">{sample.name}</span>
                    <div className="sample-details">
                      <span className="sample-tag">{sample.type}</span>
                      <span>•</span>
                      <span>{sample.bpm}</span>
                      <span>•</span>
                      <span className="sample-size">{sample.size}</span>
                    </div>
                  </div>
                  <div className="sample-actions">
                    <button className="download-button" onClick={() => handleDownload(sample.fileUrl, sample.name)}>
                      <span className="download-icon">↓</span> Download
                    </button>
                  </div>
                </div>
                <div className="timeline-container">
                  <span className="time-display">{isCurrent ? formatTime(currentTime) : "0:00"}</span>
                  <input 
                    type="range" className="seek-slider" min="0" max="100" step="0.1"
                    value={isCurrent ? progress : 0} onChange={handleScrub} disabled={!isCurrent}
                  />
                  <span className="time-display">{isCurrent ? formatTime(duration) : "0:00"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}