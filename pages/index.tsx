import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { Mode, modes, getStartOfChatMessage } from "../lib/modes";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Home: NextPage = () => {
  const [selectedMode, setSelectedMode] = useState<Mode>('executive');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startChat = useCallback((mode: Mode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
    const welcomeMessage = getStartOfChatMessage(mode);
    setMessages([{ role: 'assistant', content: welcomeMessage }]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0), { role: 'user', content: userMessage }],
          mode: selectedMode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage += parsed.content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage };
                    return newMessages;
                  });
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShowModeSelector(true);
  };

  const currentMode = modes[selectedMode];

  if (showModeSelector) {
    return (
      <div className="app-container">
        <Head>
          <title>GrowDIS v5.0</title>
          <meta name="description" content="GrowDIS v5.0 - Multi-Mode AI Assistant" />
          <link rel="icon" href="/logo.png" />
        </Head>

        <div className="mode-selector-page">
          <div className="logo-container">
            <Image src="/logo.png" alt="GrowDIS Logo" width={120} height={120} priority />
            <h1>GrowDIS v5.0</h1>
            <p className="tagline">Precision. Strategy. Truth.</p>
          </div>

          <div className="modes-grid">
            {Object.values(modes).map((mode) => (
              <button
                key={mode.id}
                className="mode-card"
                onClick={() => startChat(mode.id)}
                style={{ '--mode-color': mode.color } as React.CSSProperties}
              >
                <span className="mode-icon">{mode.icon}</span>
                <h3>{mode.name}</h3>
                <p>{mode.description}</p>
              </button>
            ))}
          </div>

          <footer className="footer">
            <p>Created by Fuller Horizons LLC</p>
          </footer>
        </div>

        <style jsx>{`
          .app-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          }
          .mode-selector-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .logo-container {
            text-align: center;
            margin-bottom: 3rem;
          }
          .logo-container h1 {
            color: #fff;
            font-size: 2.5rem;
            margin: 1rem 0 0.5rem;
            font-weight: 700;
          }
          .tagline {
            color: #94a3b8;
            font-size: 1.1rem;
            letter-spacing: 0.1em;
          }
          .modes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            max-width: 1000px;
            width: 100%;
          }
          .mode-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
          }
          .mode-card:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--mode-color);
            transform: translateY(-4px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          }
          .mode-icon {
            font-size: 2.5rem;
            display: block;
            margin-bottom: 1rem;
          }
          .mode-card h3 {
            color: #fff;
            font-size: 1.25rem;
            margin: 0 0 0.5rem;
          }
          .mode-card p {
            color: #94a3b8;
            font-size: 0.9rem;
            margin: 0;
          }
          .footer {
            margin-top: 3rem;
            color: #64748b;
            font-size: 0.85rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <Head>
        <title>{currentMode.name} - GrowDIS v5.0</title>
        <meta name="description" content={`GrowDIS v5.0 - ${currentMode.name}`} />
        <link rel="icon" href="/logo.png" />
      </Head>

      <header className="chat-header" style={{ '--mode-color': currentMode.color } as React.CSSProperties}>
        <div className="header-left">
          <Image src="/logo.png" alt="GrowDIS" width={40} height={40} />
          <div className="header-info">
            <h1>GrowDIS v5.0</h1>
            <span className="current-mode">
              {currentMode.icon} {currentMode.name}
            </span>
          </div>
        </div>
        <button className="reset-btn" onClick={resetChat}>
          Change Mode
        </button>
      </header>

      <main className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.role === 'assistant' && (
                <span className="assistant-icon">{currentMode.icon}</span>
              )}
              <div className="message-text">
                {message.content.split('\n').map((line, i) => (
                  <p key={i}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="message assistant">
            <div className="message-content">
              <span className="assistant-icon">{currentMode.icon}</span>
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <form className="input-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            disabled={isLoading}
            rows={1}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </div>
      </form>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #0f172a;
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: linear-gradient(90deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-info h1 {
          color: #fff;
          font-size: 1.25rem;
          margin: 0;
          font-weight: 600;
        }
        .current-mode {
          color: var(--mode-color);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .reset-btn {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .reset-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .message {
          max-width: 85%;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message.user {
          align-self: flex-end;
        }
        .message.assistant {
          align-self: flex-start;
        }
        .message-content {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        .assistant-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .message-text {
          padding: 1rem 1.25rem;
          border-radius: 16px;
          line-height: 1.6;
        }
        .message.user .message-text {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .message.assistant .message-text {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          border-bottom-left-radius: 4px;
        }
        .message-text p {
          margin: 0;
        }
        .message-text p + p {
          margin-top: 0.5rem;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #64748b;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); }
          40% { transform: scale(1.2); }
        }
        .input-form {
          padding: 1rem 1.5rem;
          background: rgba(15, 23, 42, 0.95);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .input-container {
          display: flex;
          gap: 0.75rem;
          max-width: 900px;
          margin: 0 auto;
        }
        .input-container textarea {
          flex: 1;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 0.875rem 1rem;
          color: #fff;
          font-size: 1rem;
          resize: none;
          font-family: inherit;
          min-height: 48px;
          max-height: 200px;
        }
        .input-container textarea:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.5);
        }
        .input-container textarea::placeholder {
          color: #64748b;
        }
        .input-container button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 0 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .input-container button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .input-container button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Home;
