/**
 * EffectSystem - Sistema para gerenciar efeitos visuais
 * Implementa padrões Strategy, Factory e Object Pool
 */
class EffectSystem extends EventEmitter {
    constructor() {
        super();
        
        this.effects = new Map();
        this.effectFactories = new Map();
        this.effectPools = new Map();
        this.activeEffects = new Set();
        
        this.setupDefaultFactories();
    }
    
    /**
     * Configura factories padrão para efeitos
     */
    setupDefaultFactories() {
        // Factory para partículas de dano
        this.registerEffectFactory('damage_text', (config) => {
            return new DamageTextEffect(config);
        });
        
        // Factory para explosões
        this.registerEffectFactory('explosion', (config) => {
            return new ExplosionEffect(config);
        });
        
        // Factory para partículas
        this.registerEffectFactory('particles', (config) => {
            return new ParticleEffect(config);
        });
        
        // Factory para rastros
        this.registerEffectFactory('trail', (config) => {
            return new TrailEffect(config);
        });
        
        // Factory para auras
        this.registerEffectFactory('aura', (config) => {
            return new AuraEffect(config);
        });
        
        // Factory para efeito de cura
        this.registerEffectFactory('heal', (config) => {
            return new HealEffect(config);
        });
        
        // Factory para raio/lightning
        this.registerEffectFactory('lightning', (config) => {
            return new LightningEffect(config);
        });
        
        // Factory para onda de congelamento
        this.registerEffectFactory('freeze_wave', (config) => {
            return new FreezeWaveEffect(config);
        });
        
        // Factory para corrente de raios
        this.registerEffectFactory('lightning_chain', (config) => {
            return new LightningChainEffect(config);
        });
        
        // Factory para bolt de raio (usado por torres)
        this.registerEffectFactory('lightning_bolt', (config) => {
            return new LightningBoltEffect(config);
        });
        
        // Factory para corrente de raios (usado por torres)
        this.registerEffectFactory('chain_lightning', (config) => {
            return new ChainLightningEffect(config);
        });
        
        // Factory para efeito de onda completada
        this.registerEffectFactory('wave_complete', (config) => {
            return new WaveCompleteEffect(config);
        });
    }
    
    /**
     * Registra uma factory de efeito
     */
    registerEffectFactory(type, factory) {
        this.effectFactories.set(type, factory);
        this.effectPools.set(type, []);
    }
    
    /**
     * Cria um novo efeito
     */
    createEffect(type, config) {
        const factory = this.effectFactories.get(type);
        if (!factory) {
            console.warn(`Factory de efeito não encontrada: ${type}`);
            return null;
        }
        
        // Tenta reutilizar do pool
        const pool = this.effectPools.get(type);
        let effect = pool.pop();
        
        if (effect) {
            effect.reset(config);
        } else {
            effect = factory(config);
        }
        
        effect.id = this.generateEffectId();
        effect.type = type;
        
        this.activeEffects.add(effect);
        this.effects.set(effect.id, effect);
        
        this.emit('effectCreated', effect);
        return effect;
    }
    
    /**
     * Remove um efeito
     */
    removeEffect(effectId) {
        const effect = this.effects.get(effectId);
        if (!effect) return;
        
        this.activeEffects.delete(effect);
        this.effects.delete(effectId);
        
        // Retorna ao pool para reutilização
        const pool = this.effectPools.get(effect.type);
        if (pool && pool.length < 50) { // Limita tamanho do pool
            pool.push(effect);
        }
        
        this.emit('effectRemoved', effect);
    }
    
    /**
     * Atualiza todos os efeitos ativos
     */
    update(deltaTime) {
        const effectsToRemove = [];
        
        for (const effect of this.activeEffects) {
            effect.update(deltaTime);
            
            if (effect.isFinished()) {
                effectsToRemove.push(effect.id);
            }
        }
        
        // Remove efeitos finalizados
        effectsToRemove.forEach(id => this.removeEffect(id));
    }
    
    /**
     * Renderiza todos os efeitos ativos
     */
    render(ctx) {
        // Ordena efeitos por z-index
        const sortedEffects = Array.from(this.activeEffects)
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        
        for (const effect of sortedEffects) {
            if (effect.isVisible()) {
                ctx.save();
                effect.render(ctx);
                ctx.restore();
            }
        }
    }
    
    /**
     * Obtém todos os efeitos ativos
     */
    getActiveEffects() {
        return Array.from(this.activeEffects);
    }
    
    /**
     * Gera ID único para efeito
     */
    generateEffectId() {
        return `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Limpa todos os efeitos
     */
    clear() {
        this.activeEffects.clear();
        this.effects.clear();
        
        // Limpa pools
        for (const pool of this.effectPools.values()) {
            pool.length = 0;
        }
        
        this.emit('cleared');
    }
    
    /**
     * Obtém estatísticas do sistema
     */
    getStats() {
        return {
            activeEffects: this.activeEffects.size,
            totalEffects: this.effects.size,
            poolSizes: Object.fromEntries(
                Array.from(this.effectPools.entries())
                    .map(([type, pool]) => [type, pool.length])
            )
        };
    }
}

/**
 * Classe base para efeitos visuais
 */
class BaseEffect {
    constructor(config = {}) {
        this.id = null;
        this.type = null;
        this.position = new Vector2D(config.x || 0, config.y || 0);
        this.duration = config.duration || 1000;
        this.age = 0;
        this.zIndex = config.zIndex || 0;
        this.alpha = config.alpha || 1;
        this.scale = config.scale || 1;
        this.finished = false;
    }
    
    /**
     * Reseta o efeito para reutilização
     */
    reset(config) {
        this.position.set(config.x || 0, config.y || 0);
        this.duration = config.duration || 1000;
        this.age = 0;
        this.zIndex = config.zIndex || 0;
        this.alpha = config.alpha || 1;
        this.scale = config.scale || 1;
        this.finished = false;
    }
    
    /**
     * Atualiza o efeito
     */
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.age >= this.duration) {
            this.finished = true;
        }
        
        this.onUpdate(deltaTime);
    }
    
    /**
     * Renderiza o efeito
     */
    render(ctx) {
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.position.x, this.position.y);
        ctx.scale(this.scale, this.scale);
        
        this.onRender(ctx);
    }
    
    /**
     * Verifica se o efeito terminou
     */
    isFinished() {
        return this.finished;
    }
    
    /**
     * Verifica se o efeito está visível
     */
    isVisible() {
        return this.alpha > 0 && this.scale > 0;
    }
    
    /**
     * Obtém progresso do efeito (0 a 1)
     */
    getProgress() {
        return Math.min(this.age / this.duration, 1);
    }
    
    // Métodos abstratos para implementação nas subclasses
    onUpdate(deltaTime) {}
    onRender(ctx) {}
}

/**
 * Efeito de texto de dano
 */
class DamageTextEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.text = config.text || '';
        this.color = config.color || '#FF0000';
        this.fontSize = config.fontSize || 16;
        this.velocity = new Vector2D(0, -50);
        this.gravity = config.gravity || 0;
    }
    
    reset(config) {
        super.reset(config);
        this.text = config.text || '';
        this.color = config.color || '#FF0000';
        this.fontSize = config.fontSize || 16;
        this.velocity.set(0, -50);
        this.gravity = config.gravity || 0;
    }
    
    onUpdate(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        
        // Movimento
        this.position.add(Vector2D.multiply(this.velocity, deltaSeconds));
        this.velocity.y += this.gravity * deltaSeconds;
        
        // Fade out
        const progress = this.getProgress();
        this.alpha = 1 - progress;
        this.scale = 1 + progress * 0.5;
    }
    
    onRender(ctx) {
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText(this.text, 0, 0);
        ctx.fillText(this.text, 0, 0);
    }
}

/**
 * Efeito de explosão
 */
class ExplosionEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.radius = config.radius || 30;
        this.color = config.color || '#FF4500';
        this.particles = [];
        
        this.createParticles();
    }
    
    reset(config) {
        super.reset(config);
        this.radius = config.radius || 30;
        this.color = config.color || '#FF4500';
        this.particles = [];
        this.createParticles();
    }
    
    createParticles() {
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = MathUtils.random(50, 150);
            
            this.particles.push({
                position: new Vector2D(0, 0),
                velocity: Vector2D.fromAngle(angle, speed),
                life: 1.0,
                size: MathUtils.random(2, 6)
            });
        }
    }
    
    onUpdate(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        const progress = this.getProgress();
        
        // Atualiza partículas
        this.particles.forEach(particle => {
            particle.position.add(Vector2D.multiply(particle.velocity, deltaSeconds));
            particle.velocity.multiply(0.95); // Atrito
            particle.life = 1 - progress;
        });
        
        this.alpha = 1 - progress;
    }
    
    onRender(ctx) {
        // Explosão principal
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, ColorUtils.lighten(this.color, 0.5));
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * this.scale, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Partículas
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                ctx.save();
                ctx.translate(particle.position.x, particle.position.y);
                ctx.globalAlpha = particle.life;
                
                ctx.beginPath();
                ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
                
                ctx.restore();
            }
        });
    }
}

/**
 * Efeito de partículas genérico
 */
class ParticleEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.particleCount = config.particleCount || 10;
        this.particleColor = config.particleColor || '#FFFFFF';
        this.particleSize = config.particleSize || 3;
        this.spread = config.spread || 50;
        this.particles = [];
        
        this.createParticles();
    }
    
    reset(config) {
        super.reset(config);
        this.particleCount = config.particleCount || 10;
        this.particleColor = config.particleColor || '#FFFFFF';
        this.particleSize = config.particleSize || 3;
        this.spread = config.spread || 50;
        this.particles = [];
        this.createParticles();
    }
    
    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                position: new Vector2D(
                    MathUtils.random(-this.spread, this.spread),
                    MathUtils.random(-this.spread, this.spread)
                ),
                velocity: Vector2D.random(MathUtils.random(20, 80)),
                life: 1.0,
                size: MathUtils.random(this.particleSize * 0.5, this.particleSize * 1.5)
            });
        }
    }
    
    onUpdate(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        const progress = this.getProgress();
        
        this.particles.forEach(particle => {
            particle.position.add(Vector2D.multiply(particle.velocity, deltaSeconds));
            particle.velocity.multiply(0.98);
            particle.life = 1 - progress;
        });
    }
    
    onRender(ctx) {
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                ctx.save();
                ctx.translate(particle.position.x, particle.position.y);
                ctx.globalAlpha = particle.life;
                
                ctx.beginPath();
                ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = this.particleColor;
                ctx.fill();
                
                ctx.restore();
            }
        });
    }
}

/**
 * Efeito de rastro
 */
class TrailEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.points = config.points || [];
        this.color = config.color || '#FFFFFF';
        this.width = config.width || 3;
    }
    
    reset(config) {
        super.reset(config);
        this.points = config.points || [];
        this.color = config.color || '#FFFFFF';
        this.width = config.width || 3;
    }
    
    onUpdate(deltaTime) {
        const progress = this.getProgress();
        this.alpha = 1 - progress;
    }
    
    onRender(ctx) {
        if (this.points.length < 2) return;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        ctx.stroke();
    }
}

/**
 * Efeito de aura
 */
class AuraEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.radius = config.radius || 40;
        this.color = config.color || '#FFD700';
        this.pulseSpeed = config.pulseSpeed || 2;
    }
    
    reset(config) {
        super.reset(config);
        this.radius = config.radius || 40;
        this.color = config.color || '#FFD700';
        this.pulseSpeed = config.pulseSpeed || 2;
    }
    
    onUpdate(deltaTime) {
        // Efeito de pulsação
        const pulse = Math.sin(this.age * this.pulseSpeed * 0.001) * 0.2 + 0.8;
        this.scale = pulse;
        this.alpha = pulse * 0.5;
    }
    
    onRender(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.7, ColorUtils.lighten(this.color, 0.3));
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

/**
 * Efeito de cura
 */
class HealEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.healing = config.healing || 0;
        this.color = config.color || '#4CAF50';
        this.fontSize = config.fontSize || 20;
        this.floatSpeed = config.floatSpeed || 50;
        this.particles = [];
        
        this.createHealParticles();
    }
    
    reset(config) {
        super.reset(config);
        this.healing = config.healing || 0;
        this.color = config.color || '#4CAF50';
        this.fontSize = config.fontSize || 20;
        this.floatSpeed = config.floatSpeed || 50;
        this.particles = [];
        this.createHealParticles();
    }
    
    createHealParticles() {
        // Cria partículas de cura em volta do ponto
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = MathUtils.random(20, 40);
            
            this.particles.push({
                position: new Vector2D(
                    Math.cos(angle) * distance,
                    Math.sin(angle) * distance
                ),
                velocity: new Vector2D(
                    Math.cos(angle) * 30,
                    Math.sin(angle) * 30 - 20
                ),
                life: 1.0,
                size: MathUtils.random(3, 6)
            });
        }
    }
    
    onUpdate(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        const progress = this.getProgress();
        
        // Move o texto para cima
        this.position.y -= this.floatSpeed * deltaSeconds;
        
        // Atualiza partículas
        this.particles.forEach(particle => {
            particle.position.add(Vector2D.multiply(particle.velocity, deltaSeconds));
            particle.velocity.y -= 50 * deltaSeconds; // Gravidade reversa
            particle.life = 1 - progress;
        });
        
        this.alpha = 1 - progress;
    }
    
    onRender(ctx) {
        // Renderiza texto de cura
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra do texto
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(`+${this.healing}`, 0, 0);
        ctx.restore();
        
        // Renderiza partículas de cura
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                ctx.save();
                ctx.translate(particle.position.x, particle.position.y);
                ctx.globalAlpha = particle.life * 0.8;
                
                // Partícula em forma de cruz (símbolo de cura)
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                
                const size = particle.size;
                ctx.beginPath();
                ctx.moveTo(-size, 0);
                ctx.lineTo(size, 0);
                ctx.moveTo(0, -size);
                ctx.lineTo(0, size);
                ctx.stroke();
                
                ctx.restore();
            }
        });
    }
}

/**
 * Efeito de raio/lightning
 */
class LightningEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.targets = config.targets || [];
        this.damage = config.damage || 0;
        this.color = config.color || '#FFFF00';
        this.bolts = [];
        
        this.createLightningBolts();
    }
    
    reset(config) {
        super.reset(config);
        this.targets = config.targets || [];
        this.damage = config.damage || 0;
        this.color = config.color || '#FFFF00';
        this.bolts = [];
        this.createLightningBolts();
    }
    
    createLightningBolts() {
        // Cria múltiplos raios para cada alvo
        this.targets.forEach(target => {
            for (let i = 0; i < 3; i++) {
                this.bolts.push({
                    start: this.position.clone(),
                    end: target.position.clone(),
                    segments: this.generateLightningSegments(this.position, target.position),
                    intensity: MathUtils.random(0.7, 1.0),
                    delay: i * 50
                });
            }
        });
    }
    
    generateLightningSegments(start, end) {
        const segments = [];
        const distance = start.distanceTo(end);
        const segmentCount = Math.floor(distance / 20);
        
        let current = start.clone();
        const direction = Vector2D.subtract(end, start).normalize();
        const segmentLength = distance / segmentCount;
        
        for (let i = 0; i < segmentCount; i++) {
            const next = Vector2D.add(current, Vector2D.multiply(direction, segmentLength));
            
            // Adiciona variação aleatória
            if (i > 0 && i < segmentCount - 1) {
                const perpendicular = new Vector2D(-direction.y, direction.x);
                const offset = Vector2D.multiply(perpendicular, MathUtils.random(-15, 15));
                next.add(offset);
            }
            
            segments.push({
                start: current.clone(),
                end: next.clone()
            });
            
            current = next;
        }
        
        return segments;
    }
    
    onUpdate(deltaTime) {
        const progress = this.getProgress();
        this.alpha = 1 - progress;
    }
    
    onRender(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        this.bolts.forEach(bolt => {
            if (this.age >= bolt.delay) {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3 * bolt.intensity;
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                bolt.segments.forEach((segment, index) => {
                    if (index === 0) {
                        ctx.moveTo(segment.start.x - this.position.x, segment.start.y - this.position.y);
                    }
                    ctx.lineTo(segment.end.x - this.position.x, segment.end.y - this.position.y);
                });
                ctx.stroke();
                
                // Raio secundário mais fino
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
        
        ctx.restore();
    }
}

/**
 * Efeito de onda de congelamento
 */
class FreezeWaveEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.radius = config.radius || 150;
        this.maxRadius = config.maxRadius || 300;
        this.color = config.color || '#87CEEB';
        this.waveSpeed = config.waveSpeed || 200;
        this.currentRadius = 0;
        this.particles = [];
        
        this.createIceParticles();
    }
    
    reset(config) {
        super.reset(config);
        this.radius = config.radius || 150;
        this.maxRadius = config.maxRadius || 300;
        this.color = config.color || '#87CEEB';
        this.waveSpeed = config.waveSpeed || 200;
        this.currentRadius = 0;
        this.particles = [];
        this.createIceParticles();
    }
    
    createIceParticles() {
        // Cria partículas de gelo em círculo
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = MathUtils.random(50, 100);
            
            this.particles.push({
                angle: angle,
                distance: distance,
                size: MathUtils.random(4, 8),
                rotationSpeed: MathUtils.random(-2, 2),
                life: 1.0
            });
        }
    }
    
    onUpdate(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        const progress = this.getProgress();
        
        // Expande a onda
        this.currentRadius = this.maxRadius * progress;
        
        // Atualiza partículas
        this.particles.forEach(particle => {
            particle.angle += particle.rotationSpeed * deltaSeconds;
            particle.distance += 30 * deltaSeconds;
            particle.life = 1 - progress;
        });
        
        this.alpha = 1 - progress;
    }
    
    onRender(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Renderiza onda principal
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Renderiza onda interna
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.currentRadius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Renderiza partículas de gelo
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                const x = Math.cos(particle.angle) * particle.distance;
                const y = Math.sin(particle.angle) * particle.distance;
                
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(particle.angle);
                ctx.globalAlpha = particle.life;
                
                // Cristal de gelo
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.moveTo(0, -particle.size);
                ctx.lineTo(particle.size * 0.5, 0);
                ctx.lineTo(0, particle.size);
                ctx.lineTo(-particle.size * 0.5, 0);
                ctx.closePath();
                ctx.fill();
                
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                ctx.restore();
            }
        });
        
        ctx.restore();
    }
}

/**
 * Efeito de corrente de raios
 */
class LightningChainEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.targets = config.targets || [];
        this.chainColor = config.chainColor || '#FFFF00';
        this.chains = [];
        
        this.createChains();
    }
    
    reset(config) {
        super.reset(config);
        this.targets = config.targets || [];
        this.chainColor = config.chainColor || '#FFFF00';
        this.chains = [];
        this.createChains();
    }
    
    createChains() {
        // Cria correntes entre alvos consecutivos
        for (let i = 0; i < this.targets.length - 1; i++) {
            const start = this.targets[i].position;
            const end = this.targets[i + 1].position;
            
            this.chains.push({
                start: start.clone(),
                end: end.clone(),
                segments: this.generateChainSegments(start, end),
                intensity: 1.0 - (i * 0.2) // Diminui intensidade a cada salto
            });
        }
    }
    
    generateChainSegments(start, end) {
        const segments = [];
        const distance = start.distanceTo(end);
        const segmentCount = Math.floor(distance / 15);
        
        let current = start.clone();
        const direction = Vector2D.subtract(end, start).normalize();
        const segmentLength = distance / segmentCount;
        
        for (let i = 0; i < segmentCount; i++) {
            const next = Vector2D.add(current, Vector2D.multiply(direction, segmentLength));
            
            // Adiciona variação para efeito de raio
            if (i > 0 && i < segmentCount - 1) {
                const perpendicular = new Vector2D(-direction.y, direction.x);
                const offset = Vector2D.multiply(perpendicular, MathUtils.random(-10, 10));
                next.add(offset);
            }
            
            segments.push({
                start: current.clone(),
                end: next.clone()
            });
            
            current = next;
        }
        
        return segments;
    }
    
    onUpdate(deltaTime) {
        const progress = this.getProgress();
        this.alpha = 1 - progress;
    }
    
    onRender(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowColor = this.chainColor;
        ctx.shadowBlur = 8;
        
        this.chains.forEach(chain => {
            ctx.strokeStyle = this.chainColor;
            ctx.lineWidth = 2 * chain.intensity;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            chain.segments.forEach((segment, index) => {
                if (index === 0) {
                    ctx.moveTo(segment.start.x - this.position.x, segment.start.y - this.position.y);
                }
                ctx.lineTo(segment.end.x - this.position.x, segment.end.y - this.position.y);
            });
            ctx.stroke();
        });
        
        ctx.restore();
    }
}

/**
 * Efeito de bolt de raio (para torres)
 */
class LightningBoltEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.target = config.target;
        this.color = config.color || '#FFFF00';
        this.segments = [];
        
        if (this.target) {
            this.segments = this.generateBoltSegments(this.position, this.target.position);
        }
    }
    
    reset(config) {
        super.reset(config);
        this.target = config.target;
        this.color = config.color || '#FFFF00';
        this.segments = [];
        
        if (this.target) {
            this.segments = this.generateBoltSegments(this.position, this.target.position);
        }
    }
    
    generateBoltSegments(start, end) {
        const segments = [];
        const distance = start.distanceTo(end);
        const segmentCount = Math.floor(distance / 25);
        
        let current = start.clone();
        const direction = Vector2D.subtract(end, start).normalize();
        const segmentLength = distance / segmentCount;
        
        for (let i = 0; i < segmentCount; i++) {
            const next = Vector2D.add(current, Vector2D.multiply(direction, segmentLength));
            
            // Adiciona variação aleatória
            if (i > 0 && i < segmentCount - 1) {
                const perpendicular = new Vector2D(-direction.y, direction.x);
                const offset = Vector2D.multiply(perpendicular, MathUtils.random(-20, 20));
                next.add(offset);
            }
            
            segments.push({
                start: current.clone(),
                end: next.clone()
            });
            
            current = next;
        }
        
        return segments;
    }
    
    onUpdate(deltaTime) {
        const progress = this.getProgress();
        this.alpha = 1 - progress;
    }
    
    onRender(ctx) {
        if (!this.segments.length) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        
        // Raio principal
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        this.segments.forEach((segment, index) => {
            if (index === 0) {
                ctx.moveTo(segment.start.x - this.position.x, segment.start.y - this.position.y);
            }
            ctx.lineTo(segment.end.x - this.position.x, segment.end.y - this.position.y);
        });
        ctx.stroke();
        
        // Núcleo branco
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }
}

/**
 * Efeito de corrente de raios (para torres)
 */
class ChainLightningEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.targets = config.targets || [];
        this.color = config.color || '#FFFF00';
        this.chains = [];
        
        this.createLightningChains();
    }
    
    reset(config) {
        super.reset(config);
        this.targets = config.targets || [];
        this.color = config.color || '#FFFF00';
        this.chains = [];
        this.createLightningChains();
    }
    
    createLightningChains() {
        // Cria correntes entre alvos
        for (let i = 0; i < this.targets.length - 1; i++) {
            const start = this.targets[i].position;
            const end = this.targets[i + 1].position;
            
            this.chains.push({
                start: start.clone(),
                end: end.clone(),
                segments: this.generateChainSegments(start, end),
                intensity: Math.max(0.3, 1.0 - (i * 0.25))
            });
        }
    }
    
    generateChainSegments(start, end) {
        const segments = [];
        const distance = start.distanceTo(end);
        const segmentCount = Math.floor(distance / 20);
        
        let current = start.clone();
        const direction = Vector2D.subtract(end, start).normalize();
        const segmentLength = distance / segmentCount;
        
        for (let i = 0; i < segmentCount; i++) {
            const next = Vector2D.add(current, Vector2D.multiply(direction, segmentLength));
            
            if (i > 0 && i < segmentCount - 1) {
                const perpendicular = new Vector2D(-direction.y, direction.x);
                const offset = Vector2D.multiply(perpendicular, MathUtils.random(-12, 12));
                next.add(offset);
            }
            
            segments.push({
                start: current.clone(),
                end: next.clone()
            });
            
            current = next;
        }
        
        return segments;
    }
    
    onUpdate(deltaTime) {
        const progress = this.getProgress();
        this.alpha = 1 - progress;
    }
    
    onRender(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        
        this.chains.forEach(chain => {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3 * chain.intensity;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            chain.segments.forEach((segment, index) => {
                if (index === 0) {
                    ctx.moveTo(segment.start.x - this.position.x, segment.start.y - this.position.y);
                }
                ctx.lineTo(segment.end.x - this.position.x, segment.end.y - this.position.y);
            });
            ctx.stroke();
            
            // Núcleo mais claro
            ctx.strokeStyle = ColorUtils.lighten(this.color, 0.5);
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        
        ctx.restore();
    }
}

/**
 * Efeito de onda completada
 */
class WaveCompleteEffect extends BaseEffect {
    constructor(config) {
        super(config);
        
        this.wave = config.wave || 1;
        this.bonus = config.bonus || 0;
        this.color = config.color || '#FFD700';
        this.fontSize = config.fontSize || 32;
        this.particles = [];
        
        this.createCelebrationParticles();
    }
    
    reset(config) {
        super.reset(config);
        this.wave = config.wave || 1;
        this.bonus = config.bonus || 0;
        this.color = config.color || '#FFD700';
        this.fontSize = config.fontSize || 32;
        this.particles = [];
        this.createCelebrationParticles();
    }
    
    createCelebrationParticles() {
        // Cria partículas de celebração
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const distance = MathUtils.random(50, 150);
            const speed = MathUtils.random(100, 200);
            
            this.particles.push({
                position: new Vector2D(0, 0),
                velocity: new Vector2D(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed - 50
                ),
                life: 1.0,
                size: MathUtils.random(4, 8),
                color: ['#FFD700', '#FF6347', '#32CD32', '#87CEEB'][Math.floor(Math.random() * 4)]
            });
        }
    }
    
    onUpdate(deltaTime) {
        const deltaSeconds = deltaTime / 1000;
        const progress = this.getProgress();
        
        // Atualiza partículas
        this.particles.forEach(particle => {
            particle.position.add(Vector2D.multiply(particle.velocity, deltaSeconds));
            particle.velocity.y += 200 * deltaSeconds; // Gravidade
            particle.velocity.multiply(0.98); // Atrito
            particle.life = 1 - progress;
        });
        
        this.alpha = Math.sin(progress * Math.PI); // Fade in e out suave
    }
    
    onRender(ctx) {
        // Renderiza texto principal
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra do texto
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(`Wave ${this.wave} Completada!`, 0, -30);
        
        // Texto do bônus
        ctx.font = `bold ${this.fontSize * 0.6}px Arial`;
        ctx.fillStyle = '#32CD32';
        ctx.fillText(`Bônus: +${this.bonus} ouro`, 0, 20);
        
        ctx.restore();
        
        // Renderiza partículas de celebração
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                ctx.save();
                ctx.translate(particle.position.x, particle.position.y);
                ctx.globalAlpha = particle.life;
                
                // Estrela de celebração
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                
                const size = particle.size;
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(angle) * size;
                    const y = Math.sin(angle) * size;
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                    
                    // Ponto interno da estrela
                    const innerAngle = angle + Math.PI / 5;
                    const innerX = Math.cos(innerAngle) * size * 0.4;
                    const innerY = Math.sin(innerAngle) * size * 0.4;
                    ctx.lineTo(innerX, innerY);
                }
                
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();
            }
        });
    }
} 