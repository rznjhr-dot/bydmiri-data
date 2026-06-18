import Link from "next/link";
import company from "@/data/company.json";
import vehicles from "@/data/vehicles.json";
import finance from "@/data/finance.json";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calcMonthly(price: number, downPct: number): number {
  const rate = finance.interestRate / 100;
  const tenure = finance.defaultTenure;
  const loan = price * (1 - downPct / 100);
  const totalInterest = loan * rate * tenure;
  const totalPayable = loan + totalInterest;
  return totalPayable / (tenure * 12);
}

export default function VehiclesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-neutral-200/60 bg-gradient-to-b from-white to-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 tracking-tight">
            Vehicle Database
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Complete catalog of all {vehicles.length} BYD models available at {company.branch}
          </p>
        </div>
      </section>

      <main id="main-content" className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
        {vehicles.map((vehicle) => (
          <section key={vehicle.model}>
            <h2 className="section-title text-base">{vehicle.model}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {vehicle.variants.map((variant) => {
                const effectivePrice = variant.otr - (variant.rebate || 0);
                return (
                  <div key={variant.name} className="card card-elevated">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <h3 className="font-bold text-neutral-800 text-base">
                          {vehicle.model}
                        </h3>
                        <p className="text-xs text-neutral-400">{variant.name}</p>
                      </div>
                      {variant.rebate && variant.rebate > 0 ? (
                        <span className="badge badge-green shrink-0">
                          -{formatCurrency(variant.rebate)}
                        </span>
                      ) : null}
                    </div>

                    {/* Prices */}
                    <div className="space-y-1 mb-1.5">
                      <div className="data-row">
                        <span className="data-row-label">OTR without Insurance</span>
                        <span className="data-row-value">
                          {formatCurrency(variant.otrWithoutInsurance)}
                        </span>
                      </div>
                      <div className="data-row">
                        <span className="data-row-label">
                          Est. Insurance
                          {variant.sumInsured && (
                            <span className="text-[0.55rem] text-blue-400 ml-1 font-normal">
                              (Sum Insured RM {variant.sumInsured.toLocaleString("en-MY")})
                            </span>
                          )}
                        </span>
                        <span className="data-row-value">
                          {formatCurrency(variant.otr - variant.otrWithoutInsurance)}
                        </span>
                      </div>
                      <div className="border-t border-neutral-100/50 my-1.5" />
                      <div className="data-row">
                        <span className="data-row-label">OTR Price</span>
                        <span className="data-row-value font-bold text-base">
                          {formatCurrency(variant.otr)}
                        </span>
                      </div>
                      {variant.rebate && variant.rebate > 0 && (
                        <div className="data-row">
                          <span className="data-row-label">Rebate</span>
                          <span className="data-row-value text-green-600 font-bold text-base">
                            -{formatCurrency(variant.rebate)}
                          </span>
                        </div>
                      )}
                      <div className="data-row">
                        <span className="data-row-label">Effective Price</span>
                        <span className="data-row-value text-accent">
                          {formatCurrency(effectivePrice)}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-neutral-100 mb-1.5" />

                    {/* Monthly */}
                    <div className="bg-accent/5 rounded-lg p-2 space-y-0.5 mb-1.5">
                      <p className="text-[0.6rem] font-semibold text-neutral-400 uppercase tracking-wider">
                        Monthly Instalment
                      </p>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-neutral-400">0% Down</span>
                        <span className="text-xl font-extrabold text-accent whitespace-nowrap">
                          {formatCurrency(calcMonthly(effectivePrice, 0))}
                          <span className="text-xs font-normal text-neutral-400">/mo</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-neutral-400">
                        <span>10% Down</span>
                        <span className="font-semibold whitespace-nowrap">
                          {formatCurrency(calcMonthly(effectivePrice, 10))}/mo
                        </span>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="space-y-1">
                      <div className="data-row">
                        <span className="data-row-label">Range</span>
                        <span className="data-row-value">
                          {variant.range}km
                        </span>
                      </div>
                      {variant.battery && (
                        <div className="data-row">
                          <span className="data-row-label">Battery</span>
                          <span className="data-row-value">
                            {variant.battery}kWh
                          </span>
                        </div>
                      )}
                      {variant.maxChargePower && (
                        <div className="data-row">
                          <span className="data-row-label">Max Charge</span>
                          <span className="data-row-value">
                            {variant.maxChargePower}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-neutral-200/60 bg-white mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Ridzuan Jahari
          </p>
        </div>
      </footer>
    </div>
  );
}
