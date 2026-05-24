import { NextResponse } from "next/server";
import Redis from "ioredis";

// Chave onde guardaremos todo o JSON financeiro unificado na nuvem
const KV_KEY = "dashflavio_financial_data_v11";

// Cria o cliente Redis de forma lazy (apenas se a URL existir)
let redisClient: Redis | null = null;

const getRedisClient = (): Redis | null => {
  // Tenta a URL do Redis clássico (Vercel KV_REDIS_URL) ou fallback para outras vars
  const redisUrl =
    process.env.KV_REDIS_URL ||
    process.env.KV_URL ||
    process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("Nenhuma URL Redis encontrada nas variáveis de ambiente.");
    return null;
  }

  // Reutiliza conexão existente para performance
  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      // Configurações para ambiente serverless (Vercel)
      maxRetriesPerRequest: 3,
      lazyConnect: false,
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
    });

    redisClient.on("error", (err) => {
      console.error("Erro na conexão Redis:", err.message);
    });
  }

  return redisClient;
};

export async function GET() {
  try {
    const client = getRedisClient();

    if (!client) {
      console.warn("Redis não configurado. Usando fallback de LocalStorage.");
      return NextResponse.json({ data: null, isFallback: true });
    }

    const raw = await client.get(KV_KEY);

    if (!raw) {
      return NextResponse.json({ data: null, isFallback: false });
    }

    const data = JSON.parse(raw);
    return NextResponse.json({ data, isFallback: false });
  } catch (error: any) {
    console.error("Erro ao ler do Redis:", error.message);
    return NextResponse.json({ data: null, isFallback: true, error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    const client = getRedisClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Redis não configurado" },
        { status: 400 }
      );
    }

    const body = await request.json();
    if (!body || !Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Formato de dados inválido" },
        { status: 400 }
      );
    }

    // Salva os dados como string JSON no Redis (sem TTL = persistente)
    await client.set(KV_KEY, JSON.stringify(body));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao gravar no Redis:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
