import { NextResponse } from "next/server";
import { createClient } from "@vercel/kv";

// Chave onde guardaremos todo o JSON financeiro unificado na nuvem
const KV_KEY = "dashflavio_financial_data_v11";

// Resolve as credenciais dinamicamente apenas em tempo de execução
const getRedisConfig = () => {
  const url = process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL || process.env.KV_REDIS_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN;
  return { url, token };
};

export async function GET() {
  try {
    const { url, token } = getRedisConfig();

    // Se as credenciais do banco de dados na nuvem não estiverem configuradas, ativa o fallback de forma silenciosa
    if (!url || !token) {
      console.warn("As credenciais do banco de dados (KV_ ou STORAGE_) não foram encontradas. Usando LocalStorage.");
      return NextResponse.json({ data: null, isFallback: true });
    }

    // Instancia o cliente Redis de forma lazy (sob demanda) apenas se as credenciais de fato existem
    const kvClient = createClient({ url, token });
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
    const { url, token } = getRedisConfig();

    // Verifica se as credenciais do banco estão configuradas
    if (!url || !token) {
      return NextResponse.json({ success: false, error: "Credenciais de banco ausentes" }, { status: 400 });
    }

    const body = await request.json();
    if (!body || !Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Formato de dados inválido" }, { status: 400 });
    }

    // Instancia o cliente Redis de forma lazy
    const kvClient = createClient({ url, token });
    await kvClient.set(KV_KEY, body);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao gravar no banco de dados em nuvem:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


