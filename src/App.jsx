import './App.css'
import { Routes, Route, } from 'react-router-dom'
import { Home } from './components/build/Home'
import { Samples } from './components/pages/Samples'
import { Synth } from './components/pages/Synth'
import { Header } from './components/build/Header'
import { Footer } from './components/build/Footer'

function App() {


  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/samples" element={<Samples />} />
          <Route path="/synth" element={<Synth />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App