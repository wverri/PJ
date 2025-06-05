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
        new Vector2D(0, 300),
        new Vector2D(150, 300),
        new Vector2D(150, 200),
        new Vector2D(300, 200),
        new Vector2D(300, 400),
        new Vector2D(450, 400),
        new Vector2D(450, 150),
        new Vector2D(600, 150),
        new Vector2D(600, 350),
        new Vector2D(750, 350),
        new Vector2D(800, 350)
    ]
};

// Tipos de torres - Balanceamento completo
const TOWER_TYPES = {
    ARCHER: {
        id: 'archer',
        name: 'Torre Arqueiro',
        description: 'Torre básica com ataques rápidos',
        cost: 80,               // Aumentado de ~50 para 80
        damage: 12,             // Reduzido para 12
        range: 90,              // Reduzido para 90
        attackSpeed: 1200,      // Mais lento: 1.2s
        projectileSpeed: 250,
        color: '#8B4513',
        borderColor: '#654321',
        icon: '🏹',
        upgradeCost: 60,        // Aumentado
        upgradeDamage: 8,       // Menor incremento
        upgradeRange: 15,
        maxLevel: 3
    },
    
    MAGE: {
        id: 'mage',
        name: 'Torre Mago',
        description: 'Ataques mágicos com dano em área',
        cost: 120,              // Aumentado de ~80 para 120
        damage: 20,             // Reduzido para 20
        range: 100,             // Reduzido para 100
        attackSpeed: 1800,      // Mais lento: 1.8s
        projectileSpeed: 200,
        splashRadius: 40,       // Reduzido
        color: '#4B0082',
        borderColor: '#2F0052',
        icon: '🔮',
        upgradeCost: 90,
        upgradeDamage: 12,
        upgradeRange: 20,
        maxLevel: 3
    },
    
    ICE_MAGE: {
        id: 'ice_mage',
        name: 'Mago do Gelo',
        description: 'Congela inimigos e reduz velocidade',
        cost: 150,              // Aumentado de ~100 para 150
        damage: 15,             // Reduzido para 15
        range: 85,              // Reduzido para 85
        attackSpeed: 2000,      // Mais lento: 2s
        projectileSpeed: 180,
        slowEffect: 0.4,        // Reduzido de 0.5 para 0.4
        slowDuration: 2500,     // Reduzido para 2.5s
        color: '#87CEEB',
        borderColor: '#4682B4',
        icon: '❄️',
        upgradeCost: 110,
        upgradeDamage: 10,
        upgradeRange: 15,
        maxLevel: 3
    },
    
    POISON_TOWER: {
        id: 'poison_tower',
        name: 'Torre Venenosa',
        description: 'Causa dano contínuo por veneno',
        cost: 100,              // Aumentado de ~70 para 100
        damage: 8,              // Reduzido para 8
        range: 75,              // Reduzido para 75
        attackSpeed: 1500,      // 1.5s
        projectileSpeed: 220,
        poisonDamage: 3,        // Reduzido de 5 para 3
        poisonDuration: 4000,   // Reduzido para 4s
        color: '#32CD32',
        borderColor: '#228B22',
        icon: '☠️',
        upgradeCost: 75,
        upgradeDamage: 5,
        upgradeRange: 10,
        maxLevel: 3
    },
    
    CANNON: {
        id: 'cannon',
        name: 'Canhão',
        description: 'Alto dano em área, ataque lento',
        cost: 200,              // Aumentado de ~150 para 200
        damage: 45,             // Reduzido de ~60 para 45
        range: 110,             // Reduzido para 110
        attackSpeed: 3000,      // Muito lento: 3s
        projectileSpeed: 150,
        splashRadius: 60,       // Reduzido
        color: '#696969',
        borderColor: '#2F4F4F',
        icon: '💣',
        upgradeCost: 150,
        upgradeDamage: 25,
        upgradeRange: 20,
        maxLevel: 3
    },
    
    LIGHTNING: {
        id: 'lightning',
        name: 'Torre Elétrica',
        description: 'Ataques em cadeia entre inimigos',
        cost: 180,              // Aumentado de ~120 para 180
        damage: 25,             // Reduzido para 25
        range: 95,              // Reduzido para 95
        attackSpeed: 2200,      // 2.2s
        chainTargets: 2,        // Reduzido de 3 para 2
        chainDamageReduction: 0.6, // Maior redução
        color: '#FFD700',
        borderColor: '#DAA520',
        icon: '⚡',
        upgradeCost: 130,
        upgradeDamage: 15,
        upgradeRange: 15,
        maxLevel: 3
    }
};

// Tipos de inimigos - Vida aumentada e recompensas ajustadas
const ENEMY_TYPES = {
    ORC: {
        id: 'orc',
        name: 'Orc',
        health: 45,             // Aumentado de 30 para 45
        speed: 60,              // Reduzido de 80 para 60
        damage: 2,              // Aumentado de 1 para 2
        goldReward: 8,          // Reduzido de 10 para 8
        scoreValue: 10,
        color: '#228B22',
        borderColor: '#006400',
        size: 12
    },
    
    SKELETON: {
        id: 'skeleton',
        name: 'Esqueleto',
        health: 25,             // Aumentado de 20 para 25
        speed: 90,              // Reduzido de 120 para 90
        damage: 1,
        goldReward: 6,          // Reduzido de 8 para 6
        scoreValue: 15,
        color: '#F5F5DC',
        borderColor: '#D3D3D3',
        size: 10
    },
    
    TROLL: {
        id: 'troll',
        name: 'Troll',
        health: 120,            // Aumentado de 80 para 120
        speed: 35,              // Reduzido de 50 para 35
        damage: 4,              // Aumentado de 3 para 4
        goldReward: 15,         // Reduzido de 20 para 15
        scoreValue: 25,
        color: '#8B4513',
        borderColor: '#654321',
        size: 16
    },
    
    DRAGON: {
        id: 'dragon',
        name: 'Dragão',
        health: 300,            // Aumentado de 200 para 300
        speed: 25,              // Reduzido de 30 para 25
        damage: 8,              // Aumentado de 5 para 8
        goldReward: 40,         // Reduzido de 50 para 40
        scoreValue: 100,
        color: '#DC143C',
        borderColor: '#8B0000',
        size: 20,
        isFlying: true
    },
    
    LICH: {
        id: 'lich',
        name: 'Lich',
        health: 180,            // Aumentado de 120 para 180
        speed: 45,              // Reduzido de 60 para 45
        damage: 6,              // Aumentado de 4 para 6
        goldReward: 25,         // Reduzido de 30 para 25
        scoreValue: 50,
        color: '#4B0082',
        borderColor: '#2F0052',
        size: 14,
        magicResistance: 0.3    // 30% resistência mágica
    },
    
    DAEMON: {
        id: 'daemon',
        name: 'Daemon',
        health: 220,            // Aumentado de 150 para 220
        speed: 55,              // Reduzido de 70 para 55
        damage: 7,              // Aumentado de 5 para 7
        goldReward: 30,         // Reduzido de 40 para 30
        scoreValue: 75,
        color: '#8B0000',
        borderColor: '#4B0000',
        size: 18,
        fireResistance: 0.4     // 40% resistência ao fogo
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