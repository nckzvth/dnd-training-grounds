import React from 'react';
import { TelemetryRoundRecord } from '../types/combat';
import { BarChart3, AlertTriangle, CheckCircle, ShieldCheck, Zap, X } from 'lucide-react';

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetryHistory: TelemetryRoundRecord[];
  characterArchetype?: string;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({
  isOpen,
  onClose,
  telemetryHistory,
  characterArchetype = 'Rogue',
}) => {
  if (!isOpen) return null;

  const totalRounds = telemetryHistory.length || 1;
  const wastedBonusActions = telemetryHistory.filter((t) => t.unusedBonusAction).length;
  const wastedReactions = telemetryHistory.filter((t) => t.unusedReaction).length;
  const exposedRounds = telemetryHistory.filter((t) => t.endedInOpenLoS).length;
  const totalDamageDealt = telemetryHistory.reduce((acc, t) => acc + t.damageDealt, 0);
  const totalDamageTaken = telemetryHistory.reduce((acc, t) => acc + t.damageTaken, 0);
  const totalOverkill = telemetryHistory.reduce((acc, t) => acc + t.overkillDamage, 0);

  const actionLeakagePercent = Math.round(((wastedBonusActions + wastedReactions) / (totalRounds * 2)) * 100);
  const defensiveExposurePercent = Math.round((exposedRounds / totalRounds) * 100);
  const dpr = (totalDamageDealt / totalRounds).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Tactical Telemetry & Action Budget Diagnostics
            </h2>
            <p className="text-xs text-slate-400">Post-combat evaluation of your decision-making and action economy</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High Level Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-4">
          {/* Action Economy Leakage */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Action Leakage</div>
            <div className={`text-2xl font-black font-mono mt-1 ${actionLeakagePercent > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {actionLeakagePercent}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {wastedBonusActions} unused bonus, {wastedReactions} unheld reactions
            </div>
          </div>

          {/* Defensive Exposure */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Exposure Index</div>
            <div className={`text-2xl font-black font-mono mt-1 ${defensiveExposurePercent > 50 ? 'text-amber-400' : 'text-sky-400'}`}>
              {defensiveExposurePercent}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {exposedRounds} of {totalRounds} turns ended in open LoS
            </div>
          </div>

          {/* Average DPR */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Damage Per Round</div>
            <div className="text-2xl font-black font-mono mt-1 text-amber-400">
              {dpr}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {totalDamageDealt} dealt, {totalDamageTaken} taken
            </div>
          </div>
        </div>

        {/* Tactical Coaching Advice */}
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs mb-3 space-y-2">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Tactical Coaching for {characterArchetype}
          </div>

          {wastedBonusActions > 0 && /rogue/i.test(characterArchetype) && (
            <div className="flex items-start gap-2 text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-900/30">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Bonus Action Bottleneck:</strong> You ended {wastedBonusActions} round(s) without using Cunning Action. As a Rogue, always evaluate Cunning Action Hide (for free advantage) or Disengage before ending your turn.
              </span>
            </div>
          )}

          {defensiveExposurePercent > 50 && (
            <div className="flex items-start gap-2 text-rose-300/90 bg-rose-950/20 p-2 rounded border border-rose-900/30">
              <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                <strong>Defensive Exposure:</strong> You ended {defensiveExposurePercent}% of rounds out in the open. Use 5-10 ft of leftover movement to step behind half-cover crates (+2 AC) or solid walls to break line-of-sight.
              </span>
            </div>
          )}

          {totalOverkill > 0 && (
            <div className="flex items-start gap-2 text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
              <CheckCircle className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
              <span>
                <strong>Overkill Inefficiency:</strong> {totalOverkill} damage was wasted past 0 HP on defeated targets. Practice splitting multiple attacks between targets when minions are bloodied.
              </span>
            </div>
          )}

          {actionLeakagePercent <= 20 && defensiveExposurePercent <= 30 && (
            <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                <strong>Exemplary Tactical Discipline!</strong> You maximized your action budget and effectively leveraged cover and kiting.
              </span>
            </div>
          )}
        </div>

        {/* Round by Round Ledger Table */}
        <div className="flex-1 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] uppercase text-slate-400 bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="p-2">Round</th>
                <th className="p-2">Bonus Act</th>
                <th className="p-2">Reaction</th>
                <th className="p-2">Cover State</th>
                <th className="p-2 text-right">Dmg Dealt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {telemetryHistory.map((t) => (
                <tr key={t.round} className="hover:bg-slate-950/40">
                  <td className="p-2 font-bold text-amber-400">R{t.round}</td>
                  <td className="p-2">
                    {t.unusedBonusAction ? (
                      <span className="text-rose-400 font-sans text-[11px]">Unused</span>
                    ) : (
                      <span className="text-emerald-400 font-sans text-[11px]">Utilized</span>
                    )}
                  </td>
                  <td className="p-2">
                    {t.unusedReaction ? (
                      <span className="text-slate-500 font-sans text-[11px]">Held</span>
                    ) : (
                      <span className="text-purple-400 font-sans text-[11px]">Triggered</span>
                    )}
                  </td>
                  <td className="p-2">
                    {t.endedInOpenLoS ? (
                      <span className="text-amber-400 font-sans text-[11px]">Open LoS</span>
                    ) : (
                      <span className="text-sky-400 font-sans text-[11px]">Behind Cover</span>
                    )}
                  </td>
                  <td className="p-2 text-right font-bold text-slate-100">{t.damageDealt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
