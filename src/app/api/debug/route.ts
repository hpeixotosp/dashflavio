import { NextResponse } from "next/server";

export async function GET() {
  const kvRedisUrl = process.env.KV_REDIS_URL;
  const kvUrl = process.env.KV_URL;
  const kvRestApiUrl = process.env.KV_REST_API_URL;
  const kvRestApiToken = process.env.KV_REST_API_TOKEN;
  const redisUrl = process.env.REDIS_URL;

  // Mostra apenas o início de cada URL (sem credenciais)
  const mask = (val?: string) => {
    if (!val) return null;
    // Mostra o protocolo e os primeiros 20 chars apenas
    const parts = val.split("@");
    if (parts.length > 1) {
      return val.split("://")[0] + "://***@" + parts[parts.length - 1].substring(0, 30) + "...";
    }
    return val.substring(0, 30) + "...";
  };

  // Testa conexão Redis
  let redisStatus = "não testado";
  const urlToTest = kvRedisUrl || kvUrl || redisUrl;

  if (urlToTest) {
    try {
      const Redis = (await import("ioredis")).default;
      const client = new Redis(urlToTest, {
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        tls: urlToTest.startsWith("rediss://") ? {} : undefined,
      });

      await client.ping();
      redisStatus = "✅ CONECTADO (PING OK)";
      await client.quit();
    } catch (err: any) {
      redisStatus = "❌ ERRO: " + err.message;
    }
  } else {
    redisStatus = "❌ Nenhuma URL Redis encontrada";
  }

  return NextResponse.json({
    envVars: {
      KV_REDIS_URL: mask(kvRedisUrl),
      KV_URL: mask(kvUrl),
      KV_REST_API_URL: mask(kvRestApiUrl),
      KV_REST_API_TOKEN: kvRestApiToken ? "✅ presente" : null,
      REDIS_URL: mask(redisUrl),
    },
    redisConnection: redisStatus,
    urlBeingTested: mask(urlToTest),
  });
}
