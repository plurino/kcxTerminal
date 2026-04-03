import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Globe, Cpu, Terminal as TerminalIcon } from 'lucide-react';

// --- CONFIGURATION ---
const USER = "guest";
const LOCAL_HOST = "kcx.me";
const REMOTE_HOST = "plurino.com";

const KCX_ASCII = `
██ ██ ██████ ██ ██
██ ██ ██ ██ ██
█████ ██ █████
██ ██ ██ ██ ██
██ ██ ██████ ██ ██

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
};

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
if (i < lines.length) { setBootLines(prev=> [...prev, lines[i]]);
    i++;
    } else {
    clearInterval(interval);
    setTimeout(() => {
    setBooting(false);
    setHistory([{ type: 'output', content: KCX_ASCII + "\nType 'help' to begin." }]);
    }, 800);
    }
    }, 400);

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

    const handleCommand = (cmd) => {
    const fullCmd = cmd.trim();
    if (!fullCmd) return;

    const [main, ...args] = fullCmd.split(' ');
    const entry = { type: 'input', content: fullCmd, path, host: currentHost };
    let output = '';

    switch (main.toLowerCase()) {
    case 'help':
    output = `Available Commands:
    ls - List files
    cd [dir] - Change directory (e.g., 'cd ..' or 'cd about')
    cat [file] - Read a file
    whois - About Kieran
    projects - My active ventures
    ssh - Secure Tunnel to Plurino HQ
    pulse - Check real-time network status
    matrix - Toggle reality
    clear - Wipe terminal
    exit - Terminate session
    sudo - [RESTRICTED]`;
    break;

    case 'ls':
    output = FILE_SYSTEM[path].children.join(' ');
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
    else output = `directory not found: ${target}`;
    }
    break;

    case 'cat':
    const file = (path === '/' ? '' : path) + '/' + args[0];
    output = FILE_SYSTEM[file]?.type === 'file' ? FILE_SYSTEM[file].content : `file not found: ${args[0]}`;
    break;

    case 'ssh':
    setIsSSH(true);
    setTimeout(() => {
    setIsSSH(false);
    setCurrentHost(REMOTE_HOST);
    setHistory(prev => [...prev, { type: 'output', content: "TUNNEL ESTABLISHED.\nConnected to:\nPlurino_Internal_Node_01\nEncryption: RSA-4096-AES" }]);
    }, 3000);
    return;

    case 'pulse':
    if (netData) {
    output = `NETWORK PULSE REPORT:
    Status: ACTIVE
    Gateway: ${netData.org}
    Location: ${netData.city}, ${netData.country_name}
    IP: ${netData.ip}
    Latency: ${Math.floor(Math.random() * 20) + 10}ms
    System: Irish West Coast Hub (Node-42)`;
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

    setHistory(prev => [...prev, entry, { type: 'output', content: output }]);
    setInput('');
    };

    if (booting) {
    return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-10 flex flex-col justify-start">
        {bootLines.map((line, i) => (
        <div key={i} className="mb-1">{line}</div>
        ))}
        <div className="w-4 h-6 bg-green-500 animate-pulse mt-2" />
    </div>
    );
    }

    return (
    <div className={`min-h-screen font-mono p-4 md:p-10 transition-colors duration-500 overflow-hidden relative
        ${isMatrix ? 'bg-black text-green-400' : 'bg-slate-950 text-green-500' }`} onClick={()=>
        inputRef.current?.focus()}
        >
        {isMatrix &&
        <MatrixBackground />}

        <div className="max-w-4xl mx-auto h-[88vh] overflow-y-auto scrollbar-hide">
            {history.map((entry, i) => (
            <div key={i} className="mb-2">
                {entry.type === 'input' ? (
                <div className="flex text-sm md:text-base">
                    <span className="text-blue-400 mr-2">{USER}@{entry.host}</span>
                    <span className="text-gray-400 mr-2">:{entry.path}$</span>
                    <span className="text-white italic">{entry.content}</span>
                </div>
                ) : (
                <div className="whitespace-pre-wrap opacity-90 leading-relaxed">{entry.content}</div>
                )}
            </div>
            ))}

            <div className="flex items-center text-sm md:text-base">
                <span className="text-blue-400 mr-2">{USER}@{currentHost}</span>
                <span className="text-gray-400 mr-2">:{path}$</span>
                <input ref={inputRef} autoFocus
                    className="bg-transparent border-none outline-none text-white flex-grow caret-green-500"
                    value={input} onChange={e=> setInput(e.target.value)}
                onKeyDown={e => {
                if (e.key === 'Enter') handleCommand(input);
                if (e.key === 'Tab') {
                e.preventDefault();
                const hints = ['help', 'ls', 'cd', 'cat', 'ssh', 'pulse', 'matrix', 'clear', 'sudo', 'whois',
                'projects'];
                const match = hints.find(h => h.startsWith(input));
                if (match) setInput(match);
                }
                }}
                spellCheck="false"
                autoComplete="off"
                />
            </div>
            <div ref={scrollRef} />
        </div>

        {/* SSH Handshake Overlay */}
        {isSSH && (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center">
            <Shield className="w-12 h-12 mb-6 text-blue-500 animate-pulse" />
            <div className="text-xl tracking-widest mb-4">ESTABLISHING TUNNEL</div>
            <div className="text-[10px] text-gray-500 font-mono space-y-1">
                <div>[RSA] SHARED_SECRET: 0xFD...4A</div>
                <div>[AES] SYMMETRIC_LINK: ACTIVE</div>
                <div className="w-64 h-1 bg-gray-800 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-[loading_3s_linear]" />
                </div>
            </div>
        </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: ` @keyframes loading { from { width: 0%; } to { width: 100%; } }
            .scrollbar-hide::-webkit-scrollbar { display: none; } `}} />
    </div>
    );
    };

    // --- MATRIX EFFECT ---
    const MatrixBackground = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(1);
    const render = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
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
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-20" />;
    };

    export default App;
