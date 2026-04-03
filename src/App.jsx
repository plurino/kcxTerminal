import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Globe, Cpu, Terminal as TerminalIcon, Folder, FileText } from 'lucide-react';

// --- CONFIGURATION ---
const USER = "guest";
const LOCAL_HOST = "kcx.me";
const REMOTE_HOST = "plurino.com";

const KCX_ASCII = `
██   ██    ██████    ██   ██
██  ██    ██    ██    ██ ██ 
█████     ██           ███  
██  ██    ██    ██    ██ ██ 
██   ██    ██████    ██   ██

KCX-OS v2.1.0 [STABLE]
Location: Ireland (IE)
`;

const FILE_SYSTEM = {
  "/": { type: "dir", children: ["about", "projects", "contact", "system"] },
  "/about": { type: "dir", children: ["bio.txt", "skills.txt"] },
  "/about/bio.txt": { type: "file", content: "Kieran (KCX). Architect. Builder. Irish-based tech lead at Plurino Ltd." },
  "/about/skills.txt": { type: "file", content: "Expertise: Full-stack Architecture, Vibe Coding, Domain Engineering." },
  "/projects": { type: "dir", children: ["etravelapp.com", "orderimo.com", "rawpleasure.com"] },
  "/projects/etravelapp.com": { type: "file", content: "eTravelApp: AI-driven itinerary generation." },
  "/projects/orderimo.com": { type: "file", content: "Orderimo: High-conversion social commerce." },
  "/projects/rawpleasure.com": { type: "file", content: "RawPleasure: Premium aesthetic link-hubs." },
  "/contact": { type: "dir", children: ["email.txt"] },
  "/contact/email.txt": { type: "file", content: "Reach out: k@kcx.me" },
  "/system": { type: "dir", children: ["uptime.log", "network.status"] },
  "/system/uptime.log": { type: "file", content: "System uptime: 1337 days, 4 hours, 20 mins." },
  "/system/network.status": { type: "file", content: "Status: ONLINE. Latency: 12ms." }
};

const VALID_THEMES = ['hacker', 'cyberpunk', 'synthwave', 'ghost'];
const AVAILABLE_COMMANDS = ['help', 'ls', 'cd', 'cat', 'ssh', 'pulse', 'matrix', 'clear', 'sudo', 'whois', 'projects', 'theme', 'kcxfetch', 'hack'];

const App = () => {
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [path, setPath] = useState('/');
  const [isMatrix, setIsMatrix] = useState(false);
  const [isSSH, setIsSSH] = useState(false);
  const [currentHost, setCurrentHost] = useState(LOCAL_HOST);
  const [netData, setNetData] = useState(null);
  
  // New features state
  const [theme, setTheme] = useState('theme-hacker');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isHacked, setIsHacked] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // --- BOOT SEQUENCE ---
  useEffect(() => {
    const lines = [
      "Initializing KCX-Kernel v2.1.0...",
      "Checking hardware registers... [OK]",
      "Mounting file systems... [OK]",
      "Starting network stack...",
      "DHCP lease obtained: 192.168.1.42",
      "Loading user profile: guest",
      "KCX-OS READ_ONLY_MODE enabled.",
      "READY."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) { 
        setBootLines(prev => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBooting(false);
          setHistory([{ type: 'output', content: KCX_ASCII + "\nType 'help' to begin.", time: new Date().toLocaleTimeString() }]);
        }, 800);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // --- REAL DATA FETCH (IP Info) ---
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setNetData(data))
      .catch(() => setNetData({ city: "Unknown", org: "Unknown" }));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, bootLines]);
  
  useEffect(() => {
    // Apply theme class to body for background transition
    document.body.className = theme;
  }, [theme]);

  const handleCommand = (cmd) => {
    const fullCmd = cmd.trim();
    if (!fullCmd) return;
    
    // Add to history
    if (cmdHistory[0] !== fullCmd) {
      setCmdHistory(prev => [fullCmd, ...prev]);
    }
    setHistoryIdx(-1);

    const [main, ...args] = fullCmd.split(' ');
    const timestamp = new Date().toLocaleTimeString();
    const entry = { type: 'input', content: fullCmd, path, host: currentHost, time: timestamp };
    let output = '';

    switch (main.toLowerCase()) {
      case 'help':
        output = `Available Commands:
  ls          - List files
  cd [dir]    - Change directory (e.g., 'cd ..' or 'cd about')
  cat [file]  - Read a file
  whois       - About Kieran
  projects    - My active ventures
  ssh         - Secure Tunnel to Plurino HQ
  pulse       - Check real-time network status
  matrix      - Toggle reality
  theme [opt] - Set OS theme (hacker, cyberpunk, synthwave, ghost)
  kcxfetch    - Display system specs
  clear       - Wipe terminal
  exit        - Terminate session
  sudo        - [RESTRICTED]`;
        break;

      case 'ls':
        const children = FILE_SYSTEM[path].children || [];
        if (children.length === 0) {
          output = "empty directory";
        } else {
          output = (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-2">
              {children.map(child => {
                const childPath = (path === '/' ? '' : path) + '/' + child;
                const isDir = FILE_SYSTEM[childPath]?.type === 'dir';
                return (
                  <div key={child} className="flex items-center gap-2">
                    {isDir ? <Folder size={18} className="text-theme-accent" /> : <FileText size={18} className="text-theme-sys" />}
                    <span className={isDir ? 'text-theme-accent font-bold' : 'text-theme-fg opacity-90'}>{child}</span>
                  </div>
                );
              })}
            </div>
          );
        }
        break;

      case 'cd':
        const target = args[0];
        if (!target || target === '/') setPath('/');
        else if (target === '..') {
          if (path !== '/') {
            const parts = path.split('/').filter(Boolean);
            parts.pop();
            setPath('/' + parts.join('/'));
          }
        } else {
          const newPath = (path === '/' ? '' : path) + '/' + target;
          if (FILE_SYSTEM[newPath] && FILE_SYSTEM[newPath].type === 'dir') setPath(newPath);
          else output = `cd: ${target}: No such file or directory`;
        }
        break;

      case 'cat':
        const file = (path === '/' ? '' : path) + '/' + args[0];
        output = FILE_SYSTEM[file]?.type === 'file' ? FILE_SYSTEM[file].content : `cat: ${args[0]}: No such file`;
        break;
        
      case 'theme':
        const selectedTheme = args[0]?.toLowerCase();
        if (!selectedTheme) {
          output = `Current theme: ${theme.replace('theme-', '')}\nAvailable themes: ${VALID_THEMES.join(', ')}`;
        } else if (VALID_THEMES.includes(selectedTheme)) {
          setTheme(`theme-${selectedTheme}`);
          output = `Theme initialized: ${selectedTheme}`;
        } else {
          output = `theme: invalid theme '${selectedTheme}'. Available: ${VALID_THEMES.join(', ')}`;
        }
        break;
        
      case 'kcxfetch':
        const KCX_LOGO = `██   ██   ██████   ██   ██
██  ██   ██    ██   ██ ██ 
█████    ██          ███  
██  ██   ██    ██   ██ ██ 
██   ██   ██████   ██   ██`;
        output = (
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center my-4 opacity-ghost">
            <div className="text-theme-accent font-bold hidden sm:block"><pre className="leading-tight">{KCX_LOGO}</pre></div>
            <div className="flex flex-col gap-1 text-sm md:text-base border-l-2 border-theme-sys pl-4 py-1">
              <div><span className="text-theme-accent font-bold">OS:</span> KCX-OS v2.1.0-stable</div>
              <div><span className="text-theme-accent font-bold">Host:</span> {currentHost}</div>
              <div><span className="text-theme-accent font-bold">Kernel:</span> 5.15.0-vibe-kernel</div>
              <div><span className="text-theme-accent font-bold">Uptime:</span> 1337 days, 4h 20m</div>
              <div><span className="text-theme-accent font-bold">Shell:</span> plurino-zsh</div>
              <div><span className="text-theme-accent font-bold">Theme:</span> {theme.replace('theme-', '')}</div>
              <div><span className="text-theme-accent font-bold">Memory:</span> 4096MiB / 8192MiB</div>
              <div className="flex gap-2 mt-2">
                 <div className="w-5 h-5 bg-black border border-gray-700"></div>
                 <div className="w-5 h-5 bg-red-500"></div>
                 <div className="w-5 h-5 bg-green-500"></div>
                 <div className="w-5 h-5 bg-yellow-400"></div>
                 <div className="w-5 h-5 bg-blue-500"></div>
                 <div className="w-5 h-5 bg-purple-500"></div>
                 <div className="w-5 h-5 bg-cyan-500"></div>
                 <div className="w-5 h-5 bg-white"></div>
              </div>
            </div>
          </div>
        );
        break;

      case 'ssh':
        setIsSSH(true);
        setTimeout(() => {
          setIsSSH(false);
          setCurrentHost(REMOTE_HOST);
          setHistory(prev => [...prev, { type: 'output', content: "TUNNEL ESTABLISHED.\nConnected to:\nPlurino_Internal_Node_01\nEncryption: RSA-4096-AES", time: new Date().toLocaleTimeString() }]);
        }, 3000);
        return;

      case 'pulse':
        if (netData) {
          output = `NETWORK PULSE REPORT:\nStatus: ACTIVE\nGateway: ${netData.org}\nLocation: ${netData.city}, ${netData.country_name}\nIP: ${netData.ip}\nLatency: ${Math.floor(Math.random() * 20) + 10}ms\nSystem: Irish West Coast Hub (Node-42)`;
        } else {
          output = "Pinging gateway... connection failed or pending.";
        }
        break;

      case 'exit':
        if (currentHost === REMOTE_HOST) {
          setCurrentHost(LOCAL_HOST);
          output = "SSH Tunnel collapsed. Returned to local.";
        } else {
          output = "Already at root shell.";
        }
        break;

      case 'matrix':
        setIsMatrix(!isMatrix);
        output = isMatrix ? "System stabilized." : "Searching for Neo...";
        break;
        
      case 'hack':
        setIsHacked(true);
        output = "CRITICAL ERROR: KERNEL PANIC. INITIATING SYSTEM SHUTDOWN...";
        setTimeout(() => setIsHacked(false), 2000);
        break;

      case 'sudo':
        const jokes = [
          "Nice try. My password is 12 characters longer than your patience.",
          "Unauthorized. This incident will be reported to Santa Claus.",
          "Error: Permission denied. Have you tried being a better person?",
          "Sudo access? In this economy?"
        ];
        output = jokes[Math.floor(Math.random() * jokes.length)];
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'whois':
        output = FILE_SYSTEM["/about/bio.txt"].content;
        break;

      case 'projects':
        output = "KCX VOYAGER PROJECTS:\n- etravelapp.com\n- orderimo.com\n- rawpleasure.com\n- plurino.com";
        break;

      default:
        output = `command not found: ${main}. Try 'help'.`;
    }

    setHistory(prev => [...prev, entry, { type: 'output', content: output, time: timestamp }]);
    setInput('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIdx + 1 < cmdHistory.length ? historyIdx + 1 : historyIdx;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const parts = input.split(' ');
      
      if (parts.length === 1) {
        const match = AVAILABLE_COMMANDS.find(c => c.startsWith(input));
        if (match) setInput(match);
      } 
      else if (parts.length === 2 && ['cd', 'cat'].includes(parts[0])) {
        const target = parts[1];
        const children = FILE_SYSTEM[path]?.children || [];
        const match = children.find(c => c.startsWith(target));
        if (match) setInput(`${parts[0]} ${match}`);
      }
      else if (parts.length === 2 && parts[0] === 'theme') {
        const target = parts[1];
        const match = VALID_THEMES.find(c => c.startsWith(target));
        if (match) setInput(`${parts[0]} ${match}`);
      }
    }
  };

  if (booting) {
    return (
      <div className="min-h-screen bg-black text-theme-fg font-mono p-10 flex flex-col justify-start theme-hacker">
        {bootLines.map((line, i) => (
          <div key={i} className="mb-1">{line}</div>
        ))}
        <div className="w-4 h-6 bg-theme-fg animate-pulse mt-2" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-mono p-4 md:p-10 transition-colors duration-500 overflow-hidden relative ${theme} ${isHacked ? 'animate-glitch' : ''}`} onClick={() => inputRef.current?.focus()}>
      {isMatrix && <MatrixBackground color="var(--text-color)" />}

      <div className="max-w-4xl mx-auto h-[88vh] overflow-y-auto scrollbar-hide opacity-ghost relative z-10">
        {history.map((entry, i) => (
          <div key={i} className="mb-3">
            {entry.type === 'input' ? (
              <div className="flex text-sm md:text-base flex-wrap">
                <span className="text-theme-sys mr-3 text-xs md:text-sm mt-1">[{entry.time}]</span>
                <span className="text-theme-accent mr-2">{USER}@{entry.host}</span>
                <span className="text-theme-sys mr-2">:{entry.path}$</span>
                <span className="text-theme-fg italic">{entry.content}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed text-theme-fg">
                {typeof entry.content === 'string' ? entry.content : entry.content}
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center text-sm md:text-base flex-wrap">
          <span className="text-theme-accent mr-2">{USER}@{currentHost}</span>
          <span className="text-theme-sys mr-2">:{path}$</span>
          <input
            ref={inputRef}
            autoFocus
            className="bg-transparent border-none outline-none text-theme-fg flex-grow caret-theme-fg"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div ref={scrollRef} className="pb-10" />
      </div>

      {/* SSH Handshake Overlay */}
      {isSSH && (
        <div className="absolute inset-0 bg-theme-bg/95 z-50 flex flex-col items-center justify-center p-6 text-center text-theme-fg">
          <Shield className="w-12 h-12 mb-6 text-theme-accent animate-pulse" />
          <div className="text-xl tracking-widest mb-4">ESTABLISHING TUNNEL</div>
          <div className="text-[10px] text-theme-sys font-mono space-y-1">
            <div>[RSA] SHARED_SECRET: 0xFD...4A</div>
            <div>[AES] SYMMETRIC_LINK: ACTIVE</div>
            <div className="w-64 h-1 bg-gray-800 mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-theme-accent animate-[loading_3s_linear]" />
            </div>
          </div>
        </div>
      )}
      
      {/* Hack Overlay */}
      {isHacked && (
        <div className="absolute inset-0 bg-red-900/90 z-50 flex flex-col items-center justify-center p-6 text-center text-white animate-pulse">
          <div className="text-5xl font-black tracking-widest mb-4 rotate-12 animate-bounce">SYSTEM FAILURE</div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading { from { width: 0%; } to { width: 100%; } }
      `}} />
    </div>
  );
};

// --- MATRIX EFFECT ---
const MatrixBackground = ({ color }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(1);
    
    // We parse the css variable color to ensure canvas can use it
    let drawColor = '#0f0';
    if (color && color.includes('var')) {
      const tempEl = document.createElement('div');
      tempEl.style.color = color;
      document.body.appendChild(tempEl);
      drawColor = getComputedStyle(tempEl).color;
      document.body.removeChild(tempEl);
    }
    
    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = drawColor;
      ctx.font = '15px monospace';
      drops.forEach((y, i) => {
        const text = String.fromCharCode(Math.random() * 128);
        ctx.fillText(text, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const id = setInterval(render, 50);
    return () => clearInterval(id);
  }, [color]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-20" />;
};

export default App;
