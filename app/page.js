"use client";
import { useState } from "react";
import { Settings, Globe, CheckCircle2 } from "lucide-react";

export default function App() {
  const [view, setView] = useState("admin"); 
  
  const [clientData, setClientData] = useState({
    businessName: "Apex Landscaping",
    niche: "Landscaping",
    color: "blue",
    phone: "555-019-8273",
    rules: "Minimum call out is $150."
  });

  const [customerInput, setCustomerInput] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);

  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-blue-600",
    green: "bg-green-600 hover:bg-green-700 text-green-600",
    red: "bg-red-600 hover:bg-red-700 text-red-600",
    black: "bg-gray-900 hover:bg-black text-gray-900",
  };

  const themeBg = colors[clientData.color]?.split(" ")[0] || "bg-blue-600"; 
  const themeText = colors[clientData.color]?.split(" ")[2] || "text-blue-600";

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

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-gray-900">QuoteFlow AI</h1>
        <div className="space-x-4">
          <button onClick={() => setView("admin")} className={`px-4 py-2 rounded-md text-sm font-bold inline-flex items-center ${view === "admin" ? "bg-gray-100 text-black" : "text-gray-500"}`}>
            <Settings className="w-4 h-4 mr-2" /> Admin Dashboard
          </button>
          <button onClick={() => setView("live")} className={`px-4 py-2 rounded-md text-sm font-bold inline-flex items-center ${view === "live" ? "bg-gray-100 text-black" : "text-gray-500"}`}>
            <Globe className="w-4 h-4 mr-2" /> Live Client Website
          </button>
        </div>
      </nav>

      {view === "admin" && (
        <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">New Client Onboarding</h2>
          <p className="text-gray-500 mb-8">Enter the client's details to instantly generate their AI website.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label>
              <input type="text" value={clientData.businessName} onChange={e => setClientData({...clientData, businessName: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
              <input type="text" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Main Service</label>
              <select value={clientData.niche} onChange={e => setClientData({...clientData, niche: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black">
                <option>Landscaping</option>
                <option>Plumbing</option>
                <option>House Cleaning</option>
                <option>Painting</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Brand Color</label>
              <select value={clientData.color} onChange={e => setClientData({...clientData, color: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black">
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
                <option value="black">Black</option>
              </select>
            </div>
          </div>
          <div className="mb-8">
             <label className="block text-sm font-bold text-gray-700 mb-1">Pricing Rules (For the AI)</label>
             <textarea value={clientData.rules} onChange={e => setClientData({...clientData, rules: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 h-24 text-black" placeholder="e.g., $150 minimum call out fee..."></textarea>
          </div>
          <button onClick={() => setView("live")} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg">
            Save & Generate Website
          </button>
        </div>
      )}

      {view === "live" && (
        <div className="bg-white min-h-screen flex flex-col">
          <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{clientData.businessName}</h2>
            <a href={`tel:${clientData.phone}`} className={`${themeBg} text-white px-6 py-2 rounded-full font-bold shadow-md`}>
              Call Now: {clientData.phone}
            </a>
          </header>

          <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-12 bg-gray-50">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 max-w-4xl tracking-tight">
              Premium <span className={themeText}>{clientData.niche}</span> Services by {clientData.businessName}
            </h1>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl">
              Stop waiting days for a callback. Get an instant estimate right now and book your service today.
            </p>

            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 relative overflow-hidden">
              {!quote ? (
                <form onSubmit={generateQuote} className="space-y-5 relative z-10 text-left">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">Get an Instant Estimate</h3>
                  <p className="text-gray-500 text-sm mb-6 text-center">Describe your project, and our AI will calculate a quote.</p>
                  
                  <textarea required value={customerInput} onChange={e => setCustomerInput(e.target.value)} className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-400 focus:outline-none resize-none h-32 text-black" placeholder="e.g., I have a 4-bedroom house that needs deep cleaning..."></textarea>
                  
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
          </main>
          
          <footer className="bg-gray-900 text-white text-center py-8 mt-auto">
            <p className="font-medium text-gray-400">© 2026 {clientData.businessName}. All Rights Reserved.</p>
          </footer>
        </div>
      )}
    </div>
  );
}
