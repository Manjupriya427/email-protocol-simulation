import { useEffect, useState } from "react";

const API = "https://email-protocol-simulation.onrender.com/api";
const states = [
  ["q0", "Disconnected", "CONNECT", "q1"],
  ["q1", "Connected", "EHLO / HELO", "q2"],
  ["q2", "Greeting completed", "MAIL FROM", "q3"],
  ["q3", "Sender specified", "RCPT TO", "q4"],
  ["q4", "Recipient specified", "DATA", "q5"],
  ["q5", "Data transfer", ".", "q6"],
  ["q6", "Completed", "QUIT", "q0"]
];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [form, setForm] = useState({ sender: "", recipient: "", subject: "", message: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [emails, setEmails] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  async function loadHistory() {
    try { const r = await fetch(`${API}/history`); const d = await r.json(); setHistory(d.history || []); }
    catch { setHistory([]); }
  }
  async function loadMailbox() {
    try { const r = await fetch(`${API}/mailbox`); const d = await r.json(); setEmails(d.emails || []); }
    catch { setEmails([]); }
  }
  useEffect(() => { loadHistory(); loadMailbox(); }, []);

  async function runSMTP(e) {
    e.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch(`${API}/smtp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json(); setResult(d); if (d.error) setError(d.error); loadHistory();
    } catch { setError("Cannot connect to the backend. Start the server on port 5000."); }
    finally { setLoading(false); }
  }

  const nav = ["Dashboard", "SMTP Simulation", "IMAP Simulation", "POP3 Simulation", "State Diagram", "History"];
  const successCount = history.filter(x => x.status === "Success").length;

  return <div className="layout">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon">✉</span><div><b>Mail Protocol</b><small>Simulation System</small></div></div>
      <div className="nav-label">MENU</div>
      {nav.map(n => <button key={n} className={`nav-item ${page === n ? "active" : ""}`} onClick={() => setPage(n)}><span>{({Dashboard:"▦","SMTP Simulation":"↗","IMAP Simulation":"▣","POP3 Simulation":"⇩","State Diagram":"⌘",History:"◷"})[n]}</span>{n}</button>)}
      <div className="side-note">Educational protocol simulator</div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">EMAIL PROTOCOL PROJECT</div><h1>{page}</h1></div><div className="avatar">EP</div></header>
      {page === "Dashboard" && <section>
        <p className="intro">Welcome! Simulate email communication and understand how mail protocols work.</p>
        <div className="stats">
          <Stat title="Total Simulations" value={history.length} icon="▤"/>
          <Stat title="Successful" value={successCount} icon="✓"/>
          <Stat title="Failed" value={history.length-successCount} icon="!"/>
        </div>
        <div className="panel"><div className="panel-head"><h2>Getting started</h2></div><div className="quick-grid">
          <Quick title="SMTP Simulation" desc="Send sample commands and view server responses." onClick={()=>setPage("SMTP Simulation")}/>
          <Quick title="State Diagram" desc="Understand the finite state machine and transitions." onClick={()=>setPage("State Diagram")}/>
          <Quick title="IMAP / POP3" desc="Explore simple email retrieval demonstrations." onClick={()=>setPage("IMAP Simulation")}/>
        </div></div>
        <p className="muted small">This application simulates protocols for learning. It does not send real emails.</p>
      </section>}

      {page === "SMTP Simulation" && <section className="content-grid">
        <div className="panel"><div className="panel-head"><h2>Compose sample email</h2><span className="tag">SMTP</span></div>
          <form onSubmit={runSMTP} className="form">
            <label>Sender email<input type="email" required placeholder="sender@example.com" value={form.sender} onChange={e=>setForm({...form,sender:e.target.value})}/></label>
            <label>Receiver email<input type="email" required placeholder="receiver@example.com" value={form.recipient} onChange={e=>setForm({...form,recipient:e.target.value})}/></label>
            <label>Subject<input required placeholder="Enter subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label>
            <label>Message<textarea required rows="4" placeholder="Write your message..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label>
            <button className="primary" disabled={loading}>{loading ? "Simulating..." : "Start Simulation →"}</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
        <div className="panel"><div className="panel-head"><h2>Command responses</h2>{result && <span className={`status ${result.status==="Success"?"good":"bad"}`}>{result.status}</span>}</div>
          {!result ? <div className="empty">Your SMTP command and server responses will appear here.</div> :
            <div className="logs">{result.messages.map((m,i)=><div className={`log ${m.accepted?"":"rejected"}`} key={i}><b>{m.command}</b><span>{m.response}</span></div>)}</div>}
          {result?.saved !== undefined && <p className="muted small">{result.saved ? "Saved to MongoDB history." : "MongoDB not connected: result was not saved."}</p>}
        </div>
      </section>}

      {(page === "IMAP Simulation" || page === "POP3 Simulation") && <section className="panel">
        <div className="panel-head"><h2>{page === "IMAP Simulation" ? "IMAP – View mailbox" : "POP3 – Download mailbox messages"}</h2><span className="tag">{page.startsWith("IMAP")?"IMAP":"POP3"}</span></div>
        <p className="muted">{page.startsWith("IMAP") ? "Select a message to view it, as an email client does with IMAP." : "Select a message to simulate downloading it using POP3."}</p>
        <div className="mail-layout"><div className="mail-list">{emails.map(mail=><button className={`mail-row ${selected?.id===mail.id?"chosen":""}`} key={mail.id} onClick={()=>setSelected(mail)}><b>{mail.subject}</b><small>{mail.from}</small></button>)}</div>
          <div className="mail-detail">{selected ? <><span className="tag">{page.startsWith("IMAP")?"Message viewed":"Download simulated"}</span><h3>{selected.subject}</h3><p className="muted">From: {selected.from}</p><p>{selected.body}</p>{page.startsWith("POP3") && <p className="success-text">✓ Message downloaded in this simulation.</p>}</> : <div className="empty">Select an email to continue.</div>}</div></div>
      </section>}

      {page === "State Diagram" && <section className="panel"><div className="panel-head"><h2>SMTP Finite State Machine</h2><span className="tag">FLAT</span></div>
        <p className="muted">Each valid command moves the protocol to its next state. An invalid command is rejected.</p>
        <div className="state-flow">{states.slice(0,6).map((s,i)=><div className="state-step" key={s[0]}><div className="state-circle"><b>{s[0]}</b><small>{s[1]}</small></div><div className="state-arrow"><span>{s[2]}</span><b>→</b></div></div>)}<div className="state-circle final"><b>q6</b><small>Completed</small></div></div>
        <h3 className="table-title">State Transition Table</h3>
        <div className="table-wrap"><table><thead><tr><th>Current State</th><th>Input</th><th>Next State</th><th>Description</th></tr></thead><tbody>
          {states.slice(0,6).map(s=><tr key={s[0]}><td>{s[0]} – {s[1]}</td><td><code>{s[2]}</code></td><td>{s[3]}</td><td>Valid transition</td></tr>)}
        </tbody></table></div>
        <p className="muted small">After completion, QUIT closes the session and returns to the disconnected state.</p>
      </section>}

      {page === "History" && <section className="panel"><div className="panel-head"><h2>Simulation history</h2><button className="outline" onClick={loadHistory}>Refresh</button></div>
        {history.length===0 ? <div className="empty">No saved history yet. Run a simulation with MongoDB connected.</div> :
        <div className="table-wrap"><table><thead><tr><th>Protocol</th><th>Sender</th><th>Receiver</th><th>Status</th><th>Date</th></tr></thead><tbody>{history.map(h=><tr key={h._id}><td>{h.protocol}</td><td>{h.sender}</td><td>{h.recipient}</td><td><span className={`status ${h.status==="Success"?"good":"bad"}`}>{h.status}</span></td><td>{new Date(h.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>}
      </section>}
      <footer>Full Stack Web Development · Computer Networks · FLAT</footer>
    </main>
  </div>;
}

function Stat({title,value,icon}) { return <div className="stat-card"><div className="stat-icon">{icon}</div><p>{title}</p><strong>{value}</strong></div>; }
function Quick({title,desc,onClick}) { return <button className="quick-card" onClick={onClick}><b>{title}</b><p>{desc}</p><span>Open section →</span></button>; }
