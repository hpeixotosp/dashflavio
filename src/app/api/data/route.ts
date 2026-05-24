import { NextResponse } from "next/server";

const KV_KEY = "dashflavio_financial_data_v11";

// Cria uma conexão Redis fresca por requisição (correto para serverless)
async function getRedisClient() {
  const redisUrl =
    process.env.KV_REDIS_URL ||
    process.env.KV_URL ||
    process.env.REDIS_URL;

  if (!redisUrl) return null;

  const { default: Redis } = await import("ioredis");

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    connectTimeout: 8000,
    commandTimeout: 8000,
    lazyConnect: true, // Conecta explicitamente abaixo
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
    enableReadyCheck: false,
  });

  await client.connect();
  return client;
}

export async function GET() {
  let client = null;
  try {
    client = await getRedisClient();

    if (!client) {
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
  } finally {
    // Fecha a conexão após uso — obrigatório em serverless
    if (client) {
      client.quit().catch(() => {});
    }
  }
}

export async function POST(request: Request) {
  let client = null;
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Formato de dados inválido" },
        { status: 400 }
      );
    }

    client = await getRedisClient();

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Redis não configurado" },
        { status: 400 }
      );
    }

    await client.set(KV_KEY, JSON.stringify(body));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao gravar no Redis:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.quit().catch(() => {});
    }
  }
}
