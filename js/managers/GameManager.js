/**
 * GameManager - Coordena a lógica principal do jogo
 * Implementa o padrão Mediator e Observer
 */
class GameManager extends EventEmitter {
    constructor(canvas, ctx) {
        super();
        
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Estado do jogo
        this.gameState = {
            gold: GAME_CONFIG.PLAYER.INITIAL_GOLD,
            health: GAME_CONFIG.PLAYER.INITIAL_HEALTH,
            currentWave: 1,
            score: 0,
            isGameOver: false,
            isPaused: false
        };
        
        // Managers especializados
        this.waveManager = new WaveManager();
        this.towerManager = new TowerManager();
        
        // Coleções de entidades
        this.enemies = new Set();
        this.towers = new Set();
        this.projectiles = new Set();
        
        // Estado de interação
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.mousePosition = { x: 0, y: 0 };
        
        // Estatísticas
        this.statistics = {
            enemiesKilled: 0,
            towersBuilt: 0,
            spellsCast: 0,
            totalDamageDealt: 0,
            highScore: this.loadHighScore()
        };
        
        this.setupEventHandlers();
    }
    
    /**
     * Configura manipuladores de eventos
     */
    setupEventHandlers() {
        // Wave Manager
        this.waveManager.on('enemySpawned', (enemy) => {
            this.addEnemy(enemy);
        });
        
        this.waveManager.on('waveCompleted', (waveNumber) => {
            this.handleWaveCompleted(waveNumber);
        });
        
        this.waveManager.on('allWavesCompleted', () => {
            this.handleGameWon();
        });
        
        // Tower Manager
        this.towerManager.on('towerBuilt', (tower) => {
            this.handleTowerBuilt(tower);
        });
        
        this.towerManager.on('towerUpgraded', (tower) => {
            this.handleTowerUpgraded(tower);
        });
        
        this.towerManager.on('towerSold', (tower) => {
            this.handleTowerSold(tower);
        });
    }
    
    /**
     * Atualiza o jogo
     */
    update(deltaTime) {
        if (this.gameState.isPaused || this.gameState.isGameOver) {
            return;
        }
        
        this.updateEntities(deltaTime);
        this.checkCollisions();
        this.cleanupDestroyedEntities();
        this.updateWaveManager(deltaTime);
        this.checkGameOverConditions();
    }
    
    /**
     * Atualiza todas as entidades
     */
    updateEntities(deltaTime) {
        // Atualiza inimigos
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
            
            if (enemy.hasReachedEnd()) {
                this.handleEnemyReachedEnd(enemy);
            }
        });
        
        // Atualiza torres (elas gerenciam seus próprios ataques)
        this.towers.forEach(tower => {
            tower.update(deltaTime);
        });
        
        // Atualiza projéteis
        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
            
            if (projectile.hasHitTarget()) {
                this.handleProjectileHit(projectile);
            }
        });
    }
    
    /**
     * Verifica colisões
     */
    checkCollisions() {
        this.projectiles.forEach(projectile => {
            if (projectile.target && !projectile.target.isDead()) {
                const distance = Vector2D.distance(
                    projectile.position,
                    projectile.target.position
                );
                
                if (distance <= projectile.hitRadius) {
                    this.handleProjectileHit(projectile);
                }
            }
        });
    }
    
    /**
     * Remove entidades destruídas
     */
    cleanupDestroyedEntities() {
        // Remove inimigos mortos
        this.enemies.forEach(enemy => {
            if (enemy.isDead()) {
                this.handleEnemyKilled(enemy);
                this.enemies.delete(enemy);
            }
        });
        
        // Remove projéteis que atingiram o alvo
        this.projectiles.forEach(projectile => {
            if (projectile.shouldBeDestroyed()) {
                this.projectiles.delete(projectile);
            }
        });
    }
    
    /**
     * Atualiza o gerenciador de ondas
     */
    updateWaveManager(deltaTime) {
        this.waveManager.update(deltaTime);
    }
    
    /**
     * Verifica condições de fim de jogo
     */
    checkGameOverConditions() {
        if (this.gameState.health <= 0) {
            this.handleGameLost();
        }
    }
    
    /**
     * Manipula clique do mouse
     */
    handleClick(x, y) {
        this.mousePosition = { x, y };
        
        if (this.selectedTowerType) {
            this.tryPlaceTower(x, y);
        } else {
            this.trySelectTower(x, y);
        }
    }
    
    /**
     * Manipula movimento do mouse
     */
    handleMouseMove(x, y) {
        this.mousePosition = { x, y };
    }
    
    /**
     * Manipula clique direito
     */
    handleRightClick(x, y) {
        this.cancelCurrentAction();
    }
    
    /**
     * Tenta colocar uma torre
     */
    tryPlaceTower(x, y) {
        const position = { x, y };
        
        if (this.towerManager.canPlaceTower(position, this.selectedTowerType)) {
            const cost = TOWER_TYPES[this.selectedTowerType].cost;
            
            if (this.gameState.gold >= cost) {
                const tower = this.towerManager.placeTower(position, this.selectedTowerType);
                this.spendGold(cost);
                this.selectedTowerType = null;
                
                this.emit('towerPlaced', tower);
            } else {
                this.emit('insufficientGold', cost);
            }
        } else {
            this.emit('invalidPlacement', position);
        }
    }
    
    /**
     * Tenta selecionar uma torre
     */
    trySelectTower(x, y) {
        const tower = this.towerManager.getTowerAt({ x, y });
        
        if (tower) {
            this.selectedTower = tower;
            this.emit('towerSelected', tower);
        } else {
            this.selectedTower = null;
            this.emit('towerDeselected');
        }
    }
    
    /**
     * Cancela ação atual
     */
    cancelCurrentAction() {
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.emit('actionCancelled');
    }
    
    /**
     * Seleciona tipo de torre para colocação
     */
    selectTowerForPlacement(towerType) {
        if (TOWER_TYPES[towerType]) {
            this.selectedTowerType = towerType;
            this.selectedTower = null;
            this.emit('towerTypeSelected', towerType);
        } else {
            console.error(`❌ Tipo de torre inválido: ${towerType}`);
        }
    }
    
    /**
     * Melhora torre selecionada
     */
    upgradeTower() {
        if (!this.selectedTower) return false;
        
        const upgradeCost = this.selectedTower.getUpgradeCost();
        
        if (this.gameState.gold >= upgradeCost) {
            this.selectedTower.upgrade();
            this.spendGold(upgradeCost);
            this.emit('towerUpgraded', this.selectedTower);
            return true;
        }
        
        this.emit('insufficientGold', upgradeCost);
        return false;
    }

    /**
     * Evolui torre selecionada
     */
    evolveTower() {
        if (!this.selectedTower || !this.selectedTower.canEvolve()) return false;

        const cost = this.selectedTower.getEvolutionCost();

        if (this.gameState.gold >= cost) {
            this.selectedTower.evolve();
            this.spendGold(cost);
            this.emit('towerEvolved', this.selectedTower);
            return true;
        }

        this.emit('insufficientGold', cost);
        return false;
    }
    
    /**
     * Vende torre selecionada
     */
    sellTower() {
        if (!this.selectedTower) return false;
        
        const sellValue = this.selectedTower.getSellValue();
        this.addGold(sellValue);
        
        this.towers.delete(this.selectedTower);
        this.towerManager.removeTower(this.selectedTower);
        
        this.emit('towerSold', this.selectedTower, sellValue);
        this.selectedTower = null;
        
        return true;
    }
    
    /**
     * Lança magia
     */
    castSpell(spellType) {
        const spell = SPELLS[spellType];
        if (!spell) return false;
        
        if (this.gameState.gold >= spell.cost) {
            this.spendGold(spell.cost);
            this.executeSpell(spellType, spell);
            this.statistics.spellsCast++;
            
            this.emit('spellCast', spellType, spell);
            return true;
        }
        
        this.emit('insufficientGold', spell.cost);
        return false;
    }
    
    /**
     * Executa efeito da magia
     */
    executeSpell(spellType, spell) {
        switch (spellType) {
            case 'FIREBALL':
                this.castFireball(spell);
                break;
            case 'FREEZE':
                this.castFreeze(spell);
                break;
            case 'LIGHTNING_STORM':
                this.castLightningStorm(spell);
                break;
            case 'HEAL':
                this.castHeal(spell);
                break;
        }
    }
    
    /**
     * Lança bola de fogo
     */
    castFireball(spell) {
        const targetPosition = this.mousePosition;
        
        this.enemies.forEach(enemy => {
            const distance = Vector2D.distance(enemy.position, targetPosition);
            if (distance <= spell.radius) {
                enemy.takeDamage(spell.damage);
                this.statistics.totalDamageDealt += spell.damage;
            }
        });
        
        this.emit('effectRequested', 'explosion', {
            x: targetPosition.x,
            y: targetPosition.y,
            radius: spell.radius,
            type: 'fireball'
        });
    }
    
    /**
     * Lança congelamento
     */
    castFreeze(spell) {
        this.enemies.forEach(enemy => {
            enemy.applyEffect('freeze', spell.duration);
        });
        
        this.emit('effectRequested', 'freeze_wave', {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            duration: spell.duration
        });
    }
    
    /**
     * Lança tempestade elétrica
     */
    castLightningStorm(spell) {
        const targets = Array.from(this.enemies).slice(0, spell.targets);
        
        targets.forEach(enemy => {
            enemy.takeDamage(spell.damage);
            this.statistics.totalDamageDealt += spell.damage;
            
            this.emit('effectRequested', 'lightning', {
                x: enemy.position.x,
                y: enemy.position.y,
                type: 'chain'
            });
        });
    }
    
    /**
     * Lança cura
     */
    castHeal(spell) {
        this.gameState.health = Math.min(
            this.gameState.health + spell.healing,
            GAME_CONFIG.PLAYER.INITIAL_HEALTH
        );
        
        this.emit('healthChanged', this.gameState.health);
        this.emit('effectRequested', 'heal', {
            x: this.canvas.width / 2,
            y: 50,
            healing: spell.healing
        });
    }
    
    /**
     * Inicia próxima onda
     */
    startNextWave() {
        if (this.waveManager.canStartNextWave()) {
            this.waveManager.startWave();
            this.gameState.currentWave = this.waveManager.getCurrentWave();
            this.emit('waveChanged', this.gameState.currentWave);
        }
    }
    
    /**
     * Adiciona inimigo
     */
    addEnemy(enemy) {
        this.enemies.add(enemy);
        
        // Conecta eventos do inimigo
        enemy.on('died', () => {
            this.handleEnemyKilled(enemy);
        });
        
        enemy.on('reachedEnd', () => {
            this.handleEnemyReachedEnd(enemy);
        });
    }
    
    /**
     * Adiciona projétil
     */
    addProjectile(projectile) {
        this.projectiles.add(projectile);
    }
    
    /**
     * Encontra alvo para torre
     */
    findTargetForTower(tower) {
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            if (enemy.isDead()) return;
            
            const distance = Vector2D.distance(tower.position, enemy.position);
            
            if (distance <= tower.range && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        return closestEnemy;
    }
    
    /**
     * Manipula projétil atingindo alvo
     */
    handleProjectileHit(projectile) {
        if (projectile.target && !projectile.target.isDead()) {
            const damage = projectile.damage;
            projectile.target.takeDamage(damage);
            this.statistics.totalDamageDealt += damage;
            
            // Efeitos especiais baseados no tipo de projétil
            this.applyProjectileEffects(projectile);
        }
        
        projectile.markForDestruction();
    }
    
    /**
     * Aplica efeitos especiais do projétil
     */
    applyProjectileEffects(projectile) {
        switch (projectile.type) {
            case 'ice':
                projectile.target.applyEffect('slow', 3000);
                break;
            case 'poison':
                projectile.target.applyEffect('poison', 5000, 2);
                break;
            case 'explosive':
                this.handleExplosiveDamage(projectile);
                break;
            case 'lightning':
                this.handleChainLightning(projectile);
                break;
        }
    }
    
    /**
     * Manipula dano explosivo
     */
    handleExplosiveDamage(projectile) {
        const explosionRadius = 60;
        
        this.enemies.forEach(enemy => {
            if (enemy === projectile.target) return;
            
            const distance = Vector2D.distance(
                projectile.target.position,
                enemy.position
            );
            
            if (distance <= explosionRadius) {
                const splashDamage = Math.floor(projectile.damage * 0.5);
                enemy.takeDamage(splashDamage);
                this.statistics.totalDamageDealt += splashDamage;
            }
        });
        
        this.emit('effectRequested', 'explosion', {
            x: projectile.target.position.x,
            y: projectile.target.position.y,
            radius: explosionRadius
        });
    }
    
    /**
     * Manipula raio em cadeia
     */
    handleChainLightning(projectile) {
        const chainRange = 80;
        const maxChains = 3;
        let currentTarget = projectile.target;
        let chainsLeft = maxChains;
        
        while (chainsLeft > 0 && currentTarget) {
            let nextTarget = null;
            let closestDistance = Infinity;
            
            this.enemies.forEach(enemy => {
                if (enemy === currentTarget || enemy.isDead()) return;
                
                const distance = Vector2D.distance(
                    currentTarget.position,
                    enemy.position
                );
                
                if (distance <= chainRange && distance < closestDistance) {
                    closestDistance = distance;
                    nextTarget = enemy;
                }
            });
            
            if (nextTarget) {
                const chainDamage = Math.floor(projectile.damage * 0.7);
                nextTarget.takeDamage(chainDamage);
                this.statistics.totalDamageDealt += chainDamage;
                
                this.emit('effectRequested', 'lightning_chain', {
                    from: currentTarget.position,
                    to: nextTarget.position
                });
                
                currentTarget = nextTarget;
            } else {
                break;
            }
            
            chainsLeft--;
        }
    }
    
    /**
     * Manipula inimigo morto
     */
    handleEnemyKilled(enemy) {
        this.addGold(enemy.goldReward);
        this.gameState.score += enemy.scoreValue;
        this.statistics.enemiesKilled++;
        
        // Notifica o WaveManager sobre o inimigo morto
        this.waveManager.handleEnemyKilled();
        
        this.emit('enemyKilled', enemy);
        this.emit('effectRequested', 'damage_text', {
            x: enemy.position.x,
            y: enemy.position.y - 20,
            text: `+${enemy.goldReward}`,
            color: '#FFD700'
        });
    }
    
    /**
     * Manipula inimigo chegando ao fim
     */
    handleEnemyReachedEnd(enemy) {
        this.gameState.health -= enemy.damage;
        this.enemies.delete(enemy);
        
        // Notifica o WaveManager sobre o inimigo que chegou ao fim
        this.waveManager.handleEnemyReachedEnd();
        
        this.emit('healthChanged', this.gameState.health);
        this.emit('enemyReachedEnd', enemy);
    }
    
    /**
     * Manipula torre construída
     */
    handleTowerBuilt(tower) {
        this.towers.add(tower);
        tower.setGameManager(this);
        this.statistics.towersBuilt++;
        this.emit('towerBuilt', tower);
    }
    
    /**
     * Manipula torre melhorada
     */
    handleTowerUpgraded(tower) {
        this.emit('towerUpgraded', tower);
    }
    
    /**
     * Manipula torre vendida
     */
    handleTowerSold(tower) {
        this.towers.delete(tower);
        this.emit('towerSold', tower);
    }
    
    /**
     * Manipula onda completada
     */
    handleWaveCompleted(waveNumber) {
        const bonus = waveNumber * 10;
        this.addGold(bonus);
        
        // Atualiza o número da onda atual
        this.gameState.currentWave = waveNumber + 1;
        this.emit('waveChanged', this.gameState.currentWave);
        
        this.emit('waveCompleted', waveNumber, bonus);
        this.emit('effectRequested', 'wave_complete', {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            wave: waveNumber,
            bonus: bonus
        });
        
        // Inicia próxima onda automaticamente após 3 segundos
        setTimeout(() => {
            if (!this.gameState.isGameOver && !this.gameState.isPaused) {
                if (this.waveManager.canStartNextWave()) {
                    this.startNextWave();
                    console.log(`🚀 Iniciando Wave ${this.gameState.currentWave} automaticamente`);
                } else {
                    // Todas as ondas foram completadas
                    this.handleGameWon();
                }
            }
        }, 3000);
    }
    
    /**
     * Manipula vitória
     */
    handleGameWon() {
        this.gameState.isGameOver = true;
        this.updateHighScore();
        
        this.emit('gameOver', {
            result: 'victory',
            score: this.gameState.score,
            statistics: this.statistics
        });
    }
    
    /**
     * Manipula derrota
     */
    handleGameLost() {
        this.gameState.isGameOver = true;
        this.updateHighScore();
        
        this.emit('gameOver', {
            result: 'defeat',
            score: this.gameState.score,
            statistics: this.statistics
        });
    }
    
    /**
     * Adiciona ouro
     */
    addGold(amount) {
        this.gameState.gold += amount;
        this.emit('goldChanged', this.gameState.gold);
    }
    
    /**
     * Gasta ouro
     */
    spendGold(amount) {
        this.gameState.gold = Math.max(0, this.gameState.gold - amount);
        this.emit('goldChanged', this.gameState.gold);
    }
    
    /**
     * Atualiza recorde
     */
    updateHighScore() {
        if (this.gameState.score > this.statistics.highScore) {
            this.statistics.highScore = this.gameState.score;
            this.saveHighScore(this.statistics.highScore);
        }
    }
    
    /**
     * Carrega recorde
     */
    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('uo_td_high_score')) || 0;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * Salva recorde
     */
    saveHighScore(score) {
        try {
            localStorage.setItem('uo_td_high_score', score.toString());
        } catch (error) {
            console.warn('Não foi possível salvar o recorde');
        }
    }
    
    /**
     * Reseta o jogo
     */
    reset() {
        // Limpa entidades
        this.enemies.clear();
        this.towers.clear();
        this.projectiles.clear();
        
        // Reseta estado
        this.gameState = {
            gold: GAME_CONFIG.PLAYER.INITIAL_GOLD,
            health: GAME_CONFIG.PLAYER.INITIAL_HEALTH,
            currentWave: 1,
            score: 0,
            isGameOver: false,
            isPaused: false
        };
        
        // Reseta seleções
        this.selectedTowerType = null;
        this.selectedTower = null;
        
        // Reseta managers
        this.waveManager.reset();
        this.towerManager.reset();
        
        // Emite eventos de reset
        this.emit('goldChanged', this.gameState.gold);
        this.emit('healthChanged', this.gameState.health);
        this.emit('waveChanged', this.gameState.currentWave);
        this.emit('gameReset');
    }
    
    /**
     * Pausa/despausa o jogo
     */
    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        this.emit('pauseToggled', this.gameState.isPaused);
    }
    
    /**
     * Getters para estado do jogo
     */
    getGold() { return this.gameState.gold; }
    getHealth() { return this.gameState.health; }
    getCurrentWave() { return this.gameState.currentWave; }
    getScore() { return this.gameState.score; }
    getHighScore() { return this.statistics.highScore; }
    getStatistics() { return { ...this.statistics }; }
    isGameOver() { return this.gameState.isGameOver; }
    isPaused() { return this.gameState.isPaused; }
    
    /**
     * Getters para entidades
     */
    getEnemies() { return Array.from(this.enemies); }
    getTowers() { return Array.from(this.towers); }
    getProjectiles() { return Array.from(this.projectiles); }
    getSelectedTower() { return this.selectedTower; }
    getSelectedTowerType() { return this.selectedTowerType; }
    
    /**
     * Carrega dados salvos
     */
    loadData(data) {
        if (data.highScore) {
            this.statistics.highScore = data.highScore;
        }
        
        if (data.statistics) {
            Object.assign(this.statistics, data.statistics);
        }
    }
    
    /**
     * Destrói o manager
     */
    destroy() {
        this.removeAllListeners();
        this.waveManager.destroy();
        this.towerManager.destroy();
        
        this.enemies.clear();
        this.towers.clear();
        this.projectiles.clear();
    }
} 