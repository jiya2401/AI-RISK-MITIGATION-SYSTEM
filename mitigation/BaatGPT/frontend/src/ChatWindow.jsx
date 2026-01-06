import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import './LoadingAnimations.css';
import './ScrollAnimations.css';

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
    sidebarCollapsed,
    setSidebarCollapsed,
    darkMode,
    toggleTheme
  } = useContext(MyContext);
  
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [mlFlags, setMlFlags] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMlPanel, setShowMlPanel] = useState(true);
  const [mlCollapsed, setMlCollapsed] = useState(false);
  const [testMode, setTestMode] = useState(true); // Enable test mode by default for demo

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      // Update scroll progress
      const scrollProgress = document.querySelector('.scroll-progress');
      if (scrollProgress) {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        scrollProgress.style.width = `${scrollPercent}%`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getReply = async () => {
    if (!prompt.trim()) return;
    setMlFlags(null);
    setLoading(true);
    setNewChat(false);
    
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    };

    try {
      // Use test endpoint when in test mode, otherwise use real API
      const endpoint = testMode ? '/api/test-ui' : '/api/thread';
      const response = await fetch(endpoint, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const res = await response.json();
      console.log('API Response:', res);
      
      // Extract reply text
      const text = res.reply || res.openai_output || 'No reply';
      setReply(text);
      
      // Show ML panel when we have a response
      setShowMlPanel(true);
      
      // Process ML flags from the new backend format
      if (res.mlFlags) {
        setMlFlags(res.mlFlags);
      } else {
        // Fallback for unavailable ML service
        setMlFlags({ status: 'unavailable' });
      }
    } catch(err) {
      console.error('Fetch error:', err);
      setReply("Sorry, I encountered an error. Please try again.");
      setMlFlags({ status: 'error' });
    }
    
    setLoading(false);
  };

  // Streaming variant: call /api/thread/stream and process SSE-like chunks
  const getReplyStream = async () => {
    if (!prompt.trim()) return;
    setMlFlags(null);
    setLoading(true);
    setNewChat(false);

    try {
      const res = await fetch('/api/thread/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assembledText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!raw) continue;
          const line = raw.replace(/^data:\s*/, '');
          try {
            const payload = JSON.parse(line);
            if (payload.type === 'openai') {
              assembledText = payload.text;
              setReply(assembledText);
              setShowMlPanel(true);
            } else if (payload.type === 'ml') {
              setMlFlags(payload.mlFlags || { status: 'unavailable' });
              setShowMlPanel(true);
            } else if (payload.type === 'error') {
              setReply('Error: ' + payload.message);
              setMlFlags({ status: 'error' });
            }
          } catch (e) {
            console.error('stream parse error', e, line);
          }
        }
      }

    } catch (err) {
      console.error('Stream fetch error', err);
      setReply('Sorry, streaming failed.');
      setMlFlags({ status: 'error' });
    }

    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && prompt.trim()) {
  if (streaming) getReplyStream();
  else getReply();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Append new chat to prevChats
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats(prevChats => ([
        ...prevChats,
        { role: "user", content: prompt },
        { role: "assistant", content: reply }
      ]));
    }
    setPrompt("");
  }, [reply]);

  return (
    <div className={`chatWindow ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress"></div>

      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle sidebar"
          >
            <i className="fas fa-bars"></i>
          </button>
          <span>स्पष्टGPT</span>
          {testMode && (
            <span style={{
              marginLeft: '10px',
              padding: '4px 8px',
              background: 'rgba(251, 191, 36, 0.2)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#fbbf24'
            }}>
              DEMO MODE
            </span>
          )}
        </div>
        <div className="navbar-right">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <div className="userIconDiv">
            <div className="userIcon">
              <i className="fas fa-user" style={{fontSize: '14px'}}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      {loading ? (
        <div className="loading-container">
          {/* Neural Network Loader */}
          <div className="neural-loader">
            <div className="neural-node"></div>
            <div className="neural-node"></div>
            <div className="neural-node"></div>
            <div className="neural-node"></div>
            <div className="neural-node"></div>
            <div className="neural-node"></div>
          </div>
          
          {/* Alternative loaders - uncomment to use */}
          {/* 
          <div className="quantum-loader">
            <div className="quantum-dot"></div>
            <div className="quantum-dot"></div>
            <div className="quantum-dot"></div>
          </div>
          */}
          
          {/* 
          <div className="holographic-loader">
            <div className="holographic-ring"></div>
            <div className="holographic-ring"></div>
            <div className="holographic-ring"></div>
            <div className="holographic-core"></div>
          </div>
          */}
          
          {/* 
          <div className="matrix-loader">
            <div className="matrix-column"></div>
            <div className="matrix-column"></div>
            <div className="matrix-column"></div>
            <div className="matrix-column"></div>
            <div className="matrix-column"></div>
            <div className="matrix-column"></div>
          </div>
          */}
        </div>
      ) : (
        <Chat />
      )}

      {/* Scroll to Top Button */}
      <button 
        className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Scroll to top"
      >
        <i className="fas fa-arrow-up"></i>
      </button>

      {/* Chat Input */}
      <div className="chatInput">
        <form onSubmit={handleSubmit} className="inputBox">
          <label htmlFor="chat-input" className="sr-only">Message input</label>
          <input
            value={prompt}
            id="chat-input"
            aria-label="Type your message"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={loading}
          />
          <div className="controls">
            <label className="control-label" htmlFor="stream-toggle">Stream</label>
            <button
              type="button"
              id="stream-toggle"
              className={"stream-toggle" + (streaming ? ' active' : '')}
              onClick={() => setStreaming(s => !s)}
              aria-pressed={streaming}
              title="Toggle streaming (OpenAI output appears immediately; ML flags arrive when ready)">
              {streaming ? 'ON' : 'OFF'}
            </button>
            <button
              id="submit"
              type="submit"
              disabled={loading || !prompt.trim()}
              style={{
                opacity: loading || !prompt.trim() ? 0.5 : 1,
                cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </form>
        
      </div>
      {/* ML Flags panel */}
      {showMlPanel && (
        <div className={"ml-flags-panel" + (mlCollapsed ? ' collapsed' : '')} role="status" aria-live="polite">
          {mlCollapsed ? (
            <div className="collapsed-icon" title="Expand ML Risk Analysis" onClick={() => setMlCollapsed(false)}>
              <i className="fas fa-shield-alt"></i>
            </div>
          ) : (
            <>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '12px'}}>
                <div className="panel-row">
                  <i className="fas fa-shield-alt" style={{marginRight: 8}}></i>
                  <strong style={{fontSize:15}}>AI Risk Analysis</strong>
                </div>
                <div style={{display:'flex', gap:8}}>
                  <button type="button" className="stream-toggle" onClick={() => setMlCollapsed(true)} title="Collapse">‒</button>
                  <button type="button" className="stream-toggle" onClick={() => setShowMlPanel(false)} title="Hide">✕</button>
                </div>
              </div>
              <div>
                {!mlFlags || mlFlags.status === 'loading' ? (
                  <div className="ml-loading">
                    <div className="spinner"></div>
                    <span style={{marginLeft: 8}}>Analyzing risks...</span>
                  </div>
                ) : mlFlags.status === 'unavailable' ? (
                  <div className="ml-unavailable">
                    <i className="fas fa-exclamation-triangle" style={{marginRight: 8}}></i>
                    <span>ML service unavailable</span>
                  </div>
                ) : mlFlags.status === 'error' ? (
                  <div className="ml-error">
                    <i className="fas fa-times-circle" style={{marginRight: 8}}></i>
                    <span>Analysis failed</span>
                  </div>
                ) : (
                  <div className="ml-flags-content">
                    {/* Check if all risks are low */}
                    {mlFlags.hallucination_risk === 'LOW' && 
                     mlFlags.bias_risk === 'LOW' && 
                     mlFlags.toxicity_risk === 'LOW' && 
                     mlFlags.fraud_risk === 'LOW' && 
                     !mlFlags.pii_leak ? (
                      <div className="no-risk-detected">
                        <i className="fas fa-check-circle" style={{color: '#10b981', marginRight: 8}}></i>
                        <span>No significant risks detected</span>
                      </div>
                    ) : (
                      <div className="risk-flags-grid">
                        {/* Hallucination Risk */}
                        <div className={`risk-flag risk-${mlFlags.hallucination_risk?.toLowerCase()}`} title="AI may have generated false or unverified information">
                          <div className="risk-flag-header">
                            <i className="fas fa-brain"></i>
                            <span className="risk-label">Hallucination</span>
                          </div>
                          <span className="risk-value">{mlFlags.hallucination_risk}</span>
                        </div>

                        {/* Bias Risk */}
                        <div className={`risk-flag risk-${mlFlags.bias_risk?.toLowerCase()}`} title="Response may contain biased language or perspectives">
                          <div className="risk-flag-header">
                            <i className="fas fa-balance-scale"></i>
                            <span className="risk-label">Bias</span>
                          </div>
                          <span className="risk-value">{mlFlags.bias_risk}</span>
                        </div>

                        {/* Toxicity Risk */}
                        <div className={`risk-flag risk-${mlFlags.toxicity_risk?.toLowerCase()}`} title="Response may contain harmful or offensive content">
                          <div className="risk-flag-header">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span className="risk-label">Toxicity</span>
                          </div>
                          <span className="risk-value">{mlFlags.toxicity_risk}</span>
                        </div>

                        {/* Fraud Risk */}
                        <div className={`risk-flag risk-${mlFlags.fraud_risk?.toLowerCase()}`} title="Response may contain suspicious or fraudulent patterns">
                          <div className="risk-flag-header">
                            <i className="fas fa-user-secret"></i>
                            <span className="risk-label">Fraud</span>
                          </div>
                          <span className="risk-value">{mlFlags.fraud_risk}</span>
                        </div>

                        {/* PII Leak */}
                        <div className={`risk-flag risk-${mlFlags.pii_leak ? 'high' : 'low'}`} title="Response may contain personally identifiable information">
                          <div className="risk-flag-header">
                            <i className="fas fa-user-lock"></i>
                            <span className="risk-label">PII Leak</span>
                          </div>
                          <span className="risk-value">{mlFlags.pii_leak ? 'YES' : 'NO'}</span>
                        </div>

                        {/* Confidence Score */}
                        <div className="risk-flag confidence-score" title="ML model confidence in the analysis">
                          <div className="risk-flag-header">
                            <i className="fas fa-chart-line"></i>
                            <span className="risk-label">Confidence</span>
                          </div>
                          <span className="risk-value">{(mlFlags.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Processing time */}
                    {mlFlags.processing_time_ms && (
                      <div className="ml-footer">
                        <small>Analysis completed in {mlFlags.processing_time_ms.toFixed(0)}ms</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
