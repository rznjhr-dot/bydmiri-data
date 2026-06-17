# BYD Miri Knowledge Base

The Single Source of Truth (SSOT) for all BYD Miri operations.

Built with Next.js 16, TypeScript, and Tailwind CSS. No database, no auth, no backend — everything is stored in static JSON files.

## Tech Stack

- **Next.js 16** — Static site generation
- **TypeScript** — Type-safe development
- **Tailwind CSS** — Utility-first styling
- **Static JSON** — All data in `src/data/`

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard (homepage)
│   ├── globals.css         # Global styles
│   ├── data/page.tsx       # Machine-readable endpoint listing
│   ├── handbook/page.tsx   # Master handbook
│   └── changelog/page.tsx  # Version history
└── data/                   # Static JSON data files
    ├── company.json
    ├── vehicles.json
    ├── pricing.json
    ├── rebates.json
    ├── finance.json
    ├── charging.json
    ├── website_rules.json
    ├── sales_rules.json
    ├── content_rules.json
    └── changelog.json
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Static output is in the `out/` directory, ready for Netlify deployment.

## Updating Data

All data is in `src/data/*.json`. After editing any JSON file:

1. Run `npm run build` to regenerate the static site
2. Deploy the `out/` directory to Netlify

No code changes are needed for price updates, rebate adjustments, new vehicles, or charging station changes.

## URLs

| Path | Description |
|------|-------------|
| `/` | Human-readable dashboard |
| `/data` | Machine-readable endpoint listing |
| `/data/*.json` | Raw JSON data for AI agents |
| `/handbook` | Master handbook |
| `/changelog` | Version history |

## AI Agent Usage

AI agents should read `https://[site-url]/data/` or individual JSON endpoints to obtain the latest verified business data before generating any output.

## Deployment

This project is configured for Netlify deployment. Push to GitHub and connect your repository to Netlify for automatic CI/CD.
