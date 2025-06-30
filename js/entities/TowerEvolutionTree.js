/**
 * TowerEvolutionTree - Gerencia a árvore de evolução das torres
 * Implementa o padrão Strategy para diferentes tipos de evolução
 */
class TowerEvolutionTree {
    constructor(tower) {
        this.tower = tower;
        this.towerType = tower.towerType;
        this.evolutionData = TOWER_EVOLUTION[this.towerType] || {};
    }

    /**
     * Verifica se a torre pode evoluir para um tipo específico
     */
    canEvolve(evolutionType, currentLevel, currentEvolution) {
        const evolution = this.getEvolution(evolutionType);
        
        if (!evolution) {
            return false;
        }

        // Verifica requisitos de nível
        if (evolution.requirements.level && currentLevel < evolution.requirements.level) {
            return false;
        }

        // Verifica requisitos de evolução anterior
        if (evolution.requirements.evolution && currentEvolution !== evolution.requirements.evolution) {
            return false;
        }

        // Verifica se já não evoluiu para este tipo
        if (currentEvolution === evolutionType) {
            return false;
        }

        return true;
    }

    /**
     * Obtém dados de uma evolução específica
     */
    getEvolution(evolutionType) {
        // Procura nas evoluções básicas
        if (this.evolutionData.evolutions && this.evolutionData.evolutions[evolutionType]) {
            return this.evolutionData.evolutions[evolutionType];
        }

        // Procura nas especializações
        if (this.evolutionData.specializations && this.evolutionData.specializations[evolutionType]) {
            return this.evolutionData.specializations[evolutionType];
        }

        return null;
    }

    /**
     * Obtém todas as evoluções disponíveis para o estado atual da torre
     */
    getAvailableEvolutions(currentLevel, currentEvolution) {
        const available = [];

        // Verifica evoluções básicas
        if (this.evolutionData.evolutions) {
            Object.keys(this.evolutionData.evolutions).forEach(evolutionType => {
                if (this.canEvolve(evolutionType, currentLevel, currentEvolution)) {
                    available.push({
                        type: evolutionType,
                        data: this.evolutionData.evolutions[evolutionType],
                        category: 'evolution'
                    });
                }
            });
        }

        // Verifica especializações
        if (this.evolutionData.specializations) {
            Object.keys(this.evolutionData.specializations).forEach(evolutionType => {
                if (this.canEvolve(evolutionType, currentLevel, currentEvolution)) {
                    available.push({
                        type: evolutionType,
                        data: this.evolutionData.specializations[evolutionType],
                        category: 'specialization'
                    });
                }
            });
        }

        return available;
    }

    /**
     * Obtém o caminho de evolução completo
     */
    getEvolutionPath(targetEvolution) {
        const path = [];
        let current = targetEvolution;

        while (current) {
            const evolution = this.getEvolution(current);
            if (!evolution) break;

            path.unshift({
                type: current,
                data: evolution
            });

            current = evolution.requirements.evolution;
        }

        return path;
    }

    /**
     * Calcula o custo total para uma evolução
     */
    getTotalEvolutionCost(targetEvolution) {
        const path = this.getEvolutionPath(targetEvolution);
        return path.reduce((total, step) => total + step.data.cost, 0);
    }

    /**
     * Verifica se uma evolução é uma especialização
     */
    isSpecialization(evolutionType) {
        return this.evolutionData.specializations && 
               this.evolutionData.specializations[evolutionType] !== undefined;
    }

    /**
     * Obtém todas as especializações disponíveis para uma evolução base
     */
    getSpecializationsFor(baseEvolution) {
        const specializations = [];

        if (this.evolutionData.specializations) {
            Object.keys(this.evolutionData.specializations).forEach(evolutionType => {
                const evolution = this.evolutionData.specializations[evolutionType];
                if (evolution.requirements.evolution === baseEvolution) {
                    specializations.push({
                        type: evolutionType,
                        data: evolution
                    });
                }
            });
        }

        return specializations;
    }
}

/**
 * TowerSpecialConfig - Configura propriedades especiais das torres
 * Implementa o padrão Factory para diferentes configurações
 */
class TowerSpecialConfig {
    constructor(towerType, config) {
        this.towerType = towerType;
        this.config = config;
    }

    /**
     * Obtém propriedades especiais baseadas no tipo de torre
     */
    getProperties() {
        const properties = {};

        switch (this.towerType) {
            case 'MAGE':
            case 'CANNON':
                properties.splashRadius = this.config.splashRadius;
                break;
                
            case 'ICE_MAGE':
                properties.slowEffect = this.config.slowEffect;
                properties.slowDuration = this.config.slowDuration;
                break;
                
            case 'POISON_TOWER':
                properties.poisonDamage = this.config.poisonDamage;
                properties.poisonDuration = this.config.poisonDuration;
                properties.poisonTick = this.config.poisonTick;
                break;
                
            case 'LIGHTNING':
                properties.chainTargets = this.config.chainTargets;
                properties.chainDamageReduction = this.config.chainDamageReduction;
                break;
        }

        return properties;
    }
}

/**
 * TowerParticle - Representa partículas visuais das torres
 */
class TowerParticle {
    constructor(x, y, config = {}) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(
            config.velocity?.x || 0,
            config.velocity?.y || 0
        );
        
        this.color = config.color || '#FFFFFF';
        this.size = config.size || 2;
        this.life = config.life || 1000;
        this.maxLife = this.life;
        this.fade = config.fade || false;
        this.gravity = config.gravity || 0;
        
        this.alpha = 1.0;
    }

    /**
     * Atualiza a partícula
     */
    update(deltaTime) {
        // Atualiza posição
        this.position.x += this.velocity.x * deltaTime * 0.001;
        this.position.y += this.velocity.y * deltaTime * 0.001;
        
        // Aplica gravidade
        if (this.gravity > 0) {
            this.velocity.y += this.gravity * deltaTime * 0.001;
        }
        
        // Atualiza vida
        this.life -= deltaTime;
        
        // Atualiza transparência se fade estiver ativo
        if (this.fade) {
            this.alpha = this.life / this.maxLife;
        }
    }

    /**
     * Renderiza a partícula
     */
    render(ctx) {
        if (this.isDead()) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Verifica se a partícula está morta
     */
    isDead() {
        return this.life <= 0;
    }
} 