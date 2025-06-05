/**
 * Classe Projectile - representa projéteis disparados pelas torres
 * Implementa diferentes tipos de projéteis com comportamentos específicos
 */
class Projectile extends GameObject {
    constructor(x, y, target, config) {
        super(x, y);
        
        // Configurações do projétil
        this.target = target;
        this.damage = config.damage;
        this.speed = config.speed;
        this.type = config.type;
        this.source = config.source;
        this.splashRadius = config.splashRadius || 0;
        this.statusEffect = config.statusEffect || null;
        
        // Propriedades visuais
        this.size = 6;
        this.setupVisualProperties();
        
        // Propriedades de movimento
        this.targetPosition = target ? target.position.clone() : null;
        this.hasHit = false;
        
        // Tempo de vida máximo (para evitar projéteis infinitos)
        this.maxAge = 5000; // 5 segundos
        
        // Configurações específicas do tipo
        this.setupTypeSpecificProperties();
        
        // Eventos
        this.on('hit', this.onHit.bind(this));
        this.on('exploded', this.onExploded.bind(this));
    }

    /**
     * Configura propriedades visuais baseadas no tipo
     */
    setupVisualProperties() {
        switch (this.type) {
            case 'ARCHER':
                this.color = '#8B4513';
                this.size = 4;
                this.trail = true;
                break;
                
            case 'MAGE':
                this.color = '#FF4500';
                this.size = 8;
                this.glow = true;
                this.particles = true;
                break;
                
            case 'ICE_MAGE':
                this.color = '#87CEEB';
                this.size = 6;
                this.glow = true;
                this.iceTrail = true;
                break;
                
            case 'POISON_TOWER':
                this.color = '#32CD32';
                this.size = 5;
                this.poisonTrail = true;
                break;
                
            case 'CANNON':
                this.color = '#696969';
                this.size = 10;
                this.heavy = true;
                this.smokeTrail = true;
                break;
                
            default:
                this.color = '#FFFFFF';
                this.size = 6;
        }
    }

    /**
     * Configura propriedades específicas do tipo
     */
    setupTypeSpecificProperties() {
        switch (this.type) {
            case 'CANNON':
                // Projéteis de canhão têm trajetória parabólica
                this.gravity = 200;
                this.initialVelocityY = -100;
                this.velocityY = this.initialVelocityY;
                break;
                
            case 'MAGE':
                // Bolas de fogo criam partículas
                this.particleTimer = 0;
                this.particleInterval = 50;
                break;
        }
    }

    /**
     * Atualização específica do projétil
     */
    onUpdate(deltaTime) {
        // Verifica se o alvo ainda existe
        if (this.target && this.target.destroyed) {
            this.destroy();
            return;
        }
        
        // Atualiza posição do alvo se ainda estiver vivo
        if (this.target && !this.target.destroyed) {
            this.targetPosition = this.target.position.clone();
        }
        
        // Atualiza movimento
        this.updateMovement(deltaTime);
        
        // Verifica colisão
        this.checkCollision();
        
        // Atualiza efeitos específicos do tipo
        this.updateTypeSpecificEffects(deltaTime);
    }

    /**
     * Atualiza movimento do projétil
     */
    updateMovement(deltaTime) {
        if (!this.targetPosition || this.hasHit) return;
        
        const deltaSeconds = deltaTime / 1000;
        
        if (this.type === 'CANNON') {
            // Movimento parabólico para projéteis de canhão
            this.updateParabolicMovement(deltaSeconds);
        } else {
            // Movimento linear para outros projéteis
            this.updateLinearMovement(deltaSeconds);
        }
    }

    /**
     * Movimento linear (maioria dos projéteis)
     */
    updateLinearMovement(deltaSeconds) {
        const direction = Vector2D.subtract(this.targetPosition, this.position);
        const distance = direction.magnitude();
        
        // Verifica se chegou próximo ao alvo
        if (distance < this.speed * deltaSeconds) {
            this.position.copy(this.targetPosition);
            this.hit();
            return;
        }
        
        // Move em direção ao alvo
        direction.normalize();
        const movement = Vector2D.multiply(direction, this.speed * deltaSeconds);
        this.position.add(movement);
        
        // Atualiza rotação
        this.rotation = direction.angle();
    }

    /**
     * Movimento parabólico (projéteis de canhão)
     */
    updateParabolicMovement(deltaSeconds) {
        const direction = Vector2D.subtract(this.targetPosition, this.position);
        const distance = direction.magnitude();
        
        // Movimento horizontal
        direction.normalize();
        const horizontalMovement = Vector2D.multiply(direction, this.speed * deltaSeconds);
        this.position.add(horizontalMovement);
        
        // Movimento vertical (gravidade)
        this.velocityY += this.gravity * deltaSeconds;
        this.position.y += this.velocityY * deltaSeconds;
        
        // Verifica se chegou ao alvo
        if (distance < this.speed * deltaSeconds * 2) {
            this.hit();
        }
    }

    /**
     * Verifica colisão com inimigos
     */
    checkCollision() {
        if (this.hasHit || !this.target) return;
        
        const distance = this.position.distanceTo(this.target.position);
        if (distance <= this.target.collisionRadius + this.size / 2) {
            this.hit();
        }
    }

    /**
     * Atualiza efeitos específicos do tipo
     */
    updateTypeSpecificEffects(deltaTime) {
        switch (this.type) {
            case 'MAGE':
                this.updateFireParticles(deltaTime);
                break;
                
            case 'ICE_MAGE':
                this.updateIceTrail(deltaTime);
                break;
                
            case 'POISON_TOWER':
                this.updatePoisonTrail(deltaTime);
                break;
                
            case 'CANNON':
                this.updateSmokeTrail(deltaTime);
                break;
        }
    }

    /**
     * Atualiza partículas de fogo
     */
    updateFireParticles(deltaTime) {
        this.particleTimer += deltaTime;
        
        if (this.particleTimer >= this.particleInterval) {
            this.createFireParticle();
            this.particleTimer = 0;
        }
    }

    /**
     * Cria partícula de fogo
     */
    createFireParticle() {
        this.addEffect(`fire_particle_${Date.now()}`, {
            duration: 300,
            position: this.position.clone(),
            velocity: Vector2D.random(20),
            update: function(deltaTime) {
                this.position.add(Vector2D.multiply(this.velocity, deltaTime / 1000));
                this.velocity.multiply(0.98); // Atrito
            },
            render: function(ctx) {
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.beginPath();
                ctx.arc(0, 0, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#FF4500';
                ctx.fill();
                ctx.restore();
            }
        });
    }

    /**
     * Atualiza rastro de gelo
     */
    updateIceTrail(deltaTime) {
        if (Math.random() < 0.3) {
            this.addEffect(`ice_trail_${Date.now()}`, {
                duration: 500,
                position: this.position.clone(),
                update: function(deltaTime) {},
                render: function(ctx) {
                    ctx.save();
                    ctx.translate(this.position.x, this.position.y);
                    ctx.beginPath();
                    ctx.arc(0, 0, 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
                    ctx.fill();
                    ctx.restore();
                }
            });
        }
    }

    /**
     * Atualiza rastro de veneno
     */
    updatePoisonTrail(deltaTime) {
        if (Math.random() < 0.4) {
            this.addEffect(`poison_trail_${Date.now()}`, {
                duration: 400,
                position: this.position.clone(),
                update: function(deltaTime) {},
                render: function(ctx) {
                    ctx.save();
                    ctx.translate(this.position.x, this.position.y);
                    ctx.beginPath();
                    ctx.arc(0, 0, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(50, 205, 50, 0.7)';
                    ctx.fill();
                    ctx.restore();
                }
            });
        }
    }

    /**
     * Atualiza rastro de fumaça
     */
    updateSmokeTrail(deltaTime) {
        if (Math.random() < 0.5) {
            this.addEffect(`smoke_trail_${Date.now()}`, {
                duration: 600,
                position: this.position.clone(),
                scale: 1,
                update: function(deltaTime) {
                    this.scale += deltaTime / 1000;
                },
                render: function(ctx) {
                    ctx.save();
                    ctx.translate(this.position.x, this.position.y);
                    ctx.scale(this.scale, this.scale);
                    ctx.beginPath();
                    ctx.arc(0, 0, 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(105, 105, 105, ${0.5 / this.scale})`;
                    ctx.fill();
                    ctx.restore();
                }
            });
        }
    }

    /**
     * Projétil atinge o alvo
     */
    hit() {
        if (this.hasHit) return;
        
        this.hasHit = true;
        
        // Aplica dano ao alvo principal
        if (this.target && !this.target.destroyed) {
            const damageType = this.getDamageType();
            const actualDamage = this.target.takeDamage(this.damage, damageType);
            
            // Aplica efeito de status se houver
            if (this.statusEffect && actualDamage > 0) {
                this.target.addStatusEffect(this.statusEffect.type, this.statusEffect);
            }
        }
        
        // Dano em área se aplicável
        if (this.splashRadius > 0) {
            this.applySplashDamage();
        }
        
        // Cria efeito de impacto
        this.createImpactEffect();
        
        this.emit('hit', this.target);
        this.destroy();
    }

    /**
     * Verifica se o projétil atingiu o alvo
     */
    hasHitTarget() {
        return this.hasHit;
    }

    /**
     * Verifica se o projétil deve ser destruído
     */
    shouldBeDestroyed() {
        return this.hasHit || this.destroyed || this.age > this.maxAge;
    }

    /**
     * Marca projétil para destruição
     */
    markForDestruction() {
        this.destroyed = true;
        this.hasHit = true;
    }

    /**
     * Aplica dano em área
     */
    applySplashDamage() {
        // Esta função será implementada pelo GameManager
        // que tem acesso à lista de inimigos
        this.emit('splashDamage', {
            position: this.position.clone(),
            radius: this.splashRadius,
            damage: this.damage * 0.7, // Dano reduzido para área
            damageType: this.getDamageType(),
            statusEffect: this.statusEffect
        });
    }

    /**
     * Obtém tipo de dano baseado no tipo de projétil
     */
    getDamageType() {
        switch (this.type) {
            case 'MAGE':
            case 'CANNON':
                return 'fire';
            case 'ICE_MAGE':
                return 'ice';
            case 'POISON_TOWER':
                return 'poison';
            case 'LIGHTNING':
                return 'lightning';
            default:
                return 'physical';
        }
    }

    /**
     * Cria efeito visual de impacto
     */
    createImpactEffect() {
        const effectType = this.type.toLowerCase();
        
        this.addEffect('impact', {
            duration: 300,
            scale: 0.1,
            update: function(deltaTime) {
                this.scale += deltaTime / 300;
            },
            render: (ctx) => {
                ctx.save();
                ctx.translate(0, 0);
                ctx.scale(this.scale, this.scale);
                
                switch (effectType) {
                    case 'mage':
                    case 'cannon':
                        this.renderFireExplosion(ctx);
                        break;
                    case 'ice_mage':
                        this.renderIceExplosion(ctx);
                        break;
                    case 'poison_tower':
                        this.renderPoisonExplosion(ctx);
                        break;
                    default:
                        this.renderDefaultImpact(ctx);
                }
                
                ctx.restore();
            }
        });
    }

    /**
     * Renderiza explosão de fogo
     */
    renderFireExplosion(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 69, 0, 0.6)');
        gradient.addColorStop(0.6, 'rgba(255, 99, 71, 0.4)');
        gradient.addColorStop(1, 'rgba(220, 20, 60, 0.2)');
        
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    /**
     * Renderiza explosão de gelo
     */
    renderIceExplosion(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.4, 'rgba(135, 206, 235, 0.7)');
        gradient.addColorStop(0.7, 'rgba(65, 105, 225, 0.5)');
        gradient.addColorStop(1, 'rgba(25, 25, 112, 0.2)');
        
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    /**
     * Renderiza explosão de veneno
     */
    renderPoisonExplosion(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
        gradient.addColorStop(0, 'rgba(173, 255, 47, 0.8)');
        gradient.addColorStop(0.5, 'rgba(50, 205, 50, 0.6)');
        gradient.addColorStop(1, 'rgba(34, 139, 34, 0.3)');
        
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    /**
     * Renderiza impacto padrão
     */
    renderDefaultImpact(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /**
     * Renderização específica do projétil
     */
    onRender(ctx) {
        // Renderiza rastro se aplicável
        if (this.trail) {
            this.renderTrail(ctx);
        }
        
        // Renderiza brilho se aplicável
        if (this.glow) {
            this.renderGlow(ctx);
        }
        
        // Renderiza o projétil principal
        this.renderProjectile(ctx);
    }

    /**
     * Renderiza rastro do projétil
     */
    renderTrail(ctx) {
        ctx.save();
        ctx.strokeStyle = ColorUtils.darken(this.color, 0.3);
        ctx.lineWidth = this.size / 2;
        ctx.lineCap = 'round';
        
        const trailLength = this.speed * 0.1;
        const direction = Vector2D.fromAngle(this.rotation + Math.PI, trailLength);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(direction.x, direction.y);
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * Renderiza brilho do projétil
     */
    renderGlow(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 2;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Renderiza o projétil principal
     */
    renderProjectile(ctx) {
        ctx.save();
        
        // Rotaciona baseado na direção
        ctx.rotate(this.rotation);
        
        switch (this.type) {
            case 'ARCHER':
                this.renderArrow(ctx);
                break;
            case 'CANNON':
                this.renderCannonball(ctx);
                break;
            default:
                this.renderDefaultProjectile(ctx);
        }
        
        ctx.restore();
    }

    /**
     * Renderiza flecha
     */
    renderArrow(ctx) {
        const length = this.size * 2;
        const width = this.size / 2;
        
        // Haste da flecha
        ctx.fillStyle = this.color;
        ctx.fillRect(-length / 2, -width / 4, length * 0.8, width / 2);
        
        // Ponta da flecha
        ctx.beginPath();
        ctx.moveTo(length / 2, 0);
        ctx.lineTo(length / 4, -width / 2);
        ctx.lineTo(length / 4, width / 2);
        ctx.closePath();
        ctx.fill();
        
        // Penas
        ctx.fillStyle = ColorUtils.lighten(this.color, 0.3);
        ctx.fillRect(-length / 2, -width / 3, width / 2, width / 6);
        ctx.fillRect(-length / 2, width / 6, width / 2, width / 6);
    }

    /**
     * Renderiza bala de canhão
     */
    renderCannonball(ctx) {
        const radius = this.size / 2;
        
        // Sombra
        ctx.save();
        ctx.translate(1, 1);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();
        ctx.restore();
        
        // Bala principal
        const gradient = ctx.createRadialGradient(-radius / 3, -radius / 3, 0, 0, 0, radius);
        gradient.addColorStop(0, ColorUtils.lighten(this.color, 0.4));
        gradient.addColorStop(1, ColorUtils.darken(this.color, 0.2));
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Brilho
        ctx.beginPath();
        ctx.arc(-radius / 4, -radius / 4, radius / 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }

    /**
     * Renderiza projétil padrão
     */
    renderDefaultProjectile(ctx) {
        const radius = this.size / 2;
        
        // Projétil principal
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, ColorUtils.lighten(this.color, 0.5));
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, ColorUtils.darken(this.color, 0.3));
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = ColorUtils.darken(this.color, 0.4);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /**
     * Eventos do projétil
     */
    onHit(target) {
        // Implementado nas subclasses se necessário
    }

    onExploded() {
        // Implementado nas subclasses se necessário
    }

    /**
     * Serialização específica do projétil
     */
    toJSON() {
        const baseData = super.toJSON();
        return {
            ...baseData,
            damage: this.damage,
            speed: this.speed,
            type: this.type,
            splashRadius: this.splashRadius,
            hasHit: this.hasHit,
            targetPosition: this.targetPosition ? {
                x: this.targetPosition.x,
                y: this.targetPosition.y
            } : null
        };
    }
} 