import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

// ─── Google Fonts ───────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Exo+2:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    :root {
      --neon-blue: #00d4ff;
      --neon-purple: #8b5cf6;
      --neon-cyan: #06ffd8;
      --dark-bg: #020509;
      --card-bg: rgba(10, 18, 35, 0.7);
    }
    * { scroll-behavior: smooth; }
    body { background: var(--dark-bg); overflow-x: hidden; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #020509; }
    ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #00d4ff, #8b5cf6); border-radius: 2px; }
    .font-orbitron { font-family: 'Orbitron', sans-serif; }
    .font-exo { font-family: 'Exo 2', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes borderGlow {
      0%, 100% { border-color: rgba(0,212,255,0.4); box-shadow: 0 0 20px rgba(0,212,255,0.2); }
      50% { border-color: rgba(139,92,246,0.6); box-shadow: 0 0 30px rgba(139,92,246,0.3); }
    }
    @keyframes floatY {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    .glow-border-animated { animation: borderGlow 3s ease-in-out infinite; }
    .float-anim { animation: floatY 6s ease-in-out infinite; }
    .pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
    .gradient-text {
      background: linear-gradient(135deg, #00d4ff, #8b5cf6, #06ffd8);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: gradientShift 4s ease infinite;
    }
    .glass-card {
      background: rgba(10, 18, 35, 0.65);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 212, 255, 0.15);
    }
    .glow-btn {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .glow-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .glow-btn:hover::before { opacity: 1; }
    .glow-btn:hover {
      box-shadow: 0 0 25px rgba(0,212,255,0.4), 0 0 50px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.05);
      border-color: rgba(0,212,255,0.7) !important;
      transform: translateY(-2px);
    }
    .mesh-bg {
      background: 
        radial-gradient(ellipse 80% 60% at 20% 10%, rgba(0,212,255,0.08) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 80% 90%, rgba(139,92,246,0.08) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 50% 50%, rgba(6,255,216,0.03) 0%, transparent 70%),
        linear-gradient(180deg, #020509 0%, #050d1a 50%, #020509 100%);
    }
    .section-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(139,92,246,0.3), transparent);
    }
    .network-card:hover {
      border-color: rgba(0,212,255,0.5) !important;
      box-shadow: 0 0 30px rgba(0,212,255,0.1), 0 20px 40px rgba(0,0,0,0.4);
      transform: translateY(-4px);
    }
    .network-card { transition: all 0.4s ease; }
  `}</style>
);

// ─── Particle System ─────────────────────────────────────────────────────────
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.5 ? "0,212,255" : "139,92,246",
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.fill();
      });
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((q) => {
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
};

// ─── Glowing Button ──────────────────────────────────────────────────────────
const GlowButton = ({ children, onClick, variant = "primary", size = "md", icon }) => {
  const styles = {
    primary: "border-cyan-500/50 text-cyan-300 hover:text-white",
    purple: "border-purple-500/50 text-purple-300 hover:text-white",
    cyan: "border-emerald-400/50 text-emerald-300 hover:text-white",
    outline: "border-cyan-400/30 text-cyan-200/70 hover:text-cyan-100",
  };
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xl: "px-10 py-5 text-lg",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`glow-btn glass-card rounded-lg border font-orbitron tracking-wider uppercase font-medium cursor-pointer ${styles[variant]} ${sizes[size]}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};

// ─── Modal ───────────────────────────────────────────────────────────────────
const Modal = ({ isOpen, onClose, title, content }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-2xl glass-card rounded-2xl border border-cyan-500/30 p-8 shadow-2xl"
          style={{ boxShadow: "0 0 60px rgba(0,212,255,0.1), 0 40px 80px rgba(0,0,0,0.6)" }}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 pulse-glow" />
                <span className="font-mono text-xs text-cyan-500/70 tracking-widest uppercase">Shelby Protocol</span>
              </div>
              <h3 className="font-orbitron text-2xl font-bold gradient-text">{title}</h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-cyan-500/50 transition-all"
            >
              ✕
            </motion.button>
          </div>
          {/* Divider */}
          <div className="section-divider mb-6" />
          {/* Content */}
          <div className="font-exo text-slate-300 leading-relaxed space-y-4 max-h-80 overflow-y-auto pr-2" style={{ scrollbarWidth: "thin", scrollbarColor: "#00d4ff22 transparent" }}>
            {Array.isArray(content) ? (
              content.map((item, i) => (
                <div key={i}>
                  {item.subtitle && <h4 className="font-orbitron text-sm text-cyan-400 mb-2 tracking-wider">{item.subtitle}</h4>}
                  {item.text && <p className="text-slate-300/90">{item.text}</p>}
                  {item.list && (
                    <ul className="space-y-2 mt-2">
                      {item.list.map((li, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                          <span className="text-slate-300/80">{li}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p>{content}</p>
            )}
          </div>
          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
            <GlowButton onClick={onClose} size="sm" variant="outline">Close</GlowButton>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Protocol Explorer Card ──────────────────────────────────────────────────
const ExplorerCard = ({ label, index, onClick, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
    whileHover={{ y: -6 }}
    onClick={onClick}
    className="glow-btn glass-card glow-border-animated rounded-xl border p-6 cursor-pointer group"
  >
    <div className="flex flex-col items-start gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
        {icon}
      </div>
      <span className="font-orbitron text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors tracking-wide">{label}</span>
      <div className="flex items-center gap-1.5 text-xs text-cyan-500/60 font-mono">
        <span>View docs</span>
        <motion.span whileHover={{ x: 3 }} className="inline-block">→</motion.span>
      </div>
    </div>
  </motion.div>
);

// ─── Section Header ──────────────────────────────────────────────────────────
const SectionHeader = ({ tag, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center mb-16"
  >
    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5">
      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-glow" />
      <span className="font-mono text-xs text-cyan-400/80 tracking-widest uppercase">{tag}</span>
    </div>
    <h2 className="font-orbitron text-3xl md:text-4xl font-bold gradient-text mb-4">{title}</h2>
    {subtitle && <p className="font-exo text-slate-400 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>}
  </motion.div>
);

// ─── Nav Bar ─────────────────────────────────────────────────────────────────
const NavBar = ({ scrolled }) => (
  <motion.nav
    initial={{ y: -80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
    style={{
      background: scrolled ? "rgba(2,5,9,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(0,212,255,0.1)" : "none",
    }}
  >
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(0,212,255,0.4)" }}>
          <span className="text-cyan-400 text-sm font-bold font-orbitron">S</span>
        </div>
        <span className="font-orbitron text-white font-semibold text-sm tracking-wider">SHELBY</span>
        <span className="font-mono text-xs text-cyan-500/50 hidden sm:block">PROTOCOL</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {["Protocol", "Developer", "Faucet", "Network"].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="font-exo text-sm text-slate-400 hover:text-cyan-300 transition-colors tracking-wide">{item}</a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <a href="https://docs.shelby.xyz" target="_blank" rel="noreferrer" className="font-mono text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors hidden sm:block">docs.shelby.xyz</a>
        <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #06ffd8" }} title="Network Online" />
      </div>
    </div>
  </motion.nav>
);

// ─── DATA ────────────────────────────────────────────────────────────────────
const PROTOCOL_DATA = [
  {
    id: "what-is-shelby", label: "What is Shelby", icon: "◈",
    content: [{ text: "Shelby is a decentralized blob storage protocol built for high performance read heavy workloads. It enables fast retrieval of large datasets through distributed storage providers coordinated through blockchain infrastructure." }],
  },
  {
    id: "architecture", label: "Architecture", icon: "⬡",
    content: [
      { text: "Shelby consists of several major components working in coordination:" },
      { list: ["Aptos smart contracts coordinating storage commitments", "Storage providers hosting blob data", "RPC nodes handling read and write requests", "Erasure coding for data redundancy", "Audit systems verifying provider integrity"] },
    ],
  },
  {
    id: "key-features", label: "Key Features", icon: "◉",
    content: [
      { text: "Shelby is engineered for demanding real-time workloads:" },
      { list: ["High performance read-optimized storage", "Distributed storage providers", "High bandwidth serving network", "Erasure coded data redundancy", "Cryptographic data verification", "Scalable storage economics"] },
    ],
  },
  {
    id: "why-aptos", label: "Why Aptos", icon: "▲",
    content: [{ text: "Shelby uses the Aptos blockchain as the coordination layer. Aptos provides high throughput transaction processing, low latency finality, and scalable execution for protocol coordination and incentive mechanisms." }],
  },
  {
    id: "incentive-model", label: "Incentive Model", icon: "◈",
    content: [{ text: "Shelby implements a paid read system. Storage providers earn rewards for serving data efficiently. This encourages high availability and high bandwidth infrastructure across the network." }],
  },
];

const DEV_TOOLS_DATA = [
  {
    id: "cli", label: "CLI", icon: ">_",
    content: [{ subtitle: "Command Line Interface", text: "Command line tool used to upload, manage, and retrieve blobs from the Shelby network. Supports all major operating systems and provides full access to protocol features." }],
  },
  {
    id: "typescript-sdk", label: "TypeScript SDK", icon: "{ }",
    content: [{ subtitle: "Developer Library", text: "Developer library allowing web applications to integrate decentralized storage capabilities directly. Fully typed with comprehensive documentation and examples." }],
  },
  {
    id: "rpc-apis", label: "RPC APIs", icon: "⟳",
    content: [{ subtitle: "Network Endpoints", text: "Endpoints that allow applications to read and write data to the Shelby network. RESTful and WebSocket interfaces available for maximum compatibility." }],
  },
  {
    id: "storage-providers", label: "Storage Providers", icon: "◫",
    content: [{ subtitle: "Distributed Nodes", text: "Independent nodes that host data chunks and serve them on demand to users. Providers are incentivized through the Shelby token model to maintain high availability and bandwidth." }],
  },
];

const NETWORK_DATA = [
  { label: "Prototype Network", value: "shelbynet", icon: "🌐", desc: "Shelby Test Network" },
  { label: "Storage Capacity", value: "~10 TiB", icon: "💾", desc: "Distributed capacity" },
  { label: "Storage Providers", value: "Distributed", icon: "⬡", desc: "Hosting & serving data chunks" },
  { label: "Coordination Layer", value: "Aptos", icon: "▲", desc: "Smart contract protocol state" },
];

// ─── Main App ────────────────────────────────────────────────────────────────
export default function ShelbyProtocol() {
  const [modal, setModal] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openModal = useCallback((data) => setModal(data), []);
  const closeModal = useCallback(() => setModal(null), []);

  return (
    <div className="min-h-screen mesh-bg font-exo text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
      <FontLoader />
      <ParticleField />

      {/* ── NAV ── */}
      <NavBar scrolled={scrolled} />

      {/* ── HERO ── */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ zIndex: 1 }}>
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl float-anim" style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)", animation: "floatY 8s ease-in-out infinite reverse" }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full glass-card border border-cyan-500/30"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 pulse-glow" />
            <span className="font-mono text-xs text-cyan-400 tracking-widest uppercase">Testnet Live · shelbynet</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #06ffd8" }} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-orbitron text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            <span className="gradient-text">Decentralized</span>
            <br />
            <span className="text-white">Hot Storage</span>
            <br />
            <span className="gradient-text">Protocol</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="font-exo text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            High performance decentralized blob storage designed for real-time workloads like AI pipelines, streaming systems, and large-scale analytics.
          </motion.p>

          {/* Hero Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <GlowButton size="lg" variant="primary" icon="◈" onClick={() => document.getElementById("protocol")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Protocol
            </GlowButton>
            <GlowButton size="lg" variant="purple" icon=">_" onClick={() => document.getElementById("developer")?.scrollIntoView({ behavior: "smooth" })}>
              Developer Tools
            </GlowButton>
            <GlowButton size="lg" variant="cyan" icon="◎" onClick={() => document.getElementById("faucet")?.scrollIntoView({ behavior: "smooth" })}>
              ShelbyUSD Faucet
            </GlowButton>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="font-mono text-xs text-slate-600 tracking-widest uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-0.5 h-8 bg-gradient-to-b from-cyan-500/50 to-transparent rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="section-divider mx-8" style={{ zIndex: 1, position: "relative" }} />

      {/* ── PROTOCOL EXPLORER ── */}
      <section id="protocol" className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            tag="Protocol Explorer"
            title="How Shelby Works"
            subtitle="Explore the architecture, features, and economics powering the Shelby decentralized storage network."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PROTOCOL_DATA.map((item, i) => (
              <ExplorerCard key={item.id} label={item.label} icon={item.icon} index={i} onClick={() => openModal(item)} />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider mx-8" style={{ zIndex: 1, position: "relative" }} />

      {/* ── DEVELOPER TOOLS ── */}
      <section id="developer" className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            tag="Developer Tools"
            title="Build on Shelby"
            subtitle="Everything you need to integrate decentralized storage into your application."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {DEV_TOOLS_DATA.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                onClick={() => openModal(item)}
                className="glow-btn glass-card rounded-2xl border border-purple-500/20 p-7 cursor-pointer group text-center"
              >
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center font-mono text-lg font-bold text-purple-300" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                  {item.icon}
                </div>
                <span className="font-orbitron text-sm font-semibold text-slate-200 group-hover:text-purple-300 transition-colors block">{item.label}</span>
                <span className="font-mono text-xs text-purple-500/60 mt-2 block">Click to explore →</span>
              </motion.div>
            ))}
          </div>

          {/* Code snippet decoration */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 glass-card rounded-xl border border-purple-500/20 p-6 font-mono text-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="ml-4 text-xs text-slate-600">shelby-quickstart.ts</span>
            </div>
            <div className="space-y-1">
              <div><span className="text-purple-400">import</span><span className="text-slate-300"> {"{ ShelbyClient }"} </span><span className="text-purple-400">from</span><span className="text-cyan-300"> "@shelby/sdk"</span></div>
              <div className="text-slate-600">{"  "}</div>
              <div><span className="text-purple-400">const</span><span className="text-cyan-200"> client</span><span className="text-slate-300"> = </span><span className="text-purple-400">new</span><span className="text-cyan-200"> ShelbyClient</span><span className="text-slate-400">{"({"}</span></div>
              <div><span className="text-slate-400">{"  network: "}</span><span className="text-cyan-300">"shelbynet"</span><span className="text-slate-400">,</span></div>
              <div><span className="text-slate-400">{"  rpc: "}</span><span className="text-cyan-300">"https://rpc.shelby.xyz"</span></div>
              <div><span className="text-slate-400">{"});"}</span></div>
              <div className="text-slate-600">{"  "}</div>
              <div><span className="text-slate-500">{"// Upload a blob to the network"}</span></div>
              <div><span className="text-purple-400">const</span><span className="text-cyan-200"> blobId</span><span className="text-slate-300"> = </span><span className="text-purple-400">await</span><span className="text-slate-300"> client.</span><span className="text-cyan-300">uploadBlob</span><span className="text-slate-400">(data);</span></div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="section-divider mx-8" style={{ zIndex: 1, position: "relative" }} />

      {/* ── FAUCET ── */}
      <section id="faucet" className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeader
            tag="Test Tokens"
            title="ShelbyUSD Faucet"
            subtitle="Use the ShelbyUSD faucet to obtain test tokens required for interacting with Shelby network APIs and performing storage operations on the test network."
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-3xl border p-12 relative overflow-hidden"
            style={{ borderColor: "rgba(6,255,216,0.25)", boxShadow: "0 0 80px rgba(6,255,216,0.05), 0 40px 80px rgba(0,0,0,0.4)" }}
          >
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl" style={{ background: "radial-gradient(ellipse, rgba(6,255,216,0.08) 0%, transparent 70%)" }} />
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg, rgba(6,255,216,0.15), rgba(0,212,255,0.1))", border: "1px solid rgba(6,255,216,0.3)", boxShadow: "0 0 30px rgba(6,255,216,0.15)" }}>
                💧
              </div>
              <h3 className="font-orbitron text-2xl font-bold text-white mb-2">Request Test Tokens</h3>
              <p className="font-exo text-slate-400 mb-8 max-w-lg mx-auto">Get ShelbyUSD test tokens to start building on the Shelby testnet. Tokens are used for storage fees and protocol interactions.</p>

              <motion.a
                href="https://docs.shelby.xyz/apis/faucet/shelbyusd"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-orbitron text-base font-semibold tracking-wider uppercase text-white cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(6,255,216,0.2), rgba(0,212,255,0.15))",
                  border: "1px solid rgba(6,255,216,0.5)",
                  boxShadow: "0 0 30px rgba(6,255,216,0.2), inset 0 0 20px rgba(6,255,216,0.05)",
                  textDecoration: "none",
                }}
              >
                <span>💧</span>
                Request ShelbyUSD Test Tokens
              </motion.a>

              <div className="mt-8 grid grid-cols-3 gap-6 max-w-sm mx-auto">
                {[["Free", "No cost"], ["Instant", "Immediate"], ["Testnet", "Safe to use"]].map(([v, l]) => (
                  <div key={v} className="text-center">
                    <div className="font-orbitron text-sm font-bold text-emerald-400">{v}</div>
                    <div className="font-mono text-xs text-slate-600 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="section-divider mx-8" style={{ zIndex: 1, position: "relative" }} />

      {/* ── NETWORK INFO ── */}
      <section id="network" className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            tag="Network Status"
            title="Shelby Test Network"
            subtitle="Live network statistics and infrastructure overview for the Shelby protocol testnet."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {NETWORK_DATA.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="network-card glass-card rounded-2xl border border-cyan-500/15 p-7"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="font-orbitron text-xl font-bold text-cyan-300 mb-1">{item.value}</div>
                <div className="font-exo text-sm font-semibold text-slate-300 mb-1">{item.label}</div>
                <div className="font-mono text-xs text-slate-600">{item.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* Network status bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 glass-card rounded-xl border border-emerald-500/20 p-5 flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 8px #06ffd8" }} />
              <span className="font-orbitron text-sm text-emerald-300">Network Operational</span>
            </div>
            <span className="font-mono text-xs text-slate-500">Last updated: Live</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">Coordination:</span>
              <span className="font-mono text-xs text-cyan-400">Aptos Testnet</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="section-divider mx-8" style={{ zIndex: 1, position: "relative" }} />

      {/* ── FOOTER ── */}
      <footer className="relative py-16 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))", border: "1px solid rgba(0,212,255,0.4)" }}>
                  <span className="text-cyan-400 font-bold font-orbitron">S</span>
                </div>
                <span className="font-orbitron text-white font-bold tracking-wider">SHELBY</span>
              </div>
              <p className="font-exo text-sm text-slate-500 leading-relaxed">Decentralized hot storage protocol for high performance workloads.</p>
              <div className="flex items-center gap-4 mt-5">
                {["𝕏", "⬡", "◈"].map((icon, i) => (
                  <motion.a key={i} href="#" whileHover={{ scale: 1.2 }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    {icon}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-orbitron text-xs font-semibold text-slate-400 tracking-widest uppercase mb-5">Protocol</h4>
              <div className="space-y-3">
                {["Shelby Protocol Docs", "Architecture Overview", "API Documentation"].map((link) => (
                  <a key={link} href="https://docs.shelby.xyz" target="_blank" rel="noreferrer" className="block font-exo text-sm text-slate-500 hover:text-cyan-300 transition-colors">{link}</a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-orbitron text-xs font-semibold text-slate-400 tracking-widest uppercase mb-5">Developer</h4>
              <div className="space-y-3">
                {["GitHub", "Developer Resources", "TypeScript SDK"].map((link) => (
                  <a key={link} href="https://docs.shelby.xyz" target="_blank" rel="noreferrer" className="block font-exo text-sm text-slate-500 hover:text-cyan-300 transition-colors">{link}</a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-orbitron text-xs font-semibold text-slate-400 tracking-widest uppercase mb-5">Network</h4>
              <div className="space-y-3">
                {["ShelbyUSD Faucet", "Storage Providers", "Network Status"].map((link) => (
                  <a key={link} href="https://docs.shelby.xyz" target="_blank" rel="noreferrer" className="block font-exo text-sm text-slate-500 hover:text-cyan-300 transition-colors">{link}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="section-divider mb-8" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="font-mono text-xs text-slate-700">© 2025 Shelby Protocol · Built on Aptos</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-glow" />
              <span className="font-mono text-xs text-slate-600">shelbynet online</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MODAL ── */}
      {modal && (
        <Modal
          isOpen={!!modal}
          onClose={closeModal}
          title={modal.label}
          content={modal.content}
        />
      )}
    </div>
  );
}
