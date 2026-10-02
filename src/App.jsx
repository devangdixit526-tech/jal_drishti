import Navbar from './components/Navbar';
import Hero from './components/Hero';

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Hero Section */}
      <main>
        <Hero />
      </main>
    </div>
  );
}

export default App;