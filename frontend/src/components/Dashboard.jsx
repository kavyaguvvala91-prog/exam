import React, { useEffect, useRef, useState } from "react";
import "./Dashboard.css";
import { fetchLoggedUsers } from "../services/api";

function Dashboard() {
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [loggedInUsername, setLoggedInUsername] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [loggedUsers, setLoggedUsers] = useState([]);
  const [audioAttempted, setAudioAttempted] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem("loggedInUsername") || "";
    const storedRole = localStorage.getItem("userRole") || "user";
    setLoggedInUsername(storedUsername);
    setUserRole(storedRole);
  }, []);

  useEffect(() => {
    const loadLoggedUsers = async () => {
      if (userRole !== "admin") return;

      try {
        const token = localStorage.getItem("authToken") || "";
        const response = await fetchLoggedUsers(token);
        setLoggedUsers(response.data || []);
      } catch (err) {
        console.log("Unable to fetch logged users");
      }
    };

    loadLoggedUsers();
  }, [userRole]);

  useEffect(() => {
    if (audioRef.current && !audioAttempted) {
      const attemptAutoplay = async () => {
        try {
          audioRef.current.muted = false;
          audioRef.current.volume = volume;
          await audioRef.current.play();
          setAudioAttempted(true);
        } catch (error) {
          console.log("Autoplay blocked, audio ready on user interaction");
        }
      };

      const timer = setTimeout(attemptAutoplay, 500);
      return () => clearTimeout(timer);
    }
  }, [audioAttempted, volume]);

  useEffect(() => {
    if (videoRef.current && !videoPlayed) {
      const playVideo = async () => {
        try {
          videoRef.current.muted = false;
          videoRef.current.volume = volume;
          await videoRef.current.play();
          setVideoPlayed(true);
        } catch (error) {
          console.log("Video autoplay blocked");
        }
      };

      const timer = setTimeout(playVideo, 300);
      return () => clearTimeout(timer);
    }
  }, [videoPlayed, volume]);

  const handlePausePlay = () => {
    if (videoRef.current && audioRef.current) {
      if (isPaused) {
        videoRef.current.play();
        audioRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        audioRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleVolumeChange = (event) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    if (videoRef.current) videoRef.current.volume = newVolume;
    if (audioRef.current) audioRef.current.volume = newVolume;
  };

  const handleSeek = (event) => {
    const seekTo = Number(event.target.value);
    setCurrentTime(seekTo);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTo;
    }
  };

  const formatTime = (value) => {
    if (!Number.isFinite(value)) return "0:00";
    const mins = Math.floor(value / 60);
    const secs = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="dashboard">
      <div className="spark spark-one" />
      <div className="spark spark-two" />
      <div className="spark spark-three" />

      <div className="header">
        <h1>Welcome Superstar!</h1>
        <p>
          {loggedInUsername
            ? `Logged in as: ${loggedInUsername}`
            : "Student Portal Dashboard - Study Hard, Vibe Harder"}
        </p>
      </div>

      <div className="fun-tags">
        <span>Goal Mode</span>
        <span>Snack Power</span>
        <span>No Stress Zone</span>
      </div>

      <div className="video-section">
        <video
          ref={videoRef}
          className="video-player"
          autoPlay
          playsInline
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onEnded={() => setIsPaused(true)}
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support video playback.
        </video>

        <div className="controls-container">
          <button
            className="yt-icon-btn"
            onClick={handlePausePlay}
            title={isPaused ? "Play" : "Pause"}
            type="button"
          >
            {isPaused ? "Play" : "Pause"}
          </button>

          <input
            className="yt-progress-slider"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            aria-label="Seek"
          />

          <span className="yt-volume-icon" aria-hidden="true">
            {volume === 0 ? "Muted" : "Volume"}
          </span>
          <input
            className="yt-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
          />
          <div className="yt-time-pill">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      <div className="message">
        Pass avuthav le bro, tension padaku. You got this.
      </div>

      {userRole === "admin" && (
        <div className="message" style={{ marginTop: "12px", textAlign: "left" }}>
          <strong>Logged Usernames:</strong>
          <div>
            {loggedUsers.length === 0
              ? " No users have logged in yet"
              : loggedUsers.map((user) => user.username).join(", ")}
          </div>
        </div>
      )}

      <audio ref={audioRef} autoPlay>
        <source src="/audio.mp3.mpeg" type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default Dashboard;
