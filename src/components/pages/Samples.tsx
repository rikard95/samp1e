import React, { useState, useEffect, useRef, useMemo } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// @ts-ignore
import './Samples.css';

export function Samples() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [isPlayingId, setIsPlayingId] = useState(null);
  const [progress, setProgress] = useState(0); 
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isZipping, setIsZipping] = useState(false);

  const audioRef = useRef(null);
  const preloadedAudioRef = useRef(new Map());

  // Vi använder 'as: url' för att hämta direkta sökvägar från /public
  const audioFiles = import.meta.glob('/public/audio/**/*.wav', { eager: true, as: 'url' });

  const { groupedSamples, allSamples } = useMemo(() => {
    const groups = {};
    const flatList = [];
    
    Object.entries(audioFiles).forEach(([path, fileUrl], index) => {
      // Vi tar bort '/public' från sökvägen eftersom filer i public nås via rot-URL
      const cleanUrl = path.replace('/public', '');
      const parts = path.split('/');
      const fileName = parts.pop();
      const folderName = parts[parts.length - 1];

      if (!groups[folderName]) groups[folderName] = [];
      
      const isDrum = /drum|snare|kick|hat|perc|loop/i.test(fileName);
      
      const sample = { 
        id: index + 1, 
        name: fileName, 
        folder: folderName, 
        type: isDrum ? "Drum" : "Melody", 
        size: "WAV", 
        bpm: "-", 
        fileUrl: cleanUrl 
      };
      
      groups[folderName].push(sample);
      flatList.push(sample);
    });
    return { groupedSamples: groups, allSamples: flatList };
  }, [audioFiles]);

  const searchResults = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return {
      folders: Object.keys(groupedSamples).filter(f => f.toLowerCase().includes(term)),
      samples: allSamples.filter(s => s.name.toLowerCase().includes(term))
    };
  }, [groupedSamples, allSamples, searchTerm]);

  const handleBack = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlayingId(null);
    setExpandedFolder(null);
    setSearchTerm("");
  };

  const handleDownloadFolder = async (folderName, samples) => {
    setIsZipping(true);
    const zip = new JSZip();
    
    try {
      for (const sample of samples) {
        const response = await fetch(sample.fileUrl);
        const blob = await response.blob();
        zip.file(sample.name, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}_pack.zip`);
    } catch (error) {
      console.error("Kunde inte skapa zip-fil:", error);
    } finally {
      setIsZipping(false);
    }
  };

  useEffect(() => {
    allSamples.forEach(({ fileUrl }) => {
      if (preloadedAudioRef.current.has(fileUrl)) return;
      const audio = new Audio(fileUrl);
      audio.preload = "auto";
      audio.load();
      preloadedAudioRef.current.set(fileUrl, audio);
    });
  }, [allSamples]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      preloadedAudioRef.current.forEach((audio) => { audio.pause(); audio.src = ""; });
      preloadedAudioRef.current.clear();
    };
  }, []);

  const handlePlay = (id, fileUrl) => {
    if (isPlayingId === id && audioRef.current) {
      if (!audioRef.current.paused) { audioRef.current.pause(); setIsPlayingId(null); }
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.removeEventListener('timeupdate', handleTimeUpdate); }
    const cachedAudio = preloadedAudioRef.current.get(fileUrl);
    const audio = cachedAudio || new Audio(fileUrl);
    audio.currentTime = 0;
    audioRef.current = audio;
    setIsPlayingId(id);
    setProgress(0);
    setCurrentTime(0);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.onended = () => { setIsPlayingId(null); setProgress(0); setCurrentTime(0); };
    audio.play().catch(err => console.error("Playback failed:", err));
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;
    setCurrentTime(current);
    setDuration(dur);
    setProgress(dur > 0 ? (current / dur) * 100 : 0);
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
    link.href = fileUrl; link.download = fileName; 
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return (
    <div className="samples-page">
      <div className="header-container">
        <h2>{expandedFolder ? expandedFolder : "Browse Handcrafted Samples"}</h2>
        {expandedFolder && (
          <button 
            className="download-pack-button" 
            onClick={() => handleDownloadFolder(expandedFolder, groupedSamples[expandedFolder])}
            disabled={isZipping}
          >
            {isZipping ? "Packar..." : "↓ Download Folder"}
          </button>
        )}
      </div>
      <div className="search-bar-container">
        <input type="text" placeholder="Search..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <div className="samples-container">
        {searchTerm ? (
          <>
            {searchResults.folders.map(f => (
              <button key={f} className="folder-card" onClick={() => { setExpandedFolder(f); setSearchTerm(""); }}> {f}</button>
            ))}
            {searchResults.samples.map(item => (
              <SampleCard key={item.id} item={item} isPlaying={isPlayingId === item.id} onPlay={handlePlay} onDownload={handleDownload} currentTime={currentTime} progress={progress} duration={duration} onScrub={handleScrub} formatTime={formatTime} />
            ))}
          </>
        ) : expandedFolder ? (
          <>
            <button className="back-button" onClick={handleBack}>← Back</button>
            {groupedSamples[expandedFolder].map(item => (
              <SampleCard key={item.id} item={item} isPlaying={isPlayingId === item.id} onPlay={handlePlay} onDownload={handleDownload} currentTime={currentTime} progress={progress} duration={duration} onScrub={handleScrub} formatTime={formatTime} />
            ))}
          </>
        ) : (
          Object.keys(groupedSamples).map(folder => (
            <button key={folder} className="folder-card" onClick={() => setExpandedFolder(folder)}> {folder}</button>
          ))
        )}
      </div>
    </div>
  );
}

function SampleCard({ item, isPlaying, onPlay, onDownload, currentTime, progress, duration, onScrub, formatTime }) {
  return (
    <div className={`sample-card ${isPlaying ? 'active-card' : ''}`}>
      <div className="sample-info">
        <button className="play-button" onClick={() => onPlay(item.id, item.fileUrl)}>
          <span className="play-icon">{isPlaying ? "⏸" : "▶"}</span>
        </button>
        <div className="sample-text">
          <span className="sample-name">{item.name}</span>
          <div className="sample-details">
            <span className="sample-tag">{item.type}</span>
            <span>•</span> <span>{item.folder}</span>
          </div>
        </div>
        <button className="download-button" onClick={() => onDownload(item.fileUrl, item.name)}>↓ Download</button>
      </div>
      <div className="timeline-container">
        <span className="time-display">{isPlaying ? formatTime(currentTime) : "0:00"}</span>
        <input type="range" className="seek-slider" min="0" max="100" step="0.1" value={isPlaying ? progress : 0} onChange={onScrub} disabled={!isPlaying} />
        <span className="time-display">{isPlaying ? formatTime(duration) : "0:00"}</span>
      </div>
    </div>
  );
}