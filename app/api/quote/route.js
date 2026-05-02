import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { customerInput, businessName, niche, rules } = await req.json();
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a strict math calculator and quoting assistant for a ${niche} business named ${businessName}. 
      Customer request: "${customerInput}"
      Pricing Rules: "${rules}"
      
      INSTRUCTIONS FOR MATH:
      1. Read the pricing rules literally. 
      2. If the rules mention a "Base Fee", "Setup Fee", or "Plus", YOU MUST ADD IT to the final total.
      3. Calculate the per-unit cost (e.g., $20 x 100 = $2000).
      4. Add the base fee to the per-unit total (e.g., $150 + $2000 = $2150).
      5. Never invent numbers or give ranges. Give the exact calculated number.
      
      Format your response as exactly two friendly sentences giving the final exact price and what it includes. Do not show the math breakdown to the customer.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ quote: text });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ quote: "System busy. We will text you shortly to get you a price!" }, { status: 500 });
  }
}
