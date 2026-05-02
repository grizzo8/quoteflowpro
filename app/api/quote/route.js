import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { customerInput, businessName, niche, rules } = await req.json();
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a professional quoting assistant for a ${niche} business named ${businessName}. 
      A customer has requested: "${customerInput}". 
      Here are the specific pricing rules for this business: "${rules}". 
      
      Based ONLY on these rules, provide a rough, realistic estimated price range for the customer. 
      Keep your response to exactly two short, friendly sentences. Do not use bolding, asterisks, or markdown.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ quote: text });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ quote: "System busy. We will text you shortly to get you a price!" }, { status: 500 });
  }
}
