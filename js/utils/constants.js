/**
 * Configurações globais do jogo
 * Balanceadas para gameplay estratégico e desafiador
 */

// Configurações do canvas e jogo
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Configurações do jogador - Mais restritivas
    PLAYER: {
        INITIAL_GOLD: 150,      // Reduzido de 500 para 150
        INITIAL_HEALTH: 15,     // Reduzido de 20 para 15
        MAX_HEALTH: 20
    },
    
    // Caminho dos inimigos
    PATH: [
        { x: 0, y: 300 },
        { x: 150, y: 300 },
        { x: 150, y: 200 },
        { x: 300, y: 200 },
        { x: 300, y: 400 },
        { x: 450, y: 400 },
        { x: 450, y: 150 },
        { x: 600, y: 150 },
        { x: 600, y: 350 },
        { x: 750, y: 350 },
        { x: 800, y: 350 }
    ]
};

// Tipos de torres - Sistema de Evolução Completo
const TOWER_TYPES = {
    // ========== TORRE ARQUEIRO ==========
    ARCHER: {
        id: 'archer',
        name: 'Arqueiro Novato',
        description: 'Torre básica com ataques rápidos',
        tier: 1,
        cost: 80,
        damage: 12,
        range: 90,
        attackSpeed: 1200,
        projectileSpeed: 250,
        size: 24,
        color: '#8B4513',
        borderColor: '#654321',
        icon: '🏹',
        upgradeCost: 60,        // Aumentado
        upgradeDamage: 8,       // Menor incremento
        upgradeRange: 15,
        maxLevel: 3,
        evolutions: [
            { cost: 200, damage: 20, range: 110, icon: '🏹' },
            { cost: 350, damage: 30, range: 130, icon: '🏹' }
        ]
        upgradeCost: 60,
        evolvesTo: ['ARCHER_VETERAN', 'ARCHER_HUNTER']
    },
    
    // Evolução 1: Veterano
    ARCHER_VETERAN: {
        id: 'archer_veteran',
        name: 'Arqueiro Veterano',
        description: 'Arqueiro experiente com maior precisão',
        tier: 2,
        cost: 140,
        damage: 22,
        range: 110,
        attackSpeed: 1000,
        projectileSpeed: 300,
        accuracy: 0.95,
        color: '#A0522D',
        borderColor: '#8B4513',
        icon: '🎯',
        upgradeCost: 80,
        evolvesTo: ['ARCHER_SNIPER', 'ARCHER_RAPID', 'ARCHER_PIERCING']
    },
    
    // Evolução 2: Caçador
    ARCHER_HUNTER: {
        id: 'archer_hunter',
        name: 'Caçador Élfico',
        description: 'Especialista em rastreamento e tiros múltiplos',
        tier: 2,
        cost: 140,
        damage: 18,
        range: 100,
        attackSpeed: 900,
        projectileSpeed: 280,
        multiShot: 2,
        color: '#228B22',
        borderColor: '#006400',
        icon: '🧝',
        upgradeCost: 80,
        evolvesTo: ['ARCHER_RANGER', 'ARCHER_VOLLEY', 'ARCHER_TRACKER']
    },
    
    // Especializações do Veterano
    ARCHER_SNIPER: {
        id: 'archer_sniper',
        name: 'Franco-atirador',
        description: 'Alcance extremo e dano crítico',
        tier: 3,
        cost: 220,
        damage: 45,
        range: 180,
        attackSpeed: 1800,
        projectileSpeed: 400,
        criticalChance: 0.3,
        criticalMultiplier: 2.5,
        color: '#4B0082',
        borderColor: '#2F0052',
        icon: '🎯',
        upgradeCost: 120
    },
    
    ARCHER_RAPID: {
        id: 'archer_rapid',
        name: 'Atirador Rápido',
        description: 'Velocidade de ataque extrema',
        tier: 3,
        cost: 220,
        damage: 16,
        range: 95,
        attackSpeed: 400,
        projectileSpeed: 350,
        burstShots: 3,
        color: '#FF6347',
        borderColor: '#DC143C',
        icon: '💨',
        upgradeCost: 120
    },
    
    ARCHER_PIERCING: {
        id: 'archer_piercing',
        name: 'Arqueiro Perfurante',
        description: 'Flechas atravessam múltiplos inimigos',
        tier: 3,
        cost: 220,
        damage: 28,
        range: 120,
        attackSpeed: 1200,
        projectileSpeed: 320,
        piercing: 3,
        piercingDamageReduction: 0.8,
        color: '#DAA520',
        borderColor: '#B8860B',
        icon: '⚡',
        upgradeCost: 120
    },
    
    // Especializações do Caçador
    ARCHER_RANGER: {
        id: 'archer_ranger',
        name: 'Ranger Élfico',
        description: 'Mestre em combate à distância',
        tier: 3,
        cost: 220,
        damage: 25,
        range: 130,
        attackSpeed: 800,
        projectileSpeed: 300,
        multiShot: 3,
        natureBonus: 1.2,
        color: '#32CD32',
        borderColor: '#228B22',
        icon: '🌿',
        upgradeCost: 120
    },
    
    ARCHER_VOLLEY: {
        id: 'archer_volley',
        name: 'Mestre da Saraivada',
        description: 'Dispara rajadas devastadoras',
        tier: 3,
        cost: 220,
        damage: 20,
        range: 110,
        attackSpeed: 2000,
        projectileSpeed: 280,
        volleyShots: 5,
        volleySpread: 30,
        color: '#FF8C00',
        borderColor: '#FF6347',
        icon: '🌟',
        upgradeCost: 120
    },
    
    ARCHER_TRACKER: {
        id: 'archer_tracker',
        name: 'Rastreador Sombrio',
        description: 'Flechas teleguiadas e veneno',
        tier: 3,
        cost: 220,
        damage: 22,
        range: 115,
        attackSpeed: 1100,
        projectileSpeed: 250,
        homingShots: true,
        poisonChance: 0.4,
        color: '#8B008B',
        borderColor: '#4B0082',
        icon: '🕷️',
        upgradeCost: 120
    },

    // ========== TORRE MAGO ==========
    MAGE: {
        id: 'mage',
        name: 'Aprendiz de Mago',
        description: 'Ataques mágicos com dano em área',
        tier: 1,
        cost: 120,
        damage: 20,
        range: 100,
        attackSpeed: 1800,
        projectileSpeed: 200,
        size: 24,
        splashRadius: 40,
        color: '#4B0082',
        borderColor: '#2F0052',
        icon: '🔮',
        upgradeCost: 90,
        upgradeDamage: 12,
        upgradeRange: 20,
        maxLevel: 3,
        evolutions: [
            { cost: 250, damage: 35, range: 120, icon: '🔮' },
            { cost: 400, damage: 50, range: 140, icon: '🔮' }
        ]
    },
    
    // Evolução 1: Erudito
    MAGE_SCHOLAR: {
        id: 'mage_scholar',
        name: 'Erudito Arcano',
        description: 'Mago estudioso com magias poderosas',
        tier: 2,
        cost: 210,
        damage: 35,
        range: 120,
        attackSpeed: 1600,
        projectileSpeed: 220,
        splashRadius: 50,
        manaEfficiency: 1.3,
        color: '#6A5ACD',
        borderColor: '#483D8B',
        icon: '📚',
        upgradeCost: 110,
        evolvesTo: ['MAGE_ARCHMAGE', 'MAGE_ELEMENTALIST', 'MAGE_NECROMANCER']
    },
    
    // Evolução 2: Mago de Batalha
    MAGE_BATTLE: {
        id: 'mage_battle',
        name: 'Mago de Batalha',
        description: 'Especialista em combate direto',
        tier: 2,
        cost: 210,
        damage: 30,
        range: 110,
        attackSpeed: 1400,
        projectileSpeed: 250,
        splashRadius: 45,
        armorPenetration: 0.3,
        color: '#DC143C',
        borderColor: '#8B0000',
        icon: '⚔️',
        upgradeCost: 110,
        evolvesTo: ['MAGE_WARMAGE', 'MAGE_DESTROYER', 'MAGE_SPELLSWORD']
    },
    
    // Especializações do Erudito
    MAGE_ARCHMAGE: {
        id: 'mage_archmage',
        name: 'Arquimago',
        description: 'Mestre supremo das artes arcanas',
        tier: 3,
        cost: 320,
        damage: 60,
        range: 150,
        attackSpeed: 1500,
        projectileSpeed: 200,
        splashRadius: 70,
        chainLightning: 3,
        manaRegeneration: true,
        color: '#9370DB',
        borderColor: '#663399',
        icon: '🧙‍♂️',
        upgradeCost: 150
    },
    
    MAGE_ELEMENTALIST: {
        id: 'mage_elementalist',
        name: 'Elementalista',
        description: 'Controla os elementos da natureza',
        tier: 3,
        cost: 320,
        damage: 45,
        range: 130,
        attackSpeed: 1300,
        projectileSpeed: 230,
        splashRadius: 60,
        elementalRotation: ['fire', 'ice', 'lightning'],
        color: '#FF4500',
        borderColor: '#FF6347',
        icon: '🌪️',
        upgradeCost: 150
    },
    
    MAGE_NECROMANCER: {
        id: 'mage_necromancer',
        name: 'Necromante',
        description: 'Mestre da magia sombria e morte',
        tier: 3,
        cost: 320,
        damage: 50,
        range: 125,
        attackSpeed: 1600,
        projectileSpeed: 180,
        splashRadius: 55,
        lifeDrain: 0.3,
        curseEffect: true,
        color: '#2F4F4F',
        borderColor: '#000000',
        icon: '💀',
        upgradeCost: 150
    },
    
    // Especializações do Mago de Batalha
    MAGE_WARMAGE: {
        id: 'mage_warmage',
        name: 'Mago de Guerra',
        description: 'Especialista em destruição em massa',
        tier: 3,
        cost: 320,
        damage: 55,
        range: 120,
        attackSpeed: 1200,
        projectileSpeed: 280,
        splashRadius: 65,
        explosiveShots: true,
        armorPenetration: 0.5,
        color: '#B22222',
        borderColor: '#8B0000',
        icon: '💥',
        upgradeCost: 150
    },
    
    MAGE_DESTROYER: {
        id: 'mage_destroyer',
        name: 'Destruidor Arcano',
        description: 'Poder destrutivo absoluto',
        tier: 3,
        cost: 320,
        damage: 70,
        range: 110,
        attackSpeed: 1800,
        projectileSpeed: 200,
        splashRadius: 80,
        devastation: true,
        color: '#8B0000',
        borderColor: '#4B0000',
        icon: '🔥',
        upgradeCost: 150
    },
    
    MAGE_SPELLSWORD: {
        id: 'mage_spellsword',
        name: 'Lâmina Mística',
        description: 'Combina magia e combate corpo a corpo',
        tier: 3,
        cost: 320,
        damage: 40,
        range: 100,
        attackSpeed: 1000,
        projectileSpeed: 300,
        splashRadius: 50,
        meleeBonus: 2.0,
        magicSword: true,
        color: '#4169E1',
        borderColor: '#191970',
        icon: '🗡️',
        upgradeCost: 150
    },

    // ========== MAGO DO GELO ==========
    ICE_MAGE: {
        id: 'ice_mage',
        name: 'Aprendiz do Gelo',
        description: 'Congela inimigos e reduz velocidade',
        tier: 1,
        cost: 150,
        damage: 15,
        range: 85,
        attackSpeed: 2000,
        projectileSpeed: 180,
        size: 24,
        slowEffect: 0.4,
        slowDuration: 2500,
        color: '#87CEEB',
        borderColor: '#4682B4',
        icon: '❄️',
        upgradeCost: 110,
        evolvesTo: ['ICE_MAGE_FROST', 'ICE_MAGE_BLIZZARD']
    },
    
    // Evolução 1: Mago do Gelo Polar
    ICE_MAGE_FROST: {
        id: 'ice_mage_frost',
        name: 'Mago do Gelo Polar',
        description: 'Especialista em controle de gelo',
        tier: 2,
        cost: 260,
        damage: 25,
        range: 105,
        attackSpeed: 1800,
        projectileSpeed: 200,
        slowEffect: 0.6,
        slowDuration: 3500,
        frostAura: 50,
        color: '#B0E0E6',
        borderColor: '#87CEEB',
        icon: '🧊',
        upgradeCost: 130,
        evolvesTo: ['ICE_MAGE_GLACIER', 'ICE_MAGE_CRYSTAL', 'ICE_MAGE_ABSOLUTE']
    },
    
    // Evolução 2: Senhor da Nevasca
    ICE_MAGE_BLIZZARD: {
        id: 'ice_mage_blizzard',
        name: 'Senhor da Nevasca',
        description: 'Controla tempestades de gelo',
        tier: 2,
        cost: 260,
        damage: 20,
        range: 95,
        attackSpeed: 1600,
        projectileSpeed: 160,
        slowEffect: 0.5,
        slowDuration: 3000,
        blizzardArea: 80,
        color: '#F0F8FF',
        borderColor: '#B0C4DE',
        icon: '🌨️',
        upgradeCost: 130,
        evolvesTo: ['ICE_MAGE_STORM', 'ICE_MAGE_AVALANCHE', 'ICE_MAGE_WINTER']
    },
    
    // Especializações do Gelo Polar
    ICE_MAGE_GLACIER: {
        id: 'ice_mage_glacier',
        name: 'Guardião da Geleira',
        description: 'Cria barreiras de gelo permanentes',
        tier: 3,
        cost: 390,
        damage: 40,
        range: 120,
        attackSpeed: 1700,
        projectileSpeed: 180,
        slowEffect: 0.8,
        slowDuration: 5000,
        iceWalls: true,
        frostAura: 70,
        color: '#E0FFFF',
        borderColor: '#B0E0E6',
        icon: '🏔️',
        upgradeCost: 180
    },
    
    ICE_MAGE_CRYSTAL: {
        id: 'ice_mage_crystal',
        name: 'Mestre dos Cristais',
        description: 'Cristais de gelo que explodem',
        tier: 3,
        cost: 390,
        damage: 35,
        range: 110,
        attackSpeed: 1500,
        projectileSpeed: 200,
        slowEffect: 0.7,
        slowDuration: 4000,
        crystalExplosion: 60,
        shardDamage: 20,
        color: '#ADD8E6',
        borderColor: '#87CEEB',
        icon: '💎',
        upgradeCost: 180
    },
    
    ICE_MAGE_ABSOLUTE: {
        id: 'ice_mage_absolute',
        name: 'Zero Absoluto',
        description: 'Congela instantaneamente qualquer inimigo',
        tier: 3,
        cost: 390,
        damage: 30,
        range: 100,
        attackSpeed: 2000,
        projectileSpeed: 220,
        slowEffect: 0.95,
        slowDuration: 6000,
        instantFreeze: 0.2,
        absoluteZero: true,
        color: '#F0F8FF',
        borderColor: '#E6E6FA',
        icon: '🔷',
        upgradeCost: 180
    },
    
    // Especializações da Nevasca
    ICE_MAGE_STORM: {
        id: 'ice_mage_storm',
        name: 'Senhor da Tempestade',
        description: 'Tempestades de gelo devastadoras',
        tier: 3,
        cost: 390,
        damage: 45,
        range: 130,
        attackSpeed: 1400,
        projectileSpeed: 150,
        slowEffect: 0.6,
        slowDuration: 4500,
        stormRadius: 100,
        continuousDamage: 5,
        color: '#4682B4',
        borderColor: '#2F4F4F',
        icon: '⛈️',
        upgradeCost: 180
    },
    
    ICE_MAGE_AVALANCHE: {
        id: 'ice_mage_avalanche',
        name: 'Mestre da Avalanche',
        description: 'Causa avalanches devastadoras',
        tier: 3,
        cost: 390,
        damage: 50,
        range: 115,
        attackSpeed: 1800,
        projectileSpeed: 140,
        slowEffect: 0.7,
        slowDuration: 4000,
        avalancheChain: true,
        knockback: 50,
        color: '#708090',
        borderColor: '#2F4F4F',
        icon: '🏔️',
        upgradeCost: 180
    },
    
    ICE_MAGE_WINTER: {
        id: 'ice_mage_winter',
        name: 'Eterno Inverno',
        description: 'Traz o inverno eterno ao campo',
        tier: 3,
        cost: 390,
        damage: 25,
        range: 140,
        attackSpeed: 1600,
        projectileSpeed: 160,
        slowEffect: 0.8,
        slowDuration: 8000,
        winterAura: 150,
        globalSlow: 0.3,
        color: '#F5F5F5',
        borderColor: '#DCDCDC',
        icon: '❄️',
        upgradeCost: 180
    },

    // ========== TORRE VENENOSA ==========
    POISON_TOWER: {
        id: 'poison_tower',
        name: 'Alquimista Novato',
        description: 'Causa dano contínuo por veneno',
        tier: 1,
        cost: 100,
        damage: 8,
        range: 75,
        attackSpeed: 1500,
        projectileSpeed: 160,
        size: 24,
        poisonDamage: 3,
        poisonDuration: 4000,
        poisonTick: 500,
        color: '#9ACD32',
        borderColor: '#6B8E23',
        icon: '☠️',
        upgradeCost: 75,
        evolvesTo: ['POISON_ALCHEMIST', 'POISON_PLAGUE']
    },
    
    // Evolução 1: Alquimista
    POISON_ALCHEMIST: {
        id: 'poison_alchemist',
        name: 'Alquimista Mestre',
        description: 'Especialista em poções e venenos',
        tier: 2,
        cost: 175,
        damage: 12,
        range: 90,
        attackSpeed: 1300,
        projectileSpeed: 240,
        poisonDamage: 6,
        poisonDuration: 5000,
        acidSplash: 30,
        color: '#ADFF2F',
        borderColor: '#9ACD32',
        icon: '🧪',
        upgradeCost: 95,
        evolvesTo: ['POISON_PLAGUE', 'POISON_ACID', 'POISON_TOXIC']
    },
    
    // Evolução 2: Druida Sombrio
    POISON_DRUID: {
        id: 'poison_druid',
        name: 'Druida Sombrio',
        description: 'Controla plantas venenosas',
        tier: 2,
        cost: 175,
        damage: 10,
        range: 85,
        attackSpeed: 1400,
        projectileSpeed: 200,
        poisonDamage: 5,
        poisonDuration: 6000,
        thornAura: 40,
        color: '#556B2F',
        borderColor: '#2F4F2F',
        icon: '🌿',
        upgradeCost: 95,
        evolvesTo: ['POISON_NATURE', 'POISON_SPORE', 'POISON_VINE']
    },
    
    // Especializações do Alquimista
    POISON_PLAGUE: {
        id: 'poison_plague',
        name: 'Senhor da Peste',
        description: 'Espalha doenças mortais',
        tier: 3,
        cost: 270,
        damage: 18,
        range: 105,
        attackSpeed: 1200,
        projectileSpeed: 250,
        poisonDamage: 12,
        poisonDuration: 8000,
        plagueSpread: 60,
        diseaseStack: true,
        color: '#8B4513',
        borderColor: '#654321',
        icon: '🦠',
        upgradeCost: 140
    },
    
    POISON_ACID: {
        id: 'poison_acid',
        name: 'Mestre do Ácido',
        description: 'Ácido que corrói armaduras',
        tier: 3,
        cost: 270,
        damage: 20,
        range: 95,
        attackSpeed: 1100,
        projectileSpeed: 260,
        poisonDamage: 8,
        poisonDuration: 5000,
        armorCorrosion: 0.4,
        acidPool: 50,
        color: '#FFFF00',
        borderColor: '#FFD700',
        icon: '🧪',
        upgradeCost: 140
    },
    
    POISON_TOXIC: {
        id: 'poison_toxic',
        name: 'Toxicologista',
        description: 'Venenos extremamente letais',
        tier: 3,
        cost: 270,
        damage: 15,
        range: 100,
        attackSpeed: 1400,
        projectileSpeed: 230,
        poisonDamage: 15,
        poisonDuration: 10000,
        toxicCloud: 70,
        lethalPoison: 0.1,
        color: '#9932CC',
        borderColor: '#8B008B',
        icon: '☣️',
        upgradeCost: 140
    },
    
    // Especializações do Druida
    POISON_NATURE: {
        id: 'poison_nature',
        name: 'Guardião da Natureza',
        description: 'Controla a natureza venenosa',
        tier: 3,
        cost: 270,
        damage: 16,
        range: 110,
        attackSpeed: 1300,
        projectileSpeed: 210,
        poisonDamage: 10,
        poisonDuration: 7000,
        entanglement: true,
        natureRegeneration: true,
        color: '#228B22',
        borderColor: '#006400',
        icon: '🌳',
        upgradeCost: 140
    },
    
    POISON_SPORE: {
        id: 'poison_spore',
        name: 'Mestre dos Esporos',
        description: 'Esporos tóxicos que se espalham',
        tier: 3,
        cost: 270,
        damage: 12,
        range: 120,
        attackSpeed: 1500,
        projectileSpeed: 180,
        poisonDamage: 8,
        poisonDuration: 6000,
        sporeCloud: 80,
        sporeReplication: true,
        color: '#8FBC8F',
        borderColor: '#556B2F',
        icon: '🍄',
        upgradeCost: 140
    },
    
    POISON_VINE: {
        id: 'poison_vine',
        name: 'Senhor das Vinhas',
        description: 'Vinhas venenosas que prendem',
        tier: 3,
        cost: 270,
        damage: 14,
        range: 100,
        attackSpeed: 1600,
        projectileSpeed: 160,
        poisonDamage: 9,
        poisonDuration: 8000,
        vineEntangle: true,
        vineSpread: 90,
        color: '#2E8B57',
        borderColor: '#006400',
        icon: '🌿',
        upgradeCost: 140
    },

    // ========== CANHÃO ==========
    CANNON: {
        id: 'cannon',
        name: 'Canhão de Ferro',
        description: 'Alto dano em área, ataque lento',
        tier: 1,
        cost: 200,
        damage: 45,
        range: 110,
        attackSpeed: 3000,
        projectileSpeed: 150,
        splashRadius: 60,
        color: '#696969',
        borderColor: '#2F4F4F',
        icon: '💣',
        upgradeCost: 150,
        evolvesTo: ['CANNON_SIEGE', 'CANNON_MORTAR']
    },
    
    // Evolução 1: Canhão de Cerco
    CANNON_SIEGE: {
        id: 'cannon_siege',
        name: 'Canhão de Cerco',
        description: 'Especializado em destruição de estruturas',
        tier: 2,
        cost: 350,
        damage: 70,
        range: 130,
        attackSpeed: 2800,
        projectileSpeed: 180,
        splashRadius: 75,
        structureDamage: 2.0,
        color: '#2F4F4F',
        borderColor: '#000000',
        icon: '🏰',
        upgradeCost: 200,
        evolvesTo: ['CANNON_FORTRESS', 'CANNON_DEMOLISHER', 'CANNON_BALLISTA']
    },
    
    // Evolução 2: Morteiro
    CANNON_MORTAR: {
        id: 'cannon_mortar',
        name: 'Morteiro Pesado',
        description: 'Ataques em arco com grande área',
        tier: 2,
        cost: 350,
        damage: 60,
        range: 140,
        attackSpeed: 3200,
        projectileSpeed: 120,
        splashRadius: 90,
        arcShot: true,
        color: '#8B4513',
        borderColor: '#654321',
        icon: '🎯',
        upgradeCost: 200,
        evolvesTo: ['CANNON_ARTILLERY', 'CANNON_BOMBARD', 'CANNON_TREBUCHET']
    },
    
    // Especializações do Cerco
    CANNON_FORTRESS: {
        id: 'cannon_fortress',
        name: 'Canhão da Fortaleza',
        description: 'Poder destrutivo supremo',
        tier: 3,
        cost: 550,
        damage: 120,
        range: 150,
        attackSpeed: 2500,
        projectileSpeed: 200,
        splashRadius: 100,
        fortressBreaker: true,
        armorPenetration: 0.8,
        color: '#000000',
        borderColor: '#2F2F2F',
        icon: '🏰',
        upgradeCost: 250
    },
    
    CANNON_DEMOLISHER: {
        id: 'cannon_demolisher',
        name: 'Demolidor',
        description: 'Especialista em demolição total',
        tier: 3,
        cost: 550,
        damage: 100,
        range: 135,
        attackSpeed: 2200,
        projectileSpeed: 160,
        splashRadius: 120,
        demolition: true,
        chainExplosion: 3,
        color: '#8B0000',
        borderColor: '#4B0000',
        icon: '💥',
        upgradeCost: 250
    },
    
    CANNON_BALLISTA: {
        id: 'cannon_ballista',
        name: 'Balista Gigante',
        description: 'Projéteis perfurantes de longo alcance',
        tier: 3,
        cost: 550,
        damage: 90,
        range: 180,
        attackSpeed: 2000,
        projectileSpeed: 300,
        splashRadius: 50,
        piercing: 5,
        giantBolt: true,
        color: '#654321',
        borderColor: '#2F4F2F',
        icon: '🏹',
        upgradeCost: 250
    },
    
    // Especializações do Morteiro
    CANNON_ARTILLERY: {
        id: 'cannon_artillery',
        name: 'Artilharia Pesada',
        description: 'Bombardeio de área devastador',
        tier: 3,
        cost: 550,
        damage: 80,
        range: 160,
        attackSpeed: 3000,
        projectileSpeed: 100,
        splashRadius: 130,
        artilleryBarrage: 3,
        delayedExplosion: true,
        color: '#A0522D',
        borderColor: '#8B4513',
        icon: '🎯',
        upgradeCost: 250
    },
    
    CANNON_BOMBARD: {
        id: 'cannon_bombard',
        name: 'Bombardeiro',
        description: 'Múltiplas explosões em sequência',
        tier: 3,
        cost: 550,
        damage: 70,
        range: 145,
        attackSpeed: 2800,
        projectileSpeed: 110,
        splashRadius: 110,
        clusterBombs: 5,
        bombardment: true,
        color: '#B22222',
        borderColor: '#8B0000',
        icon: '💣',
        upgradeCost: 250
    },
    
    CANNON_TREBUCHET: {
        id: 'cannon_trebuchet',
        name: 'Trebuchet Colossal',
        description: 'Alcance máximo e dano devastador',
        tier: 3,
        cost: 550,
        damage: 150,
        range: 200,
        attackSpeed: 4000,
        projectileSpeed: 80,
        splashRadius: 140,
        colossalStone: true,
        earthquakeEffect: true,
        color: '#8B4513',
        borderColor: '#654321',
        icon: '🏗️',
        upgradeCost: 250
    },

    // ========== TORRE ELÉTRICA ==========
    LIGHTNING: {
        id: 'lightning',
        name: 'Condutor Básico',
        description: 'Ataques em cadeia entre inimigos',
        tier: 1,
        cost: 180,
        damage: 25,
        range: 95,
        attackSpeed: 2200,
        chainTargets: 2,
        chainDamageReduction: 0.6,
        color: '#FFD700',
        borderColor: '#DAA520',
        icon: '⚡',
        upgradeCost: 130,
        evolvesTo: ['LIGHTNING_TESLA', 'LIGHTNING_STORM']
    },
    
    // Evolução 1: Bobina Tesla
    LIGHTNING_TESLA: {
        id: 'lightning_tesla',
        name: 'Bobina Tesla',
        description: 'Energia elétrica concentrada',
        tier: 2,
        cost: 310,
        damage: 40,
        range: 110,
        attackSpeed: 2000,
        chainTargets: 3,
        chainDamageReduction: 0.7,
        electricField: 50,
        color: '#00BFFF',
        borderColor: '#0080FF',
        icon: '⚡',
        upgradeCost: 170,
        evolvesTo: ['LIGHTNING_COIL', 'LIGHTNING_GENERATOR', 'LIGHTNING_PLASMA']
    },
    
    // Evolução 2: Senhor da Tempestade
    LIGHTNING_STORM: {
        id: 'lightning_storm',
        name: 'Senhor da Tempestade',
        description: 'Controla tempestades elétricas',
        tier: 2,
        cost: 310,
        damage: 35,
        range: 120,
        attackSpeed: 1800,
        chainTargets: 4,
        chainDamageReduction: 0.5,
        stormRadius: 80,
        color: '#9370DB',
        borderColor: '#663399',
        icon: '🌩️',
        upgradeCost: 170,
        evolvesTo: ['LIGHTNING_THUNDER', 'LIGHTNING_HURRICANE', 'LIGHTNING_DIVINE']
    },
    
    // Especializações da Tesla
    LIGHTNING_COIL: {
        id: 'lightning_coil',
        name: 'Bobina Suprema',
        description: 'Energia elétrica pura e devastadora',
        tier: 3,
        cost: 480,
        damage: 70,
        range: 125,
        attackSpeed: 1800,
        chainTargets: 5,
        chainDamageReduction: 0.8,
        electricField: 80,
        overcharge: true,
        color: '#00FFFF',
        borderColor: '#00BFFF',
        icon: '⚡',
        upgradeCost: 220
    },
    
    LIGHTNING_GENERATOR: {
        id: 'lightning_generator',
        name: 'Gerador Arcano',
        description: 'Gera energia para outras torres',
        tier: 3,
        cost: 480,
        damage: 50,
        range: 115,
        attackSpeed: 1600,
        chainTargets: 4,
        chainDamageReduction: 0.7,
        energyBoost: 1.3,
        powerRadius: 100,
        color: '#FFD700',
        borderColor: '#FFA500',
        icon: '🔋',
        upgradeCost: 220
    },
    
    LIGHTNING_PLASMA: {
        id: 'lightning_plasma',
        name: 'Canhão de Plasma',
        description: 'Energia de plasma devastadora',
        tier: 3,
        cost: 480,
        damage: 60,
        range: 130,
        attackSpeed: 2000,
        chainTargets: 3,
        chainDamageReduction: 0.9,
        plasmaBurn: 8,
        plasmaDuration: 5000,
        color: '#FF00FF',
        borderColor: '#8B008B',
        icon: '🌟',
        upgradeCost: 220
    },
    
    // Especializações da Tempestade
    LIGHTNING_THUNDER: {
        id: 'lightning_thunder',
        name: 'Senhor do Trovão',
        description: 'Trovões ensurdecedores',
        tier: 3,
        cost: 480,
        damage: 80,
        range: 140,
        attackSpeed: 1500,
        chainTargets: 6,
        chainDamageReduction: 0.6,
        thunderStun: 2000,
        shockwave: 100,
        color: '#4B0082',
        borderColor: '#2F0052',
        icon: '⛈️',
        upgradeCost: 220
    },
    
    LIGHTNING_HURRICANE: {
        id: 'lightning_hurricane',
        name: 'Olho do Furacão',
        description: 'Furacões elétricos devastadores',
        tier: 3,
        cost: 480,
        damage: 55,
        range: 150,
        attackSpeed: 1700,
        chainTargets: 8,
        chainDamageReduction: 0.4,
        hurricaneEffect: true,
        windDamage: 20,
        color: '#708090',
        borderColor: '#2F4F4F',
        icon: '🌪️',
        upgradeCost: 220
    },
    
    LIGHTNING_DIVINE: {
        id: 'lightning_divine',
        name: 'Raio Divino',
        description: 'Poder dos deuses',
        tier: 3,
        cost: 480,
        damage: 100,
        range: 135,
        attackSpeed: 2200,
        chainTargets: 4,
        chainDamageReduction: 0.9,
        divineStrike: true,
        holyDamage: 1.5,
        color: '#FFFACD',
        borderColor: '#FFD700',
        icon: '✨',
        upgradeCost: 220
    }
};

// Tipos de inimigos - Vida aumentada e recompensas ajustadas + Novos Inimigos Élite
const ENEMY_TYPES = {
    // ========== INIMIGOS BÁSICOS ==========
    ORC: {
        id: 'orc',
        name: 'Orc',
        health: 45,
        speed: 60,
        damage: 2,
        goldReward: 8,
        scoreValue: 10,
        color: '#228B22',
        borderColor: '#006400',
        size: 12,
        tier: 1
    },
    
    SKELETON: {
        id: 'skeleton',
        name: 'Esqueleto',
        health: 25,
        speed: 90,
        damage: 1,
        goldReward: 6,
        scoreValue: 15,
        color: '#F5F5DC',
        borderColor: '#D3D3D3',
        size: 10,
        tier: 1
    },
    
    TROLL: {
        id: 'troll',
        name: 'Troll',
        health: 120,
        speed: 35,
        damage: 4,
        goldReward: 15,
        scoreValue: 25,
        color: '#8B4513',
        borderColor: '#654321',
        size: 16,
        tier: 2
    },
    
    DRAGON: {
        id: 'dragon',
        name: 'Dragão',
        health: 300,
        speed: 25,
        damage: 8,
        goldReward: 40,
        scoreValue: 100,
        color: '#DC143C',
        borderColor: '#8B0000',
        size: 20,
        isFlying: true,
        tier: 3
    },
    
    LICH: {
        id: 'lich',
        name: 'Lich',
        health: 180,
        speed: 45,
        damage: 6,
        goldReward: 25,
        scoreValue: 50,
        color: '#4B0082',
        borderColor: '#2F0052',
        size: 14,
        magicResistance: 0.3,
        tier: 2
    },
    
    DAEMON: {
        id: 'daemon',
        name: 'Daemon',
        health: 220,
        speed: 55,
        damage: 7,
        goldReward: 30,
        scoreValue: 75,
        color: '#8B0000',
        borderColor: '#4B0000',
        size: 18,
        fireResistance: 0.4,
        tier: 3
    },

    // ========== INIMIGOS ÉLITE (TIER 3+) ==========
    ORC_WARLORD: {
        id: 'orc_warlord',
        name: 'Senhor da Guerra Orc',
        health: 400,
        speed: 45,
        damage: 12,
        goldReward: 50,
        scoreValue: 150,
        color: '#2F4F2F',
        borderColor: '#1C3A1C',
        size: 18,
        armor: 5,
        leadership: true, // Aumenta stats de orcs próximos
        tier: 3
    },
    
    SKELETON_KING: {
        id: 'skeleton_king',
        name: 'Rei Esqueleto',
        health: 350,
        speed: 70,
        damage: 10,
        goldReward: 45,
        scoreValue: 120,
        color: '#FFFACD',
        borderColor: '#F0E68C',
        size: 16,
        necromancy: true, // Revive esqueletos mortos
        magicResistance: 0.2,
        tier: 3
    },
    
    TROLL_BERSERKER: {
        id: 'troll_berserker',
        name: 'Troll Berserker',
        health: 600,
        speed: 50,
        damage: 18,
        goldReward: 60,
        scoreValue: 200,
        color: '#8B0000',
        borderColor: '#4B0000',
        size: 20,
        rage: true, // Fica mais rápido quando ferido
        regeneration: 3, // Regenera 3 HP por segundo
        tier: 4
    },
    
    ANCIENT_DRAGON: {
        id: 'ancient_dragon',
        name: 'Dragão Ancião',
        health: 800,
        speed: 30,
        damage: 25,
        goldReward: 100,
        scoreValue: 400,
        color: '#4B0082',
        borderColor: '#2F0052',
        size: 24,
        isFlying: true,
        fireBreath: true, // Ataque em área
        magicResistance: 0.4,
        fireResistance: 0.8,
        tier: 4
    },
    
    ARCHLICH: {
        id: 'archlich',
        name: 'Arquilich',
        health: 500,
        speed: 40,
        damage: 15,
        goldReward: 80,
        scoreValue: 300,
        color: '#191970',
        borderColor: '#000080',
        size: 16,
        magicResistance: 0.6,
        deathMagic: true, // Causa dano em área ao morrer
        teleport: true, // Pode teleportar
        tier: 4
    },
    
    DAEMON_LORD: {
        id: 'daemon_lord',
        name: 'Lorde Daemon',
        health: 700,
        speed: 60,
        damage: 20,
        goldReward: 90,
        scoreValue: 350,
        color: '#000000',
        borderColor: '#2F2F2F',
        size: 22,
        fireResistance: 0.7,
        magicResistance: 0.3,
        hellfire: true, // Deixa rastro de fogo
        summonMinions: true, // Invoca daemons menores
        tier: 4
    },

    // ========== INIMIGOS ESPECIAIS ==========
    GOLEM_STONE: {
        id: 'golem_stone',
        name: 'Golem de Pedra',
        health: 1000,
        speed: 20,
        damage: 15,
        goldReward: 70,
        scoreValue: 250,
        color: '#696969',
        borderColor: '#2F4F4F',
        size: 20,
        armor: 10,
        physicalResistance: 0.5,
        magicVulnerability: 1.5, // Toma mais dano mágico
        tier: 3
    },
    
    ELEMENTAL_FIRE: {
        id: 'elemental_fire',
        name: 'Elemental do Fogo',
        health: 250,
        speed: 80,
        damage: 12,
        goldReward: 35,
        scoreValue: 100,
        color: '#FF4500',
        borderColor: '#FF6347',
        size: 14,
        fireResistance: 0.9,
        iceVulnerability: 2.0, // Toma muito mais dano de gelo
        burnAura: 30, // Causa dano em área
        tier: 3
    },
    
    ELEMENTAL_ICE: {
        id: 'elemental_ice',
        name: 'Elemental do Gelo',
        health: 280,
        speed: 60,
        damage: 10,
        goldReward: 35,
        scoreValue: 100,
        color: '#87CEEB',
        borderColor: '#4682B4',
        size: 14,
        iceResistance: 0.9,
        fireVulnerability: 2.0, // Toma muito mais dano de fogo
        freezeAura: 40, // Reduz velocidade de torres próximas
        tier: 3
    },
    
    WRAITH: {
        id: 'wraith',
        name: 'Espectro',
        health: 150,
        speed: 100,
        damage: 8,
        goldReward: 30,
        scoreValue: 80,
        color: '#2F4F4F',
        borderColor: '#000000',
        size: 12,
        isEthereal: true, // Imune a ataques físicos
        magicVulnerability: 1.3,
        phaseShift: true, // Pode atravessar torres
        tier: 3
    },
    
    VAMPIRE_LORD: {
        id: 'vampire_lord',
        name: 'Lorde Vampiro',
        health: 450,
        speed: 75,
        damage: 16,
        goldReward: 65,
        scoreValue: 200,
        color: '#8B0000',
        borderColor: '#4B0000',
        size: 16,
        lifeDrain: 0.5, // Cura baseado no dano causado
        batForm: true, // Pode voar temporariamente
        charm: true, // Pode controlar torres temporariamente
        tier: 4
    },

    // ========== CHEFES FINAIS ==========
    BALRON: {
        id: 'balron',
        name: 'Balron',
        health: 1500,
        speed: 40,
        damage: 30,
        goldReward: 200,
        scoreValue: 1000,
        color: '#8B0000',
        borderColor: '#000000',
        size: 28,
        fireResistance: 0.8,
        magicResistance: 0.5,
        demonLord: true,
        hellstorm: true, // Ataque devastador em área
        summonDemons: true,
        tier: 5,
        isBoss: true
    },
    
    SHADOW_LORD: {
        id: 'shadow_lord',
        name: 'Senhor das Sombras',
        health: 1200,
        speed: 60,
        damage: 25,
        goldReward: 180,
        scoreValue: 800,
        color: '#000000',
        borderColor: '#2F2F2F',
        size: 24,
        isEthereal: true,
        magicResistance: 0.7,
        shadowClones: true, // Cria clones
        darkMagic: true,
        tier: 5,
        isBoss: true
    },
    
    TITAN: {
        id: 'titan',
        name: 'Titã',
        health: 2000,
        speed: 25,
        damage: 40,
        goldReward: 250,
        scoreValue: 1200,
        color: '#FFD700',
        borderColor: '#FFA500',
        size: 32,
        armor: 15,
        physicalResistance: 0.6,
        earthquake: true, // Atordoa torres
        titanicStrike: true, // Ataque devastador
        tier: 5,
        isBoss: true
    }
};

// Configurações de ondas - Mais agressivas
const WAVE_CONFIG = {
    BASE_ENEMY_COUNT: 8,        // Aumentado de 5 para 8
    ENEMY_COUNT_INCREASE: 3,    // Aumentado de 2 para 3
    DIFFICULTY_MULTIPLIER: 1.15, // Aumentado de 1.1 para 1.15
    HEALTH_MULTIPLIER_PER_WAVE: 1.12, // Aumentado de 1.1 para 1.12
    SPEED_INCREASE_PER_WAVE: 1.05,    // Novo: velocidade aumenta
    SPAWN_INTERVAL_DECREASE: 0.95,    // Spawn mais rápido a cada onda
    MIN_SPAWN_INTERVAL: 400,          // Mínimo de 0.4s entre spawns
    
    // Configurações de bônus
    WAVE_COMPLETION_BONUS: 5,   // Reduzido de 10 para 5
    BOSS_WAVE_BONUS: 15,        // Reduzido de 25 para 15
    PERFECT_WAVE_BONUS: 10      // Bônus por não perder vida
};

// Magias - Custos aumentados e efeitos reduzidos
const SPELLS = {
    FIREBALL: {
        id: 'fireball',
        name: 'Bola de Fogo',
        description: 'Causa dano em área',
        cost: 40,               // Aumentado de 25 para 40
        damage: 35,             // Reduzido de 50 para 35
        radius: 70,             // Reduzido de 100 para 70
        cooldown: 8000          // Aumentado para 8s
    },
    
    FREEZE: {
        id: 'freeze',
        name: 'Congelar',
        description: 'Congela todos os inimigos',
        cost: 50,               // Aumentado de 30 para 50
        duration: 3000,         // Reduzido de 5000 para 3000
        cooldown: 12000         // Aumentado para 12s
    },
    
    LIGHTNING_STORM: {
        id: 'lightning_storm',
        name: 'Tempestade Elétrica',
        description: 'Atinge múltiplos inimigos',
        cost: 60,               // Aumentado de 40 para 60
        damage: 40,             // Reduzido de 60 para 40
        targets: 4,             // Reduzido de 6 para 4
        cooldown: 10000         // Aumentado para 10s
    },
    
    HEAL: {
        id: 'heal',
        name: 'Cura',
        description: 'Restaura vida do jogador',
        cost: 35,               // Aumentado de 20 para 35
        healAmount: 3,          // Reduzido de 5 para 3
        cooldown: 15000         // Aumentado para 15s
    }
};

// Cores para diferentes elementos
const COLORS = {
    BACKGROUND: '#2d5016',
    PATH: '#8B4513',
    GRID: 'rgba(255, 255, 255, 0.1)',
    
    // Torres
    ARCHER: '#8B4513',
    MAGE: '#4B0082',
    ICE_MAGE: '#87CEEB',
    POISON_TOWER: '#32CD32',
    CANNON: '#696969',
    LIGHTNING: '#FFD700',
    
    // Inimigos
    ORC: '#228B22',
    SKELETON: '#F5F5DC',
    TROLL: '#8B4513',
    DRAGON: '#DC143C',
    LICH: '#4B0082',
    DAEMON: '#8B0000',
    
    // UI
    GOLD: '#FFD700',
    HEALTH: '#FF0000',
    MANA: '#0000FF',
    
    // Efeitos
    DAMAGE_TEXT: '#FF4444',
    HEAL_TEXT: '#44FF44',
    CRITICAL_TEXT: '#FFFF44'
};

// Configurações de performance
const PERFORMANCE_CONFIG = {
    MAX_PARTICLES: 200,         // Reduzido para melhor performance
    MAX_EFFECTS: 50,
    CLEANUP_INTERVAL: 1000,
    TARGET_FPS: 60,
    DELTA_TIME_CAP: 50
}; 