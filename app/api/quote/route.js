import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { customerInput, businessName, niche, rules } = await req.json();
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // FIX: We upgraded the prompt to be a strict mathematical calculator
    const prompt = `
      You are a strict, professional estimator for a ${niche} business named ${businessName}. 
      A customer needs this job done: "${customerInput}". 
      Here are your exact pricing rules: "${rules}". 
      
      INSTRUCTIONS FOR YOUR MATH:
      1. Act like a calculator. Carefully apply the exact pricing rules to the customer's request.
      2. If the rules state a flat rate per unit (like square meters), multiply it exactly. 
      3. If the rules have a base fee PLUS a per-unit rate, add them together. 
      4. If the calculated total is less than the "minimum call-out fee", quote the minimum call-out fee.
      5. Do NOT invent a price range if the math results in an exact number. Just give the exact calculated number.
      
      RESPONSE FORMAT:
      Reply in exactly two short, friendly sentences. State the calculated price clearly, and briefly mention what it includes. Do not use bolding, asterisks, or markdown.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ quote: text });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ quote: "System busy. We will text you shortly to get you a price!" }, { status: 500 });
