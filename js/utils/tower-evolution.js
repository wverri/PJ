/**
 * Sistema de Evolução de Torres - Ultima Online Tower Defense
 * Implementa árvores de evolução complexas para cada tipo de torre
 */

// Sistema de Evolução de Torres
const TOWER_EVOLUTION = {
    // ========== ARQUEIRO ==========
    ARCHER: {
        evolutions: {
            // Tier 2
            ARCHER_VETERAN: {
                name: 'Arqueiro Veterano',
                description: 'Arqueiro experiente com maior precisão',
                cost: 60,
                requirements: { level: 2 },
                bonuses: {
                    damage: 10,
                    range: 20,
                    attackSpeed: -200,
                    accuracy: 0.95
                }
            },
            ARCHER_HUNTER: {
                name: 'Caçador Élfico',
                description: 'Especialista em rastreamento e tiros múltiplos',
                cost: 60,
                requirements: { level: 2 },
                bonuses: {
                    damage: 6,
                    range: 10,
                    attackSpeed: -300,
                    multiShot: 2
                }
            }
        },
        
        specializations: {
            // Do Veterano
            ARCHER_SNIPER: {
                name: 'Franco-atirador',
                description: 'Alcance extremo e dano crítico',
                cost: 80,
                requirements: { evolution: 'ARCHER_VETERAN', level: 3 },
                bonuses: {
                    damage: 23,
                    range: 70,
                    attackSpeed: 600,
                    criticalChance: 0.3,
                    criticalMultiplier: 2.5
                }
            },
            ARCHER_RAPID: {
                name: 'Atirador Rápido',
                description: 'Velocidade de ataque extrema',
                cost: 80,
                requirements: { evolution: 'ARCHER_VETERAN', level: 3 },
                bonuses: {
                    damage: -6,
                    range: 5,
                    attackSpeed: -800,
                    burstShots: 3
                }
            },
            ARCHER_PIERCING: {
                name: 'Arqueiro Perfurante',
                description: 'Flechas atravessam múltiplos inimigos',
                cost: 80,
                requirements: { evolution: 'ARCHER_VETERAN', level: 3 },
                bonuses: {
                    damage: 6,
                    range: 30,
                    piercing: 3,
                    piercingDamageReduction: 0.8
                }
            },
            
            // Do Caçador
            ARCHER_RANGER: {
                name: 'Ranger Élfico',
                description: 'Mestre em combate à distância',
                cost: 80,
                requirements: { evolution: 'ARCHER_HUNTER', level: 3 },
                bonuses: {
                    damage: 7,
                    range: 30,
                    attackSpeed: -100,
                    multiShot: 1,
                    natureBonus: 1.2
                }
            },
            ARCHER_VOLLEY: {
                name: 'Mestre da Saraivada',
                description: 'Dispara rajadas devastadoras',
                cost: 80,
                requirements: { evolution: 'ARCHER_HUNTER', level: 3 },
                bonuses: {
                    damage: 2,
                    range: 10,
                    attackSpeed: 1100,
                    volleyShots: 5,
                    volleySpread: 30
                }
            },
            ARCHER_TRACKER: {
                name: 'Rastreador Sombrio',
                description: 'Flechas teleguiadas e veneno',
                cost: 80,
                requirements: { evolution: 'ARCHER_HUNTER', level: 3 },
                bonuses: {
                    damage: 4,
                    range: 15,
                    attackSpeed: 200,
                    homingShots: true,
                    poisonChance: 0.4
                }
            }
        }
    },

    // ========== MAGO ==========
    MAGE: {
        evolutions: {
            MAGE_SCHOLAR: {
                name: 'Erudito Arcano',
                description: 'Mago estudioso com magias poderosas',
                cost: 90,
                requirements: { level: 2 },
                bonuses: {
                    damage: 15,
                    range: 20,
                    attackSpeed: -200,
                    splashRadius: 10,
                    manaEfficiency: 1.3
                }
            },
            MAGE_BATTLE: {
                name: 'Mago de Batalha',
                description: 'Especialista em combate direto',
                cost: 90,
                requirements: { level: 2 },
                bonuses: {
                    damage: 10,
                    range: 10,
                    attackSpeed: -400,
                    splashRadius: 5,
                    armorPenetration: 0.3
                }
            }
        },
        
        specializations: {
            // Do Erudito
            MAGE_ARCHMAGE: {
                name: 'Arquimago',
                description: 'Mestre supremo das artes arcanas',
                cost: 110,
                requirements: { evolution: 'MAGE_SCHOLAR', level: 3 },
                bonuses: {
                    damage: 25,
                    range: 30,
                    attackSpeed: -100,
                    splashRadius: 20,
                    chainLightning: 3,
                    manaRegeneration: true
                }
            },
            MAGE_ELEMENTALIST: {
                name: 'Elementalista',
                description: 'Controla os elementos da natureza',
                cost: 110,
                requirements: { evolution: 'MAGE_SCHOLAR', level: 3 },
                bonuses: {
                    damage: 10,
                    range: 10,
                    attackSpeed: -300,
                    splashRadius: 10,
                    elementalRotation: ['fire', 'ice', 'lightning']
                }
            },
            MAGE_NECROMANCER: {
                name: 'Necromante',
                description: 'Mestre da magia sombria e morte',
                cost: 110,
                requirements: { evolution: 'MAGE_SCHOLAR', level: 3 },
                bonuses: {
                    damage: 15,
                    range: 5,
                    splashRadius: 15,
                    lifeDrain: 0.3,
                    curseEffect: true
                }
            },
            
            // Do Mago de Batalha
            MAGE_WARMAGE: {
                name: 'Mago de Guerra',
                description: 'Especialista em destruição em massa',
                cost: 110,
                requirements: { evolution: 'MAGE_BATTLE', level: 3 },
                bonuses: {
                    damage: 25,
                    range: 10,
                    attackSpeed: -600,
                    splashRadius: 20,
                    explosiveShots: true,
                    armorPenetration: 0.2
                }
            },
            MAGE_DESTROYER: {
                name: 'Destruidor Arcano',
                description: 'Poder destrutivo absoluto',
                cost: 110,
                requirements: { evolution: 'MAGE_BATTLE', level: 3 },
                bonuses: {
                    damage: 40,
                    range: 0,
                    splashRadius: 40,
                    devastation: true
                }
            },
            MAGE_SPELLSWORD: {
                name: 'Lâmina Mística',
                description: 'Combina magia e combate corpo a corpo',
                cost: 110,
                requirements: { evolution: 'MAGE_BATTLE', level: 3 },
                bonuses: {
                    damage: 10,
                    range: 0,
                    attackSpeed: -800,
                    splashRadius: 10,
                    meleeBonus: 2.0,
                    magicSword: true
                }
            }
        }
    },

    // ========== MAGO DO GELO ==========
    ICE_MAGE: {
        evolutions: {
            ICE_MAGE_FROST: {
                name: 'Mago do Gelo Polar',
                description: 'Especialista em controle de gelo',
                cost: 110,
                requirements: { level: 2 },
                bonuses: {
                    damage: 10,
                    range: 20,
                    attackSpeed: -200,
                    slowEffect: 0.2,
                    slowDuration: 1000,
                    frostAura: 50
                }
            },
            ICE_MAGE_BLIZZARD: {
                name: 'Senhor da Nevasca',
                description: 'Controla tempestades de gelo',
                cost: 110,
                requirements: { level: 2 },
                bonuses: {
                    damage: 5,
                    range: 10,
                    attackSpeed: -400,
                    slowEffect: 0.1,
                    slowDuration: 500,
                    blizzardArea: 80
                }
            }
        },
        
        specializations: {
            // Do Gelo Polar
            ICE_MAGE_GLACIER: {
                name: 'Guardião da Geleira',
                description: 'Cria barreiras de gelo permanentes',
                cost: 130,
                requirements: { evolution: 'ICE_MAGE_FROST', level: 3 },
                bonuses: {
                    damage: 15,
                    range: 15,
                    attackSpeed: -300,
                    slowEffect: 0.2,
                    slowDuration: 2500,
                    iceWalls: true,
                    frostAura: 20
                }
            },
            ICE_MAGE_CRYSTAL: {
                name: 'Mestre dos Cristais',
                description: 'Cristais de gelo que explodem',
                cost: 130,
                requirements: { evolution: 'ICE_MAGE_FROST', level: 3 },
                bonuses: {
                    damage: 10,
                    range: 5,
                    attackSpeed: -500,
                    slowEffect: 0.1,
                    slowDuration: 1500,
                    crystalExplosion: 60,
                    shardDamage: 20
                }
            },
            ICE_MAGE_ABSOLUTE: {
                name: 'Zero Absoluto',
                description: 'Congela instantaneamente qualquer inimigo',
                cost: 130,
                requirements: { evolution: 'ICE_MAGE_FROST', level: 3 },
                bonuses: {
                    damage: 0,
                    range: 15,
                    slowEffect: 0.55,
                    slowDuration: 3500,
                    instantFreeze: 0.2,
                    absoluteZero: true
                }
            },
            
            // Da Nevasca
            ICE_MAGE_STORM: {
                name: 'Senhor da Tempestade',
                description: 'Tempestades de gelo devastadoras',
                cost: 130,
                requirements: { evolution: 'ICE_MAGE_BLIZZARD', level: 3 },
                bonuses: {
                    damage: 25,
                    range: 35,
                    attackSpeed: -600,
                    slowEffect: 0.1,
                    slowDuration: 1500,
                    stormRadius: 100,
                    continuousDamage: 5
                }
            },
            ICE_MAGE_AVALANCHE: {
                name: 'Mestre da Avalanche',
                description: 'Causa avalanches devastadoras',
                cost: 130,
                requirements: { evolution: 'ICE_MAGE_BLIZZARD', level: 3 },
                bonuses: {
                    damage: 30,
                    range: 20,
                    attackSpeed: 200,
                    slowEffect: 0.2,
                    slowDuration: 1000,
                    avalancheChain: true,
                    knockback: 50
                }
            },
            ICE_MAGE_WINTER: {
                name: 'Eterno Inverno',
                description: 'Traz o inverno eterno ao campo',
                cost: 130,
                requirements: { evolution: 'ICE_MAGE_BLIZZARD', level: 3 },
                bonuses: {
                    damage: 10,
                    range: 55,
                    attackSpeed: -400,
                    slowEffect: 0.4,
                    slowDuration: 5500,
                    winterAura: 150,
                    globalSlow: 0.3
                }
            }
        }
    },

    // ========== TORRE VENENOSA ==========
    POISON_TOWER: {
        evolutions: {
            POISON_ALCHEMIST: {
                name: 'Alquimista Mestre',
                description: 'Especialista em poções e venenos',
                cost: 75,
                requirements: { level: 2 },
                bonuses: {
                    damage: 4,
                    range: 15,
                    attackSpeed: -200,
                    poisonDamage: 3,
                    poisonDuration: 1000,
                    acidSplash: 30
                }
            },
            POISON_DRUID: {
                name: 'Druida Sombrio',
                description: 'Controla plantas venenosas',
                cost: 75,
                requirements: { level: 2 },
                bonuses: {
                    damage: 2,
                    range: 10,
                    attackSpeed: -100,
                    poisonDamage: 2,
                    poisonDuration: 2000,
                    thornAura: 40
                }
            }
        },
        
        specializations: {
            // Do Alquimista
            POISON_PLAGUE: {
                name: 'Senhor da Peste',
                description: 'Espalha doenças mortais',
                cost: 95,
                requirements: { evolution: 'POISON_ALCHEMIST', level: 3 },
                bonuses: {
                    damage: 6,
                    range: 15,
                    attackSpeed: -300,
                    poisonDamage: 6,
                    poisonDuration: 3000,
                    plagueSpread: 60,
                    diseaseStack: true
                }
            },
            POISON_ACID: {
                name: 'Mestre do Ácido',
                description: 'Ácido que corrói armaduras',
                cost: 95,
                requirements: { evolution: 'POISON_ALCHEMIST', level: 3 },
                bonuses: {
                    damage: 8,
                    range: 5,
                    attackSpeed: -400,
                    poisonDamage: 2,
                    poisonDuration: 0,
                    armorCorrosion: 0.4,
                    acidPool: 50
                }
            },
            POISON_TOXIC: {
                name: 'Toxicologista',
                description: 'Venenos extremamente letais',
                cost: 95,
                requirements: { evolution: 'POISON_ALCHEMIST', level: 3 },
                bonuses: {
                    damage: 3,
                    range: 10,
                    attackSpeed: -100,
                    poisonDamage: 9,
                    poisonDuration: 5000,
                    toxicCloud: 70,
                    lethalPoison: 0.1
                }
            },
            
            // Do Druida
            POISON_NATURE: {
                name: 'Guardião da Natureza',
                description: 'Controla a natureza venenosa',
                cost: 95,
                requirements: { evolution: 'POISON_DRUID', level: 3 },
                bonuses: {
                    damage: 6,
                    range: 35,
                    attackSpeed: -200,
                    poisonDamage: 5,
                    poisonDuration: 2000,
                    entanglement: true,
                    natureRegeneration: true
                }
            },
            POISON_SPORE: {
                name: 'Mestre dos Esporos',
                description: 'Esporos tóxicos que se espalham',
                cost: 95,
                requirements: { evolution: 'POISON_DRUID', level: 3 },
                bonuses: {
                    damage: 2,
                    range: 45,
                    poisonDamage: 3,
                    poisonDuration: 1000,
                    sporeCloud: 80,
                    sporeReplication: true
                }
            },
            POISON_VINE: {
                name: 'Senhor das Vinhas',
                description: 'Vinhas venenosas que prendem',
                cost: 95,
                requirements: { evolution: 'POISON_DRUID', level: 3 },
                bonuses: {
                    damage: 4,
                    range: 0,
                    attackSpeed: 100,
                    poisonDamage: 4,
                    poisonDuration: 3000,
                    vineEntangle: true,
                    vineSpread: 90
                }
            }
        }
    },

    // ========== CANHÃO ==========
    CANNON: {
        evolutions: {
            CANNON_SIEGE: {
                name: 'Canhão de Cerco',
                description: 'Especializado em destruição de estruturas',
                cost: 150,
                requirements: { level: 2 },
                bonuses: {
                    damage: 25,
                    range: 20,
                    attackSpeed: -200,
                    splashRadius: 15,
                    structureDamage: 2.0
                }
            },
            CANNON_MORTAR: {
                name: 'Morteiro Pesado',
                description: 'Ataques em arco com grande área',
                cost: 150,
                requirements: { level: 2 },
                bonuses: {
                    damage: 15,
                    range: 30,
                    attackSpeed: 200,
                    splashRadius: 30,
                    arcShot: true
                }
            }
        },
        
        specializations: {
            // Do Cerco
            CANNON_FORTRESS: {
                name: 'Canhão da Fortaleza',
                description: 'Poder destrutivo supremo',
                cost: 200,
                requirements: { evolution: 'CANNON_SIEGE', level: 3 },
                bonuses: {
                    damage: 50,
                    range: 20,
                    attackSpeed: -500,
                    splashRadius: 25,
                    fortressBreaker: true,
                    armorPenetration: 0.8
                }
            },
            CANNON_DEMOLISHER: {
                name: 'Demolidor',
                description: 'Especialista em demolição total',
                cost: 200,
                requirements: { evolution: 'CANNON_SIEGE', level: 3 },
                bonuses: {
                    damage: 30,
                    range: 5,
                    attackSpeed: -800,
                    splashRadius: 45,
                    demolition: true,
                    chainExplosion: 3
                }
            },
            CANNON_BALLISTA: {
                name: 'Balista Gigante',
                description: 'Projéteis perfurantes de longo alcance',
                cost: 200,
                requirements: { evolution: 'CANNON_SIEGE', level: 3 },
                bonuses: {
                    damage: 20,
                    range: 50,
                    attackSpeed: -1000,
                    splashRadius: -10,
                    piercing: 5,
                    giantBolt: true
                }
            },
            
            // Do Morteiro
            CANNON_ARTILLERY: {
                name: 'Artilharia Pesada',
                description: 'Bombardeio de área devastador',
                cost: 200,
                requirements: { evolution: 'CANNON_MORTAR', level: 3 },
                bonuses: {
                    damage: 20,
                    range: 20,
                    splashRadius: 40,
                    artilleryBarrage: 3,
                    delayedExplosion: true
                }
            },
            CANNON_BOMBARD: {
                name: 'Bombardeiro',
                description: 'Múltiplas explosões em sequência',
                cost: 200,
                requirements: { evolution: 'CANNON_MORTAR', level: 3 },
                bonuses: {
                    damage: 10,
                    range: 5,
                    attackSpeed: -400,
                    splashRadius: 20,
                    clusterBombs: 5,
                    bombardment: true
                }
            },
            CANNON_TREBUCHET: {
                name: 'Trebuchet Colossal',
                description: 'Alcance máximo e dano devastador',
                cost: 200,
                requirements: { evolution: 'CANNON_MORTAR', level: 3 },
                bonuses: {
                    damage: 90,
                    range: 60,
                    attackSpeed: 1000,
                    splashRadius: 50,
                    colossalStone: true,
                    earthquakeEffect: true
                }
            }
        }
    },

    // ========== TORRE ELÉTRICA ==========
    LIGHTNING: {
        evolutions: {
            LIGHTNING_TESLA: {
                name: 'Bobina Tesla',
                description: 'Energia elétrica concentrada',
                cost: 130,
                requirements: { level: 2 },
                bonuses: {
                    damage: 15,
                    range: 15,
                    attackSpeed: -200,
                    chainTargets: 1,
                    chainDamageReduction: 0.1,
                    electricField: 50
                }
            },
            LIGHTNING_STORM: {
                name: 'Senhor da Tempestade',
                description: 'Controla tempestades elétricas',
                cost: 130,
                requirements: { level: 2 },
                bonuses: {
                    damage: 10,
                    range: 25,
                    attackSpeed: -400,
                    chainTargets: 2,
                    chainDamageReduction: -0.1,
                    stormRadius: 80
                }
            }
        },
        
        specializations: {
            // Da Tesla
            LIGHTNING_COIL: {
                name: 'Bobina Suprema',
                description: 'Energia elétrica pura e devastadora',
                cost: 170,
                requirements: { evolution: 'LIGHTNING_TESLA', level: 3 },
                bonuses: {
                    damage: 30,
                    range: 15,
                    attackSpeed: -400,
                    chainTargets: 2,
                    chainDamageReduction: 0.1,
                    electricField: 30,
                    overcharge: true
                }
            },
            LIGHTNING_GENERATOR: {
                name: 'Gerador Arcano',
                description: 'Gera energia para outras torres',
                cost: 170,
                requirements: { evolution: 'LIGHTNING_TESLA', level: 3 },
                bonuses: {
                    damage: 10,
                    range: 5,
                    attackSpeed: -600,
                    chainTargets: 1,
                    energyBoost: 1.3,
                    powerRadius: 100
                }
            },
            LIGHTNING_PLASMA: {
                name: 'Canhão de Plasma',
                description: 'Energia de plasma devastadora',
                cost: 170,
                requirements: { evolution: 'LIGHTNING_TESLA', level: 3 },
                bonuses: {
                    damage: 20,
                    range: 20,
                    chainTargets: 0,
                    chainDamageReduction: 0.3,
                    plasmaBurn: 8,
                    plasmaDuration: 5000
                }
            },
            
            // Da Tempestade
            LIGHTNING_THUNDER: {
                name: 'Senhor do Trovão',
                description: 'Trovões ensurdecedores',
                cost: 170,
                requirements: { evolution: 'LIGHTNING_STORM', level: 3 },
                bonuses: {
                    damage: 45,
                    range: 20,
                    attackSpeed: -700,
                    chainTargets: 2,
                    chainDamageReduction: 0.1,
                    thunderStun: 2000,
                    shockwave: 100
                }
            },
            LIGHTNING_HURRICANE: {
                name: 'Olho do Furacão',
                description: 'Furacões elétricos devastadores',
                cost: 170,
                requirements: { evolution: 'LIGHTNING_STORM', level: 3 },
                bonuses: {
                    damage: 20,
                    range: 30,
                    attackSpeed: -500,
                    chainTargets: 4,
                    chainDamageReduction: -0.2,
                    hurricaneEffect: true,
                    windDamage: 20
                }
            },
            LIGHTNING_DIVINE: {
                name: 'Raio Divino',
                description: 'Poder dos deuses',
                cost: 170,
                requirements: { evolution: 'LIGHTNING_STORM', level: 3 },
                bonuses: {
                    damage: 75,
                    range: 15,
                    chainTargets: 0,
                    chainDamageReduction: 0.3,
                    divineStrike: true,
                    holyDamage: 1.5
                }
            }
        }
    }
};

// Função para aplicar evolução
function applyTowerEvolution(tower, evolutionType) {
    const baseType = tower.type.split('_')[0];
    const evolution = TOWER_EVOLUTION[baseType]?.evolutions[evolutionType] || 
                     TOWER_EVOLUTION[baseType]?.specializations[evolutionType];
    
    if (!evolution) return false;
    
    // Aplica bônus
    Object.keys(evolution.bonuses).forEach(stat => {
        if (tower[stat] !== undefined) {
            tower[stat] += evolution.bonuses[stat];
        } else {
            tower[stat] = evolution.bonuses[stat];
        }
    });
    
    tower.type = evolutionType;
    tower.name = evolution.name;
    tower.description = evolution.description;
    tower.tier = tower.tier + 1;
    
    return true;
}

// Função para verificar se pode evoluir
function canEvolve(tower, evolutionType) {
    const baseType = tower.type.split('_')[0];
    const evolution = TOWER_EVOLUTION[baseType]?.evolutions[evolutionType] || 
                     TOWER_EVOLUTION[baseType]?.specializations[evolutionType];
    
    if (!evolution) return false;
    
    const requirements = evolution.requirements;
    
    // Verifica nível
    if (requirements.level && tower.level < requirements.level) return false;
    
    // Verifica evolução anterior
    if (requirements.evolution && tower.type !== requirements.evolution) return false;
    
    return true;
}

// Função para obter evoluções disponíveis
function getAvailableEvolutions(tower) {
    const baseType = tower.type.split('_')[0];
    const towerEvolution = TOWER_EVOLUTION[baseType];
    
    if (!towerEvolution) return [];
    
    const available = [];
    
    // Verifica evoluções básicas
    Object.keys(towerEvolution.evolutions).forEach(evolutionType => {
        if (canEvolve(tower, evolutionType)) {
            available.push({
                type: evolutionType,
                ...towerEvolution.evolutions[evolutionType]
            });
        }
    });
    
    // Verifica especializações
    Object.keys(towerEvolution.specializations).forEach(evolutionType => {
        if (canEvolve(tower, evolutionType)) {
            available.push({
                type: evolutionType,
                ...towerEvolution.specializations[evolutionType]
            });
        }
    });
    
    return available;
} 