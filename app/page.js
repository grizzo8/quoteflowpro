"use client";
import { useState, useEffect } from "react";
import { Settings, Globe, CheckCircle2, Star, Shield, Clock, Wrench, LayoutTemplate, SquareDashedBottom } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Hardcoding the public keys so the browser always has them
const supabaseUrl = "https://iaoxpdxyfmnegaogufvz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhb3hwZHh5Zm1uZWdhb2d1ZnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzQ2MDgsImV4cCI6MjA5MzMxMDYwOH0.672Dfq7gL7HlowVnuz8IxMuwK66i-x99YHXnJp8t6EA";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [view, setView] = useState("admin"); 
  const [isLiveClient, setIsLiveClient] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [clientData, setClientData] = useState({
    businessName: "",
    niche: "Landscaping",
    color: "blue",
    phone: "",
    rules: "",
    productTier: "full_website"
  });

  const [customerInput, setCustomerInput] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);

  // CHECK THE URL FOR AN ID WHEN THE PAGE LOADS
  useEffect(() => {
    const fetchClient = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("id");
      if (id) {
        setIsLiveClient(true);
        const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
        if (data) {
          setClientData({
            businessName: data.business_name,
            phone: data.contact_phone,
            niche: data.niche,
            color: data.brand_color,
            rules: data.pricing_rules,
            productTier: data.product_tier
          });
          setView("live");
        }
      }
    };
    fetchClient();
  }, []);

  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-blue-600",
    green: "bg-green-600 hover:bg-green-700 text-green-600",
    red: "bg-red-600 hover:bg-red-700 text-red-600",
    black: "bg-gray-900 hover:bg-black text-gray-900",
  };

  const themeBg = colors[clientData.color]?.split(" ")[0] || "bg-blue-600"; 
  const themeText = colors[clientData.color]?.split(" ")[2] || "text-blue-600";

  const nicheServices = {
    Landscaping: ["Lawn Care & Mowing", "Garden Design & Mulch", "Yard Cleanup & Debris Removal"],
    Plumbing: ["Emergency Pipe Repair", "Water Heater Installation", "Drain Cleaning & Clearing"],
    "House Cleaning": ["Deep House Cleaning", "Move-In / Move-Out Cleaning", "Recurring Maid Service"],
    Painting: ["Interior Room Painting", "Exterior House Painting", "Cabinet Refinishing"]
  };
  const currentServices = nicheServices[clientData.niche] || nicheServices["Landscaping"];

  // SAVE TO DATABASE
  const saveClient = async () => {
    setIsSaving(true);
    const { data, error } = await supabase.from("clients").insert([{
      business_name: clientData.businessName,
      contact_phone: clientData.phone,
      niche: clientData.niche,
      brand_color: clientData.color,
      pricing_rules: clientData.rules,
      product_tier: clientData.productTier
    }]).select();

    if (data && data.length > 0) {
      setGeneratedLink(`${window.location.origin}?id=${data[0].id}`);
    } else {
      alert("Error saving client!");
    }
    setIsSaving(false);
  };

  // AI QUOTE GENERATOR
  const generateQuote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInput,
          businessName: clientData.businessName,
          niche: clientData.niche,
          rules: clientData.rules
        }),
      });
      const data = await res.json();
      setQuote(data.quote);
    } catch (error) {
      setQuote("Error connecting to AI. We will text you shortly!");
    }
    setLoading(false);
  };

  const QuoteWidget = () => (
    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 relative overflow-hidden transform hover:-translate-y-1 transition duration-300 mx-auto">
      {!quote ? (
        <form onSubmit={generateQuote} className="space-y-5 relative z-10 text-left">
          <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Get an Instant Estimate</h3>
          <p className="text-gray-500 text-sm mb-6 text-center">Describe your project, and our AI will calculate a quote.</p>
          <textarea required value={customerInput} onChange={e => setCustomerInput(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none resize-none h-32 text-black" placeholder={`e.g., I need a quote for ${clientData.niche.toLowerCase()}...`}></textarea>
          <input required type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none text-black" placeholder="Your Cell Phone Number" />
          <button disabled={loading} type="submit" className={`w-full ${themeBg} text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all`}>
            {loading ? "Calculating with AI..." : "Calculate AI Quote"}
          </button>
        </form>
      ) : (
        <div className="py-8 relative z-10 text-center">
          <CheckCircle2 className={`w-16 h-16 mx-auto mb-4 ${themeText}`} />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Success!</h3>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6">
            <p className="text-gray-800 font-medium text-lg leading-relaxed">{quote}</p>
          </div>
          <p className="text-gray-500 font-medium">Your request was sent! We will text you at <span className="text-gray-900 font-bold">{customerPhone}</span> shortly to confirm.</p>
          <button onClick={() => setQuote("")} className="mt-8 text-sm font-bold text-gray-400 hover:text-gray-600">Start New Request</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hide the Admin Nav Bar if a client is viewing their generated link */}
      {!isLiveClient && (
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-black text-gray-900">QuoteFlow AI</h1>
          <div className="space-x-4">
            <button onClick={() => {setView("admin"); setGeneratedLink("");}} className={`px-4 py-2 rounded-md text-sm font-bold inline-flex items-center ${view === "admin" ? "bg-gray-100 text-black" : "text-gray-500"}`}>
              <Settings className="w-4 h-4 mr-2" /> Admin Dashboard
            </button>
            <button onClick={() => setView("live")} className={`px-4 py-2 rounded-md text-sm font-bold inline-flex items-center ${view === "live" ? "bg-gray-100 text-black" : "text-gray-500"}`}>
              <Globe className="w-4 h-4 mr-2" /> Preview Design
            </button>
          </div>
        </nav>
      )}

      {view === "admin" && !isLiveClient && (
        <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">New Client Onboarding</h2>
          <p className="text-gray-500 mb-8">Enter the client's details and select their product tier.</p>
          
          {generatedLink ? (
             <div className="mb-8 p-8 bg-green-50 border-2 border-green-500 rounded-xl text-center">
                <h3 className="text-2xl font-bold text-green-900 mb-2">Client Website Generated!</h3>
                <p className="text-gray-700 mb-6">Here is the permanent, white-labeled link to give to your client:</p>
                <input type="text" readOnly value={generatedLink} className="w-full p-4 border rounded-lg bg-white text-black font-mono text-center mb-6 shadow-inner" />
                <div className="space-x-4">
                   <a href={generatedLink} target="_blank" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition">Open Live Site</a>
                   <button onClick={() => setGeneratedLink("")} className="text-gray-600 font-bold hover:text-gray-900">Create Another Client</button>
                </div>
             </div>
          ) : (
            <>
              <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Select Product Tier</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setClientData({...clientData, productTier: "widget_only"})} className={`p-4 rounded-lg border-2 text-left flex items-center transition-all ${clientData.productTier === "widget_only" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"}`}>
                    <SquareDashedBottom className={`w-8 h-8 mr-4 ${clientData.productTier === "widget_only" ? "text-blue-600" : "text-gray-400"}`} />
                    <div>
                      <h4 className={`font-bold ${clientData.productTier === "widget_only" ? "text-blue-900" : "text-gray-700"}`}>Widget Only ($50/mo)</h4>
                      <p className="text-sm text-gray-500 mt-1">For clients who already have a website.</p>
                    </div>
                  </button>
                  <button onClick={() => setClientData({...clientData, productTier: "full_website"})} className={`p-4 rounded-lg border-2 text-left flex items-center transition-all ${clientData.productTier === "full_website" ? "border-purple-600 bg-purple-50" : "border-gray-200 bg-white"}`}>
                    <LayoutTemplate className={`w-8 h-8 mr-4 ${clientData.productTier === "full_website" ? "text-purple-600" : "text-gray-400"}`} />
                    <div>
                      <h4 className={`font-bold ${clientData.productTier === "full_website" ? "text-purple-900" : "text-gray-700"}`}>Full Website ($199 + $99/mo)</h4>
                      <p className="text-sm text-gray-500 mt-1">Generates a complete landing page.</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label><input type="text" value={clientData.businessName} onChange={e => setClientData({...clientData, businessName: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label><input type="text" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Main Service</label><select value={clientData.niche} onChange={e => setClientData({...clientData, niche: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black"><option>Landscaping</option><option>Plumbing</option><option>House Cleaning</option><option>Painting</option></select></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Brand Color</label><select value={clientData.color} onChange={e => setClientData({...clientData, color: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black"><option value="blue">Blue</option><option value="green">Green</option><option value="red">Red</option><option value="black">Black</option></select></div>
              </div>
              <div className="mb-8"><label className="block text-sm font-bold text-gray-700 mb-1">Pricing Rules (For the AI)</label><textarea value={clientData.rules} onChange={e => setClientData({...clientData, rules: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 h-24 text-black" placeholder="e.g., $150 base fee PLUS $20 per square metre..."></textarea></div>
              <button disabled={isSaving} onClick={saveClient} className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg">
                {isSaving ? "Saving to Database..." : "Save to Database & Generate Link"}
              </button>
            </>
          )}
        </div>
      )}

      {/* LIVE VIEW - DYNAMIC BASED ON TIER */}
      {view === "live" && clientData.productTier === "widget_only" && (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4"><QuoteWidget /></div>
      )}

      {view === "live" && clientData.productTier === "full_website" && (
        <div className="bg-white min-h-screen flex flex-col">
          <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full bg-white">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{clientData.businessName}</h2>
            <a href={`tel:${clientData.phone}`} className={`${themeBg} text-white px-6 py-2 rounded-full font-bold shadow-md hover:opacity-90 transition`}>Call Now: {clientData.phone}</a>
          </header>
          <main className="flex flex-col items-center justify-center text-center px-4 py-16 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4 bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <Star className={`w-4 h-4 ${themeText} fill-current`} />
              <span className="text-sm font-bold text-gray-700">#1 Rated {clientData.niche} Company in Your Area</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 max-w-4xl tracking-tight">Premium <span className={themeText}>{clientData.niche}</span> Services by {clientData.businessName}</h1>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl">Stop waiting days for a callback. Get an instant estimate right now and book your service today.</p>
            <QuoteWidget />
          </main>
          <section className="py-20 px-8 max-w-7xl mx-auto w-full">
            <div className="text-center mb-16"><h2 className="text-4xl font-bold text-gray-900 mb-4">What We Do</h2><p className="text-lg text-gray-500">Professional {clientData.niche.toLowerCase()} services tailored to your needs.</p></div>
            <div className="grid md:grid-cols-3 gap-8">
              {currentServices.map((service, idx) => (
                <div key={idx} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 text-center hover:shadow-md transition">
                  <div className={`w-14 h-14 ${themeBg} rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-sm`}><Wrench className="w-6 h-6" /></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service}</h3>
                  <p className="text-gray-500">Reliable, fast, and guaranteed to exceed your expectations. We treat your property like our own.</p>
                </div>
              ))}
            </div>
          </section>
          <section className={`${themeBg} py-16 px-8 text-white`}>
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center"><Shield className="w-12 h-12 mb-4 opacity-80" /><h4 className="text-xl font-bold mb-2">Licensed & Insured</h4><p className="opacity-80">Full peace of mind guaranteed on every job.</p></div>
              <div className="flex flex-col items-center"><Clock className="w-12 h-12 mb-4 opacity-80" /><h4 className="text-xl font-bold mb-2">Fast Turnaround</h4><p className="opacity-80">We respect your time and stick to our schedule.</p></div>
              <div className="flex flex-col items-center"><Star className="w-12 h-12 mb-4 opacity-80" /><h4 className="text-xl font-bold mb-2">5-Star Service</h4><p className="opacity-80">Top-rated by your neighbors in the community.</p></div>
            </div>
          </section>
          <footer className="bg-gray-900 text-white text-center py-10 mt-auto">
            <h3 className="text-2xl font-bold mb-2">{clientData.businessName}</h3>
            <p className="text-gray-400 mb-6">Your trusted local {clientData.niche.toLowerCase()} experts.</p>
            <p className="font-medium text-gray-500 text-sm border-t border-gray-800 pt-6">© 2026 {clientData.businessName}. All Rights Reserved.</p>
          </footer>
        </div>
      )}
    </div>
  );
}
