import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import StudentPortal from './StudentPortal.jsx';
import RecruiterPortal from './RecruiterPortal.jsx';
import AdminPortal from './AdminPortal.jsx';

const App = () => {
  const [currentPortal, setCurrentPortal] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('app_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('app_theme', 'light');
    }
  }, [darkMode]);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
      { id: 1, text: "Welcome to SPRM System! How can I help you?", sender: 'bot' }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleChatSubmit = (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg = { id: Date.now(), text: chatInput, sender: 'user' };
      setChatMessages(prev => [...prev, userMsg]);
      
      let botResponseText = "I can help you navigate to Student, Recruiter, or Admin portals.";
      const lowerInput = chatInput.toLowerCase();

      if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
          botResponseText = "Hello! Welcome to the Smart Placement & Recruitment Management System.";
      } else if (lowerInput.includes('student')) {
          botResponseText = "Click on the 'Student Portal' card to access student features like applying for jobs and taking tests.";
      } else if (lowerInput.includes('recruiter') || lowerInput.includes('company')) {
          botResponseText = "Recruiters can log in via the 'Recruiter Portal' to post jobs and manage applicants.";
      } else if (lowerInput.includes('admin')) {
          botResponseText = "Admins can manage the entire system through the 'Admin Portal'.";
      }

      setTimeout(() => {
          setChatMessages(prev => [...prev, { id: Date.now() + 1, text: botResponseText, sender: 'bot' }]);
      }, 500);

      setChatInput("");
  };

  const renderPortal = () => {
    switch (currentPortal) {
      case 'student':
        return <StudentPortal />;
      case 'recruiter':
        return <RecruiterPortal />;
      case 'admin':
        return <AdminPortal />;
      default:
        return (
          <div className="home-container">
            <div className="hero-content">
              <h1 className="main-title">Smart Placement <br />& Recruitment System</h1>
              <p className="subtitle">Your gateway to career success. Connect, Recruit, and Manage with ease.</p>
              <div className="portal-cards">
                <button className="portal-card student-card" onClick={() => setCurrentPortal('student')}>
                  <span className="icon">🎓</span>
                  <span className="label">Student Portal</span>
                </button>
                <button className="portal-card recruiter-card" onClick={() => setCurrentPortal('recruiter')}>
                  <span className="icon">💼</span>
                  <span className="label">Recruiter Portal</span>
                </button>
                <button className="portal-card admin-card" onClick={() => setCurrentPortal('admin')}>
                  <span className="icon">⚙️</span>
                  <span className="label">Admin Portal</span>
                </button>
              </div>
            </div>
            
            {/* Animated Background Elements */}
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            {/* Chat Widget */}
            <div className="chat-widget">
                {isChatOpen && (
                    <div className="chat-window">
                        <div className="chat-header">
                            <span>SPRM Assistant</span>
                            <button onClick={() => setIsChatOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.2rem'}}>×</button>
                        </div>
                        <div className="chat-messages">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                        <form className="chat-input-area" onSubmit={handleChatSubmit}>
                            <input 
                                type="text" 
                                placeholder="Type a message..." 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                            />
                            <button type="submit">Send</button>
                        </form>
                    </div>
                )}
                <button className="chat-toggle-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      <button 
        className="theme-toggle" 
        onClick={() => setDarkMode(!darkMode)}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      {currentPortal && (
        <button className="back-home-btn" onClick={() => setCurrentPortal(null)}>
          &larr; Back to Home
        </button>
      )}
      {renderPortal()}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default App;