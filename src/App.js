import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import WebsiteAnalyzer from './websiteanalyzer/components/WebsiteAnalyzer';
import InstagramAnalyzer from './instagramanalyzer/components/InstagramAnalyzer';
import YoutubeAnalyzer from './youtubeanalyzer/components/YoutubeAnalyzer';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/websiteanalyzer" element={<WebsiteAnalyzer />} />
          <Route path="/instagramanalyzer" element={<InstagramAnalyzer />} />
          <Route path="/youtubeanalyzer" element={<YoutubeAnalyzer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;