import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// Chave onde guardaremos todo o JSON financeiro unificado na nuvem
const KV_KEY = "dashflavio_financial_data_v11";

export async function GET() {
  try {
    // Verifica se as credenciais do Vercel KV estão presentes nas variáveis de ambiente
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn("Vercel KV credentials are not configured. Falling back to LocalStorage.");
      return NextResponse.json({ data: null, isFallback: true });
    }

    const data = await kv.get(KV_KEY);
    return NextResponse.json({ data, isFallback: false });
  } catch (error: any) {
    console.error("Error reading from Vercel KV database:", error);
    // Retorna nulo silenciosamente no erro para acionar o fallback de LocalStorage de forma resiliente
    return NextResponse.json({ data: null, isFallback: true, error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    // Verifica se as credenciais do Vercel KV estão presentes
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({ success: false, error: "KV not configured" }, { status: 400 });
    }

    const body = await request.json();
    if (!body || !Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Invalid data format" }, { status: 400 });
    }

    // Salva o JSON completo na nuvem de forma atômica
    await kv.set(KV_KEY, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error writing to Vercel KV database:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
