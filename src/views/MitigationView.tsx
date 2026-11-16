import React, { useEffect, useState } from 'react';
import { CheckSquare, RotateCcw, Square } from 'lucide-react';
import {
  EMERGENCY_KIT_ITEMS,
  EVACUATION_PRINCIPLES,
  MITIGATION_AFTER,
  MITIGATION_BEFORE,
  MITIGATION_DURING,
  type MitigationStep,
} from '../data/mitigationContent';

const KIT_STORAGE_KEY = 'geosfera_bmkg_kit_v1';

const PhaseColumn: React.FC<{
  title: string;
  steps: MitigationStep[];
}> = ({ title, steps }) => (
  <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
    <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
      <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
    </div>
    <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
      {steps.map((step) => (
        <li key={step.code} className="py-3 first:pt-0 last:pb-0">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
            <span className="font-mono text-sky-700 dark:text-sky-400 mr-1.5">{step.code}.</span>
            {step.title}
          </h3>
        </li>
      ))}
    </ol>
  </div>
);

export const MitigationView: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(KIT_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KIT_STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // ignore storage quota errors
    }
  }, [checkedIds]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const progressPct = Math.round((checkedIds.length / EMERGENCY_KIT_ITEMS.length) * 100);

  return (
    <div className="space-y-6">
      {/* 3 Kolom Simetris: Sebelum, Saat, Setelah Gempa */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <PhaseColumn title="Panduan Sebelum Gempa" steps={MITIGATION_BEFORE} />
        <PhaseColumn title="Panduan Saat Gempa" steps={MITIGATION_DURING} />
        <PhaseColumn title="Panduan Setelah Gempa" steps={MITIGATION_AFTER} />
      </section>

      {/* Jalur & Titik Evakuasi + Tas Siaga Bencana */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Jalur dan Titik Evakuasi
              </h2>
            </div>
            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
              {EVACUATION_PRINCIPLES.map((rule) => (
                <div key={rule.title} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                    {rule.category}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {rule.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">
                    {rule.criteria}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div>
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Informasi Tas Siaga Bencana
              </h2>
              <button
                type="button"
                onClick={() => setCheckedIds([])}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="mt-4 mb-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-600 dark:text-slate-400">Kelengkapan</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {checkedIds.length}/{EMERGENCY_KIT_ITEMS.length} ({progressPct}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-sm bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-700 transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {EMERGENCY_KIT_ITEMS.map((item) => {
                const checked = checkedIds.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="w-full py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded px-1.5 transition-colors cursor-pointer"
                    >
                      {checked ? (
                        <CheckSquare className="h-4 w-4 text-sky-700 dark:text-sky-400 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1 flex items-center justify-between gap-3">
                        <span
                          className={`text-xs sm:text-sm font-medium ${
                            checked
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                          {item.category}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
