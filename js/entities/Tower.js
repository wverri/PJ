/**
 * Classe Tower - representa as torres defensivas
 * Implementa o padrão Strategy para diferentes tipos de ataque
 * Refatorada para suportar sistema de evolução avançado
 */
class Tower extends GameObject {
    constructor(x, y, towerType) {
        super(x, y);
        
        // Configurações do tipo de torre
        this.towerType = towerType;
        this.config = TOWER_TYPES[towerType];
        
        if (!this.config) {
            throw new Error(`Tipo de torre inválido: ${towerType}`);
        }
        
        // Sistema de evolução
        this.evolutionTree = new TowerEvolutionTree(this);
        this.currentEvolution = null;
        this.evolutionLevel = 0;
        
        // Propriedades básicas
        this.damage = this.config.damage;
        this.range = this.config.range;
        this.attackSpeed = this.config.attackSpeed;
        this.projectileSpeed = this.config.projectileSpeed;
        this.cost = this.config.cost;
        this.size = 24;
        this.color = this.config.color;
        this.icon = this.config.icon;
        
        // Propriedades de ataque
        this.lastAttackTime = 0;
        this.target = null;
        this.projectiles = [];
        this.attackStrategy = null;
        
        // Propriedades especiais baseadas no tipo
        this.setupSpecialProperties();
        
        // Sistema de upgrades tradicional
        this.level = 1;
        this.upgrades = {
            damage: 0,
            range: 0,
            speed: 0,
            special: 0
        };

        // Evolução
        this.evolutionStage = 0;
        
        // Estado visual aprimorado para 2.5D
        this.collisionRadius = this.size / 2;
        this.solid = true;
        this.showRange = false;
        this.height = 32; // Altura para efeito 2.5D
        this.shadowOffset = { x: 2, y: 4 };
        
        // Animações aprimoradas
        this.barrelRotation = 0;
        this.shootAnimation = 0;
        this.idleAnimation = 0;
        this.upgradeAnimation = 0;
        this.glowEffect = 0;
        this.evolutionGlow = 0;
        this.upgradePulse = 0;
        
        // Efeitos visuais
        this.particles = [];
        this.aura = null;
        this.evolutionGlow = false;
        
        // Eventos
        this.setupEventHandlers();
    }

    /**
     * Configura os manipuladores de eventos
     */
    setupEventHandlers() {
        this.on('targetAcquired', this.onTargetAcquired.bind(this));
        this.on('targetLost', this.onTargetLost.bind(this));
        this.on('attacked', this.onAttacked.bind(this));
        this.on('upgraded', this.onUpgraded.bind(this));
        this.on('evolved', this.onEvolved.bind(this));
        this.on('levelUp', this.onLevelUp.bind(this));
    }

    /**
     * Configura propriedades especiais baseadas no tipo de torre
     */
    setupSpecialProperties() {
        const specialConfig = new TowerSpecialConfig(this.towerType, this.config);
        Object.assign(this, specialConfig.getProperties());
    }

    /**
     * Define a estratégia de ataque da torre
     */
    setAttackStrategy(strategy) {
        this.attackStrategy = strategy;
    }

    /**
     * Define referência ao GameManager para acesso aos inimigos
     */
    setGameManager(gameManager) {
        this.gameManager = gameManager;
    }

    /**
     * Atualização específica da torre
     */
    onUpdate(deltaTime) {
        // Atualiza projéteis
        this.updateProjectiles(deltaTime);
        
        // Busca alvos
        this.updateTargeting();
        
        // Ataca se possível
        this.updateAttack(deltaTime);
        
        // Atualiza animações e efeitos visuais
        this.updateVisualEffects(deltaTime);
        
        // Atualiza partículas
        this.updateParticles(deltaTime);
    }

    /**
     * Atualiza projéteis da torre
     */
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update(deltaTime);
            
            if (projectile.destroyed) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    /**
     * Atualiza sistema de mira
     */
    updateTargeting() {
        // Remove alvo se estiver fora de alcance ou morto
        if (this.target && (this.target.destroyed || !this.isInRange(this.target))) {
            this.target = null;
            this.emit('targetLost');
        }
        
        // Busca novo alvo se não tiver um
        if (!this.target) {
            this.target = this.findBestTarget();
            if (this.target) {
                this.emit('targetAcquired', this.target);
            }
        }
    }

    /**
     * Encontra o melhor alvo dentro do alcance
     */
    findBestTarget() {
        const enemies = this.getEnemiesInRange();
        if (enemies.length === 0) return null;
        
        // Estratégia: prioriza inimigos mais próximos do fim do caminho
        return enemies.reduce((best, enemy) => {
            if (!best) return enemy;
            
            // Prioriza inimigos mais avançados no caminho
            if (enemy.currentPathIndex > best.currentPathIndex) {
                return enemy;
            } else if (enemy.currentPathIndex === best.currentPathIndex) {
                // Se estão no mesmo ponto do caminho, prioriza o mais próximo
                const distToBest = this.position.distanceTo(best.position);
                const distToEnemy = this.position.distanceTo(enemy.position);
                return distToEnemy < distToBest ? enemy : best;
            }
            
            return best;
        });
    }

    /**
     * Obtém inimigos dentro do alcance
     */
    getEnemiesInRange() {
        if (!this.gameManager) {
            return [];
        }
        
        const enemies = [];
        this.gameManager.enemies.forEach(enemy => {
            if (!enemy.isDead()) {
                const distance = Vector2D.distance(this.position, enemy.position);
                if (distance <= this.getCurrentRange()) {
                    enemies.push(enemy);
                }
            }
        });
        
        return enemies;
    }

    /**
     * Verifica se um inimigo está dentro do alcance
     */
    isInRange(enemy) {
        const distance = this.position.distanceTo(enemy.position);
        return distance <= this.getCurrentRange();
    }

    /**
     * Atualiza sistema de ataque
     */
    updateAttack(deltaTime) {
        if (!this.target || !this.canAttack()) return;
        
        // Atualiza rotação do canhão para mirar no alvo
        this.updateBarrelRotation();
        
        // Verifica se pode atacar
        if (this.age - this.lastAttackTime >= this.getCurrentAttackSpeed()) {
            this.attack();
            this.lastAttackTime = this.age;
        }
    }

    /**
     * Atualiza rotação do canhão
     */
    updateBarrelRotation() {
        if (this.target) {
            this.barrelRotation = this.position.angleTo(this.target.position);
        }
    }

    /**
     * Verifica se pode atacar
     */
    canAttack() {
        return this.target && !this.target.destroyed && this.isInRange(this.target);
    }

    /**
     * Executa ataque
     */
    attack() {
        if (!this.canAttack()) return;
        
        switch (this.towerType) {
            case 'LIGHTNING':
                this.lightningAttack();
                break;
            default:
                this.projectileAttack();
                break;
        }
        
        this.shootAnimation = 300; // Duração da animação de tiro
        this.emit('attacked', this.target);
    }

    /**
     * Ataque com projétil
     */
    projectileAttack() {
        const projectile = new Projectile(
            this.position.x,
            this.position.y,
            this.target,
            {
                damage: this.getCurrentDamage(),
                speed: this.projectileSpeed,
                type: this.towerType,
                source: this,
                splashRadius: this.splashRadius,
                statusEffect: this.getStatusEffect()
            }
        );
        
        this.projectiles.push(projectile);
        
        // Adiciona projétil ao GameManager se disponível
        if (this.gameManager) {
            this.gameManager.addProjectile(projectile);
        }
    }

    /**
     * Ataque de raio (instantâneo)
     */
    lightningAttack() {
        const targets = this.getLightningTargets();
        let currentDamage = this.getCurrentDamage();
        
        targets.forEach((target, index) => {
            const damage = Math.floor(currentDamage);
            target.takeDamage(damage, 'lightning');
            
            // Reduz dano para próximo alvo na cadeia
            currentDamage *= this.chainDamageReduction;
            
            // Efeito visual de raio
            this.createLightningEffect(target, index);
        });
    }

    /**
     * Obtém alvos para ataque em cadeia de raio
     */
    getLightningTargets() {
        const targets = [this.target];
        let currentTarget = this.target;
        
        for (let i = 1; i < this.chainTargets; i++) {
            const enemies = this.getEnemiesInRange();
            const nextTarget = enemies.find(enemy => 
                enemy !== currentTarget && 
                !targets.includes(enemy) &&
                currentTarget.position.distanceTo(enemy.position) <= this.range * 0.6
            );
            
            if (nextTarget) {
                targets.push(nextTarget);
                currentTarget = nextTarget;
            } else {
                break;
            }
        }
        
        return targets;
    }

    /**
     * Cria efeito visual de raio
     */
    createLightningEffect(target, chainIndex) {
        const startPos = chainIndex === 0 ? this.position : this.previousTarget?.position || this.position;
        
        this.addEffect(`lightning_${target.id}`, {
            duration: 200,
            startPos: startPos.clone(),
            endPos: target.position.clone(),
            update: (deltaTime) => {},
            render: (ctx) => {
                ctx.save();
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                
                ctx.beginPath();
                ctx.moveTo(this.startPos.x - this.position.x, this.startPos.y - this.position.y);
                ctx.lineTo(this.endPos.x - this.position.x, this.endPos.y - this.position.y);
                ctx.stroke();
                
                ctx.restore();
            }
        });
        
        this.previousTarget = target;
    }

    /**
     * Obtém efeito de status baseado no tipo de torre
     */
    getStatusEffect() {
        switch (this.towerType) {
            case 'ICE_MAGE':
                return {
                    type: 'slow',
                    factor: this.slowEffect,
                    duration: this.slowDuration
                };
                
            case 'POISON_TOWER':
                return {
                    type: 'poison',
                    damage: this.poisonDamage,
                    duration: this.poisonDuration,
                    tickRate: this.poisonTick
                };
                
            default:
                return null;
        }
    }

    /**
     * Atualiza animações
     */
    updateAnimations(deltaTime) {
        if (this.shootAnimation > 0) {
            this.shootAnimation -= deltaTime;
        }
    }

    /**
     * Melhora a torre
     */
    upgrade(upgradeType) {
        const upgradeConfig = this.config.upgrades[upgradeType];
        if (!upgradeConfig) return false;
        
        const cost = this.getUpgradeCost(upgradeType);
        
        // Aplica melhoria
        this.upgrades[upgradeType]++;
        
        switch (upgradeType) {
            case 'damage':
                this.damage += upgradeConfig.increase;
                break;
            case 'range':
                this.range += upgradeConfig.increase;
                break;
            case 'speed':
                this.attackSpeed -= upgradeConfig.decrease || 0;
                break;
            case 'splash':
                if (this.splashRadius) {
                    this.splashRadius += upgradeConfig.increase;
                }
                break;
        }
        
        this.emit('upgraded', upgradeType, cost);
        return true;
    }

    /**
     * Calcula custo de melhoria
     */
    getUpgradeCost(upgradeType) {
        const baseConfig = this.config.upgrades[upgradeType];
        if (!baseConfig) return Infinity;
        
        const level = this.upgrades[upgradeType];
        return Math.floor(baseConfig.cost * Math.pow(1.5, level));
    }

    /**
     * Vende a torre
     */
    sell() {
        const sellValue = this.getSellValue();
        this.emit('sold', sellValue);
        this.destroy();
        return sellValue;
    }

    /**
     * Calcula valor de venda
     */
    getSellValue() {
        let totalCost = this.cost;
        
        // Adiciona custo das melhorias
        Object.entries(this.upgrades).forEach(([type, level]) => {
            for (let i = 0; i < level; i++) {
                totalCost += this.getUpgradeCost(type);
            }
        });
        
        return Math.floor(totalCost * 0.7); // 70% do valor investido
    }

    /**
     * Custo para evoluir a torre
     */
    getEvolutionCost() {
        return this.config.evolutions?.[this.evolutionStage]?.cost ?? Infinity;
    }

    /**
     * Verifica se pode evoluir
     */
    canEvolve() {
        return this.config.evolutions && this.evolutionStage < this.config.evolutions.length;
    }

    /**
     * Evolui a torre para próximo estágio
     */
    evolve() {
        if (!this.canEvolve()) return false;

        const data = this.config.evolutions[this.evolutionStage];
        if (data.damage) this.damage = data.damage;
        if (data.range) this.range = data.range;
        if (data.attackSpeed) this.attackSpeed = data.attackSpeed;
        if (data.icon) this.icon = data.icon;

        this.evolutionStage++;
        this.emit('evolved', this.evolutionStage);
        return true;
    }

     */
    onRender(ctx) {
        // Renderiza sombra primeiro
        this.renderShadow(ctx);
        
        // Renderiza base da torre
        this.renderBase(ctx);
        
        // Renderiza corpo da torre com altura
        this.renderBody3D(ctx);
        
        // Renderiza arma
        this.renderWeapon(ctx);
        
        // Renderiza efeitos especiais
        this.renderSpecialEffects(ctx);
        
        // Renderiza partículas
        this.renderParticles(ctx);
        
        // Renderiza alcance se selecionada
        if (this.showRange) {
            this.renderRange(ctx);
        }
        
        // Renderiza projéteis
        this.renderProjectiles(ctx);
        
        // Renderiza indicadores de nível/evolução
        this.renderEvolutionIndicators(ctx);
    }

    /**
     * Renderiza sombra da torre
     */
    renderShadow(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000000';
        
        const shadowX = this.position.x + this.shadowOffset.x;
        const shadowY = this.position.y + this.shadowOffset.y;
        
        ctx.beginPath();
        ctx.ellipse(shadowX, shadowY, this.size * 0.6, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Renderiza corpo da torre com efeito 3D
     */
    renderBody3D(ctx) {
        ctx.save();
        
        // Efeito de altura
        const baseY = this.position.y;
        const topY = baseY - this.height;
        
        // Gradiente para simular profundidade
        const gradient = ctx.createLinearGradient(0, topY, 0, baseY);
        gradient.addColorStop(0, this.getLighterColor(this.color));
        gradient.addColorStop(1, this.getDarkerColor(this.color));
        
        ctx.fillStyle = gradient;
        
        // Desenha o corpo da torre
        ctx.fillRect(
            this.position.x - this.size / 2,
            topY,
            this.size,
            this.height
        );
        
        // Borda superior
        ctx.fillStyle = this.getLighterColor(this.color);
        ctx.fillRect(
            this.position.x - this.size / 2,
            topY,
            this.size,
            4
        );
        
        ctx.restore();
    }

    /**
     * Renderiza efeitos especiais da torre
     */
    renderSpecialEffects(ctx) {
        // Aura da evolução
        if (this.aura) {
            this.renderAura(ctx);
        }
        
        // Brilho da evolução
        if (this.evolutionGlow && this.glowEffect > 0) {
            this.renderEvolutionGlow(ctx);
        }
        
        // Animação de upgrade
        if (this.upgradeAnimation > 0) {
            this.renderUpgradeAnimation(ctx);
        }
    }

    /**
     * Renderiza aura da torre
     */
    renderAura(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.4 * this.glowEffect;
        
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.size * 2
        );
        
        gradient.addColorStop(0, this.aura.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Renderiza brilho da evolução
     */
    renderEvolutionGlow(ctx) {
        ctx.save();
        ctx.globalAlpha = this.glowEffect * 0.6;
        ctx.shadowColor = this.getEvolutionColor();
        ctx.shadowBlur = 20;
        
        ctx.strokeStyle = this.getEvolutionColor();
        ctx.lineWidth = 2;
        ctx.strokeRect(
            this.position.x - this.size / 2 - 2,
            this.position.y - this.size / 2 - 2,
            this.size + 4,
            this.size + 4
        );
        
        ctx.restore();
    }

    /**
     * Renderiza partículas da torre
     */
    renderParticles(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }

    /**
     * Renderiza indicadores de evolução
     */
    renderEvolutionIndicators(ctx) {
        if (this.currentEvolution) {
            // Ícone de evolução
            ctx.save();
            ctx.fillStyle = this.getEvolutionColor();
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            
            // Estrela indicando evolução
            const starX = this.position.x + this.size / 2 - 6;
            const starY = this.position.y - this.size / 2 + 6;
            
            ctx.fillText('★', starX, starY);
            ctx.restore();
        }
        
        // Indicador de nível
        if (this.level > 1) {
            ctx.save();
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                this.level.toString(),
                this.position.x,
                this.position.y + this.size / 2 + 12
            );
            ctx.restore();
        }
    }

    /**
     * Obtém cor mais clara
     */
    getLighterColor(color) {
        // Implementação simplificada - em produção usar biblioteca de cores
        return color.replace(/rgb\((\d+),(\d+),(\d+)\)/, (match, r, g, b) => {
            return `rgb(${Math.min(255, parseInt(r) + 30)},${Math.min(255, parseInt(g) + 30)},${Math.min(255, parseInt(b) + 30)})`;
        });
    }

    /**
     * Obtém cor mais escura
     */
    getDarkerColor(color) {
        // Implementação simplificada - em produção usar biblioteca de cores
        return color.replace(/rgb\((\d+),(\d+),(\d+)\)/, (match, r, g, b) => {
            return `rgb(${Math.max(0, parseInt(r) - 30)},${Math.max(0, parseInt(g) - 30)},${Math.max(0, parseInt(b) - 30)})`;
        });
    }

    /**
     * Sistema de evolução da torre
     */
    evolve(evolutionType) {
        if (!this.canEvolve(evolutionType)) {
            return false;
        }
        
        const evolution = this.evolutionTree.getEvolution(evolutionType);
        const cost = evolution.cost;
        
        // Aplica a evolução
        this.currentEvolution = evolutionType;
        this.evolutionLevel++;
        this.applyEvolutionBonuses(evolution);
        
        // Efeitos visuais da evolução
        this.triggerEvolutionEffects();
        
        this.emit('evolved', evolutionType, cost);
        return true;
    }

    /**
     * Verifica se pode evoluir para um tipo específico
     */
    canEvolve(evolutionType) {
        return this.evolutionTree.canEvolve(evolutionType, this.level, this.currentEvolution);
    }

    /**
     * Obtém evoluções disponíveis
     */
    getAvailableEvolutions() {
        return this.evolutionTree.getAvailableEvolutions(this.level, this.currentEvolution);
    }

    /**
     * Aplica bônus da evolução
     */
    applyEvolutionBonuses(evolution) {
        const bonuses = evolution.bonuses;
        
        Object.keys(bonuses).forEach(key => {
            if (this.hasOwnProperty(key)) {
                if (typeof bonuses[key] === 'number') {
                    this[key] += bonuses[key];
                } else {
                    this[key] = bonuses[key];
                }
            }
        });
        
        // Atualiza propriedades especiais da evolução
        this.setupEvolutionSpecials(evolution);
    }

    /**
     * Configura propriedades especiais da evolução
     */
    setupEvolutionSpecials(evolution) {
        if (evolution.specialAbilities) {
            this.specialAbilities = evolution.specialAbilities;
        }
        
        if (evolution.visualEffects) {
            this.setupEvolutionVisuals(evolution.visualEffects);
        }
    }

    /**
     * Configura efeitos visuais da evolução
     */
    setupEvolutionVisuals(visualEffects) {
        this.aura = visualEffects.aura || null;
        this.evolutionGlow = visualEffects.glow || false;
        this.color = visualEffects.color || this.color;
        
        if (visualEffects.particles) {
            this.createEvolutionParticles(visualEffects.particles);
        }
    }

    /**
     * Cria partículas da evolução
     */
    createEvolutionParticles(particleConfig) {
        for (let i = 0; i < particleConfig.count; i++) {
            const particle = new TowerParticle(
                this.position.x,
                this.position.y,
                particleConfig
            );
            this.particles.push(particle);
        }
    }

    /**
     * Dispara efeitos visuais da evolução
     */
    triggerEvolutionEffects() {
        this.upgradeAnimation = 1.0;
        this.evolutionGlow = true;
        
        // Cria efeito de explosão de luz
        if (this.gameManager && this.gameManager.effectSystem) {
            this.gameManager.effectSystem.createEffect('evolutionBurst', {
                position: this.position.clone(),
                color: this.getEvolutionColor(),
                intensity: 1.5
            });
        }
        
        // Adiciona partículas de evolução
        this.createEvolutionBurst();
    }

    /**
     * Cria explosão de partículas da evolução
     */
    createEvolutionBurst() {
        const particleCount = 20;
        const color = this.getEvolutionColor();
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 50 + Math.random() * 30;
            
            const particle = new TowerParticle(
                this.position.x,
                this.position.y,
                {
                    velocity: {
                        x: Math.cos(angle) * speed,
                        y: Math.sin(angle) * speed
                    },
                    color: color,
                    life: 1000 + Math.random() * 500,
                    size: 3 + Math.random() * 2,
                    fade: true
                }
            );
            
            this.particles.push(particle);
        }
    }

    /**
     * Obtém cor da evolução
     */
    getEvolutionColor() {
        const evolutionColors = {
            ARCHER_VETERAN: '#FFD700',
            ARCHER_HUNTER: '#32CD32',
            ARCHER_SNIPER: '#FF4500',
            MAGE_SCHOLAR: '#9370DB',
            MAGE_BATTLE: '#DC143C',
            // ... mais cores para outras evoluções
        };
        
        return evolutionColors[this.currentEvolution] || '#FFFFFF';
    }

    /**
     * Manipulador de evento de evolução
     */
    onEvolved(evolutionType, cost) {
        console.log(`Torre evoluiu para ${evolutionType} por ${cost} ouro`);
    }

    /**
     * Manipulador de evento de level up
     */
    onLevelUp(newLevel) {
        this.triggerLevelUpEffects();
    }

    /**
     * Dispara efeitos de level up
     */
    triggerLevelUpEffects() {
        // Efeito visual de level up
        if (this.gameManager && this.gameManager.effectSystem) {
            this.gameManager.effectSystem.createEffect('levelUp', {
                position: this.position.clone(),
                color: '#FFD700'
            });
        }
    }

    // Getters para valores atuais considerando upgrades

    getCurrentDamage() {
        return this.damage;
    }

    getCurrentRange() {
        return this.range;
    }

    getCurrentAttackSpeed() {
        return this.attackSpeed;
    }

    /**
     * Eventos de torre
     */
    onTargetAcquired(target) {
        // Efeito visual de aquisição de alvo
    }

    onTargetLost() {
        // Efeito visual de perda de alvo
    }

    onAttacked(target) {
        // Efeito visual de ataque
    }

    onUpgraded(upgradeType, cost) {
        // Efeito visual de upgrade
        this.addEffect('upgrade_flash', {
            duration: 500,
            update: (deltaTime) => {},
            render: (ctx) => {
                ctx.save();
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2 + 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }

    /**
     * Obtém informações da torre
     */
    getInfo() {
        return {
            name: this.config.name,
            description: this.config.description,
            level: this.level,
            damage: this.getCurrentDamage(),
            range: this.getCurrentRange(),
            attackSpeed: this.getCurrentAttackSpeed(),
            upgrades: { ...this.upgrades },
            sellValue: this.getSellValue(),
            upgradeCosts: {
                damage: this.getUpgradeCost('damage'),
                range: this.getUpgradeCost('range'),
                speed: this.getUpgradeCost('speed')
            }
        };
    }

    /**
     * Serialização específica da torre
     */
    toJSON() {
        const baseData = super.toJSON();
        return {
            ...baseData,
            towerType: this.towerType,
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed,
            level: this.level,
            upgrades: this.upgrades,
            lastAttackTime: this.lastAttackTime
        };
    }

    /**
     * Atualiza animações e efeitos visuais
     */
    updateVisualEffects(deltaTime) {
        // Atualiza animação de tiro
        if (this.shootAnimation > 0) {
            this.shootAnimation -= deltaTime;
        }
        
        // Atualiza efeitos de evolução
        if (this.evolutionGlow > 0) {
            this.evolutionGlow -= deltaTime;
        }
        
        // Atualiza pulsação de upgrade
        if (this.upgradePulse > 0) {
            this.upgradePulse -= deltaTime;
        }
        
        // Atualiza rotação do canhão suavemente
        if (this.target) {
            const targetAngle = this.position.angleTo(this.target.position);
            const angleDiff = targetAngle - this.barrelRotation;
            
            // Normaliza a diferença de ângulo
            let normalizedDiff = angleDiff;
            while (normalizedDiff > Math.PI) normalizedDiff -= 2 * Math.PI;
            while (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
            
            // Rotação suave
            const rotationSpeed = 0.1;
            this.barrelRotation += normalizedDiff * rotationSpeed;
        }
    }

    /**
     * Atualiza partículas da torre
     */
    updateParticles(deltaTime) {
        // Atualiza partículas existentes
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
        
        // Cria novas partículas baseadas no estado da torre
        this.createStateParticles(deltaTime);
    }
    
    /**
     * Cria partículas baseadas no estado atual
     */
    createStateParticles(deltaTime) {
        // Partículas de energia para torres mágicas
        if (this.towerType.includes('MAGE') && Math.random() < 0.3) {
            this.createEnergyParticle();
        }
        
        // Partículas de gelo para torres de gelo
        if (this.towerType.includes('ICE') && Math.random() < 0.2) {
            this.createIceParticle();
        }
        
        // Partículas de veneno para torres venenosas
        if (this.towerType.includes('POISON') && Math.random() < 0.25) {
            this.createPoisonParticle();
        }
        
        // Partículas de evolução
        if (this.currentEvolution && Math.random() < 0.1) {
            this.createEvolutionParticle();
        }
    }
    
    /**
     * Cria partícula de energia
     */
    createEnergyParticle() {
        const particle = new TowerParticle({
            x: this.position.x + (Math.random() - 0.5) * 20,
            y: this.position.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 30,
            vy: (Math.random() - 0.5) * 30,
            life: 1000 + Math.random() * 500,
            color: '#4B0082',
            size: 2 + Math.random() * 3,
            type: 'energy'
        });
        
        this.particles.push(particle);
    }
    
    /**
     * Cria partícula de gelo
     */
    createIceParticle() {
        const particle = new TowerParticle({
            x: this.position.x + (Math.random() - 0.5) * 15,
            y: this.position.y + (Math.random() - 0.5) * 15,
            vx: (Math.random() - 0.5) * 20,
            vy: -Math.random() * 40 - 10,
            life: 800 + Math.random() * 400,
            color: '#87CEEB',
            size: 1 + Math.random() * 2,
            type: 'ice'
        });
        
        this.particles.push(particle);
    }
    
    /**
     * Cria partícula de veneno
     */
    createPoisonParticle() {
        const particle = new TowerParticle({
            x: this.position.x + (Math.random() - 0.5) * 18,
            y: this.position.y + (Math.random() - 0.5) * 18,
            vx: (Math.random() - 0.5) * 25,
            vy: -Math.random() * 30 - 5,
            life: 1200 + Math.random() * 600,
            color: '#9ACD32',
            size: 1.5 + Math.random() * 2.5,
            type: 'poison'
        });
        
        this.particles.push(particle);
    }
    
    /**
     * Cria partícula de evolução
     */
    createEvolutionParticle() {
        const particle = new TowerParticle({
            x: this.position.x + (Math.random() - 0.5) * 25,
            y: this.position.y + (Math.random() - 0.5) * 25,
            vx: (Math.random() - 0.5) * 40,
            vy: -Math.random() * 50 - 20,
            life: 1500 + Math.random() * 800,
            color: this.getEvolutionColor(),
            size: 2 + Math.random() * 4,
            type: 'evolution'
        });
        
        this.particles.push(particle);
    }

    /**
     * Renderiza base da torre
     */
    renderBase(ctx) {
        ctx.save();
        ctx.fillStyle = this.getDarkerColor(this.color);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Renderiza arma da torre
     */
    renderWeapon(ctx) {
        if (!this.target) return;
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.barrelRotation);
        
        // Desenha canhão
        ctx.fillStyle = this.getDarkerColor(this.color);
        ctx.fillRect(-2, -8, 4, 16);
        
        // Desenha boca do canhão
        ctx.fillStyle = '#333';
        ctx.fillRect(-1, -6, 2, 12);
        
        ctx.restore();
    }

    /**
     * Renderiza alcance da torre
     */
    renderRange(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.getCurrentRange(), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Renderiza projéteis da torre
     */
    renderProjectiles(ctx) {
        this.projectiles.forEach(projectile => {
            if (projectile.render) {
                projectile.render(ctx);
            }
        });
    }

    /**
     * Renderiza animação de upgrade
     */
    renderUpgradeAnimation(ctx) {
        ctx.save();
        ctx.globalAlpha = this.upgradeAnimation;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        
        const pulseSize = this.size / 2 + (this.upgradeAnimation * 10);
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
} 