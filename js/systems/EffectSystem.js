/**
 * EffectSystem - Sistema de efeitos visuais aprimorado
 * Implementa efeitos 2.5D e animações sofisticadas
 */
class EffectSystem extends EventEmitter {
    constructor() {
        super();
        
        this.effects = [];
        this.particleSystems = [];
        this.screenShakes = [];
        
        // Configurações do sistema
        this.config = {
            maxEffects: 200,
            maxParticles: 500,
            enableScreenShake: true,
            enable3DEffects: true,
            particleQuality: 'high' // low, medium, high
        };
        
        // Cache de gradientes e texturas
        this.gradientCache = new Map();
        this.textureCache = new Map();
        
        // Efeitos pré-definidos
        this.setupEffectTemplates();
    }

    /**
     * Configura templates de efeitos
     */
    setupEffectTemplates() {
        this.effectTemplates = {
            // Efeitos de evolução
            evolutionBurst: {
                type: 'particle_burst',
                duration: 2000,
                particles: {
                    count: 30,
                    spread: 360,
                    speed: { min: 50, max: 120 },
                    size: { min: 2, max: 6 },
                    life: { min: 800, max: 1500 },
                    colors: ['#FFD700', '#FFA500', '#FF6347'],
                    fade: true,
                    glow: true
                },
                shockwave: {
                    enabled: true,
                    maxRadius: 80,
                    duration: 800,
                    color: '#FFD700'
                }
            },
            
            // Efeito de level up
            levelUp: {
                type: 'rising_text',
                duration: 1500,
                text: 'LEVEL UP!',
                color: '#FFD700',
                fontSize: 16,
                rise: 40,
                fade: true,
                glow: true,
                particles: {
                    count: 15,
                    colors: ['#FFD700', '#FFFF00'],
                    size: { min: 1, max: 3 }
                }
            },
            
            // Explosão de projétil
            projectileExplosion: {
                type: 'explosion',
                duration: 600,
                particles: {
                    count: 20,
                    spread: 360,
                    speed: { min: 30, max: 80 },
                    size: { min: 1, max: 4 },
                    life: { min: 300, max: 800 },
                    fade: true
                },
                flash: {
                    enabled: true,
                    color: '#FFFFFF',
                    intensity: 0.8,
                    duration: 100
                }
            },
            
            // Efeito de dano crítico
            criticalHit: {
                type: 'damage_text',
                duration: 1200,
                fontSize: 20,
                color: '#FF0000',
                rise: 50,
                shake: true,
                glow: true,
                particles: {
                    count: 10,
                    colors: ['#FF0000', '#FF4500'],
                    size: { min: 2, max: 4 }
                }
            },
            
            // Efeito de cura
            heal: {
                type: 'heal_effect',
                duration: 1000,
                color: '#00FF00',
                particles: {
                    count: 12,
                    colors: ['#00FF00', '#32CD32', '#90EE90'],
                    size: { min: 2, max: 5 },
                    rise: true
                },
                glow: {
                    enabled: true,
                    color: '#00FF00',
                    intensity: 0.6
                }
            },
            
            // Efeito de congelamento
            freeze: {
                type: 'status_effect',
                duration: 800,
                color: '#87CEEB',
                particles: {
                    count: 15,
                    colors: ['#87CEEB', '#B0E0E6', '#E0FFFF'],
                    size: { min: 1, max: 3 },
                    gravity: -20
                },
                aura: {
                    enabled: true,
                    color: '#87CEEB',
                    radius: 25
                }
            },
            
            // Efeito de veneno
            poison: {
                type: 'status_effect',
                duration: 1200,
                color: '#9ACD32',
                particles: {
                    count: 8,
                    colors: ['#9ACD32', '#ADFF2F', '#7CFC00'],
                    size: { min: 1, max: 2 },
                    bubble: true
                },
                aura: {
                    enabled: true,
                    color: '#9ACD32',
                    radius: 20,
                    pulse: true
                }
            }
        };
    }

    /**
     * Cria um novo efeito
     */
    createEffect(templateName, options = {}) {
        const template = this.effectTemplates[templateName];
        if (!template) {
            console.warn(`Template de efeito não encontrado: ${templateName}`);
            return null;
        }

        const effect = new VisualEffect(template, options);
        this.addEffect(effect);
        
        return effect;
    }

    /**
     * Adiciona um efeito ao sistema
     */
    addEffect(effect) {
        if (this.effects.length >= this.config.maxEffects) {
            // Remove o efeito mais antigo
            this.effects.shift();
        }
        
        this.effects.push(effect);
        this.emit('effectAdded', effect);
    }

    /**
     * Cria sistema de partículas
     */
    createParticleSystem(config) {
        const system = new ParticleSystem(config);
        this.particleSystems.push(system);
        return system;
    }

    /**
     * Adiciona screen shake
     */
    addScreenShake(intensity, duration) {
        if (!this.config.enableScreenShake) return;
        
        this.screenShakes.push({
            intensity: intensity,
            duration: duration,
            elapsed: 0
        });
    }

    /**
     * Atualiza todos os efeitos
     */
    update(deltaTime) {
        // Atualiza efeitos
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            effect.update(deltaTime);
            
            if (effect.isFinished()) {
                this.effects.splice(i, 1);
                this.emit('effectRemoved', effect);
            }
        }
        
        // Atualiza sistemas de partículas
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const system = this.particleSystems[i];
            system.update(deltaTime);
            
            if (system.isFinished()) {
                this.particleSystems.splice(i, 1);
            }
        }
        
        // Atualiza screen shakes
        for (let i = this.screenShakes.length - 1; i >= 0; i--) {
            const shake = this.screenShakes[i];
            shake.elapsed += deltaTime;
            
            if (shake.elapsed >= shake.duration) {
                this.screenShakes.splice(i, 1);
            }
        }
    }

    /**
     * Renderiza todos os efeitos
     */
    render(ctx) {
        // Aplica screen shake
        this.applyScreenShake(ctx);
        
        // Renderiza sistemas de partículas (fundo)
        this.particleSystems.forEach(system => {
            if (system.layer === 'background') {
                system.render(ctx);
            }
        });
        
        // Renderiza efeitos
        this.effects.forEach(effect => {
            effect.render(ctx);
        });
        
        // Renderiza sistemas de partículas (frente)
        this.particleSystems.forEach(system => {
            if (system.layer === 'foreground') {
                system.render(ctx);
            }
        });
    }

    /**
     * Aplica efeito de screen shake
     */
    applyScreenShake(ctx) {
        if (this.screenShakes.length === 0) return;
        
        let totalShakeX = 0;
        let totalShakeY = 0;
        
        this.screenShakes.forEach(shake => {
            const progress = shake.elapsed / shake.duration;
            const intensity = shake.intensity * (1 - progress);
            
            totalShakeX += (Math.random() - 0.5) * intensity;
            totalShakeY += (Math.random() - 0.5) * intensity;
        });
        
        ctx.translate(totalShakeX, totalShakeY);
    }

    /**
     * Limpa todos os efeitos
     */
    clear() {
        this.effects.length = 0;
        this.particleSystems.length = 0;
        this.screenShakes.length = 0;
    }

    /**
     * Obtém estatísticas do sistema
     */
    getStats() {
        const totalParticles = this.particleSystems.reduce((total, system) => {
            return total + system.getParticleCount();
        }, 0);
        
        return {
            effects: this.effects.length,
            particleSystems: this.particleSystems.length,
            totalParticles: totalParticles,
            screenShakes: this.screenShakes.length
        };
    }
}

/**
 * VisualEffect - Representa um efeito visual individual
 */
class VisualEffect {
    constructor(template, options = {}) {
        this.template = template;
        this.options = options;
        
        // Propriedades básicas
        this.position = options.position || new Vector2D(0, 0);
        this.duration = template.duration || 1000;
        this.elapsed = 0;
        this.finished = false;
        
        // Propriedades específicas do tipo
        this.setupByType();
        
        // Partículas do efeito
        this.particles = [];
        this.createParticles();
    }

    /**
     * Configura o efeito baseado no tipo
     */
    setupByType() {
        switch (this.template.type) {
            case 'particle_burst':
                this.setupParticleBurst();
                break;
            case 'rising_text':
                this.setupRisingText();
                break;
            case 'explosion':
                this.setupExplosion();
                break;
            case 'damage_text':
                this.setupDamageText();
                break;
            case 'heal_effect':
                this.setupHealEffect();
                break;
            case 'status_effect':
                this.setupStatusEffect();
                break;
        }
    }

    /**
     * Configura efeito de explosão de partículas
     */
    setupParticleBurst() {
        this.shockwave = null;
        if (this.template.shockwave?.enabled) {
            this.shockwave = {
                radius: 0,
                maxRadius: this.template.shockwave.maxRadius,
                duration: this.template.shockwave.duration,
                color: this.template.shockwave.color,
                elapsed: 0
            };
        }
    }

    /**
     * Configura texto que sobe
     */
    setupRisingText() {
        this.text = this.options.text || this.template.text;
        this.fontSize = this.template.fontSize || 14;
        this.color = this.options.color || this.template.color;
        this.rise = this.template.rise || 30;
        this.currentRise = 0;
        this.alpha = 1.0;
    }

    /**
     * Configura explosão
     */
    setupExplosion() {
        this.flash = null;
        if (this.template.flash?.enabled) {
            this.flash = {
                color: this.template.flash.color,
                intensity: this.template.flash.intensity,
                duration: this.template.flash.duration,
                elapsed: 0
            };
        }
    }

    /**
     * Configura texto de dano
     */
    setupDamageText() {
        this.text = this.options.damage?.toString() || '0';
        this.fontSize = this.template.fontSize || 16;
        this.color = this.options.color || this.template.color;
        this.rise = this.template.rise || 40;
        this.currentRise = 0;
        this.alpha = 1.0;
        this.shake = this.template.shake || false;
        this.shakeOffset = { x: 0, y: 0 };
    }

    /**
     * Configura efeito de cura
     */
    setupHealEffect() {
        this.color = this.template.color;
        this.glowRadius = 0;
        this.maxGlowRadius = 30;
    }

    /**
     * Configura efeito de status
     */
    setupStatusEffect() {
        this.color = this.template.color;
        this.aura = null;
        
        if (this.template.aura?.enabled) {
            this.aura = {
                radius: this.template.aura.radius,
                color: this.template.aura.color,
                pulse: this.template.aura.pulse || false,
                pulsePhase: 0
            };
        }
    }

    /**
     * Cria partículas do efeito
     */
    createParticles() {
        if (!this.template.particles) return;
        
        const config = this.template.particles;
        const count = config.count || 10;
        
        for (let i = 0; i < count; i++) {
            const particle = this.createParticle(config, i);
            this.particles.push(particle);
        }
    }

    /**
     * Cria uma partícula individual
     */
    createParticle(config, index) {
        const angle = config.spread ? 
            (index / config.count) * (config.spread * Math.PI / 180) :
            Math.random() * Math.PI * 2;
            
        const speed = config.speed ? 
            config.speed.min + Math.random() * (config.speed.max - config.speed.min) :
            50;
            
        const size = config.size ?
            config.size.min + Math.random() * (config.size.max - config.size.min) :
            2;
            
        const life = config.life ?
            config.life.min + Math.random() * (config.life.max - config.life.min) :
            1000;
            
        const color = config.colors ?
            config.colors[Math.floor(Math.random() * config.colors.length)] :
            '#FFFFFF';

        return new EffectParticle(
            this.position.x,
            this.position.y,
            {
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                size: size,
                life: life,
                color: color,
                fade: config.fade || false,
                glow: config.glow || false,
                gravity: config.gravity || 0,
                bubble: config.bubble || false,
                rise: config.rise || false
            }
        );
    }

    /**
     * Atualiza o efeito
     */
    update(deltaTime) {
        this.elapsed += deltaTime;
        
        // Atualiza partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
        
        // Atualiza propriedades específicas do tipo
        this.updateByType(deltaTime);
        
        // Verifica se terminou
        if (this.elapsed >= this.duration && this.particles.length === 0) {
            this.finished = true;
        }
    }

    /**
     * Atualiza baseado no tipo
     */
    updateByType(deltaTime) {
        const progress = this.elapsed / this.duration;
        
        switch (this.template.type) {
            case 'particle_burst':
                this.updateParticleBurst(deltaTime, progress);
                break;
            case 'rising_text':
                this.updateRisingText(deltaTime, progress);
                break;
            case 'explosion':
                this.updateExplosion(deltaTime, progress);
                break;
            case 'damage_text':
                this.updateDamageText(deltaTime, progress);
                break;
            case 'heal_effect':
                this.updateHealEffect(deltaTime, progress);
                break;
            case 'status_effect':
                this.updateStatusEffect(deltaTime, progress);
                break;
        }
    }

    /**
     * Atualiza explosão de partículas
     */
    updateParticleBurst(deltaTime, progress) {
        if (this.shockwave) {
            this.shockwave.elapsed += deltaTime;
            const shockProgress = this.shockwave.elapsed / this.shockwave.duration;
            this.shockwave.radius = this.shockwave.maxRadius * Math.min(1, shockProgress);
        }
    }

    /**
     * Atualiza texto que sobe
     */
    updateRisingText(deltaTime, progress) {
        this.currentRise = this.rise * progress;
        this.alpha = 1 - progress;
    }

    /**
     * Atualiza explosão
     */
    updateExplosion(deltaTime, progress) {
        if (this.flash) {
            this.flash.elapsed += deltaTime;
        }
    }

    /**
     * Atualiza texto de dano
     */
    updateDamageText(deltaTime, progress) {
        this.currentRise = this.rise * progress;
        this.alpha = 1 - progress;
        
        if (this.shake) {
            const shakeIntensity = (1 - progress) * 3;
            this.shakeOffset.x = (Math.random() - 0.5) * shakeIntensity;
            this.shakeOffset.y = (Math.random() - 0.5) * shakeIntensity;
        }
    }

    /**
     * Atualiza efeito de cura
     */
    updateHealEffect(deltaTime, progress) {
        this.glowRadius = this.maxGlowRadius * Math.sin(progress * Math.PI);
    }

    /**
     * Atualiza efeito de status
     */
    updateStatusEffect(deltaTime, progress) {
        if (this.aura && this.aura.pulse) {
            this.aura.pulsePhase += deltaTime * 0.003;
        }
    }

    /**
     * Renderiza o efeito
     */
    render(ctx) {
        ctx.save();
        
        // Renderiza baseado no tipo
        this.renderByType(ctx);
        
        // Renderiza partículas
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
        
        ctx.restore();
    }

    /**
     * Renderiza baseado no tipo
     */
    renderByType(ctx) {
        switch (this.template.type) {
            case 'particle_burst':
                this.renderParticleBurst(ctx);
                break;
            case 'rising_text':
                this.renderRisingText(ctx);
                break;
            case 'explosion':
                this.renderExplosion(ctx);
                break;
            case 'damage_text':
                this.renderDamageText(ctx);
                break;
            case 'heal_effect':
                this.renderHealEffect(ctx);
                break;
            case 'status_effect':
                this.renderStatusEffect(ctx);
                break;
        }
    }

    /**
     * Renderiza explosão de partículas
     */
    renderParticleBurst(ctx) {
        if (this.shockwave && this.shockwave.radius > 0) {
            const alpha = 1 - (this.shockwave.elapsed / this.shockwave.duration);
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.6;
            ctx.strokeStyle = this.shockwave.color;
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.shockwave.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }

    /**
     * Renderiza texto que sobe
     */
    renderRisingText(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.template.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
        }
        
        ctx.fillText(
            this.text,
            this.position.x,
            this.position.y - this.currentRise
        );
        
        ctx.restore();
    }

    /**
     * Renderiza explosão
     */
    renderExplosion(ctx) {
        if (this.flash && this.flash.elapsed < this.flash.duration) {
            const alpha = (1 - this.flash.elapsed / this.flash.duration) * this.flash.intensity;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.flash.color;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }

    /**
     * Renderiza texto de dano
     */
    renderDamageText(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.template.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
        }
        
        const x = this.position.x + this.shakeOffset.x;
        const y = this.position.y - this.currentRise + this.shakeOffset.y;
        
        ctx.fillText(this.text, x, y);
        
        ctx.restore();
    }

    /**
     * Renderiza efeito de cura
     */
    renderHealEffect(ctx) {
        if (this.glowRadius > 0) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            
            const gradient = ctx.createRadialGradient(
                this.position.x, this.position.y, 0,
                this.position.x, this.position.y, this.glowRadius
            );
            
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    /**
     * Renderiza efeito de status
     */
    renderStatusEffect(ctx) {
        if (this.aura) {
            ctx.save();
            
            let alpha = 0.3;
            let radius = this.aura.radius;
            
            if (this.aura.pulse) {
                alpha *= 0.5 + 0.5 * Math.sin(this.aura.pulsePhase);
                radius *= 0.8 + 0.2 * Math.sin(this.aura.pulsePhase);
            }
            
            ctx.globalAlpha = alpha;
            
            const gradient = ctx.createRadialGradient(
                this.position.x, this.position.y, 0,
                this.position.x, this.position.y, radius
            );
            
            gradient.addColorStop(0, this.aura.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    /**
     * Verifica se o efeito terminou
     */
    isFinished() {
        return this.finished;
    }
}

/**
 * EffectParticle - Partícula de efeito visual
 */
class EffectParticle extends TowerParticle {
    constructor(x, y, config = {}) {
        super(x, y, config);
        
        this.glow = config.glow || false;
        this.bubble = config.bubble || false;
        this.rise = config.rise || false;
        
        if (this.bubble) {
            this.bubblePhase = Math.random() * Math.PI * 2;
        }
        
        if (this.rise) {
            this.velocity.y = -Math.abs(this.velocity.y);
        }
    }

    /**
     * Atualiza a partícula com efeitos especiais
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Efeito de bolha
        if (this.bubble) {
            this.bubblePhase += deltaTime * 0.005;
            this.position.x += Math.sin(this.bubblePhase) * 0.5;
        }
    }

    /**
     * Renderiza a partícula com efeitos especiais
     */
    render(ctx) {
        if (this.isDead()) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        if (this.glow) {
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.size * 2;
        }
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
} 