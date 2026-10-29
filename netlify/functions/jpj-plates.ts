import { JPJ_URL } from "../../src/config/jpj";
import { parseRunningNumbers } from "../../src/utils/jpjPlates";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

/**
 * Server-side JPJ proxy. Returns sanitized JSON instead of proxying the
 * upstream HTML through the site origin, so upstream scripts can never run
 * with BYD Miri origin privileges.
 */
export default async (): Promise<Response> => {
  try {
    const upstream = await fetch(JPJ_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!upstream.ok) throw new Error(`JPJ responded ${upstream.status}`);

    const data = parseRunningNumbers(await upstream.text());
    if (!data.regions.length) throw new Error("JPJ page format changed");

    return new Response(JSON.stringify(data), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 502,
      headers,
    });
  }
};

export const config = { path: "/api/jpj-plates" };
