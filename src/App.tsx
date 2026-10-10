import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Combatant, 
  ActionItem, 
  CombatLogEntry, 
  ReactionPrompt, 
  TelemetryRoundRecord, 
  CoverEvaluation 
} from './types/combat';
import { 
  PRESET_CHARACTERS, 
  PRESET_ENCOUNTERS, 
  EncounterPreset 
} from './data/presetEncounters';
import { rollD20, rollDice, doubleDiceFormulaForCrit } from './utils/dice';
import { evaluateCover, calculateDistanceFt } from './utils/raycastCover';
import { findPath } from './utils/pathfinding';

import { Navbar } from './components/Navbar';
import { BattleMap } from './components/BattleMap';
import { CharacterSidebar } from './components/CharacterSidebar';
import { CombatLog } from './components/CombatLog';
import { ReactionModal } from './components/ReactionModal';
import { CharacterImportModal } from './components/CharacterImportModal';
import { ScenarioModal } from './components/ScenarioModal';
import { TelemetryModal } from './components/TelemetryModal';
import { HelpModal } from './components/HelpModal';

export function App() {
  // Current active encounter and player
  const [activeEncounter, setActiveEncounter] = useState<EncounterPreset>(PRESET_ENCOUNTERS[1]); // Alley Ambush default
  const [player, setPlayer] = useState<Combatant>(JSON.parse(JSON.stringify(PRESET_CHARACTERS.arty)));
  const [combatants, setCombatants] = useState<Combatant[]>([]);

  // Turn management
  const [currentRound, setCurrentRound] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [reactionPrompt, setReactionPrompt] = useState<ReactionPrompt | null>(null);

  // Logs & History & Telemetry
  const [logs, setLogs] = useState<CombatLogEntry[]>([]);
  const [turnHistory, setTurnHistory] = useState<Array<{
    player: Combatant;
    combatants: Combatant[];
    round: number;
    logs: CombatLogEntry[];
  }>>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryRoundRecord[]>([]);

  // Modals
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Initialize encounter combatants
  const loadEncounter = (enc: EncounterPreset, customPlayer?: Combatant) => {
    const pc = customPlayer || JSON.parse(JSON.stringify(player));
    pc.spatial.x = enc.suggestedPlayerPosition.x;
    pc.spatial.y = enc.suggestedPlayerPosition.y;
    pc.budget.movementRemainingFt = pc.vitals.speedFt;
    pc.budget.actionAvailable = true;
    pc.budget.bonusActionAvailable = true;
    pc.budget.reactionAvailable = true;
    pc.conditions = [];

    const activeList: Combatant[] = [
      pc,
      ...(enc.allies ? JSON.parse(JSON.stringify(enc.allies)) : []),
      ...JSON.parse(JSON.stringify(enc.enemies)),
    ];

    setActiveEncounter(enc);
    setPlayer(pc);
    setCombatants(activeList);
    setCurrentRound(1);
    setIsPlayerTurn(true);
    setSelectedAction(null);
    setReactionPrompt(null);
    setTurnHistory([]);
    setTelemetryHistory([]);

    const initialLog: CombatLogEntry = {
      id: `log-init-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      round: 1,
      actorName: 'System',
      type: 'info' as any,
      message: `Encounter "${enc.title}" loaded. Round 1 begins! Place your token, use cover, and execute your turn budget.`,
    };
    setLogs([initialLog]);
  };

  useEffect(() => {
    loadEncounter(activeEncounter, player);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addLog = (entry: Omit<CombatLogEntry, 'id' | 'timestamp' | 'round'>) => {
    const newEntry: CombatLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      round: currentRound,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  // Save snapshot for Rewind / Decision Forking
  const saveSnapshot = () => {
    setTurnHistory((prev) => [
      ...prev,
      {
        player: JSON.parse(JSON.stringify(player)),
        combatants: JSON.parse(JSON.stringify(combatants)),
        round: currentRound,
        logs: [...logs],
      },
    ]);
  };

  const handleRewindTurn = () => {
    if (turnHistory.length === 0) return;
    const lastSnapshot = turnHistory[turnHistory.length - 1];
    setTurnHistory((prev) => prev.slice(0, -1));

    setPlayer(lastSnapshot.player);
    setCombatants(lastSnapshot.combatants);
    setCurrentRound(lastSnapshot.round);
    setLogs(lastSnapshot.logs);
    setIsPlayerTurn(true);
    setSelectedAction(null);
    setReactionPrompt(null);

    addLog({
      actorName: 'System',
      type: 'rule',
      message: `State rewind executed! Restored board and action budget to start of Round ${lastSnapshot.round}.`,
    });
  };

  // Movement handler
  const handleMovePlayer = (newX: number, newY: number, costFt: number) => {
    if (!isPlayerTurn) return;
    if (player.budget.movementRemainingFt < costFt) return;

    saveSnapshot();

    const updatedPlayer: Combatant = {
      ...player,
      spatial: {
        ...player.spatial,
        x: newX,
        y: newY,
        // If moving out in the open, break stealth
        isHiding: player.spatial.isHiding ? false : false,
      },
      budget: {
        ...player.budget,
        movementRemainingFt: player.budget.movementRemainingFt - costFt,
      },
    };

    setPlayer(updatedPlayer);
    setCombatants((prev) => prev.map((c) => (c.id === player.id ? updatedPlayer : c)));

    addLog({
      actorName: player.name,
      type: 'action',
      message: `${player.name} moves to tile (${newX}, ${newY}) [Spent ${costFt} ft movement. Remaining: ${updatedPlayer.budget.movementRemainingFt} ft].`,
    });
  };

  // Execute utility actions (Dash, Dodge, Cunning Actions, Steady Aim)
  const handleExecuteUtilityAction = (action: ActionItem) => {
    if (!isPlayerTurn) return;
    saveSnapshot();

    let updatedPlayer = { ...player };

    if (action.id === 'base-dash' && player.budget.actionAvailable) {
      updatedPlayer.budget.actionAvailable = false;
      updatedPlayer.budget.movementRemainingFt += player.vitals.speedFt;
      addLog({
        actorName: player.name,
        type: 'action',
        message: `${player.name} uses Action to Dash! Movement increased by +${player.vitals.speedFt} ft (Total: ${updatedPlayer.budget.movementRemainingFt} ft).`,
      });
    } else if (action.id === 'base-dodge' && player.budget.actionAvailable) {
      updatedPlayer.budget.actionAvailable = false;
      updatedPlayer.conditions = [...player.conditions, 'dodging'];
      addLog({
        actorName: player.name,
        type: 'action',
        message: `${player.name} takes the Dodge action! Attack rolls against them have Disadvantage until next turn.`,
      });
    } else if (action.id === 'cunning-dash' && player.budget.bonusActionAvailable) {
      updatedPlayer.budget.bonusActionAvailable = false;
      updatedPlayer.budget.movementRemainingFt += player.vitals.speedFt;
      addLog({
        actorName: player.name,
        type: 'action',
        message: `${player.name} uses Cunning Action (Bonus Action) to Dash! Added +${player.vitals.speedFt} ft movement.`,
      });
    } else if (action.id === 'cunning-disengage' && player.budget.bonusActionAvailable) {
      updatedPlayer.budget.bonusActionAvailable = false;
      addLog({
        actorName: player.name,
        type: 'action',
        message: `${player.name} uses Cunning Action to Disengage! Movement will not provoke Opportunity Attacks this turn.`,
      });
    } else if (action.id === 'cunning-hide' && player.budget.bonusActionAvailable) {
      updatedPlayer.budget.bonusActionAvailable = false;
      // Stealth check
      const stealthRoll = rollD20(player.skills.stealth || 6);
      const enemyPassivePerception = 11;
      const success = stealthRoll.total >= enemyPassivePerception;

      if (success) {
        updatedPlayer.spatial.isHiding = true;
        addLog({
          actorName: player.name,
          type: 'rule',
          message: `${player.name} uses Cunning Action Hide: Stealth roll d20(${stealthRoll.d20}) + ${stealthRoll.modifier} = ${stealthRoll.total} vs Passive Perception ${enemyPassivePerception}. Success! Hidden status granted (Advantage on next attack).`,
        });
      } else {
        addLog({
          actorName: player.name,
          type: 'rule',
          message: `${player.name} attempts to Hide: Rolled ${stealthRoll.total} vs Passive Perception ${enemyPassivePerception}. Failed to break enemy line-of-sight.`,
        });
      }
    } else if (action.id === 'steady-aim' && player.budget.bonusActionAvailable) {
      updatedPlayer.budget.bonusActionAvailable = false;
      updatedPlayer.budget.movementRemainingFt = 0;
      updatedPlayer.spatial.isHiding = true; // Simulates next attack advantage
      addLog({
        actorName: player.name,
        type: 'action',
        message: `${player.name} executes Steady Aim (Tasha's Cauldron)! Advantage granted on next attack roll this turn; remaining movement reduced to 0 ft.`,
      });
    } else if (action.id === 'valeros-second-wind' && player.budget.bonusActionAvailable) {
      const res = updatedPlayer.resources.find((r) => r.id === 'second_wind');
      if (res && res.current > 0) {
        res.current -= 1;
        updatedPlayer.budget.bonusActionAvailable = false;
        const heal = rollDice('1d10+3').total;
        updatedPlayer.vitals.currentHp = Math.min(updatedPlayer.vitals.maxHp, updatedPlayer.vitals.currentHp + heal);
        addLog({
          actorName: player.name,
          type: 'heal',
          message: `${player.name} uses Second Wind! Regained ${heal} HP (Current: ${updatedPlayer.vitals.currentHp}/${updatedPlayer.vitals.maxHp}).`,
        });
      }
    }

    setPlayer(updatedPlayer);
    setCombatants((prev) => prev.map((c) => (c.id === player.id ? updatedPlayer : c)));
  };

  // Targeting & Attack Resolution
  const handleTargetCombatant = (target: Combatant, action: ActionItem, cover: CoverEvaluation) => {
    if (!isPlayerTurn || !player.budget.actionAvailable) return;
    saveSnapshot();

    setSelectedAction(null);

    // Range calculation
    const distFt = calculateDistanceFt(player.spatial.x, player.spatial.y, target.spatial.x, target.spatial.y);
    const normalRange = action.rangeFt || action.reachFt || 5;
    const longRange = action.longRangeFt || normalRange;

    if (distFt > longRange) {
      addLog({
        actorName: player.name,
        type: 'rule',
        message: `Target ${target.name} is ${distFt} ft away (out of maximum range ${longRange} ft).`,
      });
      return;
    }

    if (cover.cover === 'total') {
      addLog({
        actorName: player.name,
        type: 'rule',
        message: `Target ${target.name} has Total Cover behind solid walls and cannot be targeted.`,
      });
      return;
    }

    // Determine advantage / disadvantage
    let advState: 'normal' | 'advantage' | 'disadvantage' = 'normal';
    if (player.spatial.isHiding) advState = 'advantage';
    if (distFt > normalRange) advState = 'disadvantage';
    if (target.conditions.includes('dodging')) advState = 'disadvantage';

    // Target Effective AC
    const effectiveAc = target.vitals.baseAc + cover.acBonus;

    // Roll attack
    const atkResult = rollD20(action.toHitMod || 0, advState);
    const isHit = (atkResult.total >= effectiveAc || atkResult.isCrit) && !atkResult.isFumble;

    addLog({
      actorName: player.name,
      type: 'attack',
      message: `${player.name} attacks ${target.name} with ${action.name} (Range: ${distFt} ft). Cover: ${cover.cover.toUpperCase()} (+${cover.acBonus} AC).`,
      details: {
        d20Roll: atkResult.d20,
        modifier: atkResult.modifier,
        totalToHit: atkResult.total,
        targetAc: effectiveAc,
        coverBonusApplied: cover.acBonus,
        isHit,
        isCrit: atkResult.isCrit,
      },
    });

    // Deduct player Action
    let updatedPlayer = {
      ...player,
      budget: { ...player.budget, actionAvailable: false },
      spatial: { ...player.spatial, isHiding: false }, // Attacking reveals position
    };

    if (!isHit) {
      setPlayer(updatedPlayer);
      setCombatants((prev) => prev.map((c) => (c.id === player.id ? updatedPlayer : c)));
      return;
    }

    // Check Sneak Attack qualification:
    // Qualified if player has Advantage OR an ally is within 5ft of the target
    const allyAdjacent = combatants.some(
      (c) => c.isFriendly && c.id !== target.id && c.id !== player.id &&
             Math.max(Math.abs(c.spatial.x - target.spatial.x), Math.abs(c.spatial.y - target.spatial.y)) <= 1
    );
    const sneakQualified = (advState === 'advantage' || allyAdjacent) && action.riders?.includes('sneak_attack');
    const sneakResource = updatedPlayer.resources.find((r) => r.id === 'sneak_attack');

    const finalizeDamage = (applySneak: boolean) => {
      let formula = action.damageFormula || '1d8+4';
      if (atkResult.isCrit) {
        formula = doubleDiceFormulaForCrit(formula);
      }

      let dmgResult = rollDice(formula);
      let totalDmg = dmgResult.total;
      let breakdown = `${dmgResult.individualRolls.join('+')} + ${dmgResult.modifier}`;

      if (applySneak) {
        const sneakFormula = atkResult.isCrit ? '4d6' : '2d6';
        const sneakRoll = rollDice(sneakFormula);
        totalDmg += sneakRoll.total;
        breakdown += ` + Sneak Attack (${sneakRoll.individualRolls.join('+')})`;

        if (sneakResource) sneakResource.current = 0; // Expended for turn
      }

      // Apply damage to target
      const newTargetHp = Math.max(0, target.vitals.currentHp - totalDmg);
      const overkill = target.vitals.currentHp < totalDmg ? totalDmg - target.vitals.currentHp : 0;

      addLog({
        actorName: player.name,
        type: 'damage',
        message: `${player.name} hits ${target.name} for ${totalDmg} ${action.damageType || 'damage'}! (Target HP: ${newTargetHp}/${target.vitals.maxHp})`,
        details: {
          damageRolls: breakdown,
          damageTotal: totalDmg,
          damageType: action.damageType,
        },
      });

      // Update telemetry
      setTelemetryHistory((prev) => [
        ...prev,
        {
          round: currentRound,
          unusedBonusAction: false,
          unusedReaction: false,
          unspentMovementFt: updatedPlayer.budget.movementRemainingFt,
          endedInOpenLoS: cover.cover === 'none',
          resourcesSpent: applySneak ? 1 : 0,
          damageDealt: totalDmg,
          damageTaken: 0,
          overkillDamage: overkill,
        },
      ]);

      const updatedTarget: Combatant = {
        ...target,
        vitals: { ...target.vitals, currentHp: newTargetHp },
      };

      setPlayer(updatedPlayer);
      setCombatants((prev) =>
        prev.map((c) => (c.id === player.id ? updatedPlayer : c.id === target.id ? updatedTarget : c))
      );

      // Check victory
      const allEnemiesDead = combatants
        .filter((c) => !c.isFriendly)
        .every((c) => (c.id === target.id ? newTargetHp === 0 : c.vitals.currentHp === 0));

      if (allEnemiesDead) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        addLog({
          actorName: 'System',
          type: 'rule',
          message: `Victory! All hostiles defeated in Round ${currentRound}. Open Telemetry to review your Action Budget Report Card!`,
        });
      }
    };

    if (sneakQualified && sneakResource && sneakResource.current > 0) {
      // INTERCEPTOR MODAL PROMPT!
      setReactionPrompt({
        id: 'prompt-sneak-attack',
        title: 'Sneak Attack Trigger Validated!',
        description: `Target ${target.name} is qualified for Sneak Attack (${
          advState === 'advantage' ? 'Attacker had Advantage' : 'Ally is within 5 ft of enemy'
        }). Spend your once-per-turn Sneak Attack (+2d6 damage)?`,
        combatantId: player.id,
        actionItem: action,
        options: [
          {
            label: 'Apply Sneak Attack (+2d6)',
            primary: true,
            onExecute: () => {
              setReactionPrompt(null);
              finalizeDamage(true);
            },
          },
        ],
        onCancel: () => {
          setReactionPrompt(null);
          finalizeDamage(false);
        },
      });
    } else {
      finalizeDamage(false);
    }
  };

  // End Turn & Opponent AI Phase
  const handleEndTurn = () => {
    if (!isPlayerTurn) return;

    // Record telemetry for unspent actions
    setTelemetryHistory((prev) => [
      ...prev,
      {
        round: currentRound,
        unusedBonusAction: player.budget.bonusActionAvailable,
        unusedReaction: player.budget.reactionAvailable,
        unspentMovementFt: player.budget.movementRemainingFt,
        endedInOpenLoS: player.spatial.hasCover === 'none',
        resourcesSpent: 0,
        damageDealt: 0,
        damageTaken: 0,
        overkillDamage: 0,
      },
    ]);

    setIsPlayerTurn(false);
    addLog({
      actorName: 'System',
      type: 'turn',
      message: `--- End of Player Turn (Round ${currentRound}). Beginning Hostile AI Phase ---`,
    });

    // Run AI turns with small tactical timeouts
    setTimeout(() => {
      runOpponentTurns();
    }, 400);
  };

  const runOpponentTurns = () => {
    let currentCombatants = [...combatants];
    let currentPlayer = { ...player };

    const enemies = currentCombatants.filter((c) => !c.isFriendly && c.vitals.currentHp > 0);

    enemies.forEach((enemy) => {
      if (enemy.aiType === 'static_dummy') return;

      // Find path towards player
      const distToPlayer = calculateDistanceFt(enemy.spatial.x, enemy.spatial.y, currentPlayer.spatial.x, currentPlayer.spatial.y);

      // Melee Bruiser AI
      if (enemy.aiType === 'melee_bruiser') {
        if (distToPlayer > 5) {
          // Move towards player
          const path = findPath(
            enemy.spatial.x,
            enemy.spatial.y,
            currentPlayer.spatial.x,
            currentPlayer.spatial.y,
            activeEncounter.gridCells,
            activeEncounter.gridWidth,
            activeEncounter.gridHeight,
            new Set()
          );

          if (path && path.length > 1) {
            // Step closer (up to 30 ft = 6 tiles)
            const targetStep = path[Math.min(path.length - 2, 5)];
            enemy.spatial.x = targetStep.x;
            enemy.spatial.y = targetStep.y;
            addLog({
              actorName: enemy.name,
              type: 'action',
              message: `${enemy.name} charges forward across the grid to (${targetStep.x}, ${targetStep.y}).`,
            });
          }
        }

        // If now in melee range (5 ft), attack player!
        const newDist = calculateDistanceFt(enemy.spatial.x, enemy.spatial.y, currentPlayer.spatial.x, currentPlayer.spatial.y);
        if (newDist <= 5) {
          const atk = enemy.actionDeck.actions[0];
          const atkRoll = rollD20(atk.toHitMod || 4);
          const effectiveAc = currentPlayer.vitals.baseAc;
          const isHit = atkRoll.total >= effectiveAc;

          addLog({
            actorName: enemy.name,
            type: 'attack',
            message: `${enemy.name} attacks ${currentPlayer.name} with ${atk.name}!`,
            details: {
              d20Roll: atkRoll.d20,
              modifier: atkRoll.modifier,
              totalToHit: atkRoll.total,
              targetAc: effectiveAc,
              isHit,
            },
          });

          if (isHit) {
            const dmgRoll = rollDice(atk.damageFormula || '1d12+3');
            const totalDmg = dmgRoll.total;
            currentPlayer.vitals.currentHp = Math.max(0, currentPlayer.vitals.currentHp - totalDmg);

            addLog({
              actorName: enemy.name,
              type: 'damage',
              message: `${enemy.name} hits ${currentPlayer.name} for ${totalDmg} damage! (${currentPlayer.vitals.currentHp}/${currentPlayer.vitals.maxHp} HP)`,
            });
          }
        }
      }

      // Ranged Skirmisher AI
      if (enemy.aiType === 'ranged_skirmisher') {
        const cover = evaluateCover(enemy.spatial.x, enemy.spatial.y, currentPlayer.spatial.x, currentPlayer.spatial.y, activeEncounter.gridCells);
        const atk = enemy.actionDeck.actions[0];
        const atkRoll = rollD20(atk.toHitMod || 4);
        const effectiveAc = currentPlayer.vitals.baseAc + cover.acBonus;
        const isHit = atkRoll.total >= effectiveAc;

        addLog({
          actorName: enemy.name,
          type: 'attack',
          message: `${enemy.name} fires ${atk.name} at ${currentPlayer.name} from behind cover!`,
          details: {
            d20Roll: atkRoll.d20,
            modifier: atkRoll.modifier,
            totalToHit: atkRoll.total,
            targetAc: effectiveAc,
            coverBonusApplied: cover.acBonus,
            isHit,
          },
        });

        if (isHit) {
          const dmgRoll = rollDice(atk.damageFormula || '1d6+2');
          const totalDmg = dmgRoll.total;
          currentPlayer.vitals.currentHp = Math.max(0, currentPlayer.vitals.currentHp - totalDmg);

          addLog({
            actorName: enemy.name,
            type: 'damage',
            message: `${enemy.name} pierces ${currentPlayer.name} for ${totalDmg} damage! (${currentPlayer.vitals.currentHp}/${currentPlayer.vitals.maxHp} HP)`,
          });
        }
      }
    });

    // Start Next Round
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setIsPlayerTurn(true);

    // Refresh player turn budget
    currentPlayer.budget.movementRemainingFt = currentPlayer.vitals.speedFt;
    currentPlayer.budget.actionAvailable = true;
    currentPlayer.budget.bonusActionAvailable = true;
    currentPlayer.budget.reactionAvailable = true;
    currentPlayer.conditions = currentPlayer.conditions.filter((c) => c !== 'dodging');

    // Refresh Sneak Attack once/turn
    const sneakRes = currentPlayer.resources.find((r) => r.id === 'sneak_attack');
    if (sneakRes) sneakRes.current = 1;

    setPlayer(currentPlayer);
    setCombatants((prev) =>
      prev.map((c) => (c.id === currentPlayer.id ? currentPlayer : c))
    );

    addLog({
      actorName: 'System',
      type: 'turn',
      message: `=== Round ${nextRound} Begins! Action economy budget refreshed. ===`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentRound={currentRound}
        activeEncounter={activeEncounter}
        onSelectEncounter={() => setIsScenarioModalOpen(true)}
        onOpenCharacterModal={() => setIsCharModalOpen(true)}
        onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onEndTurn={handleEndTurn}
        onRewindTurn={handleRewindTurn}
        canRewind={turnHistory.length > 0}
        isPlayerTurn={isPlayerTurn}
      />

      {/* Main Tactical Workspace */}
      <main className="flex-1 p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-4 max-w-[1600px] w-full mx-auto items-start">
        {/* Left: Character Sheet & Action Deck */}
        <div className="w-full shrink-0">
          <CharacterSidebar
            player={player}
            selectedAction={selectedAction}
            onSelectAction={setSelectedAction}
            onExecuteUtilityAction={handleExecuteUtilityAction}
          />
        </div>

        {/* Center / Right: Tactical Battlemap & Combat Ledger */}
        <div className="flex flex-col gap-3 min-w-0 w-full">
          {/* Battlemap Viewport */}
          <BattleMap
            gridWidth={activeEncounter.gridWidth}
            gridHeight={activeEncounter.gridHeight}
            gridCells={activeEncounter.gridCells}
            combatants={combatants}
            player={player}
            selectedAction={selectedAction}
            onMovePlayer={handleMovePlayer}
            onTargetCombatant={handleTargetCombatant}
          />

          {/* Combat Log */}
          <CombatLog logs={logs} />
        </div>
      </main>

      {/* Reactive Interceptor Modal */}
      <ReactionModal prompt={reactionPrompt} />

      {/* Modals */}
      <CharacterImportModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        onLoadCharacter={(newChar) => loadEncounter(activeEncounter, newChar)}
        activeCharacterId={player.id}
      />

      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        activeEncounterId={activeEncounter.id}
        onSelectEncounter={(enc) => loadEncounter(enc)}
      />

      <TelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        telemetryHistory={telemetryHistory}
        characterArchetype={player.archetype}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}

export default App;
