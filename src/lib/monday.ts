const MONDAY_API_URL = "https://api.monday.com/v2";

export async function mondayQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN no configurado en .env.local");

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": "2024-01",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Monday API error: ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "Monday API error");

  return json.data as T;
}
