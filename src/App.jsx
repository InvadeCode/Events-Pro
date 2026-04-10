import React, { useState, useRef, useEffect } from 'react';

// --- CONFIGURATION DATA ---
const CHECKLIST_GROUPS = [
  {
    title: "⚡ Power & Electrical",
    items: [
      { id: "c1", label: "Total power availability confirmed (mention KVA)" },
      { id: "c2", label: "Generator backup available & capacity noted" },
      { id: "c3", label: "Power panel location identified for event team" },
      { id: "c4", label: "Earthing/grounding checked at key points" },
      { id: "c5", label: "Separate power feed for AV and lighting confirmed" }
    ]
  },
  {
    title: "🔊 AV & Technical Infrastructure",
    items: [
      { id: "c6", label: "In-house PA system checked (brand, output)" },
      { id: "c7", label: "Rigging points / truss grid availability confirmed" },
      { id: "c8", label: "Internet / Wi-Fi speed tested (upload & download)" },
      { id: "c9", label: "Dedicated fibre/broadband available for event use" },
      { id: "c10", label: "CCTV coverage and blind spots noted" }
    ]
  },
  {
    title: "🚗 Parking & Logistics",
    items: [
      { id: "c11", label: "Parking capacity confirmed (cars + buses)" },
      { id: "c12", label: "Valet parking option discussed" },
      { id: "c13", label: "Loading/unloading bay timings confirmed" },
      { id: "c14", label: "Truck/vehicle access route to venue mapped" },
      { id: "c15", label: "Nearest landmark/directions for vendors documented" }
    ]
  },
  {
    title: "🍽️ F&B & Kitchen",
    items: [
      { id: "c16", label: "In-house F&B policy confirmed (exclusivity clause?)" },
      { id: "c17", label: "Outside caterer policy discussed" },
      { id: "c18", label: "Kitchen capacity & pantry areas visited" },
      { id: "c19", label: "Bar setup area identified" },
      { id: "c20", label: "Crockery, cutlery, buffet equipment inventory taken" }
    ]
  },
  {
    title: "🚻 Washrooms & Amenities",
    items: [
      { id: "c21", label: "Male & female washroom count confirmed" },
      { id: "c22", label: "Differently-abled washroom available" },
      { id: "c23", label: "Medical/first aid room identified" },
      { id: "c24", label: "Smoking zones marked/confirmed" }
    ]
  },
  {
    title: "🔥 Safety & Compliance",
    items: [
      { id: "c25", label: "Fire NOC valid and available" },
      { id: "c26", label: "Emergency exits mapped and unobstructed" },
      { id: "c27", label: "Fire extinguisher count and placement noted" },
      { id: "c28", label: "Sprinkler system coverage confirmed" },
      { id: "c29", label: "Evacuation plan available from venue" }
    ]
  },
  {
    title: "🎨 Décor & Production",
    items: [
      { id: "c30", label: "Décor restrictions confirmed (no nailing, drilling, adhesive etc.)" },
      { id: "c31", label: "Drone flying policy confirmed" },
      { id: "c32", label: "Pyrotechnics / special effects policy noted" },
      { id: "c33", label: "Confetti / dry ice / fog machine allowed?" },
      { id: "c34", label: "Outside flower/floral vendor policy confirmed" }
    ]
  }
];

const INITIAL_TIMINGS = [
  { id: 1, activity: "Venue Access / Key Handover", date: "", start: "", end: "", area: "All areas", notes: "" },
  { id: 2, activity: "Set-Up / Production Start", date: "", start: "", end: "", area: "Main Hall", notes: "" },
  { id: 3, activity: "Décor / Floral Setup", date: "", start: "", end: "", area: "", notes: "" },
  { id: 4, activity: "Sound Check / AV Rehearsal", date: "", start: "", end: "", area: "Stage Area", notes: "" },
  { id: 5, activity: "Guest / Pax Arrival", date: "", start: "", end: "", area: "Pre-Function", notes: "" },
  { id: 6, activity: "Event / Program Starts", date: "", start: "", end: "", area: "Main Hall", notes: "" },
  { id: 7, activity: "Event Ends / Last Guest Out", date: "", start: "", end: "", area: "", notes: "Strict curfew?" },
  { id: 8, activity: "Breakdown / De-Rig Starts", date: "", start: "", end: "", area: "", notes: "" },
  { id: 9, activity: "Final Handover to Venue", date: "", start: "", end: "", area: "All areas", notes: "" },
  { id: 10, activity: "Music Curfew / Noise Cutoff", date: "", start: "", end: "", area: "", notes: "Statutory cutoff time?" }
];

const INITIAL_PERMITS = [
  { id: 1, name: "Police Permission / NOC", responsible: "Events And Pro", status: "Pending", date: "" },
  { id: 2, name: "Fire NOC (from Fire Department)", responsible: "Venue", status: "Pending", date: "" },
  { id: 3, name: "Liquor Licence (Excise Dept.)", responsible: "Events And Pro", status: "Pending", date: "" },
  { id: 4, name: "IPRS / PPL Music Licence", responsible: "Events And Pro", status: "Pending", date: "" },
  { id: 5, name: "Entertainment Tax / GST Compliance", responsible: "Client", status: "Pending", date: "" },
  { id: 6, name: "Outdoor Signage / Hoarding Permission", responsible: "Events And Pro", status: "Pending", date: "" },
  { id: 7, name: "Drone Flying Permission (DGCA)", responsible: "Events And Pro", status: "Pending", date: "" },
  { id: 8, name: "Health & Safety Certificate (Venue)", responsible: "Venue", status: "Pending", date: "" },
  { id: 9, name: "Generator / DG Set Usage Permission", responsible: "Events And Pro", status: "Pending", date: "" }
];

const INITIAL_STATE = {
  // 1. Basic Info
  venueName: "", venueCity: "", venueAddress: "", clientName: "", eventDate: "", paxCount: "", eventType: "",
  recceDate: "", reccePerson: "", recceDesignation: "", reccePhone: "", recceEmail: "",
  venueContact: "", venuePhone: "", venueEmail: "", rating: "0",
  
  // 2. Dimensions
  dimensions: [
    { id: Date.now(), name: "Main Banquet Hall", l: "", w: "", h: "", area: "", seating: "", notes: "Pillar-free, AC" },
    { id: Date.now() + 1, name: "Pre-Function Area", l: "", w: "", h: "", area: "", seating: "", notes: "Registration area" }
  ],
  stageSize: "", stageHeight: "", trussHeight: "", pillarDetails: "", loadingBay: "", elevator: "", dimNotes: "",
  
  // 3. Checklist (Flat object map id -> boolean)
  checklist: {},
  
  // 4. Do's and Don'ts
  dos: { d1: false, d2: false, d3: false, d4: false, d5: false, d6: false, d7: false, d8: false },
  donts: { dn1: false, dn2: false, dn3: false, dn4: false, dn5: false, dn6: false, dn7: false, dn8: false },
  customDos: "", customDonts: "",
  
  // 5. Photos & Links
  photoLinks: { walkThrough: "", mapPin: "", storageLink: "" },
  photoChecklist: { mainHall: false, stage: false, preFunction: false, greenRoom: false, parking: false, washrooms: false, power: false, kitchen: false, fireExits: false, approach: false },
  
  // 6. Timings
  timings: [...INITIAL_TIMINGS], timingNotes: "",
  
  // 7. Permits
  permits: [...INITIAL_PERMITS], permitNotes: "",
  
  // 8. Files
  files: { cad: null, layout: null, sop: null, contract: null, quote: null, noc: null, rider: null },
  fileLinks: { drive: "", other: "" }, fileNotes: "",
  
  // 9. Summary
  summary: { suitability: "", strengths: "", concerns: "", nextSteps: "", notes: "" }
};

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle', 'success', 'server_error', 'error'
  
  const totalSteps = 9;

  // --- HANDLERS ---
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleArrayChange = (category, id, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  // Dimensions Specific
  const handleDimChange = (id, field, value) => {
    setFormData(prev => {
      const newDims = prev.dimensions.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Auto calculate area if l and w exist
          if (field === 'l' || field === 'w') {
            const l = parseFloat(updated.l) || 0;
            const w = parseFloat(updated.w) || 0;
            updated.area = (l > 0 && w > 0) ? (l * w).toString() : "";
          }
          return updated;
        }
        return item;
      });
      return { ...prev, dimensions: newDims };
    });
  };

  const addDimRow = () => {
    setFormData(prev => ({
      ...prev,
      dimensions: [...prev.dimensions, { id: Date.now(), name: "", l: "", w: "", h: "", area: "", seating: "", notes: "" }]
    }));
  };

  const removeDimRow = (id) => {
    setFormData(prev => ({
      ...prev,
      dimensions: prev.dimensions.filter(item => item.id !== id)
    }));
  };

  const addPermitRow = () => {
    setFormData(prev => ({
      ...prev,
      permits: [...prev.permits, { id: Date.now(), name: "", responsible: "Events And Pro", status: "Pending", date: "" }]
    }));
  };

  // Photo Upload
  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.filter(f => f.type.startsWith('image/')).map(file => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e, key) => {
    if (e.target.files.length > 0) {
      handleNestedChange('files', key, e.target.files[0].name);
    }
  };

  // --- SUBMISSION & EMAIL GENERATION ---
  
  const generateTextReport = () => {
    // Generates a plain text version for the mailto fallback
    return `VENUE RECCE REPORT: ${formData.venueName || 'N/A'}
Client / Event: ${formData.clientName || 'N/A'}
Date: ${formData.eventDate || 'N/A'}
Location: ${formData.venueCity} - ${formData.venueAddress}
Expected Pax: ${formData.paxCount}
Event Type: ${formData.eventType}
Recce Done By: ${formData.reccePerson} (${formData.reccePhone})

--- DIMENSIONS ---
Stage Size: ${formData.stageSize}
Stage Height: ${formData.stageHeight}
Truss Clearance: ${formData.trussHeight} ft
Loading Bay: ${formData.loadingBay}

--- SUMMARY ASSESSMENT ---
Suitability: ${formData.summary.suitability}
Key Strengths: ${formData.summary.strengths || 'None noted'}
Concerns / Red Flags: ${formData.summary.concerns || 'None noted'}
Action Items: ${formData.summary.nextSteps || 'None noted'}

(Generated via Events And Pro Recce System)`;
  };

  const generateEmailHTML = () => {
    // Generates a beautiful HTML email structure to send via Resend
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; line-height: 1.6; padding: 20px; background: #f9f9f9; }
          .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 4px solid #c9a84c; }
          h1 { color: #0d0d0d; font-size: 24px; margin-bottom: 5px; }
          h2 { color: #1a3c5e; font-size: 18px; border-bottom: 2px solid #f0d98a; padding-bottom: 8px; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 10px; border-bottom: 1px solid #e0d9cc; text-align: left; font-size: 14px; }
          th { background: #f5f2eb; color: #1a3c5e; width: 35%; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #f0f9ee; color: #27ae60; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Venue Recce Report: ${formData.venueName || 'N/A'}</h1>
          <p><strong>Client / Event:</strong> ${formData.clientName || 'N/A'} | <strong>Date:</strong> ${formData.eventDate || 'N/A'}</p>
          
          <h2>1. Basic Information</h2>
          <table>
            <tr><th>Location</th><td>${formData.venueCity} - ${formData.venueAddress}</td></tr>
            <tr><th>Expected Pax</th><td>${formData.paxCount}</td></tr>
            <tr><th>Event Type</th><td>${formData.eventType}</td></tr>
            <tr><th>Recce Done By</th><td>${formData.reccePerson} (${formData.reccePhone})</td></tr>
            <tr><th>Venue Contact</th><td>${formData.venueContact} (${formData.venuePhone})</td></tr>
            <tr><th>Venue Rating</th><td>${formData.rating} / 5 Stars</td></tr>
          </table>

          <h2>2. Dimensions Summary</h2>
          <table>
            <tr><th>Stage Details</th><td>${formData.stageSize} (Size), ${formData.stageHeight} (Height)</td></tr>
            <tr><th>Truss Clearance</th><td>${formData.trussHeight} ft</td></tr>
            <tr><th>Loading Bay</th><td>${formData.loadingBay}</td></tr>
          </table>

          <h2>3. Summary Assessment</h2>
          <table>
            <tr><th>Suitability</th><td><strong>${formData.summary.suitability}</strong></td></tr>
            <tr><th>Key Strengths</th><td>${formData.summary.strengths || 'None noted'}</td></tr>
            <tr><th>Concerns/Red Flags</th><td>${formData.summary.concerns || 'None noted'}</td></tr>
            <tr><th>Action Items</th><td>${formData.summary.nextSteps || 'None noted'}</td></tr>
          </table>
          
          <br/>
          <p style="font-size: 12px; color: #888;">This is an automated report generated from the Events And Pro Recce System.</p>
        </div>
      </body>
      </html>
    `;
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    const htmlEmail = generateEmailHTML();
    
    // Check if running inside the Canvas preview (which restricts localhost fetches via HTTPS)
    const isCanvasPreview = typeof window !== 'undefined' && window.location.hostname.includes('usercontent.goog');

    if (isCanvasPreview) {
      // Simulate successful network request for the preview environment
      setTimeout(() => {
        setSubmitStatus('success');
        setShowModal(true);
        setIsSubmitting(false);
      }, 1500);
      return;
    }

    try {
      // UPDATED for Vercel: Changed from http://localhost:3001/api/send-email to the relative /api path
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: ['eventsandpro@gmail.com'],
          subject: `Venue Recce Report: ${formData.venueName || 'New Venue'}`,
          html: htmlEmail
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to send email via Serverless Function');
      }
      
      setSubmitStatus('success');
      setShowModal(true);
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setSubmitStatus('server_error');
      } else {
        setSubmitStatus('error');
      }
      setShowModal(true); 
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NAVIGATION ---
  const nextStep = () => { if (step < totalSteps - 1) setStep(step + 1); window.scrollTo(0,0); };
  const prevStep = () => { if (step > 0) setStep(step - 1); window.scrollTo(0,0); };

  // --- RENDER HELPERS ---
  const renderStepNav = () => (
    <div className="progress-wrap">
      <div className="progress-steps">
        {['Basic Info', 'Dimensions', 'Checklist', "Do's & Don'ts", 'Photos', 'Timings', 'Permits', 'Files', 'Summary'].map((label, i) => (
          <button 
            key={i} 
            className={`step-btn ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`}
            onClick={() => { setStep(i); window.scrollTo(0,0); }}
          >
            {i + 1} · {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8f3] text-[#0d0d0d] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        
        :root {
          --ink: #0d0d0d; --gold: #c9a84c; --gold-light: #f0d98a;
          --cream: #faf8f3; --white: #ffffff; --border: #e0d9cc;
          --muted: #8a8178; --section-bg: #f5f2eb; --danger: #c0392b;
          --success: #27ae60; --accent: #1a3c5e;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--ink); margin:0; padding:0; -webkit-font-smoothing: antialiased; }
        .header { background: var(--ink); color: var(--white); padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 4px solid var(--gold); position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .brand { display: flex; align-items: center; gap: 16px; }
        .brand-icon { width: 52px; height: 52px; background: linear-gradient(135deg, var(--gold), #d4b55b); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(201,168,76,0.3); }
        .brand-text h1 { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 500; margin:0; letter-spacing: 0.5px; }
        .brand-text p { font-size: 11px; color: var(--gold-light); letter-spacing: 2.5px; text-transform: uppercase; margin: 4px 0 0 0; font-weight: 400;}
        .doc-badge { background: rgba(201,168,76,0.15); color: var(--gold-light); border: 1px solid rgba(201,168,76,0.3); font-size: 11px; font-weight: 500; padding: 6px 16px; border-radius: 20px; letter-spacing: 1.5px; text-transform: uppercase; }
        .progress-wrap { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 32px; overflow-x: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .progress-steps { display: flex; min-width: 700px; }
        .step-btn { flex: 1; padding: 18px 10px; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: var(--muted); letter-spacing: 0.8px; text-transform: uppercase; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s ease; white-space: nowrap; }
        .step-btn.active { color: var(--gold); border-bottom-color: var(--gold); }
        .step-btn.done { color: var(--accent); }
        .step-btn:hover:not(.active) { color: var(--ink); }
        .container-main { max-width: 900px; margin: 0 auto; padding: 48px 24px 80px; }
        .section-card { background: var(--white); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-bottom: 32px; animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 8px 30px rgba(0,0,0,0.04); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .section-head { background: var(--ink); color: var(--white); padding: 24px 32px; display: flex; align-items: center; gap: 18px; position: relative; overflow: hidden; }
        .section-head::after { content: ''; position: absolute; top:0; right:0; bottom:0; width: 4px; background: var(--gold); }
        .section-icon { width: 46px; height: 46px; background: rgba(201,168,76,0.15); color: var(--gold); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; border: 1px solid rgba(201,168,76,0.3); }
        .section-head h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; margin:0; letter-spacing: 0.5px; }
        .section-head p { font-size: 13px; color: #b0b0b0; margin: 4px 0 0 0; font-weight: 400; }
        .section-body { padding: 32px; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .field-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
        .field-grid.cols-1 { grid-template-columns: 1fr; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field.full { grid-column: 1 / -1; }
        label { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); }
        label .req { color: var(--danger); margin-left: 4px; }
        input[type="text"], input[type="number"], input[type="date"], input[type="time"], input[type="email"], input[type="tel"], input[type="url"], select, textarea { border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--ink); background: var(--cream); width: 100%; box-sizing: border-box; transition: all 0.2s ease; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 4px rgba(201,168,76,0.15); background: var(--white); }
        textarea { resize: vertical; min-height: 100px; line-height: 1.5; }
        .dim-table, .timing-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .dim-table th, .timing-table th { background: var(--section-bg); font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); padding: 14px; text-align: left; border-bottom: 2px solid var(--border); }
        .timing-table th { background: var(--ink); color: var(--gold); border-bottom: none; }
        .dim-table td, .timing-table td { padding: 10px 14px; border-bottom: 1px solid var(--border); }
        .dim-table input, .timing-table input { padding: 8px 12px; border-radius: 6px; }
        .add-row-btn { margin-top: 16px; background: transparent; border: 2px dashed var(--gold); color: var(--gold); padding: 10px 20px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .add-row-btn:hover { background: rgba(201,168,76,0.1); }
        .checklist { display: flex; flex-direction: column; gap: 12px; }
        .check-item { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: var(--section-bg); border-radius: 10px; border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; }
        .check-item:hover { border-color: var(--gold); background: #fdf9ee; }
        .check-item.checked { background: #f0f9ee; border-color: var(--success); box-shadow: 0 2px 8px rgba(39,174,96,0.1); }
        .check-item input { width: 20px; height: 20px; accent-color: var(--gold); cursor: pointer; }
        .check-item span { font-weight: 400; color: var(--ink); }
        .check-group-title { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin: 24px 0 12px; display: flex; align-items: center; gap: 8px; }
        .check-group-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .dos-donts { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .dos-card { background: linear-gradient(to bottom right, #f0f9ee, #e3f2e1); border: 1px solid #a8d5b5; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(39,174,96,0.05); }
        .donts-card { background: linear-gradient(to bottom right, #fdf0ee, #fbe3e0); border: 1px solid #e5b0a8; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(192,57,43,0.05); }
        .photo-upload-area { border: 2px dashed var(--gold); border-radius: 16px; padding: 48px 24px; text-align: center; background: #fdf9ee; cursor: pointer; position: relative; transition: all 0.2s; }
        .photo-upload-area:hover { background: #faf4dd; border-color: #b8952f; }
        .photo-upload-area input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .photo-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; margin-top: 24px; }
        .photo-thumb { border-radius: 10px; overflow: hidden; aspect-ratio: 1; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .file-upload-row { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); transition: all 0.2s; }
        .file-upload-row:hover { border-color: var(--gold); box-shadow: 0 4px 12px rgba(201,168,76,0.1); }
        .permit-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr; gap: 12px; padding: 16px 0; border-bottom: 1px solid var(--border); align-items: center; }
        .permit-row.header { padding: 10px 0; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); border-bottom: 2px solid var(--border); }
        .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border); }
        .btn { padding: 14px 32px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; letter-spacing: 0.5px; }
        .btn-prev { background: var(--white); border: 1.5px solid var(--border); color: var(--ink); }
        .btn-prev:hover { background: var(--section-bg); border-color: var(--muted); }
        .btn-next { background: var(--ink); color: var(--white); box-shadow: 0 4px 12px rgba(13,13,13,0.2); }
        .btn-next:hover { background: var(--accent); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(13,13,13,0.3); }
        .btn-submit { background: var(--gold); color: var(--ink); box-shadow: 0 4px 12px rgba(201,168,76,0.3); }
        .btn-submit:hover { background: #b8952f; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(201,168,76,0.4); }
        .star-rating { display: flex; flex-direction: row-reverse; gap: 8px; justify-content: flex-end;}
        .star-rating input { display: none; }
        .star-rating label { font-size: 32px; cursor: pointer; color: var(--border); transition: all 0.2s; }
        .star-rating input:checked ~ label, .star-rating label:hover, .star-rating label:hover ~ label { color: var(--gold); transform: scale(1.1); }
        hr { border: none; border-top: 1px solid var(--border); margin: 32px 0; }
        @media (max-width: 640px) { .field-grid { grid-template-columns: 1fr; } .dos-donts { grid-template-columns: 1fr; } .permit-row { grid-template-columns: 1fr; } .header { padding: 16px; } .container-main { padding: 24px 16px 80px; } }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <div className="brand">
          <div className="brand-icon">📋</div>
          <div className="brand-text">
            <h1>Events And Pro</h1>
            <p>Venue Recce Report System</p>
          </div>
        </div>
        <div className="doc-badge hidden sm:block">🔒 Internal Use</div>
      </div>

      {renderStepNav()}

      <div className="container-main">

        {/* STEP 1: BASIC INFO */}
        {step === 0 && (
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">🏛️</div>
              <div><h2>Venue & Event Basic Information</h2><p>Core details of the venue and the visiting team</p></div>
            </div>
            <div className="section-body">
              <div className="field-grid">
                <div className="field">
                  <label>Venue Name <span className="req">*</span></label>
                  <input type="text" value={formData.venueName} onChange={(e) => handleInputChange('venueName', e.target.value)} placeholder="e.g. Hotel Taj" />
                </div>
                <div className="field">
                  <label>City / Location <span className="req">*</span></label>
                  <input type="text" value={formData.venueCity} onChange={(e) => handleInputChange('venueCity', e.target.value)} placeholder="e.g. Pune, Maharashtra" />
                </div>
                <div className="field full">
                  <label>Full Address</label>
                  <textarea value={formData.venueAddress} onChange={(e) => handleInputChange('venueAddress', e.target.value)} placeholder="Complete address..." />
                </div>
                <div className="field">
                  <label>Client / Event Name <span className="req">*</span></label>
                  <input type="text" value={formData.clientName} onChange={(e) => handleInputChange('clientName', e.target.value)} placeholder="e.g. Annual Summit 2025" />
                </div>
                <div className="field">
                  <label>Event Date</label>
                  <input type="date" value={formData.eventDate} onChange={(e) => handleInputChange('eventDate', e.target.value)} />
                </div>
                <div className="field">
                  <label>Expected Pax</label>
                  <input type="number" value={formData.paxCount} onChange={(e) => handleInputChange('paxCount', e.target.value)} placeholder="e.g. 500" />
                </div>
                <div className="field">
                  <label>Event Type</label>
                  <select value={formData.eventType} onChange={(e) => handleInputChange('eventType', e.target.value)}>
                    <option value="">— Select —</option>
                    <option>Corporate Conference</option>
                    <option>Awards Ceremony</option>
                    <option>Wedding / Social</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <hr />
              <div className="field-grid">
                <div className="field"><label>Recce Done By <span className="req">*</span></label><input type="text" value={formData.reccePerson} onChange={(e) => handleInputChange('reccePerson', e.target.value)} /></div>
                <div className="field"><label>Contact Number</label><input type="tel" value={formData.reccePhone} onChange={(e) => handleInputChange('reccePhone', e.target.value)} /></div>
                <div className="field"><label>Venue Contact</label><input type="text" value={formData.venueContact} onChange={(e) => handleInputChange('venueContact', e.target.value)} /></div>
                <div className="field">
                  <label>Venue Rating</label>
                  <div className="star-rating">
                    {[5,4,3,2,1].map(num => (
                      <React.Fragment key={num}>
                        <input type="radio" id={`s${num}`} name="rating" value={num} checked={formData.rating === String(num)} onChange={(e) => handleInputChange('rating', e.target.value)} />
                        <label htmlFor={`s${num}`}>★</label>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DIMENSIONS */}
        {step === 1 && (
          <div className="section-card">
             <div className="section-head">
              <div className="section-icon">📐</div>
              <div><h2>Space Dimensions & Capacity</h2></div>
            </div>
            <div className="section-body" style={{overflowX: 'auto'}}>
              <table className="dim-table">
                <thead><tr><th>Space</th><th>L (ft)</th><th>W (ft)</th><th>H (ft)</th><th>Area</th><th>Seating</th><th>Notes</th><th></th></tr></thead>
                <tbody>
                  {formData.dimensions.map(dim => (
                    <tr key={dim.id}>
                      <td><input type="text" value={dim.name} onChange={(e) => handleDimChange(dim.id, 'name', e.target.value)} /></td>
                      <td><input type="number" value={dim.l} onChange={(e) => handleDimChange(dim.id, 'l', e.target.value)} style={{width:'70px'}}/></td>
                      <td><input type="number" value={dim.w} onChange={(e) => handleDimChange(dim.id, 'w', e.target.value)} style={{width:'70px'}}/></td>
                      <td><input type="number" value={dim.h} onChange={(e) => handleDimChange(dim.id, 'h', e.target.value)} style={{width:'70px'}}/></td>
                      <td><input type="number" value={dim.area} readOnly style={{background:'#f0f0f0', width:'80px'}}/></td>
                      <td><input type="text" value={dim.seating} onChange={(e) => handleDimChange(dim.id, 'seating', e.target.value)} style={{width:'80px'}}/></td>
                      <td><input type="text" value={dim.notes} onChange={(e) => handleDimChange(dim.id, 'notes', e.target.value)} /></td>
                      <td><button onClick={() => removeDimRow(dim.id)} style={{border:'none',background:'none',color:'#c0392b',cursor:'pointer',fontSize:'18px'}}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="add-row-btn" onClick={addDimRow}>+ Add Space</button>
              <hr />
              <div className="field-grid cols-3">
                <div className="field"><label>Stage Size</label><input type="text" value={formData.stageSize} onChange={(e)=>handleInputChange('stageSize', e.target.value)} placeholder="40 x 24" /></div>
                <div className="field"><label>Stage Height</label><input type="text" value={formData.stageHeight} onChange={(e)=>handleInputChange('stageHeight', e.target.value)} placeholder="3 ft" /></div>
                <div className="field"><label>Clear Truss Hgt</label><input type="text" value={formData.trussHeight} onChange={(e)=>handleInputChange('trussHeight', e.target.value)} placeholder="18 ft" /></div>
                <div className="field"><label>Loading Bay</label><input type="text" value={formData.loadingBay} onChange={(e)=>handleInputChange('loadingBay', e.target.value)} /></div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CHECKLIST */}
        {step === 2 && (
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">✅</div>
              <div><h2>Venue Recce Checklist</h2></div>
            </div>
            <div className="section-body">
              {CHECKLIST_GROUPS.map((group, idx) => (
                <div key={idx}>
                  <div className="check-group-title">{group.title}</div>
                  <div className="checklist">
                    {group.items.map(item => (
                      <label key={item.id} className={`check-item ${formData.checklist[item.id] ? 'checked' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={!!formData.checklist[item.id]} 
                          onChange={(e) => handleNestedChange('checklist', item.id, e.target.checked)} 
                        />
                        <span style={{fontSize: '13.5px'}}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: DO'S AND DON'TS */}
        {step === 3 && (
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">⚖️</div>
              <div><h2>Venue Do's & Don'ts</h2></div>
            </div>
            <div className="section-body">
              <div className="dos-donts">
                <div className="dos-card">
                  <h3 style={{color: 'var(--success)', marginBottom:'12px', fontSize:'13px', textTransform:'uppercase'}}>✅ Do's — Allowed / Recommended</h3>
                  <div className="checklist">
                    {['Arrive on time for setup', 'Use venue-approved tape', 'Coordinate furniture moves', 'Submit gate passes'].map((text, i) => (
                      <label key={`d${i}`} className="check-item" style={{background:'rgba(255,255,255,0.6)', padding:'8px'}}>
                        <input type="checkbox" checked={!!formData.dos[`d${i}`]} onChange={(e) => handleNestedChange('dos', `d${i}`, e.target.checked)} />
                        <span style={{fontSize:'13px'}}>{text}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{marginTop: '16px'}}>
                    <label>Custom Do's</label>
                    <textarea value={formData.customDos} onChange={(e) => handleInputChange('customDos', e.target.value)} placeholder="Add venue-specific do's..."></textarea>
                  </div>
                </div>
                <div className="donts-card">
                  <h3 style={{color: 'var(--danger)', marginBottom:'12px', fontSize:'13px', textTransform:'uppercase'}}>❌ Don'ts — Prohibited</h3>
                  <div className="checklist">
                    {['Do NOT drill, nail or screw', 'Do NOT use double-sided tape', 'Do NOT exceed sound limits', 'Do NOT block emergency exits'].map((text, i) => (
                      <label key={`dn${i}`} className="check-item" style={{background:'rgba(255,255,255,0.6)', padding:'8px'}}>
                        <input type="checkbox" checked={!!formData.donts[`dn${i}`]} onChange={(e) => handleNestedChange('donts', `dn${i}`, e.target.checked)} />
                        <span style={{fontSize:'13px'}}>{text}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{marginTop: '16px'}}>
                    <label>Custom Don'ts</label>
                    <textarea value={formData.customDonts} onChange={(e) => handleInputChange('customDonts', e.target.value)} placeholder="Add venue-specific don'ts..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PHOTOS */}
        {step === 4 && (
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">📷</div>
              <div><h2>Venue Photography</h2></div>
            </div>
            <div className="section-body">
              <div className="photo-upload-area">
                <input type="file" accept="image/*" multiple onChange={handlePhotos} />
                <div style={{fontSize: '40px', marginBottom: '12px'}}>🖼️</div>
                <h3>Drag & Drop Photos Here</h3>
                <p>Click to browse · JPG, PNG accepted</p>
              </div>
              <div className="photo-preview-grid">
                {photos.map((p, idx) => (
                  <div key={idx} className="photo-thumb">
                    <img src={p.url} alt="upload" />
                    <button className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" style={{position:'absolute', top:4, right:4, background:'var(--danger)', color:'white', border:'none', borderRadius:'50%', cursor:'pointer'}} onClick={() => removePhoto(idx)}>✕</button>
                  </div>
                ))}
              </div>
              <hr />
              <div className="field-grid">
                <div className="field">
                  <label>Links</label>
                  <input type="url" placeholder="Google Drive Photo Folder Link" value={formData.photoLinks.storageLink} onChange={e => handleNestedChange('photoLinks', 'storageLink', e.target.value)} />
                  <input type="url" placeholder="Google Maps Pin Link" className="mt-2" value={formData.photoLinks.mapPin} onChange={e => handleNestedChange('photoLinks', 'mapPin', e.target.value)} style={{marginTop:'8px'}}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: TIMINGS */}
        {step === 5 && (
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">🕐</div>
              <div><h2>Venue Timings & Schedule</h2></div>
            </div>
            <div className="section-body" style={{overflowX: 'auto'}}>
              <table className="timing-table">
                <thead><tr><th>Activity</th><th>Date</th><th>Start</th><th>End</th><th>Area</th><th>Notes</th></tr></thead>
                <tbody>
                  {formData.timings.map(t => (
                    <tr key={t.id}>
                      <td><input type="text" value={t.activity} onChange={(e) => handleArrayChange('timings', t.id, 'activity', e.target.value)} /></td>
                      <td><input type="date" value={t.date} onChange={(e) => handleArrayChange('timings', t.id, 'date', e.target.value)} /></td>
                      <td><input type="time" value={t.start} onChange={(e) => handleArrayChange('timings', t.id, 'start', e.target.value)} /></td>
                      <td><input type="time" value={t.end} onChange={(e) => handleArrayChange('timings', t.id, 'end', e.target.value)} /></td>
                      <td><input type="text" value={t.area} onChange={(e) => handleArrayChange('timings', t.id, 'area', e.target.value)} /></td>
                      <td><input type="text" value={t.notes} onChange={(e) => handleArrayChange('timings', t.id, 'notes', e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 7: PERMITS */}
        {step === 6 && (
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">📜</div>
              <div><h2>Permissions & Licences</h2></div>
            </div>
            <div className="section-body">
              <div className="permit-row header">
                <div>Permit Name</div><div>Responsible</div><div>Status</div><div>Due Date</div>
              </div>
              {formData.permits.map(p => (
                <div className="permit-row" key={p.id}>
                  <div><input type="text" value={p.name} onChange={(e) => handleArrayChange('permits', p.id, 'name', e.target.value)} /></div>
                  <div>
                    <select value={p.responsible} onChange={(e) => handleArrayChange('permits', p.id, 'responsible', e.target.value)}>
                      <option>Events And Pro</option><option>Venue</option><option>Client</option><option>Shared</option>
                    </select>
                  </div>
                  <div>
                    <select value={p.status} onChange={(e) => handleArrayChange('permits', p.id, 'status', e.target.value)}>
                      <option>Pending</option><option>Obtained</option><option>Not Required</option>
                    </select>
                  </div>
                  <div><input type="date" value={p.date} onChange={(e) => handleArrayChange('permits', p.id, 'date', e.target.value)} /></div>
                </div>
              ))}
              <button className="add-row-btn" onClick={addPermitRow}>+ Add Permit</button>
            </div>
          </div>
        )}

        {/* STEP 8: FILES */}
        {step === 7 && (
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">📁</div>
              <div><h2>Files & CAD Drawings</h2></div>
            </div>
            <div className="section-body">
              {[
                { key: 'cad', label: 'CAD / AutoCAD', icon: '🗂️' },
                { key: 'layout', label: 'Venue Layout (PDF)', icon: '🗺️' },
                { key: 'sop', label: 'Venue SOP Document', icon: '📄' },
                { key: 'contract', label: 'Venue Contract', icon: '🤝' }
              ].map(f => (
                <div className="file-upload-row" key={f.key}>
                  <div style={{fontSize:'22px'}}>{f.icon}</div>
                  <div style={{flex:1}}>
                    <h4 style={{margin:0, fontSize:'13px', fontWeight:500}}>{f.label}</h4>
                  </div>
                  <div style={{position:'relative', background:'var(--ink)', color:'white', padding:'8px 16px', borderRadius:'6px', fontSize:'12px', cursor:'pointer'}}>
                    Upload
                    <input type="file" style={{position:'absolute', inset:0, opacity:0, cursor:'pointer'}} onChange={(e) => handleFileUpload(e, f.key)} />
                  </div>
                  {formData.files[f.key] && <span style={{fontSize:'11px', color:'var(--success)', fontWeight:500}}>✓ Uploaded</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 9: SUMMARY */}
        {step === 8 && (
          <div className="section-card">
            <div className="section-head">
              <div className="section-icon">📊</div>
              <div><h2>Summary & Final Remarks</h2></div>
            </div>
            <div className="section-body">
              <div style={{padding:'14px 18px', background:'#f0f9ee', border:'1px solid #a8d5b5', color:'#1e7a3c', borderRadius:'8px', fontSize:'13px', marginBottom:'18px'}}>
                🎉 <strong>Almost done!</strong> Review and submit to email the report via Resend.
              </div>
              <div className="field-grid cols-1">
                <div className="field">
                  <label>Overall Suitability <span className="req">*</span></label>
                  <select value={formData.summary.suitability} onChange={(e) => handleNestedChange('summary', 'suitability', e.target.value)}>
                    <option value="">— Select Assessment —</option>
                    <option>✅ Highly Recommended — Ideal for this event</option>
                    <option>👍 Recommended — Minor modifications needed</option>
                    <option>⚠️ Conditionally Recommended — Major concerns to resolve</option>
                    <option>❌ Not Recommended — Venue does not meet requirements</option>
                  </select>
                </div>
                <div className="field"><label>Key Strengths</label><textarea value={formData.summary.strengths} onChange={(e) => handleNestedChange('summary', 'strengths', e.target.value)} /></div>
                <div className="field"><label>Concerns / Red Flags</label><textarea value={formData.summary.concerns} onChange={(e) => handleNestedChange('summary', 'concerns', e.target.value)} /></div>
                <div className="field"><label>Action Items</label><textarea value={formData.summary.nextSteps} onChange={(e) => handleNestedChange('summary', 'nextSteps', e.target.value)} /></div>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION BOTTOM */}
        <div className="nav-bar">
          {step > 0 ? <button className="btn btn-prev" onClick={prevStep}>← Previous</button> : <div></div>}
          <div style={{fontSize: '13px', color: 'var(--muted)', fontWeight: 400}}>Step {step + 1} of 9</div>
          {step < totalSteps - 1 ? (
             <button className="btn btn-next" onClick={nextStep}>Next →</button>
          ) : (
             <button className="btn btn-submit" onClick={submitForm} disabled={isSubmitting}>
               {isSubmitting ? 'Generating...' : '✓ Submit & Email Report'}
             </button>
          )}
        </div>

      </div>

      {/* SUCCESS / ERROR MODAL */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(13,13,13,0.7)', backdropFilter: 'blur(6px)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'white', borderRadius:'24px', padding:'48px', maxWidth:'500px', textAlign:'center', boxShadow:'0 24px 80px rgba(0,0,0,0.3)'}}>
            
            {submitStatus === 'success' ? (
              <>
                <div style={{fontSize:'64px', marginBottom:'20px'}}>✅</div>
                <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight: 600, marginBottom:'12px', color: 'var(--ink)'}}>Report Sent!</h2>
                <p style={{color:'var(--muted)', fontSize:'15px', lineHeight: 1.6, marginBottom:'32px'}}>
                  The report for <strong style={{color: 'var(--ink)'}}>{formData.venueName || 'Venue'}</strong> has been generated and sent to <strong>eventsandpro@gmail.com</strong>.
                </p>
              </>
            ) : (
              <>
                <div style={{fontSize:'64px', marginBottom:'20px'}}>⚠️</div>
                <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight: 600, marginBottom:'12px', color: 'var(--ink)'}}>API Connection Failed</h2>
                <p style={{color:'var(--muted)', fontSize:'15px', lineHeight: 1.6, marginBottom:'32px'}}>
                  Could not connect to the email API. Make sure your serverless functions are deployed properly on Vercel.
                  <br/><br/>
                  To bypass this in the frontend, you can generate an email draft directly using your mail client with all your data pre-filled:
                </p>
                <a href={`mailto:eventsandpro@gmail.com?subject=${encodeURIComponent('Venue Recce Report: ' + (formData.venueName || 'New Venue'))}&body=${encodeURIComponent(generateTextReport())}`} 
                   className="btn btn-submit" style={{display:'inline-block', textDecoration:'none', marginBottom:'24px', width: '100%', boxSizing:'border-box'}}>
                   Open Pre-filled Email Draft
                </a>
              </>
            )}

            <div style={{display:'flex', gap:'12px', justifyContent:'center'}}>
              <button className="btn btn-prev" style={{width: submitStatus !== 'success' ? '100%' : 'auto'}} onClick={() => { setShowModal(false); setFormData(INITIAL_STATE); setStep(0); setPhotos([]); }}>
                Start New Recce
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
