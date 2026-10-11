import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Combatant, 
  ActionItem, 
  CombatLogEntry, 
  ReactionPrompt, 
  TelemetryRoundRecord, 
  CoverEvaluation,
  GridCell,
  SavedMapData
} from './types/combat';
import { 
  PRESET_CHARACTERS, 
  PRESET_ENCOUNTERS, 
  EncounterPreset 
} from './data/presetEncounters';
import { rollD20, rollDice } from './utils/dice';
import { evaluateCover, calculateDistanceFt } from './utils/raycastCover';
import { findPath } from './utils/pathfinding';

import { Navbar } from './components/Navbar';
import { BattleMap } from './components/BattleMap';
import { TacticalActionBar } from './components/TacticalActionBar';
import { CharacterDrawer } from './components/CharacterDrawer';
import { CombatLogDrawer } from './components/CombatLogDrawer';
import { CombatLogTicker } from './components/CombatLogTicker';
import { ReactionModal } from './components/ReactionModal';
import { CharacterImportModal } from './components/CharacterImportModal';
import { ScenarioModal } from './components/ScenarioModal';
import { TelemetryModal } from './components/TelemetryModal';
import { HelpModal } from './components/HelpModal';
import { TabletopDiceTray, DiceTraySession } from './components/TabletopDiceTray';
import { RestModal } from './components/RestModal';
import { SpellPickerModal } from './components/SpellPickerModal';
import { MapEditorToolbar, MapEditorBrush } from './components/MapEditorToolbar';
import { MapExportImportModal } from './components/MapExportImportModal';
import { TacticalWizard } from './components/TacticalWizard';
import { ART_ASSETS } from './utils/artAssets';

export function App() {
  // Current active encounter and player
  const [activeEncounter, setActiveEncounter] = useState<EncounterPreset>(PRESET_ENCOUNTERS[0]); // Open World Sandbox default
  const [player, setPlayer] = useState<Combatant>(JSON.parse(JSON.stringify(PRESET_CHARACTERS.arty)));
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [gridCells, setGridCells] = useState<GridCell[]>([]);

  // Tactical Wizard Action Tutor [W]
  const [isWizardOpen, setIsWizardOpen] = useState(true);

  // Turn management
  const [currentRound, setCurrentRound] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [reactionPrompt, setReactionPrompt] = useState<ReactionPrompt | null>(null);

  // Tabletop Dice Tray Session (No Auto-Roll!)
  const [diceSession, setDiceSession] = useState<DiceTraySession | null>(null);

  // Map Sandbox Editor
  const [isMapEditing, setIsMapEditing] = useState(false);
  const [activeBrush, setActiveBrush] = useState<MapEditorBrush>('half_cover');

  // Logs & History & Telemetry
  const [logs, setLogs] = useState<CombatLogEntry[]>([]);
  const [turnHistory, setTurnHistory] = useState<Array<{
    player: Combatant;
    combatants: Combatant[];
    gridCells: GridCell[];
    round: number;
    logs: CombatLogEntry[];
  }>>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryRoundRecord[]>([]);

  // Modals
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [isSpellPickerOpen, setIsSpellPickerOpen] = useState(false);
  const [isMapExportImportOpen, setIsMapExportImportOpen] = useState(false);

  // Drawers (Off-Canvas Panels)
  const [isCharDrawerOpen, setIsCharDrawerOpen] = useState(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isDiceTrayOpen, setIsDiceTrayOpen] = useState(false);

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
    setGridCells(JSON.parse(JSON.stringify(enc.gridCells)));
    setPlayer(pc);
    setCombatants(activeList);
    setCurrentRound(1);
    setIsPlayerTurn(true);
    setSelectedAction(null);
    setReactionPrompt(null);
    setDiceSession(null);
    setIsMapEditing(false);
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
        gridCells: JSON.parse(JSON.stringify(gridCells)),
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
    setGridCells(lastSnapshot.gridCells);
    setCurrentRound(lastSnapshot.round);
    setLogs(lastSnapshot.logs);
    setIsPlayerTurn(true);
    setSelectedAction(null);
    setReactionPrompt(null);
    setDiceSession(null);

    addLog({
      actorName: 'System',
      type: 'rule',
      message: `State rewind executed! Restored board and action budget to start of Round ${lastSnapshot.round}.`,
    });
  };

  // Map Editor Paint
  const handleCellPaint = (x: number, y: number, brush: MapEditorBrush) => {
    saveSnapshot();

    if (brush === 'spawn_dummy') {
      const dummy: Combatant = {
        id: `dummy-${Date.now()}`,
        name: `Dummy (${combatants.length + 1})`,
        isPlayer: false,
        isFriendly: false,
        aiType: 'static_dummy',
        vitals: { maxHp: 50, currentHp: 50, tempHp: 0, baseAc: 14, speedFt: 0, initiativeMod: 0 },
        attributes: { str: 10, dex: 10, con: 20, int: 1, wis: 1, cha: 1 },
        saves: [],
        skills: {},
        budget: { movementTotalFt: 0, movementRemainingFt: 0, actionAvailable: false, bonusActionAvailable: false, reactionAvailable: false, freeInteractionAvailable: false },
        resources: [],
        actionDeck: { actions: [], bonusActions: [], reactions: [], passives: [] },
        spatial: { x, y, elevationFt: 0, isHiding: false, hasCover: 'none' },
        conditions: [],
      };
      setCombatants((prev) => [...prev, dummy]);
      addLog({ actorName: 'Editor', type: 'rule', message: `Spawned Training Target Dummy at (${x}, ${y}).` });
      return;
    }

    if (brush === 'spawn_goblin') {
      const gob: Combatant = {
        id: `goblin-${Date.now()}`,
        name: `Goblin Raider (${combatants.length + 1})`,
        race: 'Goblin',
        isPlayer: false,
        isFriendly: false,
        aiType: 'melee_bruiser',
        vitals: { maxHp: 12, currentHp: 12, tempHp: 0, baseAc: 14, speedFt: 30, initiativeMod: 2 },
        attributes: { str: 8, dex: 14, con: 12, int: 10, wis: 8, cha: 8 },
        saves: ['dex'],
        skills: {},
        budget: { movementTotalFt: 30, movementRemainingFt: 30, actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true, freeInteractionAvailable: true },
        resources: [],
        actionDeck: {
          actions: [{ id: `gob-scim-${Date.now()}`, name: 'Scimitar', cost: 'action', type: 'melee_weapon', toHitMod: 4, damageFormula: '1d6+2', damageType: 'slashing', reachFt: 5, description: '+4 to hit' }],
          bonusActions: [],
          reactions: [],
          passives: [],
        },
        spatial: { x, y, elevationFt: 0, isHiding: false, hasCover: 'none' },
        conditions: [],
      };
      setCombatants((prev) => [...prev, gob]);
      addLog({ actorName: 'Editor', type: 'rule', message: `Spawned Goblin Raider at (${x}, ${y}).` });
      return;
    }

    if (brush === 'spawn_ally') {
      const ally: Combatant = {
        id: `ally-${Date.now()}`,
        name: 'Allied Guard',
        race: 'Human',
        isPlayer: false,
        isFriendly: true,
        aiType: 'companion_tank',
        vitals: { maxHp: 25, currentHp: 25, tempHp: 0, baseAc: 16, speedFt: 30, initiativeMod: 1 },
        attributes: { str: 14, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
        saves: ['str'],
        skills: {},
        budget: { movementTotalFt: 30, movementRemainingFt: 30, actionAvailable: true, bonusActionAvailable: true, reactionAvailable: true, freeInteractionAvailable: true },
        resources: [],
        actionDeck: {
          actions: [{ id: `guard-spear-${Date.now()}`, name: 'Spear', cost: 'action', type: 'melee_weapon', toHitMod: 4, damageFormula: '1d6+2', damageType: 'piercing', reachFt: 5, description: '+4 to hit' }],
          bonusActions: [],
          reactions: [],
          passives: [],
        },
        spatial: { x, y, elevationFt: 0, isHiding: false, hasCover: 'none' },
        conditions: ['dodging'],
      };
      setCombatants((prev) => [...prev, ally]);
      addLog({ actorName: 'Editor', type: 'rule', message: `Spawned Allied Companion Guard at (${x}, ${y}).` });
      return;
    }

    // Paint cell terrain
    setGridCells((prev) =>
      prev.map((c) => (c.x === x && c.y === y ? { ...c, type: brush as any } : c))
    );
  };

  // Custom Battlemap Import
  const handleImportMap = (imported: SavedMapData) => {
    saveSnapshot();
    setGridCells(imported.gridCells);
    if (imported.combatants && imported.combatants.length > 0) {
      const newCombatants: Combatant[] = imported.combatants.map((c) => {
        if (c.isPlayer) {
          return {
            ...player,
            spatial: { ...player.spatial, x: c.x, y: c.y },
          };
        }
        return {
          id: c.id || `combatant-${Date.now()}-${Math.random()}`,
          name: c.name,
          race: c.race,
          archetype: c.archetype,
          isPlayer: false,
          isFriendly: c.isFriendly,
          aiType: c.aiType || (c.isFriendly ? 'companion_tank' : 'melee_bruiser'),
          vitals: {
            maxHp: c.maxHp,
            currentHp: c.currentHp,
            tempHp: 0,
            baseAc: c.baseAc,
            speedFt: c.speedFt,
            initiativeMod: 0,
            hitDiceMax: 1,
            hitDiceCurrent: 1,
            hitDiceDie: 'd6',
          },
          attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          saves: [],
          skills: {},
          budget: {
            movementTotalFt: c.speedFt,
            movementRemainingFt: c.speedFt,
            actionAvailable: true,
            bonusActionAvailable: true,
            reactionAvailable: true,
            freeInteractionAvailable: true,
          },
          resources: [],
          actionDeck: {
            actions: c.actions || [{
              id: `act-${Date.now()}`,
              name: 'Attack',
              cost: 'action',
              type: 'melee_weapon',
              toHitMod: 4,
              damageFormula: '1d6+2',
              damageType: 'slashing',
              description: '+4 to hit',
            }],
            bonusActions: [],
            reactions: [],
            passives: [],
          },
          spatial: { x: c.x, y: c.y, elevationFt: 0, isHiding: false, hasCover: 'none' },
          conditions: [],
        };
      });
      setCombatants(newCombatants);
    }
    addLog({
      actorName: 'System',
      type: 'rule',
      message: `Loaded custom battlemap: "${imported.name}" (${imported.gridWidth}x${imported.gridHeight}) with ${imported.combatants?.length || 0} tokens.`,
    });
  };

  const currentMapData: SavedMapData = {
    id: `map-${Date.now()}`,
    name: activeEncounter.title,
    savedAt: new Date().toISOString(),
    gridWidth: activeEncounter.gridWidth,
    gridHeight: activeEncounter.gridHeight,
    gridCells,
    combatants: combatants.map((c) => ({
      id: c.id,
      name: c.name,
      race: c.race,
      archetype: c.archetype,
      isPlayer: c.isPlayer,
      isFriendly: c.isFriendly,
      aiType: c.aiType,
      x: c.spatial.x,
      y: c.spatial.y,
      maxHp: c.vitals.maxHp,
      currentHp: c.vitals.currentHp,
      baseAc: c.vitals.baseAc,
      speedFt: c.vitals.speedFt,
      actions: c.actionDeck.actions,
    })),
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

  // Execute utility actions
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
    } else if (action.id.includes('dash') && player.budget.bonusActionAvailable) {
      updatedPlayer.budget.bonusActionAvailable = false;
      updatedPlayer.budget.movementRemainingFt += player.vitals.speedFt;
      addLog({
        actorName: player.name,
        type: 'action',
        message: `${player.name} uses Cunning Action Dash! Added +${player.vitals.speedFt} ft movement.`,
      });
    } else if (action.id.includes('disengage') && player.budget.bonusActionAvailable) {
      updatedPlayer.budget.bonusActionAvailable = false;
      addLog({
        actorName: player.name,
        type: 'action',
        message: `${player.name} uses Cunning Action Disengage! Movement will not provoke Opportunity Attacks this turn.`,
      });
    } else if (action.id.includes('hide') && player.budget.bonusActionAvailable) {
      updatedPlayer.budget.bonusActionAvailable = false;
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
      updatedPlayer.spatial.isHiding = true;
      addLog({
        actorName: player.name,
        type: 'action',
        message: `${player.name} executes Steady Aim! Advantage granted on next attack roll this turn; remaining movement reduced to 0 ft.`,
      });
    }

    setPlayer(updatedPlayer);
    setCombatants((prev) => prev.map((c) => (c.id === player.id ? updatedPlayer : c)));
  };

  // Targeting: Opens Tabletop Dice Tray (NO AUTO-ROLL!)
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

    // OPEN THE GUIDED TABLETOP DICE TRAY!
    setDiceSession({
      attacker: player,
      target,
      action,
      cover,
      onComplete: (hit, totalDamage, damageBreakdown, isCrit) => {
        let updatedPlayer = {
          ...player,
          budget: { ...player.budget, actionAvailable: false },
          spatial: { ...player.spatial, isHiding: false },
        };

        if (!hit && totalDamage === 0) {
          addLog({
            actorName: player.name,
            type: 'attack',
            message: action.saveType
              ? `${player.name} casts ${action.name} on ${target.name} -> Target SUCCEEDED ${action.saveType.toUpperCase()} Saving Throw (0 damage).`
              : `${player.name} attacks ${target.name} with ${action.name} (Range: ${distFt} ft) -> MISS (Deflected by AC ${target.vitals.baseAc + cover.acBonus}).`,
          });
          setPlayer(updatedPlayer);
          setCombatants((prev) => prev.map((c) => (c.id === player.id ? updatedPlayer : c)));
          setDiceSession(null);
          return;
        }

        // Apply Damage
        const newTargetHp = Math.max(0, target.vitals.currentHp - totalDamage);
        const overkill = target.vitals.currentHp < totalDamage ? totalDamage - target.vitals.currentHp : 0;

        addLog({
          actorName: player.name,
          type: 'damage',
          message: action.saveType
            ? `${player.name} resolves ${action.name} against ${target.name} for ${totalDamage} damage! [${damageBreakdown}] (Target HP: ${newTargetHp}/${target.vitals.maxHp})`
            : `${player.name} hits ${target.name} with ${action.name} for ${totalDamage} damage! [${damageBreakdown}] (Target HP: ${newTargetHp}/${target.vitals.maxHp})`,
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
            resourcesSpent: 1,
            damageDealt: totalDamage,
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

        setDiceSession(null);

        // Check victory
        const allEnemiesDead = combatants
          .filter((c) => !c.isFriendly)
          .every((c) => (c.id === target.id ? newTargetHp === 0 : c.vitals.currentHp === 0));

        if (allEnemiesDead) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          addLog({
            actorName: 'System',
            type: 'rule',
            message: `Victory! All hostiles defeated in Round ${currentRound}. Take a Short Rest or review Telemetry!`,
          });
        }
      },
      onCancel: () => setDiceSession(null),
    });
  };

  // Rest handler
  const handleApplyRest = (updatedPlayer: Combatant, restType: 'short' | 'long') => {
    setPlayer(updatedPlayer);
    setCombatants((prev) => prev.map((c) => (c.id === updatedPlayer.id ? updatedPlayer : c)));
    addLog({
      actorName: updatedPlayer.name,
      type: 'heal',
      message: `${updatedPlayer.name} completed a ${restType === 'short' ? 'Short Rest' : 'Long Rest'}! Hit points and action resources refreshed.`,
    });
  };

  // Add spell to deck
  const handleAddSpellToActionDeck = (actionItem: ActionItem) => {
    const updated = {
      ...player,
      actionDeck: {
        ...player.actionDeck,
        actions: [...player.actionDeck.actions, actionItem],
      },
    };
    setPlayer(updated);
    setCombatants((prev) => prev.map((c) => (c.id === player.id ? updated : c)));
    addLog({
      actorName: player.name,
      type: 'rule',
      message: `Equipped new spell/action "${actionItem.name}" to combat deck!`,
    });
  };

  // End Turn & Opponent AI Phase
  const handleEndTurn = () => {
    if (!isPlayerTurn) return;

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

      const distToPlayer = calculateDistanceFt(enemy.spatial.x, enemy.spatial.y, currentPlayer.spatial.x, currentPlayer.spatial.y);

      // Melee Bruiser AI
      if (enemy.aiType === 'melee_bruiser') {
        if (distToPlayer > 5) {
          const path = findPath(
            enemy.spatial.x,
            enemy.spatial.y,
            currentPlayer.spatial.x,
            currentPlayer.spatial.y,
            gridCells,
            activeEncounter.gridWidth,
            activeEncounter.gridHeight,
            new Set()
          );

          if (path && path.length > 1) {
            const targetStep = path[Math.min(path.length - 2, 5)];
            enemy.spatial.x = targetStep.x;
            enemy.spatial.y = targetStep.y;
            addLog({
              actorName: enemy.name,
              type: 'action',
              message: `${enemy.name} advances across grid to (${targetStep.x}, ${targetStep.y}).`,
            });
          }
        }

        const newDist = calculateDistanceFt(enemy.spatial.x, enemy.spatial.y, currentPlayer.spatial.x, currentPlayer.spatial.y);
        if (newDist <= 5) {
          const atk = enemy.actionDeck.actions[0];
          const atkRoll = rollD20(atk.toHitMod || 4);
          const effectiveAc = currentPlayer.vitals.baseAc;
          const isHit = atkRoll.total >= effectiveAc;

          addLog({
            actorName: enemy.name,
            type: 'attack',
            message: `${enemy.name} attacks ${currentPlayer.name} with ${atk.name}! [d20(${atkRoll.d20}) + ${atkRoll.modifier} = ${atkRoll.total} vs AC ${effectiveAc}] -> ${isHit ? 'HIT!' : 'MISS!'}`,
          });

          if (isHit) {
            const dmgRoll = rollDice(atk.damageFormula || '1d12+3');
            const totalDmg = dmgRoll.total;
            currentPlayer.vitals.currentHp = Math.max(0, currentPlayer.vitals.currentHp - totalDmg);

            addLog({
              actorName: enemy.name,
              type: 'damage',
              message: `${enemy.name} deals ${totalDmg} damage to ${currentPlayer.name}! (${currentPlayer.vitals.currentHp}/${currentPlayer.vitals.maxHp} HP)`,
            });
          }
        }
      }

      // Ranged Skirmisher AI
      if (enemy.aiType === 'ranged_skirmisher') {
        const cover = evaluateCover(enemy.spatial.x, enemy.spatial.y, currentPlayer.spatial.x, currentPlayer.spatial.y, gridCells);
        const atk = enemy.actionDeck.actions[0];
        const atkRoll = rollD20(atk.toHitMod || 4);
        const effectiveAc = currentPlayer.vitals.baseAc + cover.acBonus;
        const isHit = atkRoll.total >= effectiveAc;

        addLog({
          actorName: enemy.name,
          type: 'attack',
          message: `${enemy.name} fires ${atk.name} at ${currentPlayer.name}! [d20(${atkRoll.d20}) + ${atkRoll.modifier} = ${atkRoll.total} vs AC ${effectiveAc} (+${cover.acBonus} Cover)] -> ${isHit ? 'HIT!' : 'MISS!'}`,
        });

        if (isHit) {
          const dmgRoll = rollDice(atk.damageFormula || '1d6+2');
          const totalDmg = dmgRoll.total;
          currentPlayer.vitals.currentHp = Math.max(0, currentPlayer.vitals.currentHp - totalDmg);

          addLog({
            actorName: enemy.name,
            type: 'damage',
            message: `${enemy.name} deals ${totalDmg} piercing damage to ${currentPlayer.name}! (${currentPlayer.vitals.currentHp}/${currentPlayer.vitals.maxHp} HP)`,
          });
        }
      }
    });

    // Start Next Round
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setIsPlayerTurn(true);

    currentPlayer.budget.movementRemainingFt = currentPlayer.vitals.speedFt;
    currentPlayer.budget.actionAvailable = true;
    currentPlayer.budget.bonusActionAvailable = true;
    currentPlayer.budget.reactionAvailable = true;
    currentPlayer.conditions = currentPlayer.conditions.filter((c) => c !== 'dodging');

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

  // Global Keyboard Hotkeys Engine
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept hotkeys if typing in input/textarea/select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Escape: Close drawers or cancel current action targeting
      if (e.key === 'Escape') {
        if (isCharDrawerOpen) setIsCharDrawerOpen(false);
        if (isLogDrawerOpen) setIsLogDrawerOpen(false);
        if (isDiceTrayOpen) setIsDiceTrayOpen(false);
        if (selectedAction) setSelectedAction(null);
        return;
      }

      // Space: End Turn
      if (e.code === 'Space' && isPlayerTurn) {
        e.preventDefault();
        handleEndTurn();
        return;
      }

      // Hotkey Actions 1 to 8
      if (/^[1-8]$/.test(e.key)) {
        const slotIdx = parseInt(e.key, 10) - 1;
        const allActions = [...player.actionDeck.actions, ...player.actionDeck.bonusActions];
        const targetAction = allActions[slotIdx];
        if (targetAction && isPlayerTurn) {
          e.preventDefault();
          if (targetAction.type === 'utility' || (targetAction.type === 'class_feature' && !targetAction.toHitMod && !targetAction.damageFormula)) {
            handleExecuteUtilityAction(targetAction);
          } else {
            setSelectedAction((prev) => (prev?.id === targetAction.id ? null : targetAction));
          }
        }
        return;
      }

      // Drawer Toggles
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsCharDrawerOpen((prev) => !prev);
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsLogDrawerOpen((prev) => !prev);
        return;
      }

      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setIsDiceTrayOpen((prev) => !prev);
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsRestModalOpen((prev) => !prev);
        return;
      }

      if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        e.preventDefault();
        setIsHelpModalOpen((prev) => !prev);
        return;
      }

      if ((e.key === 'z' || e.key === 'Z') && turnHistory.length > 0) {
        e.preventDefault();
        handleRewindTurn();
        return;
      }

      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setIsWizardOpen((prev) => !prev);
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMapEditing((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlayerTurn,
    player,
    selectedAction,
    turnHistory.length,
    isCharDrawerOpen,
    isLogDrawerOpen,
    isDiceTrayOpen,
  ]);

  return (
    <div 
      className="relative h-screen max-h-screen overflow-hidden text-amber-50 flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 25%, rgba(20, 14, 9, 0.45) 0%, rgba(10, 6, 4, 0.85) 100%), url(${ART_ASSETS.darkWood})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundColor: '#0c0806'
      }}
    >
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
        onToggleMapEditor={() => setIsMapEditing(!isMapEditing)}
        isMapEditing={isMapEditing}
        onToggleWizard={() => setIsWizardOpen(!isWizardOpen)}
        isWizardOpen={isWizardOpen}
      />

      {/* Map Sandbox Editor Toolbar (Conditional) */}
      <MapEditorToolbar
        isEditing={isMapEditing}
        activeBrush={activeBrush}
        onSelectBrush={setActiveBrush}
        onClearCustomMap={() => setGridCells(JSON.parse(JSON.stringify(activeEncounter.gridCells)))}
        onToggleEditMode={() => setIsMapEditing(false)}
        onOpenExportImport={() => setIsMapExportImportOpen(true)}
      />

      {/* Main Tactical Workspace (Viewport-Locked RPG Stage, Zero Scrolling) */}
      <main className="flex-1 min-h-0 px-2 sm:px-3 py-1 flex flex-col justify-between max-w-[1950px] w-full mx-auto relative overflow-hidden">
        {/* Floating Tactical Wizard Action Tutor [W] */}
        <TacticalWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          activeEncounter={activeEncounter}
          player={player}
          combatants={combatants}
          selectedAction={selectedAction}
          onSelectAction={setSelectedAction}
          onExecuteUtilityAction={handleExecuteUtilityAction}
          onEndTurn={handleEndTurn}
          currentRound={currentRound}
          isPlayerTurn={isPlayerTurn}
        />

        {/* Centerpiece: Tactical Battlemap fitting all available vertical & horizontal space */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
          <BattleMap
            gridWidth={activeEncounter.gridWidth}
            gridHeight={activeEncounter.gridHeight}
            gridCells={gridCells}
            combatants={combatants}
            player={player}
            selectedAction={selectedAction}
            onMovePlayer={handleMovePlayer}
            onTargetCombatant={handleTargetCombatant}
            isEditingMap={isMapEditing}
            activeBrush={activeBrush}
            onCellPaint={handleCellPaint}
            onToggleWizard={() => setIsWizardOpen(!isWizardOpen)}
            isWizardOpen={isWizardOpen}
          />
        </div>

        {/* Bottom Tactical Action Dock (Always Visible, Pinned to Viewport, No Scrolling) */}
        <div className="shrink-0 w-full mt-1">
          <CombatLogTicker logs={logs} onOpenDrawer={() => setIsLogDrawerOpen(true)} />
          <TacticalActionBar
            player={player}
            selectedAction={selectedAction}
            onSelectAction={setSelectedAction}
            onExecuteUtilityAction={handleExecuteUtilityAction}
            onEndTurn={handleEndTurn}
            isPlayerTurn={isPlayerTurn}
            onToggleCharDrawer={() => setIsCharDrawerOpen(!isCharDrawerOpen)}
            isCharDrawerOpen={isCharDrawerOpen}
            onToggleLogDrawer={() => setIsLogDrawerOpen(!isLogDrawerOpen)}
            isLogDrawerOpen={isLogDrawerOpen}
            onToggleDiceTray={() => setIsDiceTrayOpen(!isDiceTrayOpen)}
            isDiceTrayOpen={isDiceTrayOpen}
            onOpenRestModal={() => setIsRestModalOpen(true)}
            onOpenSpellPicker={() => setIsSpellPickerOpen(true)}
            onOpenHelpModal={() => setIsHelpModalOpen(true)}
          />
        </div>
      </main>

      {/* Slide-out Character Sheet Drawer [C] */}
      <CharacterDrawer
        isOpen={isCharDrawerOpen}
        onClose={() => setIsCharDrawerOpen(false)}
        player={player}
        selectedAction={selectedAction}
        onSelectAction={setSelectedAction}
        onExecuteUtilityAction={handleExecuteUtilityAction}
        onOpenRestModal={() => setIsRestModalOpen(true)}
        onOpenSpellPicker={() => setIsSpellPickerOpen(true)}
        onOpenCharacterModal={() => setIsCharModalOpen(true)}
      />

      {/* Slide-out Combat Chronicle & Log Drawer [L] */}
      <CombatLogDrawer
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
        logs={logs}
      />

      {/* Focused Tabletop Dice Tray (Active Action Roll or Sandbox Drawer [D]) */}
      <TabletopDiceTray
        session={diceSession}
        isOpen={isDiceTrayOpen}
        onClose={() => setIsDiceTrayOpen(false)}
      />

      {/* Battlemap Export & Import Modal */}
      <MapExportImportModal
        isOpen={isMapExportImportOpen}
        onClose={() => setIsMapExportImportOpen(false)}
        currentMapData={currentMapData}
        onImportMap={handleImportMap}
      />

      {/* Reactive Interceptor Modal */}
      <ReactionModal prompt={reactionPrompt} />

      {/* Short & Long Rest Recovery Modal */}
      <RestModal
        isOpen={isRestModalOpen}
        onClose={() => setIsRestModalOpen(false)}
        player={player}
        onApplyRest={handleApplyRest}
      />

      {/* 5e SRD Spell & Cantrip Compendium Modal */}
      <SpellPickerModal
        isOpen={isSpellPickerOpen}
        onClose={() => setIsSpellPickerOpen(false)}
        onAddSpellToActionDeck={handleAddSpellToActionDeck}
      />

      {/* Character Hub Modal (PDF, Fight Club XML, Manual) */}
      <CharacterImportModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        onLoadCharacter={(newChar) => loadEncounter(activeEncounter, newChar)}
        activeCharacterId={player.id}
      />

      {/* Practice Maps & Scenarios Modal */}
      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        activeEncounterId={activeEncounter.id}
        onSelectEncounter={(enc) => loadEncounter(enc)}
      />

      {/* Tactical Diagnostics Telemetry Modal */}
      <TelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        telemetryHistory={telemetryHistory}
        characterArchetype={player.archetype}
      />

      {/* 5e Rules Reference Guide Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
}

export default App;
