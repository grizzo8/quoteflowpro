"use client";
import { useState, useEffect } from "react";
import { Settings, Globe, CheckCircle2, Star, Shield, Clock, Wrench, LayoutTemplate, SquareDashedBottom, X, MousePointerClick, CalendarCheck, Sparkles, MessageSquare, HelpCircle, ArrowUpCircle, Scissors } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Connect to your Supabase Database
const supabaseUrl = "https://iaoxpdxyfmnegaogufvz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhb3hwZHh5Zm1uZWdhb2d1ZnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzQ2MDgsImV4cCI6MjA5MzMxMDYwOH0.672Dfq7gL7HlowVnuz8IxMuwK66i-x99YHXnJp8t6EA";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [view, setView] = useState("admin"); 
  const [isLiveClient, setIsLiveClient] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
    blue: "bg-blue-600 hover:bg-blue-700 text-blue-600 border-blue-600",
    green: "bg-green-600 hover:bg-green-700 text-green-600 border-green-600",
    red: "bg-red-600 hover:bg-red-700 text-red-600 border-red-600",
    black: "bg-gray-900 hover:bg-black text-gray-900 border-gray-900",
  };

  const themeBg = colors[clientData.color]?.split(" ")[0] || "bg-blue-600"; 
  const themeText = colors[clientData.color]?.split(" ")[2] || "text-blue-600";

  // ADDED LAWN CARE SEPARATELY FROM LANDSCAPING
  const nicheServices = {
    Landscaping: ["Custom Landscape Design", "Mulch & Stone Installation", "Shrub & Tree Planting"],
    "Lawn Care": ["Weekly Lawn Mowing", "Edging & Trimming", "Weed Control & Fertilization"],
    Plumbing: ["Emergency Pipe Repair", "Water Heater Installation", "Drain Cleaning & Clearing"],
    "House Cleaning": ["Deep House Cleaning", "Move-In / Move-Out Cleaning", "Recurring Maid Service"],
    Painting: ["Interior Room Painting", "Exterior House Painting", "Cabinet Refinishing"]
  };
  const currentServices = nicheServices[clientData.niche] || nicheServices["Landscaping"];

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quoteWidgetContent = (
    <div id="quote-widget" className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-100 relative overflow-hidden transform hover:-translate-y-1 transition duration-300 mx-auto">
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
      
      {/* MODALS */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-8 relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowPrivacy(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X className="w-6 h-6" /></button>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
            <div className="text-gray-600 space-y-4 text-left">
              <p>Welcome to {clientData.businessName}. This Privacy Policy explains how we collect, use, and protect your information when you use our website and instant quoting tool.</p>
              <h3 className="font-bold text-gray-900">Information We Collect</h3>
              <p>When you request a quote for {clientData.niche.toLowerCase()} services, we collect the details of your project and your contact phone number.</p>
              <h3 className="font-bold text-gray-900">How We Use Your Information</h3>
              <p>We use this information exclusively to calculate your estimated quote using AI technology, and to contact you directly via phone or text message to finalize your service request. We do not sell your personal data to third parties.</p>
            </div>
          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-8 relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X className="w-6 h-6" /></button>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Terms & Conditions</h2>
            <div className="text-gray-600 space-y-4 text-left">
              <p>By using the website and quoting tools provided by {clientData.businessName}, you agree to the following terms and conditions.</p>
              <h3 className="font-bold text-gray-900">1. AI Estimates are Not Final Contracts</h3>
              <p>The instant quotes generated on this website are automated estimates based on standard {clientData.niche.toLowerCase()} industry pricing. They are designed to give you a rough idea of cost. **These estimates are NOT legally binding contracts or final offers.**</p>
              <h3 className="font-bold text-gray-900">2. Final Pricing</h3>
              <p>Final pricing can only be determined after a representative from {clientData.businessName} has verified the scope of work, inspected the property or project, and issued a formal written quote or invoice.</p>
            </div>
          </div>
        </div>
      )}

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
        <div className="max-w-4xl mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 mb-12">
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
                
                {/* FIX: ADDED LAWN CARE TO DROPDOWN */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Main Service</label>
                  <select value={clientData.niche} onChange={e => setClientData({...clientData, niche: e.target.value})} className="w-full p-3 border rounded-lg bg-gray-50 text-black">
                    <option value="Landscaping">Landscaping Design</option>
                    <option value="Lawn Care">Lawn Care & Mowing</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="House Cleaning">House Cleaning</option>
                    <option value="Painting">Painting</option>
                  </select>
                </div>
                
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

      {view === "live" && clientData.productTier === "widget_only" && (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4">{quoteWidgetContent}</div>
      )}

      {view === "live" && clientData.productTier === "full_website" && (
        <div className="bg-white min-h-screen flex flex-col">
          
          <header className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full bg-white sticky top-0 z-40 shadow-sm">
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
            {quoteWidgetContent}
          </main>

          <section className={`${themeBg} py-12 px-8 text-white`}>
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center"><Shield className="w-12 h-12 mb-4 opacity-90" /><h4 className="text-xl font-bold mb-2">Licensed & Insured</h4><p className="opacity-80 text-sm">Full peace of mind guaranteed on every job.</p></div>
              <div className="flex flex-col items-center"><Clock className="w-12 h-12 mb-4 opacity-90" /><h4 className="text-xl font-bold mb-2">Fast Turnaround</h4><p className="opacity-80 text-sm">We respect your time and stick to our schedule.</p></div>
              <div className="flex flex-col items-center"><Star className="w-12 h-12 mb-4 opacity-90" /><h4 className="text-xl font-bold mb-2">5-Star Service</h4><p className="opacity-80 text-sm">Top-rated by your neighbors in the community.</p></div>
            </div>
          </section>

          {/* DYNAMIC SERVICES (UPDATED WITH LAWN CARE) */}
          <section className="py-20 px-8 max-w-7xl mx-auto w-full">
            <div className="text-center mb-16"><h2 className="text-4xl font-bold text-gray-900 mb-4">What We Do</h2><p className="text-lg text-gray-500">Professional {clientData.niche.toLowerCase()} services tailored to your needs.</p></div>
            <div className="grid md:grid-cols-3 gap-8">
              {currentServices.map((service, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className={`w-14 h-14 ${themeBg} rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-md`}>
                    {clientData.niche === "Lawn Care" ? <Scissors className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service}</h3>
                  <p className="text-gray-500">Reliable, fast, and guaranteed to exceed your expectations. We treat your property like our own.</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-20 px-8 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto w-full">
              <div className="text-center mb-16"><h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2><p className="text-lg text-gray-500">Three simple steps to a better property.</p></div>
              <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="text-center relative z-10">
                  <div className={`w-20 h-20 ${themeBg} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg transform rotate-3`}><MousePointerClick className="w-10 h-10" /></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Get a Quote</h3>
                  <p className="text-gray-500">Use our AI tool at the top of the page to get an instant estimate without making a phone call.</p>
                </div>
                <div className="text-center relative z-10">
                  <div className={`w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg transform -rotate-3`}><CalendarCheck className="w-10 h-10" /></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Book Your Date</h3>
                  <p className="text-gray-500">We will reach out immediately to confirm your exact price and get you on the schedule.</p>
                </div>
                <div className="text-center relative z-10">
                  <div className={`w-20 h-20 ${themeBg} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg transform rotate-3`}><Sparkles className="w-10 h-10" /></div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">3. We Do The Work</h3>
                  <p className="text-gray-500">Our professional crew arrives on time and delivers top-tier {clientData.niche.toLowerCase()} results.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 px-8 max-w-7xl mx-auto w-full">
            <div className="text-center mb-16"><h2 className="text-4xl font-bold text-gray-900 mb-4">Client Testimonials</h2><p className="text-lg text-gray-500">Don't just take our word for it.</p></div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sarah M.", text: `Absolutely incredible ${clientData.niche.toLowerCase()} service. They were on time, extremely professional, and left my property looking perfect. Highly recommend!` },
                { name: "Jason T.", text: `I loved the instant quote feature. It made budgeting and booking my ${clientData.niche.toLowerCase()} project so incredibly easy and stress-free.` },
                { name: "Emily R.", text: `We have hired many contractors over the years, but ${clientData.businessName} is by far the best. Fair pricing and fantastic communication.` }
              ].map((review, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative">
                  <MessageSquare className="w-8 h-8 text-gray-200 absolute top-6 right-6" />
                  <div className="flex text-yellow-400 mb-4">
                    <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{review.text}"</p>
                  <p className="font-bold text-gray-900">- {review.name}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-20 px-8 bg-gray-50 border-t border-gray-200">
             <div className="max-w-4xl mx-auto w-full">
               <div className="text-center mb-12"><h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2></div>
               <div className="space-y-6">
                 {[
                   { q: "Do you offer free estimates?", a: "Yes! The fastest way to get an estimate is to use the Instant Quote tool at the top of this page. For highly complex jobs, we can come out and provide a physical written estimate." },
                   { q: "Are you fully licensed and insured?", a: `Absolutely. We carry full commercial insurance for all our ${clientData.niche.toLowerCase()} projects to ensure you have total peace of mind.` },
                   { q: "How quickly can you start?", a: "It depends on our current schedule, but we strive to begin all standard projects within just a few days of booking." }
                 ].map((faq, idx) => (
                   <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start">
                     <HelpCircle className={`w-6 h-6 mr-4 flex-shrink-0 ${themeText}`} />
                     <div>
                       <h4 className="font-bold text-gray-900 text-lg mb-2">{faq.q}</h4>
                       <p className="text-gray-600">{faq.a}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </section>

          <section className={`${themeBg} py-20 px-8 text-center text-white`}>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-extrabold mb-6">Ready to upgrade your property?</h2>
              <p className="text-xl mb-10 opacity-90">Get your exact price instantly using our AI quoting tool, or call us today to speak with a team member.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button onClick={scrollToTop} className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition flex items-center">
                  <ArrowUpCircle className="w-5 h-5 mr-2" /> Scroll to Quoting Tool
                </button>
              </div>
            </div>
          </section>

          <footer className="bg-gray-900 text-white text-center py-12 mt-auto">
            <h3 className="text-2xl font-bold mb-2">{clientData.businessName}</h3>
            <p className="text-gray-400 mb-8">Your trusted local {clientData.niche.toLowerCase()} experts.</p>
            
            <div className="flex justify-center space-x-6 text-sm text-gray-500 font-medium border-t border-gray-800 pt-8 max-w-md mx-auto">
              <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition">Privacy Policy</button>
              <span>|</span>
              <button onClick={() => setShowTerms(true)} className="hover:text-white transition">Terms & Conditions</button>
            </div>
            
            <p className="font-medium text-gray-600 text-xs mt-6">© 2026 {clientData.businessName}. All Rights Reserved.</p>
          </footer>
        </div>
      )}
    </div>
  );
}
