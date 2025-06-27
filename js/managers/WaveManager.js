/**
 * WaveManager - Gerencia as ondas de inimigos
 * Implementa padrões Strategy e Observer
 */
class WaveManager extends EventEmitter {
    constructor() {
        super();
        
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveStartTime = 0;
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        
        // Configurações de spawn
        this.spawnConfig = {
            interval: 1000,
            lastSpawnTime: 0,
            spawnPosition: { x: 0, y: 300 }
        };
        
        // Estratégias de onda
        this.waveStrategies = new Map();
        this.setupWaveStrategies();
        
        // Configurações das ondas
        this.waveConfigurations = this.createWaveConfigurations();
    }
    
    /**
     * Configura estratégias de onda
     */
    setupWaveStrategies() {
        this.waveStrategies.set('basic', new BasicWaveStrategy());
        this.waveStrategies.set('mixed', new MixedWaveStrategy());
        this.waveStrategies.set('boss', new BossWaveStrategy());
        this.waveStrategies.set('swarm', new SwarmWaveStrategy());
        this.waveStrategies.set('elite', new EliteWaveStrategy());
    }
    
    /**
     * Cria configurações das ondas
     */
    createWaveConfigurations() {
        const waves = [];
        
        // Ondas 1-3: Introdução - Mais inimigos básicos
        for (let i = 1; i <= 3; i++) {
            waves.push({
                number: i,
                strategy: 'basic',
                enemyCount: 8 + i * 3,        // Aumentado: 11, 14, 17 inimigos
                enemyTypes: ['ORC'],
                spawnInterval: 1200 - i * 100, // Spawn mais rápido
                difficulty: 1 + (i * 0.1)     // Dificuldade crescente
            });
        }
        
        // Ondas 4-7: Mistas - Introduz esqueletos
        for (let i = 4; i <= 7; i++) {
            waves.push({
                number: i,
                strategy: 'mixed',
                enemyCount: 12 + i * 2,       // 20, 22, 24, 26 inimigos
                enemyTypes: ['ORC', 'SKELETON'],
                spawnInterval: 1000 - (i - 4) * 50,
                difficulty: 1.2 + (i * 0.1)
            });
        }
        
        // Ondas 8-12: Trolls aparecem - Mais desafiador
        for (let i = 8; i <= 12; i++) {
            waves.push({
                number: i,
                strategy: 'mixed',
                enemyCount: 15 + i * 2,       // 31, 33, 35, 37, 39 inimigos
                enemyTypes: ['ORC', 'SKELETON', 'TROLL'],
                spawnInterval: 800 - (i - 8) * 30,
                difficulty: 1.5 + (i * 0.15)
            });
        }
        
        // Ondas 13-17: Elite - Liches e inimigos élite
        for (let i = 13; i <= 17; i++) {
            waves.push({
                number: i,
                strategy: 'elite',
                enemyCount: 18 + i * 2,       // 44, 46, 48, 50, 52 inimigos
                enemyTypes: ['SKELETON', 'TROLL', 'LICH', 'ORC_WARLORD', 'SKELETON_KING'],
                spawnInterval: 700 - (i - 13) * 25,
                difficulty: 2.0 + (i * 0.2)
            });
        }
        
        // Ondas 18-22: Inimigos Especiais
        for (let i = 18; i <= 22; i++) {
            waves.push({
                number: i,
                strategy: 'elite',
                enemyCount: 20 + i * 2,       // 56, 58, 60, 62, 64 inimigos
                enemyTypes: ['TROLL', 'LICH', 'DAEMON', 'TROLL_BERSERKER', 'ELEMENTAL_FIRE', 'ELEMENTAL_ICE'],
                spawnInterval: 650 - (i - 18) * 20,
                difficulty: 2.5 + (i * 0.25)
            });
        }
        
        // Ondas 23-27: Inimigos Avançados
        for (let i = 23; i <= 27; i++) {
            waves.push({
                number: i,
                strategy: 'elite',
                enemyCount: 22 + i * 2,       // 68, 70, 72, 74, 76 inimigos
                enemyTypes: ['DAEMON', 'ARCHLICH', 'VAMPIRE_LORD', 'GOLEM_STONE', 'WRAITH'],
                spawnInterval: 600,
                difficulty: 3.0 + (i * 0.3)
            });
        }
        
        // Ondas 28-30: Finais Épicas
        for (let i = 28; i <= 30; i++) {
            waves.push({
                number: i,
                strategy: 'boss',
                enemyCount: 25 + i * 3,       // 109, 112, 115 inimigos
                enemyTypes: ['ANCIENT_DRAGON', 'DAEMON_LORD', 'ARCHLICH', 'VAMPIRE_LORD', 'BALRON', 'SHADOW_LORD', 'TITAN'],
                spawnInterval: 800, // Mais lento para dar tempo de reagir
                difficulty: 4.0 + (i * 0.5)
            });
        }
        
        // Ondas Boss especiais (5, 10, 15, 20, 25, 30)
        [5, 10, 15, 20, 25, 30].forEach(waveNum => {
            if (waves[waveNum - 1]) {
                const wave = waves[waveNum - 1];
                wave.strategy = 'boss';
                
                // Adiciona chefes específicos baseado na onda
                if (waveNum === 5) {
                    wave.enemyTypes.push('DRAGON');
                } else if (waveNum === 10) {
                    wave.enemyTypes.push('DRAGON', 'ORC_WARLORD');
                } else if (waveNum === 15) {
                    wave.enemyTypes.push('ANCIENT_DRAGON', 'SKELETON_KING');
                } else if (waveNum === 20) {
                    wave.enemyTypes.push('DAEMON_LORD', 'TROLL_BERSERKER');
                } else if (waveNum === 25) {
                    wave.enemyTypes.push('BALRON', 'SHADOW_LORD');
                } else if (waveNum === 30) {
                    wave.enemyTypes = ['TITAN', 'BALRON', 'SHADOW_LORD']; // Onda final épica
                }
                
                wave.enemyCount += 8; // Mais inimigos nas ondas boss
                wave.difficulty += 0.8; // Dificuldade extra
                wave.spawnInterval = Math.max(600, wave.spawnInterval); // Não muito rápido
            }
        });
        
        return waves;
    }
    
    /**
     * Inicia próxima onda
     */
    startWave() {
        if (this.isWaveActive) return false;
        
        this.currentWave++;
        const waveConfig = this.getCurrentWaveConfig();
        
        if (!waveConfig) {
            this.handleAllWavesCompleted();
            return false;
        }
        
        this.initializeWave(waveConfig);
        this.emit('waveStarted', this.currentWave, waveConfig);
        
        return true;
    }
    
    /**
     * Inicializa onda atual
     */
    initializeWave(waveConfig) {
        this.isWaveActive = true;
        this.waveStartTime = Date.now();
        this.enemiesSpawned = 0;
        this.enemiesRemaining = waveConfig.enemyCount;
        
        this.spawnConfig.interval = waveConfig.spawnInterval;
        this.spawnConfig.lastSpawnTime = 0;
        
        console.log(`🌊 Iniciando Wave ${this.currentWave}: ${waveConfig.enemyCount} inimigos`);
    }
    
    /**
     * Atualiza o gerenciador
     */
    update(deltaTime) {
        if (!this.isWaveActive) return;
        
        const currentTime = Date.now();
        const waveConfig = this.getCurrentWaveConfig();
        
        if (this.shouldSpawnEnemy(currentTime) && this.canSpawnMoreEnemies()) {
            this.spawnNextEnemy(waveConfig);
            this.spawnConfig.lastSpawnTime = currentTime;
        }
        
        this.checkWaveCompletion();
    }
    
    /**
     * Verifica se deve spawnar inimigo
     */
    shouldSpawnEnemy(currentTime) {
        return currentTime - this.spawnConfig.lastSpawnTime >= this.spawnConfig.interval;
    }
    
    /**
     * Verifica se pode spawnar mais inimigos
     */
    canSpawnMoreEnemies() {
        return this.enemiesSpawned < this.getCurrentWaveConfig()?.enemyCount;
    }
    
    /**
     * Spawna próximo inimigo
     */
    spawnNextEnemy(waveConfig) {
        const strategy = this.waveStrategies.get(waveConfig.strategy);
        const enemyType = strategy.selectEnemyType(waveConfig, this.enemiesSpawned);
        
        const enemy = this.createEnemy(enemyType, waveConfig);
        
        this.enemiesSpawned++;
        this.emit('enemySpawned', enemy);
    }
    
    /**
     * Cria inimigo
     */
    createEnemy(enemyType, waveConfig) {
        const enemy = new Enemy(
            this.spawnConfig.spawnPosition.x,
            this.spawnConfig.spawnPosition.y,
            enemyType
        );
        
        // Aplica escalas de dificuldade mais agressivas
        const difficultyFactor = waveConfig.difficulty;
        const waveFactor = Math.pow(WAVE_CONFIG.HEALTH_MULTIPLIER_PER_WAVE, this.currentWave - 1);
        const speedFactor = Math.pow(WAVE_CONFIG.SPEED_INCREASE_PER_WAVE, this.currentWave - 1);
        
        // Escala vida (mais agressiva)
        const healthMultiplier = difficultyFactor * waveFactor;
        enemy.health = Math.floor(enemy.health * healthMultiplier);
        enemy.maxHealth = Math.floor(enemy.maxHealth * healthMultiplier);
        
        // Escala velocidade (inimigos ficam mais rápidos)
        enemy.speed = Math.floor(enemy.speed * speedFactor);
        
        // Escala dano (inimigos causam mais dano)
        if (this.currentWave > 5) {
            const damageMultiplier = 1 + (this.currentWave - 5) * 0.2;
            enemy.damage = Math.floor(enemy.damage * damageMultiplier);
        }
        
        // Reduz recompensa de ouro para ondas avançadas (economia mais restrita)
        if (this.currentWave > 3) {
            const goldReduction = Math.max(0.6, 1 - (this.currentWave - 3) * 0.05);
            enemy.goldReward = Math.max(1, Math.floor(enemy.goldReward * goldReduction));
        }
        
        // Aumenta valor de score
        enemy.scoreValue = Math.floor(enemy.scoreValue * difficultyFactor);
        
        // Define caminho para o inimigo
        enemy.setPath(GAME_CONFIG.PATH);
        
        return enemy;
    }
    
    /**
     * Verifica conclusão da onda
     */
    checkWaveCompletion() {
        if (this.enemiesSpawned >= this.getCurrentWaveConfig()?.enemyCount && 
            this.enemiesRemaining <= 0) {
            this.completeWave();
        }
    }
    
    /**
     * Completa onda atual
     */
    completeWave() {
        this.isWaveActive = false;
        
        this.emit('waveCompleted', this.currentWave);
        console.log(`✅ Wave ${this.currentWave} completada!`);
    }
    
    /**
     * Manipula inimigo morto
     */
    handleEnemyKilled() {
        this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
    }
    
    /**
     * Manipula inimigo que chegou ao fim
     */
    handleEnemyReachedEnd() {
        this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
    }
    
    /**
     * Manipula todas as ondas completadas
     */
    handleAllWavesCompleted() {
        this.emit('allWavesCompleted');
        console.log('🎉 Todas as ondas completadas! Vitória!');
    }
    
    /**
     * Obtém configuração da onda atual
     */
    getCurrentWaveConfig() {
        return this.waveConfigurations[this.currentWave - 1];
    }
    
    /**
     * Verifica se pode iniciar próxima onda
     */
    canStartNextWave() {
        return !this.isWaveActive && this.currentWave < this.waveConfigurations.length;
    }
    
    /**
     * Obtém informações da onda atual
     */
    getCurrentWaveInfo() {
        const config = this.getCurrentWaveConfig();
        
        return {
            number: this.currentWave,
            isActive: this.isWaveActive,
            enemiesSpawned: this.enemiesSpawned,
            enemiesRemaining: this.enemiesRemaining,
            totalEnemies: config?.enemyCount || 0,
            strategy: config?.strategy || 'none',
            difficulty: config?.difficulty || 1
        };
    }
    
    /**
     * Obtém onda atual
     */
    getCurrentWave() {
        return this.currentWave;
    }
    
    /**
     * Verifica se onda está ativa
     */
    isActive() {
        return this.isWaveActive;
    }
    
    /**
     * Obtém total de ondas
     */
    getTotalWaves() {
        return this.waveConfigurations.length;
    }
    
    /**
     * Reseta o gerenciador
     */
    reset() {
        this.currentWave = 0;
        this.isWaveActive = false;
        this.waveStartTime = 0;
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        
        this.spawnConfig.lastSpawnTime = 0;
        
        this.emit('waveManagerReset');
    }
    
    /**
     * Destrói o gerenciador
     */
    destroy() {
        this.removeAllListeners();
        this.waveStrategies.clear();
    }
}

/**
 * Estratégia base para ondas
 */
class WaveStrategy {
    selectEnemyType(waveConfig, spawnIndex) {
        throw new Error('Método selectEnemyType deve ser implementado');
    }
}

/**
 * Estratégia de onda básica
 */
class BasicWaveStrategy extends WaveStrategy {
    selectEnemyType(waveConfig, spawnIndex) {
        return waveConfig.enemyTypes[0] || 'ORC';
    }
}

/**
 * Estratégia de onda mista
 */
class MixedWaveStrategy extends WaveStrategy {
    selectEnemyType(waveConfig, spawnIndex) {
        const types = waveConfig.enemyTypes;
        return types[spawnIndex % types.length];
    }
}

/**
 * Estratégia de onda boss
 */
class BossWaveStrategy extends WaveStrategy {
    selectEnemyType(waveConfig, spawnIndex) {
        const types = waveConfig.enemyTypes;
        
        // 40% chance de boss nas ondas boss (aumentado de 20%)
        if (Math.random() < 0.4 && types.includes('DRAGON')) {
            return 'DRAGON';
        }
        
        // Prioriza inimigos mais fortes
        const strongEnemies = types.filter(type => ['TROLL', 'LICH', 'DAEMON'].includes(type));
        if (strongEnemies.length > 0 && Math.random() < 0.7) {
            return strongEnemies[Math.floor(Math.random() * strongEnemies.length)];
        }
        
        const regularTypes = types.filter(type => type !== 'DRAGON');
        return regularTypes[spawnIndex % regularTypes.length];
    }
}

/**
 * Estratégia de onda enxame
 */
class SwarmWaveStrategy extends WaveStrategy {
    selectEnemyType(waveConfig, spawnIndex) {
        // Prioriza inimigos rápidos em grupos
        const fastEnemies = ['SKELETON', 'ORC'];
        const availableFast = waveConfig.enemyTypes.filter(type => 
            fastEnemies.includes(type)
        );
        
        // 80% dos inimigos são rápidos (aumentado de padrão)
        if (availableFast.length > 0 && Math.random() < 0.8) {
            return availableFast[spawnIndex % availableFast.length];
        }
        
        return waveConfig.enemyTypes[spawnIndex % waveConfig.enemyTypes.length];
    }
}

/**
 * Estratégia de onda elite
 */
class EliteWaveStrategy extends WaveStrategy {
    selectEnemyType(waveConfig, spawnIndex) {
        // Prioriza inimigos fortes - 80% de chance (aumentado de 60%)
        const eliteEnemies = ['TROLL', 'LICH', 'DAEMON'];
        const availableElite = waveConfig.enemyTypes.filter(type => 
            eliteEnemies.includes(type)
        );
        
        if (availableElite.length > 0 && Math.random() < 0.8) {
            return availableElite[Math.floor(Math.random() * availableElite.length)];
        }
        
        return waveConfig.enemyTypes[spawnIndex % waveConfig.enemyTypes.length];
    }
} 