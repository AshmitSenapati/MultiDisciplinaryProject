import { useState, useEffect, useRef } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import Highlighter from "react-highlight-words";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [listening, setListening] = useState(false);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSaved, setIsSaved] = useState(false); // ✅ NEW

  const chatEndRef = useRef(null);
  const activeRef = useRef(null);
  const chatBoxRef = useRef(null);

  const [chatLoaded, setChatLoaded] = useState(false);

  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [historySearch, setHistorySearch] = useState("");

  const cleanTitle = message
  .replace(/[^\w\s]/gi, "")
  .split("")
  .slice(0, 6)
  .join(" ");


  // Load saved history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setHistory(saved);
  }, []);

  useEffect(() => {
  const savedId = localStorage.getItem("activeChatId");

  if (savedId && history.length > 0) {
    const found = history.find(h => h.id == savedId);

    if (found) {
      setChat(found.messages);
      setActiveChatId(found.id);
    }
  }
}, [history]);

  // Load current chat
  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentChat"));
    if (current) setChat(current);
  }, []);

  // Persist current chat
  useEffect(() => {
    localStorage.setItem("currentChat", JSON.stringify(chat));
  }, [chat]);

  // Auto scroll
  useEffect(() => {
  if (chatBoxRef.current) {
    chatBoxRef.current.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth"
    });
  }
}, [chat]);

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowHistory(false);
    }
  };
  window.addEventListener("keydown", handleKeyDown);

  return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
  activeRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
  }, [activeChatId]);

  useEffect(() => {
  if (chatLoaded) {
    setTimeout(() => {
      chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // slight delay ensures render is done

    setChatLoaded(false);
  }
}, [chatLoaded]);

useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("chatHistory")) || [];

  // 🔥 FIX OLD DATA
  const fixed = saved.map(h => ({
    ...h,
    title: h.title || "Untitled Chat"
  }));

  setHistory(fixed);
}, []);

useEffect(() => {
  speechSynthesis.getVoices();

  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}, []);

  // 🎤 Voice Input
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return alert("Speech not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();
    setListening(true);

    recognition.onresult = e => {
      setMessage(e.results[0][0].transcript);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
  };

  const stopSpeech = () => {
  speechSynthesis.cancel();
};

  // 🚀 Send + stream response
  const sendMessage = async (customMsg) => {
    const msg = customMsg || message;
    if (!msg.trim()) return;

    setActiveChatId(null);

    const time = new Date().toLocaleTimeString();

    setChat(prev => [...prev, { user: msg, time, bot: "" }]);
    setMessage("");
    setTyping(true);

    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const data = await res.json();
    setTyping(false);

    const words = data.reply.split("");
    let index = 0;

    const interval = setInterval(() => {
      index++;
      setChat(prev => {
        const updated = [...prev];
        updated[updated.length - 1].bot =
          words.slice(0, index).join(" ");
        return updated;
      });
      if (index === words.length) clearInterval(interval);
    }, 25);

    // ✅ AUTO SAVE HISTORY (MAIN FIX)
    if (!isSaved) {
      const now = new Date();

      const entry = {
        id: Date.now(),
        title: cleanTitle,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        pinned: false,
        messages: [...chat, { user: msg, time, bot: data.reply }]
      };

      const updated = [entry, ...history];
      setHistory(updated);
      localStorage.setItem("chatHistory", JSON.stringify(updated));
      setIsSaved(true);
    }
  };

  // 📂 Load old chat
  const loadChat = (messages, id) => {
    setChat(messages);
    setActiveChatId(id);
    setShowHistory(false);
    setChatLoaded(true); // 👈 trigger scroll

    localStorage.setItem("activeChatId", id);
  };

  // 🆕 New chat
  const startNewChat = () => {
    setChat([]);
    setActiveChatId(null);
    setIsSaved(false); // ✅ reset save flag
  };

  const editTitle = (id) => {
  const newTitle = prompt("Enter new chat name:");
  if (!newTitle) return;

  const updated = history.map(h =>
    h.id === id ? { ...h, title: newTitle } : h
  );

  setHistory(updated);
  localStorage.setItem("chatHistory", JSON.stringify(updated));
};

  // 🔍 Filter chat
  const filteredChat = chat.filter(c =>
    (c.user + (c.bot || "")).toLowerCase().includes(search.toLowerCase())
  );

  // 📄 Export PDF
  const exportToPDF = () => {
    if (chat.length === 0) return;

    const doc = new jsPDF();
    let y = 10;

    chat.forEach((msg) => {
      doc.text(`User: ${msg.user}`, 10, y);
      y += 8;

      if (msg.bot) {
        const splitText = doc.splitTextToSize(`Bot: ${msg.bot}`, 180);
        doc.text(splitText, 10, y);
        y += splitText.length * 8;
      }

      y += 5;
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save("VIT_Chat_History.pdf");
  };

  const togglePin = (id) => {
  const updated = history.map(h =>
    h.id === id ? { ...h, pinned: !h.pinned } : h
  );

  // pinned chats on top
  updated.sort((a, b) => b.pinned - a.pinned);

  setHistory(updated);
  localStorage.setItem("chatHistory", JSON.stringify(updated));
};

const regenerateResponse = async (index) => {
  const userMsg = chat[index].user;

  setTyping(true);

  const res = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: userMsg })
  });

  const data = await res.json();
  setTyping(false);

  setChat(prev => {
    const updated = [...prev];
    updated[index].bot = data.reply;
    return updated;
  });
};

  // 🗑 Delete chat
  const deleteChat = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem("chatHistory", JSON.stringify(updated));
  };

  // 📋 Copy (FIXED)
  const copyText = (text) => {
    try {
      navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Copied!");
    }
  };

  const extractText = (node) => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node?.props?.children) return extractText(node.props.children);
    return "";
  };

  const cleanTextForSpeech = (text) => {
  if (!text) return "";

  return text
    // remove markdown symbols INCLUDING +
    .replace(/[#*_>`~\-+]/g, "")

    // convert bullet lines into sentences
    .replace(/\n\s*/g, ". ")

    // remove extra spaces
    .replace(/\s+/g, " ")

    // trim
    .trim();
};

  const speak = (text) => {
  speechSynthesis.cancel();

  const cleanText = cleanTextForSpeech(text);

  const utter = new SpeechSynthesisUtterance(cleanText);

  utter.rate = 0.9;
  utter.pitch = 1;
  utter.volume = 1;

  const voices = speechSynthesis.getVoices();

  const preferred =
    voices.find(v => v.name.includes("Google") && v.lang === "en-US") ||
    voices.find(v => v.lang === "en-US") ||
    voices[0];

  if (preferred) utter.voice = preferred;

  speechSynthesis.speak(utter);
};

  return (
    <div className="app">

      {/* 📚 History Sidebar */}
      {showHistory && <div className="overlay" onClick={() => setShowHistory(false)} />}
      <div className={`history-panel ${showHistory ? "show" : ""}`}>
        <h3>History</h3>

        <input
  placeholder="Search history..."
  value={historySearch}
  onChange={(e) => setHistorySearch(e.target.value)}
  className="history-search"
/>

        {history.length === 0 && <p>No chats yet</p>}

        {history
  .filter(h =>
    (h.title || "")
      .toLowerCase()
      .includes((historySearch || "").toLowerCase())
  )

  .map(h => (
          <div
  key={h.id}
  ref={activeChatId === h.id ? activeRef : null}
  className={`history-item ${activeChatId === h.id ? "active" : ""}`}
  onClick={() => loadChat(h.messages, h.id)}
>
            <div className="history-content" onClick={() => loadChat(h.messages, h.id)}>
            <div className="history-title">{h.title}</div>
            <div className="history-time">
              {h.date} • {h.time}
            </div>
          </div>

          <button onClick={() => editTitle(h.id)}>✏️</button>

          <button
  onClick={(e) => {
    e.stopPropagation();
    togglePin(h.id);
  }}
>
  {h.pinned ? "⭐✅" : "⭐"}
</button>

            <button className="delete-btn" onClick={(e) => {e.stopPropagation(); deleteChat(h.id);}}>
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="chat-container">

        {showScrollBtn && (
  <button
    className="scroll-btn"
    onClick={() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }}
  >
    ⬇
  </button>
)}

        <div className="header">
          <h1>VIT Smart Assistant 🤖</h1>
        </div>

        <div className="controls-row">
          <input
            className="search"
            placeholder="Search chat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="action-buttons">
            <button onClick={() => setShowHistory(!showHistory)}>📚</button>
            <button onClick={exportToPDF}>📄</button>
            <button onClick={startNewChat}>🆕</button>
          </div>
        </div>

        {/* Chat */}
        <div
  className="chat-box"
  ref={chatBoxRef}
  onScroll={(e) => {
    const el = e.target;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 10;

    setShowScrollBtn(!atBottom);
  }}
>

          {chat.length === 0 && (
            <div className="suggestions">
              <p>💡 Try asking:</p>
              <ul>
                <li onClick={() => sendMessage("How to score in FAT?")}>FAT tips</li>
                <li onClick={() => sendMessage("Explain GPA calculation")}>GPA help</li>
                <li onClick={() => sendMessage("Important CAT topics")}>CAT prep</li>
              </ul>
            </div>
          )}

          <AnimatePresence mode="wait">
  <motion.div
    key={activeChatId || "new"}
    initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
    transition={{ duration: 0.35 }}
  >
    {filteredChat.map((c, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.03 }}
      >
        <div className="time">{c.time}</div>

        <div className="user-msg">
          <Highlighter
            searchWords={[search]}
            textToHighlight={c.user}
            autoEscape
          />
        </div>

        {c.bot && (
          <div className="bot-msg">
            <ReactMarkdown>{c.bot}</ReactMarkdown>
            <button onClick={() => regenerateResponse(i)}>🔄</button>
            <button onClick={() => copyText(extractText(c.bot))}>📋</button>
            <button onClick={() => speak(c.bot)}>🔊</button>
            <button onClick={stopSpeech}>⏹</button>
          </div>
        )}
      </motion.div>
    ))}
  </motion.div>
</AnimatePresence>

          {typing && <div className="typing">AI is thinking...</div>}
          <div ref={chatBoxRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Ask anything about VIT..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={startListening}>
            {listening ? "🎙️" : "🎤"}
          </button>
          <button onClick={() => sendMessage()}>➤</button>
        </div>

      </div>
    </div>
  );
}

export default App;