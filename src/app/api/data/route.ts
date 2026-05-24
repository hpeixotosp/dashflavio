import { NextResponse } from "next/server";
import { createClient } from "@vercel/kv";

// Chave onde guardaremos todo o JSON financeiro unificado na nuvem
const KV_KEY = "dashflavio_financial_data_v11";

// Resolução dinâmica de credenciais para suportar de forma transparente tanto o prefixo KV_ quanto o prefixo STORAGE_
const redisUrl = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL || process.env.KV_REDIS_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN;

const kvClient = createClient({
  url: redisUrl || "",
  token: redisToken || "",
});

export async function GET() {
  try {
    // Verifica se as credenciais do banco de dados na nuvem estão presentes
    if (!redisUrl || !redisToken) {
      console.warn("As credenciais do banco de dados (KV_ ou STORAGE_) não foram encontradas. Usando LocalStorage.");
      return NextResponse.json({ data: null, isFallback: true });
    }

    const data = await kvClient.get(KV_KEY);
    return NextResponse.json({ data, isFallback: false });
  } catch (error: any) {
    console.error("Erro ao ler do banco de dados em nuvem:", error);
    // Retorna nulo no erro para acionar o fallback de LocalStorage com total resiliência
    return NextResponse.json({ data: null, isFallback: true, error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    // Verifica se as credenciais do banco estão configuradas
    if (!redisUrl || !redisToken) {
      return NextResponse.json({ success: false, error: "Credenciais de banco ausentes" }, { status: 400 });
    }

    const body = await request.json();
    if (!body || !Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Formato de dados inválido" }, { status: 400 });
    }

    // Salva o JSON completo na nuvem de forma atômica
    await kvClient.set(KV_KEY, body);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao gravar no banco de dados em nuvem:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

