/**
 * Classe Enemy - representa os inimigos do jogo
 * Implementa o padrão Strategy para diferentes tipos de movimento
 */
class Enemy extends GameObject {
    constructor(x, y, enemyType) {
        super(x, y);
        
        // Configurações do tipo de inimigo
        this.enemyType = enemyType;
        this.config = ENEMY_TYPES[enemyType];
        
        if (!this.config) {
            throw new Error(`Tipo de inimigo inválido: ${enemyType}`);
        }
        
        // Propriedades básicas
        this.maxHealth = this.config.health;
        this.health = this.maxHealth;
        this.speed = this.config.speed;
        this.goldReward = this.config.goldReward;
        this.size = this.config.size;
        this.color = this.config.color;
        this.icon = this.config.icon;
        this.damage = this.config.damage || 1; // Dano causado ao jogador
        this.scoreValue = this.config.scoreValue || this.goldReward * 10; // Pontuação
        
        // Propriedades de movimento
        this.path = [];
        this.currentPathIndex = 0;
        this.targetPosition = null;
        this.baseSpeed = this.speed;
        
        // Estados e efeitos
        this.statusEffects = new Map();
        this.immunities = new Set();
        this.resistances = new Map();
        
        // Configurar resistências específicas
        this.setupResistances();
        
        // Propriedades visuais
        this.collisionRadius = this.size / 2;
        this.solid = true;
        
        // Regeneração (se aplicável)
        this.regeneration = this.config.regeneration || 0;
        this.lastRegenTime = 0;
        
        // Animação de movimento
        this.animationOffset = Math.random() * Math.PI * 2;
        this.bobAmount = 2;
        
        // Eventos
        this.on('damaged', this.onDamaged.bind(this));
        this.on('healed', this.onHealed.bind(this));
        this.on('died', this.onDied.bind(this));
    }

    /**
     * Configura resistências específicas do inimigo
     */
    setupResistances() {
        if (this.config.fireResistance) {
            this.resistances.set('fire', this.config.fireResistance);
        }
        if (this.config.magicResistance) {
            this.resistances.set('magic', this.config.magicResistance);
        }
        if (this.config.iceResistance) {
            this.resistances.set('ice', this.config.iceResistance);
        }
        if (this.config.poisonResistance) {
            this.resistances.set('poison', this.config.poisonResistance);
        }
    }

    /**
     * Define o caminho que o inimigo deve seguir
     */
    setPath(path) {
        this.path = [...path];
        this.currentPathIndex = 0;
        this.updateTarget();
    }

    /**
     * Atualiza o próximo alvo no caminho
     */
    updateTarget() {
        if (this.currentPathIndex < this.path.length) {
            this.targetPosition = this.path[this.currentPathIndex].clone();
        } else {
            this.targetPosition = null;
        }
    }

    /**
     * Atualização específica do inimigo
     */
    onUpdate(deltaTime) {
        // Atualiza efeitos de status
        this.updateStatusEffects(deltaTime);
        
        // Regeneração
        this.updateRegeneration(deltaTime);
        
        // Movimento
        this.updateMovement(deltaTime);
        
        // Verifica se chegou ao fim do caminho
        this.checkPathCompletion();
    }

    /**
     * Atualiza efeitos de status
     */
    updateStatusEffects(deltaTime) {
        for (const [effectType, effect] of this.statusEffects) {
            effect.duration -= deltaTime;
            
            // Aplica efeito contínuo
            this.applyStatusEffect(effectType, effect, deltaTime);
            
            // Remove efeito expirado
            if (effect.duration <= 0) {
                this.removeStatusEffect(effectType);
            }
        }
    }

    /**
     * Aplica efeito de status
     */
    applyStatusEffect(effectType, effect, deltaTime) {
        switch (effectType) {
            case 'slow':
                // Redução de velocidade já aplicada na velocidade atual
                break;
                
            case 'poison':
                if (effect.lastTick + effect.tickRate <= this.age) {
                    this.takeDamage(effect.damage, 'poison');
                    effect.lastTick = this.age;
                }
                break;
                
            case 'burn':
                if (effect.lastTick + effect.tickRate <= this.age) {
                    this.takeDamage(effect.damage, 'fire');
                    effect.lastTick = this.age;
                }
                break;
                
            case 'freeze':
                // Congelamento já aplicado na velocidade
                break;
        }
    }

    /**
     * Atualiza regeneração
     */
    updateRegeneration(deltaTime) {
        if (this.regeneration > 0) {
            this.lastRegenTime += deltaTime;
            
            if (this.lastRegenTime >= 1000) { // Regenera a cada segundo
                this.heal(this.regeneration);
                this.lastRegenTime = 0;
            }
        }
    }

    /**
     * Atualiza movimento do inimigo
     */
    updateMovement(deltaTime) {
        if (!this.targetPosition) return;
        
        const direction = Vector2D.subtract(this.targetPosition, this.position);
        const distance = direction.magnitude();
        
        // Verifica se chegou ao alvo atual
        if (distance < 5) {
            this.currentPathIndex++;
            this.updateTarget();
            return;
        }
        
        // Calcula velocidade atual considerando efeitos
        const currentSpeed = this.getCurrentSpeed();
        
        // Move em direção ao alvo
        direction.normalize();
        const movement = Vector2D.multiply(direction, currentSpeed * deltaTime / 1000);
        this.position.add(movement);
        
        // Atualiza rotação para olhar na direção do movimento
        this.rotation = direction.angle();
    }

    /**
     * Calcula velocidade atual considerando efeitos de status
     */
    getCurrentSpeed() {
        let speedMultiplier = 1.0;
        
        // Aplica efeitos de lentidão
        if (this.statusEffects.has('slow')) {
            speedMultiplier *= this.statusEffects.get('slow').factor;
        }
        
        if (this.statusEffects.has('freeze')) {
            speedMultiplier *= this.statusEffects.get('freeze').factor;
        }
        
        return this.baseSpeed * speedMultiplier;
    }

    /**
     * Verifica se chegou ao fim do caminho
     */
    checkPathCompletion() {
        if (this.currentPathIndex >= this.path.length && !this.targetPosition) {
            this.reachEnd();
        }
    }

    /**
     * Verifica se o inimigo chegou ao fim do caminho
     */
    hasReachedEnd() {
        return this.currentPathIndex >= this.path.length && !this.targetPosition;
    }

    /**
     * Verifica se o inimigo está morto
     */
    isDead() {
        return this.destroyed || this.health <= 0;
    }

    /**
     * Chamado quando o inimigo chega ao fim do caminho
     */
    reachEnd() {
        this.emit('reachedEnd', this);
        this.destroy();
    }

    /**
     * Recebe dano
     */
    takeDamage(amount, damageType = 'physical') {
        if (this.destroyed || this.health <= 0) return 0;
        
        // Verifica imunidade
        if (this.immunities.has(damageType)) {
            return 0;
        }
        
        // Aplica resistência
        let finalDamage = amount;
        if (this.resistances.has(damageType)) {
            finalDamage *= (1 - this.resistances.get(damageType));
        }
        
        finalDamage = Math.max(1, Math.floor(finalDamage)); // Mínimo 1 de dano
        
        this.health -= finalDamage;
        this.emit('damaged', finalDamage, damageType);
        
        // Verifica morte
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        return finalDamage;
    }

    /**
     * Cura o inimigo
     */
    heal(amount) {
        if (this.destroyed || this.health <= 0) return 0;
        
        const healAmount = Math.min(amount, this.maxHealth - this.health);
        this.health += healAmount;
        this.emit('healed', healAmount);
        
        return healAmount;
    }

    /**
     * Adiciona efeito de status
     */
    addStatusEffect(effectType, config) {
        if (this.immunities.has(effectType)) return false;
        
        const effect = {
            type: effectType,
            duration: config.duration,
            ...config
        };
        
        // Efeitos especiais de inicialização
        switch (effectType) {
            case 'poison':
            case 'burn':
                effect.lastTick = this.age;
                break;
        }
        
        this.statusEffects.set(effectType, effect);
        this.emit('statusEffectAdded', effectType, effect);
        
        return true;
    }

    /**
     * Remove efeito de status
     */
    removeStatusEffect(effectType) {
        if (this.statusEffects.has(effectType)) {
            this.statusEffects.delete(effectType);
            this.emit('statusEffectRemoved', effectType);
        }
    }

    /**
     * Verifica se tem efeito de status
     */
    hasStatusEffect(effectType) {
        return this.statusEffects.has(effectType);
    }

    /**
     * Mata o inimigo
     */
    die() {
        if (this.destroyed) return;
        
        this.emit('died', this);
        this.destroy();
    }

    /**
     * Renderização específica do inimigo
     */
    onRender(ctx) {
        // Animação de movimento (bobbing)
        const bobOffset = Math.sin(this.age * 0.005 + this.animationOffset) * this.bobAmount;
        
        ctx.save();
        ctx.translate(0, bobOffset);
        
        // Corpo principal
        this.renderBody(ctx);
        
        // Barra de vida
        this.renderHealthBar(ctx);
        
        // Efeitos de status
        this.renderStatusEffects(ctx);
        
        // Ícone do inimigo
        this.renderIcon(ctx);
        
        ctx.restore();
    }

    /**
     * Renderiza o corpo do inimigo
     */
    renderBody(ctx) {
        const radius = this.size / 2;
        
        // Sombra
        ctx.save();
        ctx.translate(2, 2);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        ctx.restore();
        
        // Corpo principal
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        
        // Gradiente baseado na vida
        const healthPercent = this.health / this.maxHealth;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        
        if (healthPercent > 0.5) {
            gradient.addColorStop(0, ColorUtils.lighten(this.color, 0.3));
            gradient.addColorStop(1, this.color);
        } else {
            gradient.addColorStop(0, ColorUtils.lighten(this.color, 0.2));
            gradient.addColorStop(1, ColorUtils.darken(this.color, 0.3));
        }
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = ColorUtils.darken(this.color, 0.4);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Renderiza barra de vida
     */
    renderHealthBar(ctx) {
        if (this.health >= this.maxHealth) return;
        
        const barWidth = this.size + 4;
        const barHeight = 4;
        const barY = -this.size / 2 - 8;
        
        // Fundo da barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
        
        // Barra de vida
        const healthPercent = this.health / this.maxHealth;
        const healthWidth = barWidth * healthPercent;
        
        let healthColor = '#00FF00';
        if (healthPercent < 0.3) {
            healthColor = '#FF0000';
        } else if (healthPercent < 0.6) {
            healthColor = '#FFFF00';
        }
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(-barWidth / 2, barY, healthWidth, barHeight);
        
        // Borda da barra
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
    }

    /**
     * Renderiza efeitos de status
     */
    renderStatusEffects(ctx) {
        let offsetX = -this.size / 2;
        const offsetY = this.size / 2 + 8;
        
        for (const [effectType, effect] of this.statusEffects) {
            this.renderStatusIcon(ctx, effectType, offsetX, offsetY);
            offsetX += 12;
        }
    }

    /**
     * Renderiza ícone de efeito de status
     */
    renderStatusIcon(ctx, effectType, x, y) {
        const size = 8;
        
        ctx.save();
        ctx.translate(x, y);
        
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        
        switch (effectType) {
            case 'poison':
                ctx.fillStyle = '#32CD32';
                break;
            case 'burn':
                ctx.fillStyle = '#FF4500';
                break;
            case 'slow':
                ctx.fillStyle = '#87CEEB';
                break;
            case 'freeze':
                ctx.fillStyle = '#00BFFF';
                break;
            default:
                ctx.fillStyle = '#FFFFFF';
        }
        
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * Renderiza ícone do inimigo
     */
    renderIcon(ctx) {
        ctx.save();
        ctx.font = `${this.size * 0.8}px Arial`;
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
     * Eventos de dano
     */
    onDamaged(damage, damageType) {
        // Efeito visual de dano
        this.addEffect('damage_flash', {
            duration: 200,
            update: (deltaTime) => {},
            render: (ctx) => {
                ctx.save();
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }

    /**
     * Eventos de cura
     */
    onHealed(amount) {
        // Efeito visual de cura
        this.addEffect('heal_flash', {
            duration: 300,
            update: (deltaTime) => {},
            render: (ctx) => {
                ctx.save();
                ctx.globalCompositeOperation = 'overlay';
                ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }

    /**
     * Eventos de morte
     */
    onDied() {
        // Efeito de morte será adicionado pelo GameManager
    }

    /**
     * Obtém informações do inimigo
     */
    getInfo() {
        return {
            name: this.config.name,
            health: this.health,
            maxHealth: this.maxHealth,
            speed: this.getCurrentSpeed(),
            goldReward: this.goldReward,
            statusEffects: Array.from(this.statusEffects.keys()),
            resistances: Object.fromEntries(this.resistances)
        };
    }

    /**
     * Serialização específica do inimigo
     */
    toJSON() {
        const baseData = super.toJSON();
        return {
            ...baseData,
            enemyType: this.enemyType,
            health: this.health,
            maxHealth: this.maxHealth,
            goldReward: this.goldReward,
            currentPathIndex: this.currentPathIndex,
            statusEffects: Object.fromEntries(this.statusEffects)
        };
    }
} 