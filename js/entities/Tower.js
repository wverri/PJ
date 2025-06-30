/**
 * Classe Tower - representa as torres defensivas
 * Implementa o padrão Strategy para diferentes tipos de ataque
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
        this.attackStrategy = null; // Estratégia de ataque
        
        // Propriedades especiais baseadas no tipo
        this.setupSpecialProperties();
        
        // Upgrades
        this.level = 1;
        this.upgrades = {
            damage: 0,
            range: 0,
            speed: 0,
            special: 0
        };

        // Evolução
        this.evolutionStage = 0;
        
        // Estado visual
        this.collisionRadius = this.size / 2;
        this.solid = true;
        this.showRange = false;
        
        // Animação
        this.barrelRotation = 0;
        this.shootAnimation = 0;
        
        // Eventos
        this.on('targetAcquired', this.onTargetAcquired.bind(this));
        this.on('targetLost', this.onTargetLost.bind(this));
        this.on('attacked', this.onAttacked.bind(this));
        this.on('upgraded', this.onUpgraded.bind(this));
    }

    /**
     * Configura propriedades especiais baseadas no tipo de torre
     */
    setupSpecialProperties() {
        switch (this.towerType) {
            case 'MAGE':
            case 'CANNON':
                this.splashRadius = this.config.splashRadius;
                break;
                
            case 'ICE_MAGE':
                this.slowEffect = this.config.slowEffect;
                this.slowDuration = this.config.slowDuration;
                break;
                
            case 'POISON_TOWER':
                this.poisonDamage = this.config.poisonDamage;
                this.poisonDuration = this.config.poisonDuration;
                this.poisonTick = this.config.poisonTick;
                break;
                
            case 'LIGHTNING':
                this.chainTargets = this.config.chainTargets;
                this.chainDamageReduction = this.config.chainDamageReduction;
                break;
        }
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
        
        // Atualiza animações
        this.updateAnimations(deltaTime);
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

    /**
     * Renderização específica da torre
     */
    onRender(ctx) {
        // Base da torre
        this.renderBase(ctx);
        
        // Canhão/Arma
        this.renderWeapon(ctx);
        
        // Indicador de alcance (se ativo)
        if (this.showRange) {
            this.renderRange(ctx);
        }
        
        // Ícone da torre
        this.renderIcon(ctx);
        
        // Projéteis
        this.renderProjectiles(ctx);
    }

    /**
     * Renderiza base da torre
     */
    renderBase(ctx) {
        const radius = this.size / 2;
        
        // Sombra
        ctx.save();
        ctx.translate(2, 2);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        ctx.restore();
        
        // Base principal
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, ColorUtils.lighten(this.color, 0.3));
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, ColorUtils.darken(this.color, 0.3));
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = ColorUtils.darken(this.color, 0.4);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Detalhes da base
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = ColorUtils.lighten(this.color, 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /**
     * Renderiza arma/canhão
     */
    renderWeapon(ctx) {
        ctx.save();
        ctx.rotate(this.barrelRotation);
        
        const weaponLength = this.size * 0.8;
        const weaponWidth = this.size * 0.2;
        
        // Animação de tiro
        let recoil = 0;
        if (this.shootAnimation > 0) {
            recoil = (this.shootAnimation / 300) * 3;
        }
        
        // Canhão
        ctx.fillStyle = ColorUtils.darken(this.color, 0.2);
        ctx.fillRect(-recoil, -weaponWidth / 2, weaponLength, weaponWidth);
        
        // Borda do canhão
        ctx.strokeStyle = ColorUtils.darken(this.color, 0.5);
        ctx.lineWidth = 1;
        ctx.strokeRect(-recoil, -weaponWidth / 2, weaponLength, weaponWidth);
        
        // Ponta do canhão
        ctx.fillStyle = ColorUtils.darken(this.color, 0.4);
        ctx.fillRect(weaponLength - recoil, -weaponWidth / 4, 4, weaponWidth / 2);
        
        ctx.restore();
    }

    /**
     * Renderiza indicador de alcance
     */
    renderRange(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, this.getCurrentRange(), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Renderiza ícone da torre
     */
    renderIcon(ctx) {
        ctx.save();
        ctx.font = `${this.size * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        
        ctx.strokeText(this.icon, 0, 0);
        ctx.fillText(this.icon, 0, 0);
        
        ctx.restore();
    }

    /**
     * Renderiza projéteis
     */
    renderProjectiles(ctx) {
        this.projectiles.forEach(projectile => {
            projectile.render(ctx);
        });
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
} 