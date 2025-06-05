/**
 * AttackStrategy - Estratégias de ataque para torres
 * Implementa o padrão Strategy para diferentes tipos de ataque
 */

/**
 * Interface base para estratégias de ataque
 */
class AttackStrategy {
    constructor() {
        this.name = 'BaseAttack';
        this.description = 'Estratégia base de ataque';
    }
    
    /**
     * Executa o ataque
     * @param {Tower} tower - Torre que está atacando
     * @param {Enemy} target - Alvo do ataque
     * @param {Object} context - Contexto adicional (gameManager, etc.)
     */
    execute(tower, target, context) {
        throw new Error('Método execute deve ser implementado pela estratégia concreta');
    }
    
    /**
     * Verifica se pode atacar o alvo
     */
    canAttack(tower, target) {
        return target && 
               !target.destroyed && 
               tower.isInRange(target) && 
               this.meetsAttackConditions(tower, target);
    }
    
    /**
     * Condições específicas para o ataque
     */
    meetsAttackConditions(tower, target) {
        return true; // Implementar nas subclasses se necessário
    }
    
    /**
     * Calcula dano base
     */
    calculateBaseDamage(tower) {
        return tower.getCurrentDamage();
    }
    
    /**
     * Aplica modificadores de dano
     */
    applyDamageModifiers(damage, tower, target) {
        // Implementar modificadores específicos nas subclasses
        return damage;
    }
}

/**
 * Estratégia de ataque com projétil simples
 */
class ProjectileAttackStrategy extends AttackStrategy {
    constructor() {
        super();
        this.name = 'ProjectileAttack';
        this.description = 'Ataque com projétil direcionado';
    }
    
    execute(tower, target, context) {
        if (!this.canAttack(tower, target)) return false;
        
        const damage = this.calculateBaseDamage(tower);
        const projectileConfig = this.createProjectileConfig(tower, target, damage);
        
        const projectile = new Projectile(
            tower.position.x,
            tower.position.y,
            target,
            projectileConfig
        );
        
        // Adiciona projétil ao contexto do jogo
        if (context.gameManager) {
            context.gameManager.addProjectile(projectile);
        }
        
        tower.projectiles.push(projectile);
        return true;
    }
    
    createProjectileConfig(tower, target, damage) {
        return {
            damage: damage,
            speed: tower.projectileSpeed,
            type: tower.towerType,
            source: tower,
            statusEffect: this.getStatusEffect(tower)
        };
    }
    
    getStatusEffect(tower) {
        // Implementar nas subclasses específicas
        return null;
    }
}

/**
 * Estratégia de ataque em área
 */
class AreaAttackStrategy extends ProjectileAttackStrategy {
    constructor(splashRadius = 30) {
        super();
        this.name = 'AreaAttack';
        this.description = 'Ataque com dano em área';
        this.splashRadius = splashRadius;
    }
    
    createProjectileConfig(tower, target, damage) {
        const config = super.createProjectileConfig(tower, target, damage);
        config.splashRadius = this.splashRadius;
        return config;
    }
    
    applyDamageModifiers(damage, tower, target) {
        // Dano em área pode ter modificadores específicos
        return super.applyDamageModifiers(damage, tower, target);
    }
}

/**
 * Estratégia de ataque instantâneo (raio)
 */
class InstantAttackStrategy extends AttackStrategy {
    constructor() {
        super();
        this.name = 'InstantAttack';
        this.description = 'Ataque instantâneo sem projétil';
    }
    
    execute(tower, target, context) {
        if (!this.canAttack(tower, target)) return false;
        
        const damage = this.calculateBaseDamage(tower);
        const finalDamage = this.applyDamageModifiers(damage, tower, target);
        
        // Aplica dano diretamente
        const actualDamage = target.takeDamage(finalDamage, this.getDamageType(tower));
        
        // Cria efeito visual
        this.createVisualEffect(tower, target, context);
        
        // Aplica efeito de status se houver
        const statusEffect = this.getStatusEffect(tower);
        if (statusEffect && actualDamage > 0) {
            target.addStatusEffect(statusEffect.type, statusEffect);
        }
        
        return true;
    }
    
    getDamageType(tower) {
        return 'lightning'; // Padrão para ataques instantâneos
    }
    
    createVisualEffect(tower, target, context) {
        if (context.effectSystem) {
            context.effectSystem.createEffect('lightning_bolt', {
                x: tower.position.x,
                y: tower.position.y,
                targetX: target.position.x,
                targetY: target.position.y,
                duration: 200
            });
        }
    }
    
    getStatusEffect(tower) {
        return null;
    }
}

/**
 * Estratégia de ataque em cadeia (raio que salta)
 */
class ChainAttackStrategy extends InstantAttackStrategy {
    constructor(maxTargets = 3, damageReduction = 0.7) {
        super();
        this.name = 'ChainAttack';
        this.description = 'Ataque que salta entre inimigos';
        this.maxTargets = maxTargets;
        this.damageReduction = damageReduction;
    }
    
    execute(tower, target, context) {
        if (!this.canAttack(tower, target)) return false;
        
        const targets = this.findChainTargets(tower, target, context);
        let currentDamage = this.calculateBaseDamage(tower);
        
        targets.forEach((chainTarget, index) => {
            const finalDamage = this.applyDamageModifiers(currentDamage, tower, chainTarget);
            const actualDamage = chainTarget.takeDamage(finalDamage, this.getDamageType(tower));
            
            // Cria efeito visual para cada salto
            this.createChainEffect(tower, chainTarget, index, context);
            
            // Aplica efeito de status
            const statusEffect = this.getStatusEffect(tower);
            if (statusEffect && actualDamage > 0) {
                chainTarget.addStatusEffect(statusEffect.type, statusEffect);
            }
            
            // Reduz dano para próximo alvo
            currentDamage *= this.damageReduction;
        });
        
        return true;
    }
    
    findChainTargets(tower, initialTarget, context) {
        const targets = [initialTarget];
        let currentTarget = initialTarget;
        
        for (let i = 1; i < this.maxTargets; i++) {
            const nextTarget = this.findNearestEnemy(currentTarget, targets, tower, context);
            if (nextTarget) {
                targets.push(nextTarget);
                currentTarget = nextTarget;
            } else {
                break;
            }
        }
        
        return targets;
    }
    
    findNearestEnemy(fromTarget, excludeTargets, tower, context) {
        if (!context.gameManager) return null;
        
        const enemies = context.gameManager.getEnemiesInRange(
            fromTarget.position.x,
            fromTarget.position.y,
            tower.range * 0.6 // Alcance reduzido para saltos
        );
        
        return enemies.find(enemy => 
            !excludeTargets.includes(enemy) && 
            !enemy.destroyed
        );
    }
    
    createChainEffect(tower, target, chainIndex, context) {
        if (context.effectSystem) {
            const startPos = chainIndex === 0 ? tower.position : this.previousTarget?.position || tower.position;
            
            context.effectSystem.createEffect('chain_lightning', {
                startX: startPos.x,
                startY: startPos.y,
                endX: target.position.x,
                endY: target.position.y,
                duration: 150,
                chainIndex: chainIndex
            });
        }
        
        this.previousTarget = target;
    }
}

/**
 * Estratégia de ataque com efeito de lentidão
 */
class SlowAttackStrategy extends ProjectileAttackStrategy {
    constructor(slowFactor = 0.5, slowDuration = 3000) {
        super();
        this.name = 'SlowAttack';
        this.description = 'Ataque que reduz velocidade do inimigo';
        this.slowFactor = slowFactor;
        this.slowDuration = slowDuration;
    }
    
    getStatusEffect(tower) {
        return {
            type: 'slow',
            factor: this.slowFactor,
            duration: this.slowDuration
        };
    }
    
    getDamageType(tower) {
        return 'ice';
    }
}

/**
 * Estratégia de ataque com veneno
 */
class PoisonAttackStrategy extends ProjectileAttackStrategy {
    constructor(poisonDamage = 5, poisonDuration = 5000, tickRate = 1000) {
        super();
        this.name = 'PoisonAttack';
        this.description = 'Ataque que causa dano contínuo por veneno';
        this.poisonDamage = poisonDamage;
        this.poisonDuration = poisonDuration;
        this.tickRate = tickRate;
    }
    
    getStatusEffect(tower) {
        return {
            type: 'poison',
            damage: this.poisonDamage,
            duration: this.poisonDuration,
            tickRate: this.tickRate
        };
    }
    
    getDamageType(tower) {
        return 'poison';
    }
}

/**
 * Factory para criar estratégias de ataque
 */
class AttackStrategyFactory {
    static strategies = new Map();
    
    /**
     * Registra uma estratégia
     */
    static registerStrategy(name, strategyClass) {
        this.strategies.set(name, strategyClass);
    }
    
    /**
     * Cria uma estratégia baseada no tipo de torre
     */
    static createStrategy(towerType, config = {}) {
        switch (towerType) {
            case 'ARCHER':
                return new ProjectileAttackStrategy();
                
            case 'MAGE':
                return new AreaAttackStrategy(config.splashRadius || 30);
                
            case 'ICE_MAGE':
                return new SlowAttackStrategy(
                    config.slowFactor || 0.5,
                    config.slowDuration || 3000
                );
                
            case 'POISON_TOWER':
                return new PoisonAttackStrategy(
                    config.poisonDamage || 5,
                    config.poisonDuration || 5000,
                    config.tickRate || 1000
                );
                
            case 'CANNON':
                return new AreaAttackStrategy(config.splashRadius || 40);
                
            case 'LIGHTNING':
                return new ChainAttackStrategy(
                    config.chainTargets || 3,
                    config.chainDamageReduction || 0.7
                );
                
            default:
                return new ProjectileAttackStrategy();
        }
    }
    
    /**
     * Cria estratégia customizada
     */
    static createCustomStrategy(strategyName, config = {}) {
        const StrategyClass = this.strategies.get(strategyName);
        if (StrategyClass) {
            return new StrategyClass(config);
        }
        
        console.warn(`Estratégia não encontrada: ${strategyName}`);
        return new ProjectileAttackStrategy();
    }
    
    /**
     * Lista todas as estratégias disponíveis
     */
    static getAvailableStrategies() {
        return Array.from(this.strategies.keys());
    }
}

// Registra estratégias padrão
AttackStrategyFactory.registerStrategy('projectile', ProjectileAttackStrategy);
AttackStrategyFactory.registerStrategy('area', AreaAttackStrategy);
AttackStrategyFactory.registerStrategy('instant', InstantAttackStrategy);
AttackStrategyFactory.registerStrategy('chain', ChainAttackStrategy);
AttackStrategyFactory.registerStrategy('slow', SlowAttackStrategy);
AttackStrategyFactory.registerStrategy('poison', PoisonAttackStrategy); 