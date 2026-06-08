import { Footer } from "./Footer";
import { Header } from "./Header";

export function Home() {
  return (
    <>
      <div className="home" style={{ textAlign: 'left' }}>
        <h2>Welcome to samp1e</h2>
        
        <p className="hero-subtitle">
          <strong>Hey, and welcome.</strong>
          <br /><br />
          I've spent a lot of time creating these samples and putting together sounds that I personally enjoy making and working with. This collection comes from countless hours of experimenting, learning, and simply having fun creating music.
          <br /><br />
          My goal is simple: to share something useful with other producers and creators. Whether you're working on a track, starting a new project, or just looking for a bit of inspiration, feel free to use these samples in any way that helps bring your ideas to life.
          <br /><br />
          Music has always been about sharing ideas and building on each other's creativity. That's the mindset behind everything you'll find here. Take what works for you, make it your own, and create something unique.
          <br /><br />
          Thank you for checking out my work and supporting an independent creator. It truly means a lot. I hope these samples help spark new ideas, push your creativity further, and become part of projects you're proud of.
          <br /><br />
          <em>Have fun creating.</em>
        </p>

        <div className="cta-container">
          <a href="/samples" className="cta-button">Browse Samp1es</a>
        </div>
      </div>
    </>
  );
}