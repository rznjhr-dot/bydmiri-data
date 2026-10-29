export type JpjPlateRow = {
  state: string;
  plate: string;
  unavailable: boolean;
};

export type JpjPlateRegion = {
  name: string;
  rows: JpjPlateRow[];
};

export type JpjRunningNumbersData = {
  updated: string;
  regions: JpjPlateRegion[];
};

function decodeEntities(input: string): string {
  if (typeof document !== "undefined") {
    const el = document.createElement("textarea");
    el.innerHTML = input;
    return el.value;
  }
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10))
    );
}

function htmlToLines(html: string): string[] {
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "\n");
  return decodeEntities(stripped)
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function parseRegion(block: string): JpjPlateRegion | null {
  const lines = htmlToLines(block);
  if (lines.length < 2) return null;
  const name = lines[0].toUpperCase();
  const rows: JpjPlateRow[] = [];
  for (const line of lines.slice(1)) {
    const match = line.match(
      /^([A-Za-z][A-Za-z .]{0,30}?)\s*-\s*([A-Za-z]{1,4}\d{1,4}[A-Za-z]?)(\*?)$/
    );
    if (!match) continue;
    rows.push({
      state: match[1].trim().toUpperCase(),
      plate: match[2].toUpperCase(),
      unavailable: match[3] === "*",
    });
  }
  return rows.length ? { name, rows } : null;
}

/** Parse the JPJ latest-plate page into the three regional groups. */
export function parseRunningNumbers(html: string): JpjRunningNumbersData {
  const regions: JpjPlateRegion[] = [];
  const itemRe = /<div class="item[123]">([\s\S]*?)<\/div>/gi;
  let item: RegExpExecArray | null;
  while ((item = itemRe.exec(html))) {
    const region = parseRegion(item[1]);
    if (region) regions.push(region);
  }

  const text = htmlToLines(html).join("\n");
  const matches = [...text.matchAll(/as on\s+([^\n]+?\([A-Za-z]+\))/gi)];
  const updated = matches.length
    ? matches[matches.length - 1][1].replace(/\s+/g, " ").trim()
    : "";

  return { updated, regions };
}

export function isRunningNumbersData(
  value: unknown
): value is JpjRunningNumbersData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<JpjRunningNumbersData>;
  if (typeof data.updated !== "string" || !Array.isArray(data.regions)) {
    return false;
  }
  return data.regions.every(
    (region) =>
      Boolean(region) &&
      typeof region.name === "string" &&
      Array.isArray(region.rows) &&
      region.rows.every(
        (row) =>
          Boolean(row) &&
          typeof row.state === "string" &&
          typeof row.plate === "string" &&
          typeof row.unavailable === "boolean"
      )
  );
}
