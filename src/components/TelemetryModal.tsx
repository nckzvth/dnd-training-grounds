import React from 'react';
import { ART_ASSETS, getDarkVellumStyle } from '../utils/artAssets';
import { TelemetryRoundRecord } from '../types/combat';
import { BarChart3, AlertTriangle, CheckCircle, ShieldCheck, Zap, X } from 'lucide-react';
import { FantasyCornerBrackets, WaxSealBadge } from './FantasyDecorations';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-950 border-4 border-amber-700/80 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-w-xl w-full p-5 flex flex-col relative overflow-hidden max-h-[90vh]">
        <FantasyCornerBrackets className="w-6 h-6 text-amber-500" />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25 mix-blend-overlay" style={{ backgroundImage: `url(${ART_ASSETS.darkWood})` }} />
        <div className="absolute top-0 right-0 opacity-15 pointer-events-none" style={{ backgroundImage: `url(${ART_ASSETS.crestEmblem})`, width: '160px', height: '160px', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top right', mixBlendMode: 'overlay' }} />
        <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/60">
          <div>
            <h2 className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 flex items-center gap-2 drop-shadow-md">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              Scribe's Tactical Audit & Telemetry
            </h2>
            <p className="text-xs text-amber-200/70 font-serif-rpg text-sm">Post-combat evaluation of your decision-making and action economy</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-amber-400 hover:text-amber-200 hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High Level Stats Grid (Dark Antiqued Vellum KPI Cards) */}
        <div className="grid grid-cols-3 gap-2.5 my-3.5">
          {/* Action Economy Leakage */}
          <div 
            className="p-3 rounded-xl border-2 border-amber-800/70 text-center shadow-md relative overflow-hidden"
            style={getDarkVellumStyle(0.92)}
          >
            <FantasyCornerBrackets className="w-2.5 h-2.5 text-amber-600/50" />
            <div className="text-[10px] uppercase font-fantasy font-black text-amber-200">Action Leakage</div>
            <div className={`text-2xl font-black font-mono mt-1 ${actionLeakagePercent > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {actionLeakagePercent}%
            </div>
            <div className="text-[10px] text-amber-300/80 font-serif-rpg font-semibold mt-0.5">
              {wastedBonusActions} unused bonus, {wastedReactions} unheld reactions
            </div>
          </div>

          {/* Defensive Exposure */}
          <div 
            className="p-3 rounded-xl border-2 border-amber-800/70 text-center shadow-md relative overflow-hidden"
            style={getDarkVellumStyle(0.92)}
          >
            <FantasyCornerBrackets className="w-2.5 h-2.5 text-amber-600/50" />
            <div className="text-[10px] uppercase font-fantasy font-black text-amber-200">Exposure Index</div>
            <div className={`text-2xl font-black font-mono mt-1 ${defensiveExposurePercent > 50 ? 'text-amber-400' : 'text-sky-300'}`}>
              {defensiveExposurePercent}%
            </div>
            <div className="text-[10px] text-amber-300/80 font-serif-rpg font-semibold mt-0.5">
              {exposedRounds} of {totalRounds} turns in open LoS
            </div>
          </div>

          {/* Average DPR */}
          <div 
            className="p-3 rounded-xl border-2 border-amber-800/70 text-center shadow-md relative overflow-hidden"
            style={getDarkVellumStyle(0.92)}
          >
            <FantasyCornerBrackets className="w-2.5 h-2.5 text-amber-600/50" />
            <div className="text-[10px] uppercase font-fantasy font-black text-amber-200">Damage / Round</div>
            <div className="text-2xl font-black font-mono mt-1 text-amber-300">
              {dpr}
            </div>
            <div className="text-[10px] text-amber-300/80 font-serif-rpg font-semibold mt-0.5">
              {totalDamageDealt} dealt, {totalDamageTaken} taken
            </div>
          </div>
        </div>

        {/* Tactical Coaching Advice (Dark Vellum Codex Note) */}
        <div 
          className="p-3.5 rounded-xl border-2 border-amber-800/70 text-xs mb-3 space-y-2 shadow-md relative overflow-hidden"
          style={getDarkVellumStyle(0.92)}
        >
          <FantasyCornerBrackets className="w-3 h-3 text-amber-600/50" />
          <div className="relative z-10 font-fantasy font-black text-amber-200 text-sm flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Tactical Coaching for {characterArchetype}
          </div>

          {wastedBonusActions > 0 && /rogue/i.test(characterArchetype) && (
            <div className="relative z-10 flex items-start gap-2 bg-amber-950/40 p-2 rounded-lg border border-amber-700/50 font-serif-rpg text-amber-200 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong className="text-amber-100">Bonus Action Bottleneck:</strong> You ended {wastedBonusActions} round(s) without using Cunning Action. As a Rogue, always evaluate Cunning Action Hide (for free advantage) or Disengage before ending your turn.
              </span>
            </div>
          )}

          {defensiveExposurePercent > 50 && (
            <div className="relative z-10 flex items-start gap-2 bg-rose-950/30 p-2 rounded-lg border border-rose-700/50 font-serif-rpg text-amber-100 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                <strong className="text-rose-200">Defensive Exposure:</strong> You ended {defensiveExposurePercent}% of rounds out in the open. Use 5-10 ft of leftover movement to step behind half-cover crates (+2 AC) or solid walls to break line-of-sight.
              </span>
            </div>
          )}

          {totalOverkill > 0 && (
            <div className="relative z-10 flex items-start gap-2 bg-amber-950/40 p-2 rounded-lg border border-amber-700/50 font-serif-rpg text-amber-200 font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
              <span>
                <strong className="text-sky-200">Overkill Inefficiency:</strong> {totalOverkill} damage was wasted past 0 HP on defeated targets. Practice splitting multiple attacks between targets when minions are bloodied.
              </span>
            </div>
          )}

          {actionLeakagePercent <= 20 && defensiveExposurePercent <= 30 && (
            <div className="relative z-10 flex items-start gap-2 bg-emerald-950/30 p-2 rounded-lg border border-emerald-700/50 font-serif-rpg text-emerald-200 font-semibold">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>
                <strong className="text-emerald-300">Exemplary Tactical Discipline!</strong> You maximized your action budget and effectively leveraged cover and kiting.
              </span>
            </div>
          )}
        </div>

        {/* Round by Round Ledger Table */}
        <div className="flex-1 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] uppercase font-fantasy font-black text-amber-200 bg-amber-950/70 border-b border-amber-800/80">
              <tr>
                <th className="p-2">Round</th>
                <th className="p-2">Bonus Act</th>
                <th className="p-2">Reaction</th>
                <th className="p-2">Cover State</th>
                <th className="p-2 text-right">Dmg Dealt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-900/40 text-amber-100">
              {telemetryHistory.map((t) => (
                <tr key={t.round} className="hover:bg-amber-950/30">
                  <td className="p-2 font-bold text-amber-300">R{t.round}</td>
                  <td className="p-2">
                    {t.unusedBonusAction ? (
                      <span className="text-rose-400 font-sans text-[11px] font-semibold">Unused</span>
                    ) : (
                      <span className="text-emerald-400 font-sans text-[11px] font-semibold">Utilized</span>
                    )}
                  </td>
                  <td className="p-2">
                    {t.unusedReaction ? (
                      <span className="text-slate-400 font-sans text-[11px]">Held</span>
                    ) : (
                      <span className="text-purple-300 font-sans text-[11px] font-semibold">Triggered</span>
                    )}
                  </td>
                  <td className="p-2">
                    {t.endedInOpenLoS ? (
                      <span className="text-amber-400 font-sans text-[11px]">Open LoS</span>
                    ) : (
                      <span className="text-sky-300 font-sans text-[11px] font-semibold">Behind Cover</span>
                    )}
                  </td>
                  <td className="p-2 text-right font-bold text-amber-200">{t.damageDealt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></div>
      </div>
    </div>
  );
};
