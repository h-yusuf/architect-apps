import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { signInAnonymously } from "firebase/auth";
import { auth } from "./firebase";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import About from "./pages/About";

function App() {
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;
