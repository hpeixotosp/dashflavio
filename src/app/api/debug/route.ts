import { NextResponse } from "next/server";

const TEST_KEY = "dashflavio_debug_test";

async function getRedisClient() {
  const redisUrl =
    process.env.KV_REDIS_URL ||
    process.env.KV_URL ||
    process.env.REDIS_URL;

  if (!redisUrl) return { client: null, urlMasked: null };

  const { default: Redis } = await import("ioredis");

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    connectTimeout: 5000,
    commandTimeout: 5000,
    lazyConnect: true,
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
    enableReadyCheck: false,
  });

  await client.connect();

  const parts = redisUrl.split("@");
  const urlMasked = redisUrl.split("://")[0] + "://***@" + (parts[parts.length - 1]?.substring(0, 30) ?? "???") + "...";

  return { client, urlMasked };
}

export async function GET() {
  const results: Record<string, any> = {
    envVars: {
      KV_REDIS_URL: process.env.KV_REDIS_URL ? "✅ presente" : null,
      KV_URL: process.env.KV_URL ? "✅ presente" : null,
      KV_REST_API_URL: process.env.KV_REST_API_URL ? "✅ presente" : null,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "✅ presente" : null,
    },
    ping: "não testado",
    writeTest: "não testado",
    readTest: "não testado",
    mainDataExists: "não testado",
    urlBeingTested: null,
  };

  let client = null;
  try {
    const { client: c, urlMasked } = await getRedisClient();
    client = c;
    results.urlBeingTested = urlMasked;

    if (!client) {
      results.ping = "❌ Nenhuma URL Redis encontrada";
      return NextResponse.json(results);
    }

    // Teste PING
    const ping = await client.ping();
    results.ping = ping === "PONG" ? "✅ PONG" : "❌ " + ping;

    // Teste de escrita
    const writeRes = await client.set(TEST_KEY, "hello_" + Date.now(), "EX", 60);
    results.writeTest = writeRes === "OK" ? "✅ Escrita OK" : "❌ " + writeRes;

    // Teste de leitura
    const readVal = await client.get(TEST_KEY);
    results.readTest = readVal?.startsWith("hello_") ? "✅ Leitura OK: " + readVal : "❌ Valor: " + readVal;

    // Verifica se há dados reais do dashboard
    const mainData = await client.get("dashflavio_financial_data_v11");
    results.mainDataExists = mainData
      ? `✅ Dados encontrados (${Math.round(mainData.length / 1024)} KB)`
      : "⚠️ Nenhum dado salvo ainda no Redis";

  } catch (err: any) {
    results.error = err.message;
  } finally {
    if (client) client.quit().catch(() => {});
  }

  return NextResponse.json(results, { status: 200 });
}
