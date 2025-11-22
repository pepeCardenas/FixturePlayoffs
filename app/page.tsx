"use client";

import React, { useState } from "react";

const TEAMS_LEFT = [
  "Boca Juniors", "Talleres CBA", "Velez Sarsfield", "Argentinos Jrs",
  "Rasin-clu", "River Plate", "Lanus", "Tigre"
];
const TEAMS_RIGHT = [
  "Rosario Central", "Estudiantes dLP", "Central Cordoba", "San Lorenzo",
  "Riestra", "Barracas", "Union Sta Fe", "Gimnasia La Plata"
];

// Mapeo de colores por equipo (fondo primario y secundario)
const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  "Boca Juniors": { primary: "#0033A0", secondary: "#FFD700" }, // Azul y Amarillo
  "Talleres CBA": { primary: "#0033A0", secondary: "#FFFFFF" }, // Azul y Blanco
  "Velez Sarsfield": { primary: "#0033A0", secondary: "#FFFFFF" }, // Azul y Blanco
  "Argentinos Jrs": { primary: "#DC143C", secondary: "#DC143C" }, // Rojo
  "Rasin-clu": { primary: "#87CEEB", secondary: "#FFFFFF" }, // Celeste y Blanco
  "River Plate": { primary: "#FFFFFF", secondary: "#DC143C" }, // Blanco y Rojo
  "Lanus": { primary: "#8B0000", secondary: "#8B0000" }, // Granate
  "Tigre": { primary: "#0033A0", secondary: "#DC143C" }, // Azul y Rojo
  "Rosario Central": { primary: "#FFD700", secondary: "#0033A0" }, // Amarillo y Azul
  "Estudiantes dLP": { primary: "#FFFFFF", secondary: "#DC143C" }, // Blanco y Rojo
  "Central Cordoba": { primary: "#000000", secondary: "#FFFFFF" }, // Negro y Blanco
  "San Lorenzo": { primary: "#0033A0", secondary: "#DC143C" }, // Azul y Rojo
  "Riestra": { primary: "#000000", secondary: "#000000" }, // Negro
  "Barracas": { primary: "#DC143C", secondary: "#FFFFFF" }, // Rojo y Blanco
  "Union Sta Fe": { primary: "#DC143C", secondary: "#FFFFFF" }, // Rojo y Blanco
  "Gimnasia La Plata": { primary: "#FFFFFF", secondary: "#0033A0" }, // Blanco y Azul
};

// Mapeo de escudos por equipo
const TEAM_SHIELDS: Record<string, string> = {
  "Boca Juniors": "/assets/boca.png",
  "Talleres CBA": "/assets/talleres.png",
  "Velez Sarsfield": "/assets/velez.png",
  "Argentinos Jrs": "/assets/argentinos.png",
  "Rasin-clu": "/assets/racing.png",
  "River Plate": "/assets/river.png",
  "Lanus": "/assets/lanus.png",
  "Tigre": "/assets/tigre.png",
  "Rosario Central": "/assets/rosariocentral.png",
  "Estudiantes dLP": "/assets/estudiantes.png",
  "Central Cordoba": "/assets/centralcordoba.png",
  "San Lorenzo": "/assets/sanlorenzo.png",
  "Riestra": "/assets/riestra.png",
  "Barracas": "/assets/barracas.png",
  "Union Sta Fe": "/assets/union.png",
  "Gimnasia La Plata": "/assets/gimnasia.png",
};

const SLOT_HEIGHT = 60;
const BASE_GAP = 20;

type Slot = {
  label: string;
  startSeed: number;
  endSeed: number;
  slotId: string;
  isTeam: boolean;
  sourceSlots?: [string, string];
  matchId?: string;
};

function createInitialSlots(teams: string[], seedOffset: number, side: string): Slot[] {
  return teams.map((team, index) => ({
    label: team,
    startSeed: seedOffset + index,
    endSeed: seedOffset + index,
    slotId: `${side}-r0-${index}`,
    isTeam: true,
    matchId: `${side}-match-${Math.floor(index / 2)}`,
  }));
}

function formatSeedRange(start: number, end: number): string {
  return Array.from({ length: end - start + 1 }, (_, idx) => start + idx).join("");
}

function createWinnerSlots(previousRound: Slot[], prefix: string, roundIndex: number, side: string): Slot[] {
  const winners: Slot[] = [];
  
  // Si la ronda anterior es de equipos (roundIndex === 1), agrupar por partidos
  if (roundIndex === 1) {
    // Los equipos están organizados en pares con el mismo matchId
    // Necesitamos agrupar los matchIds únicos
    const matches: string[] = [];
    previousRound.forEach(slot => {
      if (slot.matchId && !matches.includes(slot.matchId)) {
        matches.push(slot.matchId);
      }
    });
    
    // Ahora crear slots que combinen pares de partidos
    for (let i = 0; i < matches.length; i += 2) {
      const match1 = matches[i];
      const match2 = matches[i + 1];
      if (!match1 || !match2) continue;
      
      // Encontrar los equipos de estos partidos para calcular seeds
      const slot1 = previousRound.find(s => s.matchId === match1);
      const slot2 = previousRound.find(s => s.matchId === match2);
      if (!slot1 || !slot2) continue;
      
      const startSeed = slot1.startSeed;
      const endSeed = slot2.endSeed;
      
      const label = `${prefix}${startSeed}-${endSeed}`;
      
      winners.push({
        label,
        startSeed,
        endSeed,
        slotId: `${side}-r${roundIndex}-${i / 2}`,
        isTeam: false,
        sourceSlots: [match1, match2] as [string, string],
        matchId: `${side}-match-r${roundIndex}-${i / 2}`,
      });
    }
  } else {
    // Para rondas posteriores, usar la lógica normal
    for (let i = 0; i < previousRound.length; i += 2) {
      const left = previousRound[i];
      const right = previousRound[i + 1];
      if (!left || !right) continue;

      const startSeed = left.startSeed;
      const endSeed = right.endSeed;
      const groupSize = endSeed - startSeed + 1;

      let label: string;
      if (groupSize <= 2) {
        label = `${prefix}${startSeed}-${endSeed}`;
      } else {
        const leftRange = formatSeedRange(left.startSeed, left.endSeed);
        const rightRange = formatSeedRange(right.startSeed, right.endSeed);
        label = `${prefix}${leftRange}-${rightRange}`;
      }

      winners.push({
        label,
        startSeed,
        endSeed,
        slotId: `${side}-r${roundIndex}-${i / 2}`,
        isTeam: false,
        sourceSlots: [left.matchId!, right.matchId!] as [string, string],
        matchId: `${side}-match-r${roundIndex}-${i / 2}`,
      });
    }
  }
  return winners;
}

// Función para formatear el nombre del equipo en 2 líneas
function formatTeamName(teamName: string) {
  const spaceIndex = teamName.indexOf(' ');
  if (spaceIndex === -1) {
    return teamName; // Si no hay espacio, devolver tal cual
  }
  const firstPart = teamName.substring(0, spaceIndex);
  const secondPart = teamName.substring(spaceIndex + 1);
  return (
    <>
      {firstPart}
      <br />
      {secondPart}
    </>
  );
}

// Función para generar el estilo con gradiente de colores del equipo
function getTeamStyle(teamName: string | null, isSelected: boolean, isOpponent: boolean) {
  if (!teamName || !TEAM_COLORS[teamName]) {
    return {};
  }
  
  const colors = TEAM_COLORS[teamName];
  
  // Función para determinar si un color es claro (blanco o similar)
  const isLightColor = (color: string) => {
    return color === '#FFFFFF' || color.toLowerCase().includes('ffffff');
  };
  
  // Determinar si alguno de los colores es blanco
  const hasWhite = isLightColor(colors.primary) || isLightColor(colors.secondary);
  const textColor = hasWhite ? '#000000' : '#FFFFFF';
  
  if (isOpponent) {
    // Si es oponente (perdedor), mostrar en escala de grises con menor opacidad
    return {
      background: `linear-gradient(to bottom, rgba(200, 200, 200, 0.3) 0%, rgba(200, 200, 200, 0.3) 50%, rgba(220, 220, 220, 0.3) 50%, rgba(220, 220, 220, 0.3) 100%)`,
      color: '#999999',
    };
  }
  
  if (isSelected) {
    // Si está seleccionado, mostrar con mayor intensidad
    return {
      background: `linear-gradient(to bottom, ${colors.primary} 0%, ${colors.primary} 50%, ${colors.secondary} 50%, ${colors.secondary} 100%)`,
      color: textColor,
      fontWeight: 'bold',
      border: '2px solid rgba(255, 255, 255, 0.5)',
    };
  }
  
  // Estado normal con gradiente más fuerte
  return {
    background: `linear-gradient(to bottom, ${colors.primary}CC 0%, ${colors.primary}CC 50%, ${colors.secondary}CC 50%, ${colors.secondary}CC 100%)`,
    color: textColor,
    fontWeight: '600',
    border: '1px solid rgba(0, 0, 0, 0.3)',
  };
}

function renderBracketRounds(
  teams: string[], 
  align: 'left' | 'right', 
  seedOffset: number,
  winners: Record<string, string>,
  onSelectWinner: (slotId: string, team: string, matchId: string, sourceSlots?: [string, string]) => void,
  setWinners: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  const side = align === 'left' ? 'L' : 'R';
  const rounds: Slot[][] = [];
  let currentRound = createInitialSlots(teams, seedOffset, side);
  rounds.push(currentRound);

  const LABEL_PREFIXES = ['G', 'Y', 'Z', 'W'];
  let depth = 0;
  // Generar rondas hasta llegar a 1 slot
  while (currentRound.length > 1) {
    const prefix = LABEL_PREFIXES[depth] ?? 'X';
    currentRound = createWinnerSlots(currentRound, prefix, depth + 1, side);
    rounds.push(currentRound);
    depth += 1;
  }
  
  // Generar una ronda final que muestre el ganador del último slot (R3)
  if (currentRound.length === 1) {
    const lastSlot = currentRound[0];
    const prefix = LABEL_PREFIXES[depth] ?? 'W';
    const finalSlot: Slot = {
      label: `${prefix}${lastSlot.startSeed}-${lastSlot.endSeed}`,
      startSeed: lastSlot.startSeed,
      endSeed: lastSlot.endSeed,
      slotId: `${side}-r${depth + 1}-0`,
      isTeam: false,
      sourceSlots: [lastSlot.matchId!, lastSlot.matchId!] as [string, string],
      matchId: `${side}-match-r${depth + 1}-0`,
    };
    rounds.push([finalSlot]);
  }

  const isRight = align === 'right';

  const gapValues: number[] = [];
  const offsetValues: number[] = [];

  rounds.forEach((_, idx) => {
    if (idx === 0) {
      gapValues.push(BASE_GAP);
      offsetValues.push(0);
    } else {
      const prevGap = gapValues[idx - 1];
      const prevSpacing = SLOT_HEIGHT + prevGap;
      const currentGap = 2 * prevSpacing - SLOT_HEIGHT;
      gapValues.push(currentGap);
      offsetValues.push(offsetValues[idx - 1] + prevSpacing / 2);
    }
  });

  // Función auxiliar para obtener el nombre del equipo de un slot o matchId
  const getTeamFromSlot = (identifier: string): string | null => {
    return winners[identifier] || null;
  };

  const columns = (
    <div
      className={`flex ${isRight ? 'flex-row-reverse justify-end' : 'flex-row justify-start'} items-start relative`}
      style={{ minWidth: 280 }}
    >
      {rounds.map((round, i) => {
        const gap = gapValues[i];
        const offset = offsetValues[i];
        const isLastRound = i === rounds.length - 1;
        const marginClass = isLastRound ? 'mx-6' : 'mx-2';

        return (
          <div
            key={i}
            className={`flex flex-col items-center ${marginClass} relative`}
            style={{ gap: `${gap}px`, paddingTop: `${offset}px`, paddingBottom: `${offset}px`, minWidth: '140px' }}
          >
            {round.flatMap((slot, j) => {
              // Para slots normales usar matchId si existe, sino slotId
              const isLastRoundSlot = i === rounds.length - 1;
              const winner = slot.matchId ? winners[slot.matchId] : winners[slot.slotId];
              
              // Obtener los equipos fuente si existen (solo una vez)
              let team1: string | null = null;
              let team2: string | null = null;
              
              if (!slot.isTeam && slot.sourceSlots) {
                const [source1, source2] = slot.sourceSlots;
                // Si ambos sources son iguales, solo mostrar el ganador de ese match
                if (source1 === source2) {
                  team1 = getTeamFromSlot(source1);
                  team2 = null;
                } else {
                  team1 = getTeamFromSlot(source1);
                  team2 = getTeamFromSlot(source2);
                }
              }
              
              // Si no es equipo inicial y no hay equipos disponibles, no mostrar el slot
              if (!slot.isTeam && !team1 && !team2 && !winner) {
                return [];
              }
              
              // Calcular displayLabel
              let displayLabel = slot.label;
              if (!slot.isTeam && slot.sourceSlots) {
                // Si hay un ganador seleccionado, mostrar ese ganador
                if (winner) {
                  displayLabel = winner;
                } else if (team1 && team2) {
                  displayLabel = `${team1} vs ${team2}`;
                } else if (team1) {
                  displayLabel = team1;
                } else if (team2) {
                  displayLabel = team2;
                }
              }
              // Si hay un ganador, siempre mostrarlo EXCEPTO para equipos iniciales (R0)
              // En R0, solo mostrar el nombre del ganador si este slot ES el ganador
              if (winner && !slot.isTeam) {
                displayLabel = winner;
              } else if (winner && slot.isTeam && winner === slot.label) {
                displayLabel = winner; // Solo si este equipo es el ganador
              }
              
              // Determinar si el slot está habilitado
              let isEnabled = slot.isTeam;
              
              if (!slot.isTeam && slot.sourceSlots) {
                isEnabled = !!(team1 && team2);
              }
              
              // Para equipos iniciales, verificar si el partido ya tiene un ganador
              if (slot.isTeam && slot.matchId) {
                const matchHasWinner = winners[slot.matchId];
                if (matchHasWinner && matchHasWinner !== slot.label) {
                  isEnabled = false;
                }
              }
              
              const isSelected = slot.isTeam ? (!!winner && winner === slot.label) : !!winner;
              const isOpponentSelected = slot.isTeam && slot.matchId && !isSelected && !!winners[slot.matchId] && winners[slot.matchId] !== slot.label;
              
              // Para rondas posteriores, verificar si este slot tiene un ganador en su matchId
              let isOpponentSelectedInMatch = false;
              if (!slot.isTeam && slot.matchId && !winner) {
                const matchWinner = winners[slot.matchId];
                if (matchWinner) {
                  // Hay un ganador en este match, verificar si es team1 o team2
                  if (team1 && matchWinner === team1) {
                    // team1 ganó, team2 debe estar deshabilitado
                  } else if (team2 && matchWinner === team2) {
                    // team2 ganó, team1 debe estar deshabilitado
                  }
                }
              }
              
              // Para slots de rondas posteriores, mostrar como dos elementos separados si tiene sourceSlots
              // PERO: si es la última ronda (R4) con team1 pero sin team2, mostrar como elemento único clickeable
              // Mantener el split match visible incluso con ganador para mostrar perdedor tachado
              const showAsSplitMatch = !slot.isTeam && slot.sourceSlots && team1 && team2 && !isLastRoundSlot;
              
              if (showAsSplitMatch) {
                // Verificar si hay un ganador en este match
                const matchWinner = slot.matchId ? winners[slot.matchId] : null;
                const team1IsWinner = matchWinner === team1;
                const team2IsWinner = matchWinner === team2;
                
                // Obtener escudos para team1 y team2
                const team1Shield = team1 ? TEAM_SHIELDS[team1] : null;
                const team2Shield = team2 ? TEAM_SHIELDS[team2] : null;
                const flexDirection = isRight ? 'flex-row-reverse' : 'flex-row';
                
                // Retornar dos elementos: uno para team1 y otro para team2
                return [
                  <div
                    key={`${j}-team1`}
                    className={`relative flex ${flexDirection} items-center justify-center text-center rounded-md border text-sm font-bold shadow-md transition-all w-full min-w-[140px] min-h-[60px] ${
                      team1IsWinner
                        ? 'border-blue-500 border-2'
                        : team2IsWinner
                        ? 'border-gray-200 text-gray-400 line-through'
                        : team1 
                        ? 'border-gray-300 cursor-pointer hover:border-blue-400'
                        : 'border-gray-200 bg-gray-50 text-gray-400'
                    }`}
                    style={{
                      backgroundColor: team2IsWinner ? '#F3F4F6' : '#FFFFFF',
                      color: '#000000',
                      paddingLeft: team1Shield && !isRight ? '4px' : '12px',
                      paddingRight: team1Shield && isRight ? '4px' : '12px',
                      paddingTop: '6px',
                      paddingBottom: '6px'
                    }}
                    onClick={() => {
                      if (team1 && !matchWinner) {
                        onSelectWinner(slot.slotId, team1, slot.matchId || '', slot.sourceSlots);
                      }
                    }}
                  >
                    {team1Shield && (
                      <img 
                        src={team1Shield} 
                        alt={team1 || ''} 
                        className="w-12 h-12" 
                        style={{ 
                          flexShrink: 0,
                          paddingLeft: isRight ? '8px' : '0',
                          paddingRight: isRight ? '0' : '8px'
                        }}
                      />
                    )}
                    <span className="flex-1 text-center">
                      {team1 ? formatTeamName(team1) : slot.label}
                    </span>
                  </div>,
                  <div
                    key={`${j}-team2`}
                    className={`relative flex ${flexDirection} items-center justify-center text-center rounded-md border text-sm font-bold shadow-md transition-all w-full min-w-[140px] min-h-[60px] ${
                      team2IsWinner
                        ? 'border-blue-500 border-2'
                        : team1IsWinner
                        ? 'border-gray-200 text-gray-400 line-through'
                        : team2
                        ? 'border-gray-300 cursor-pointer hover:border-blue-400'
                        : 'border-gray-200 bg-gray-50 text-gray-400'
                    }`}
                    style={{
                      backgroundColor: team1IsWinner ? '#F3F4F6' : '#FFFFFF',
                      color: '#000000',
                      paddingLeft: team2Shield && !isRight ? '4px' : '12px',
                      paddingRight: team2Shield && isRight ? '4px' : '12px',
                      paddingTop: '6px',
                      paddingBottom: '6px'
                    }}
                    onClick={() => {
                      if (team2 && !matchWinner) {
                        onSelectWinner(slot.slotId, team2, slot.matchId || '', slot.sourceSlots);
                      }
                    }}
                  >
                    {team2Shield && (
                      <img 
                        src={team2Shield} 
                        alt={team2 || ''} 
                        className="w-12 h-12" 
                        style={{ 
                          flexShrink: 0,
                          paddingLeft: isRight ? '8px' : '0',
                          paddingRight: isRight ? '0' : '8px'
                        }}
                      />
                    )}
                    <span className="flex-1 text-center">
                      {team2 ? formatTeamName(team2) : slot.label}
                    </span>
                  </div>
                ];
              }
              
              // Para slots normales o con ganador, mostrar un solo elemento
              let placeholderText = displayLabel;
              // No sobrescribir con slot.label, usar displayLabel que ya tiene la lógica correcta
              
              // Si es la última ronda (R4) y tiene team1, mostrar el equipo y hacerlo clickeable
              if (isLastRoundSlot && team1 && !winner) {
                placeholderText = team1;
              }
              
              // Para R4, verificar si este equipo es el campeón o el perdedor
              let isR4Selected = false;
              let isR4Loser = false;
              if (isLastRoundSlot && team1) {
                const championTeam = winners['FINAL'];
                if (championTeam) {
                  isR4Selected = championTeam === team1;
                  isR4Loser = championTeam !== team1;
                }
              }
              
              // Verificar si el slot es clickeable
              const isLastRoundClickable = isLastRoundSlot && team1 && !winners['FINAL'];
              
              // Determinar qué equipo usar para los colores
              const teamForColors = slot.isTeam ? slot.label : (winner || team1 || displayLabel);
              const isR0 = i === 0; // Primera columna (equipos iniciales)
              
              // Determinar qué equipo mostrar con escudo (puede ser el ganador o el equipo actual)
              let teamWithShield: string | null = null;
              if (isR0 && slot.isTeam) {
                teamWithShield = slot.label;
              } else if (!slot.isTeam && winner) {
                teamWithShield = winner;
              } else if (!slot.isTeam && team1 && !team2) {
                teamWithShield = team1;
              } else if (!slot.isTeam && !team1 && team2) {
                teamWithShield = team2;
              }
              
              const teamShield = teamWithShield ? TEAM_SHIELDS[teamWithShield] : null;
              const slotHeight = 'min-h-[60px]'; // Mismo tamaño para todas las rondas
              const flexDirection = isRight ? 'flex-row-reverse' : 'flex-row'; // Invertir para lado derecho
              
              return [
                <div
                  key={j}
                  className={`relative flex ${flexDirection} items-center justify-center text-center rounded-md border text-sm font-bold shadow-md transition-all w-full min-w-[140px] ${slotHeight} ${
                    isR4Selected || isSelected
                      ? 'border-blue-500 border-2' 
                      : isR4Loser || isOpponentSelected
                      ? 'border-gray-200 text-gray-400'
                      : isEnabled || isLastRoundClickable
                      ? 'border-gray-300 cursor-pointer hover:border-blue-400'
                      : 'border-gray-200 text-gray-400'
                  }`}
                  style={{
                    backgroundColor: (isR4Loser || isOpponentSelected) ? '#F3F4F6' : '#FFFFFF',
                    color: '#000000',
                    paddingLeft: teamShield && !isRight ? '4px' : '12px',
                    paddingRight: teamShield && isRight ? '4px' : '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px'
                  }}
                  onClick={() => {
                    // Si es la última ronda (R4), guardar como campeón
                    if (isLastRoundSlot && team1 && !winners['FINAL']) {
                      setWinners(prev => ({
                        ...prev,
                        'FINAL': team1
                      }));
                    } else if (isEnabled && !isSelected) {
                      const teamName = slot.isTeam ? slot.label : displayLabel;
                      onSelectWinner(slot.slotId, teamName, slot.matchId || '', slot.sourceSlots);
                    }
                  }}
                >
                  {teamShield && (
                    <img 
                      src={teamShield} 
                      alt={slot.label}
                      className="w-12 h-12 flex-shrink-0"
                      style={{ margin: '0 8px' }}
                    />
                  )}
                  <span className="flex-1">
                    {placeholderText ? formatTeamName(placeholderText) : slot.label}
                  </span>
                </div>
              ];
            })}
          </div>
        );
      })}
    </div>
  );

  return {
    columns,
    finalOffset: offsetValues[offsetValues.length - 1] ?? 0,
  };
}

export default function Home() {
  const [winners, setWinners] = useState<Record<string, string>>({});

  const handleSelectWinner = (slotId: string, team: string, matchId: string, sourceSlots?: [string, string]) => {
    setWinners(prev => {
      const newWinners = { ...prev };
      // Guardar el ganador usando el matchId para que sea más fácil encontrarlo
      newWinners[matchId] = team;
      return newWinners;
    });
  };

  const handleReset = () => {
    setWinners({});
  };

  const leftBracket = renderBracketRounds(TEAMS_LEFT, 'left', 1, winners, handleSelectWinner, setWinners);
  const rightBracket = renderBracketRounds(TEAMS_RIGHT, 'right', 9, winners, handleSelectWinner, setWinners);

  // Obtener el campeón
  const finalMatchId = 'FINAL';
  const champion = winners[finalMatchId];
  
  // Obtener el subcampeón (perdedor de la final - R4)
  // Los finalistas son los ganadores de R3 (L-match-r2-0 y R-match-r2-0)
  const leftFinalist = winners['L-match-r2-0'];
  const rightFinalist = winners['R-match-r2-0'];
  const secondPlace = champion ? (leftFinalist === champion ? rightFinalist : leftFinalist) : null;
  
  // Obtener los perdedores de semifinal (R2) - 3er y 4to puesto
  // Son los ganadores de R1 que no ganaron en R2
  // Solo mostrar si ambos finalistas están definidos (R2 completo)
  const leftR1Winners = [winners['L-match-r1-0'], winners['L-match-r1-1']];
  const rightR1Winners = [winners['R-match-r1-0'], winners['R-match-r1-1']];
  
  let thirdPlace: string[] = [];
  if (leftFinalist && rightFinalist) {
    const leftR2Loser = leftR1Winners.find(t => t && t !== leftFinalist);
    const rightR2Loser = rightR1Winners.find(t => t && t !== rightFinalist);
    thirdPlace = [leftR2Loser, rightR2Loser].filter(Boolean) as string[];
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-100 font-sans py-2 md:py-8">
      <main className="flex flex-col items-center w-full max-w-[1400px] p-2 md:p-6 bg-white shadow-md rounded-lg">
        <div className="flex items-center justify-between w-full mb-2 md:mb-8 flex-wrap gap-2">
          <h1 className="text-lg md:text-4xl font-bold text-center flex-1 text-black">El Simulador de Otro La Travaladna</h1>
          <button
            onClick={handleReset}
            className="px-3 py-1 md:px-6 md:py-2 text-xs md:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-md"
          >
            Reiniciar
          </button>
        </div>
        <div className="w-full flex flex-row items-start justify-center gap-1 md:gap-4 overflow-x-auto">
          {/* Lado izquierdo (extremo izquierdo) */}
          {leftBracket.columns}
          {/* Lado derecho (extremo derecho) */}
          {rightBracket.columns}
        </div>
        
        {/* Posiciones finales */}
        <div className="w-full flex flex-row items-start justify-center gap-2 md:gap-8 mt-4 md:mt-12 overflow-x-auto">
          {/* 1er Puesto */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-gray-600 mb-2">🥇 1º Puesto</div>
            <div 
              className="flex flex-row items-center justify-center text-center rounded-md border-2 text-sm font-bold shadow-lg min-w-[180px] min-h-[60px]"
              style={{ backgroundColor: '#FFFFFF', color: '#000000', padding: '8px 12px' }}
            >
              {champion && TEAM_SHIELDS[champion] && (
                <img 
                  src={TEAM_SHIELDS[champion]} 
                  alt={champion} 
                  className="w-12 h-12 flex-shrink-0"
                  style={{ marginRight: '12px' }}
                />
              )}
              <span className="flex-1">
                {champion ? formatTeamName(champion) : 'Campeón'}
              </span>
            </div>
          </div>
          
          {/* 2do Puesto */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-gray-600 mb-2">🥈 2º Puesto</div>
            <div 
              className="flex flex-row items-center justify-center text-center rounded-md border-2 text-sm font-bold shadow-lg min-w-[180px] min-h-[60px]"
              style={{ backgroundColor: '#FFFFFF', color: '#000000', padding: '8px 12px' }}
            >
              {secondPlace && TEAM_SHIELDS[secondPlace] && (
                <img 
                  src={TEAM_SHIELDS[secondPlace]} 
                  alt={secondPlace} 
                  className="w-12 h-12 flex-shrink-0"
                  style={{ marginRight: '12px' }}
                />
              )}
              <span className="flex-1">
                {secondPlace ? formatTeamName(secondPlace) : 'Subcampeón'}
              </span>
            </div>
          </div>
          
          {/* 3er/4to Puesto */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-gray-600 mb-2 text-center">🥉 3º/4º Puesto</div>
            <div className="flex flex-row gap-2">
              <div 
                className="flex flex-row items-center justify-center text-center rounded-md border-2 text-sm font-bold shadow-lg min-w-[180px] min-h-[60px]"
                style={{ backgroundColor: '#FFFFFF', color: '#000000', padding: '8px 12px' }}
              >
                {thirdPlace[0] && TEAM_SHIELDS[thirdPlace[0]] && (
                  <img 
                    src={TEAM_SHIELDS[thirdPlace[0]]} 
                    alt={thirdPlace[0]} 
                    className="w-12 h-12 flex-shrink-0"
                    style={{ marginRight: '12px' }}
                  />
                )}
                <span className="flex-1">
                  {thirdPlace[0] ? formatTeamName(thirdPlace[0]) : 'Semifinalista'}
                </span>
              </div>
              <div 
                className="flex flex-row items-center justify-center text-center rounded-md border-2 text-sm font-bold shadow-lg min-w-[180px] min-h-[60px]"
                style={{ backgroundColor: '#FFFFFF', color: '#000000', padding: '8px 12px' }}
              >
                {thirdPlace[1] && TEAM_SHIELDS[thirdPlace[1]] && (
                  <img 
                    src={TEAM_SHIELDS[thirdPlace[1]]} 
                    alt={thirdPlace[1]} 
                    className="w-12 h-12 flex-shrink-0"
                    style={{ marginRight: '12px' }}
                  />
                )}
                <span className="flex-1">
                  {thirdPlace[1] ? formatTeamName(thirdPlace[1]) : 'Semifinalista'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-gray-500 text-sm">Haz clic en los equipos para seleccionar ganadores y avanzar rondas.</p>
      </main>
    </div>
  );
}
