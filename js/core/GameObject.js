/**
 * Classe base GameObject que implementa o padrão Template Method
 * Todos os objetos do jogo herdam desta classe
 */
class GameObject extends EventEmitter {
    constructor(x = 0, y = 0) {
        super();
        
        // Propriedades básicas
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(0, 0);
        this.size = 16;
        this.rotation = 0;
        
        // Estado do objeto
        this.active = true;
        this.visible = true;
        this.destroyed = false;
        
        // Identificação
        this.id = this.generateId();
        this.type = this.constructor.name.toLowerCase();
        
        // Tempo de vida
        this.age = 0;
        this.maxAge = Infinity;
        
        // Propriedades visuais
        this.color = '#FFFFFF';
        this.alpha = 1.0;
        this.scale = 1.0;
        
        // Propriedades de colisão
        this.collisionRadius = this.size / 2;
        this.solid = false;
        
        // Efeitos visuais
        this.effects = new Map();
        this.animations = new Map();
    }

    /**
     * Gera um ID único para o objeto
     */
    generateId() {
        return `${this.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Método template para atualização - implementa Template Method Pattern
     */
    update(deltaTime) {
        if (!this.active || this.destroyed) return;

        // Atualiza idade
        this.age += deltaTime;
        
        // Verifica se excedeu tempo de vida
        if (this.age >= this.maxAge) {
            this.destroy();
            return;
        }

        // Atualiza efeitos
        this.updateEffects(deltaTime);
        
        // Atualiza animações
        this.updateAnimations(deltaTime);
        
        // Atualiza física básica
        this.updatePhysics(deltaTime);
        
        // Atualização específica da subclasse
        this.onUpdate(deltaTime);
        
        // Emite evento de atualização
        this.emit('update', deltaTime);
    }

    /**
     * Método template para renderização
     */
    render(ctx) {
        if (!this.visible || this.destroyed) return;

        ctx.save();
        
        // Aplica transformações
        this.applyTransforms(ctx);
        
        // Renderização específica da subclasse
        this.onRender(ctx);
        
        // Renderiza efeitos visuais
        this.renderEffects(ctx);
        
        ctx.restore();
        
        // Emite evento de renderização
        this.emit('render', ctx);
    }

    /**
     * Atualiza física básica
     */
    updatePhysics(deltaTime) {
        if (this.velocity.magnitudeSquared() > 0) {
            const movement = Vector2D.multiply(this.velocity, deltaTime / 1000);
            this.position.add(movement);
        }
    }

    /**
     * Aplica transformações de renderização
     */
    applyTransforms(ctx) {
        // Translação
        ctx.translate(this.position.x, this.position.y);
        
        // Rotação
        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        // Escala
        if (this.scale !== 1.0) {
            ctx.scale(this.scale, this.scale);
        }
        
        // Alpha
        if (this.alpha !== 1.0) {
            ctx.globalAlpha = this.alpha;
        }
    }

    /**
     * Atualiza efeitos visuais
     */
    updateEffects(deltaTime) {
        for (const [name, effect] of this.effects) {
            effect.update(deltaTime);
            
            if (effect.finished) {
                this.effects.delete(name);
            }
        }
    }

    /**
     * Atualiza animações
     */
    updateAnimations(deltaTime) {
        for (const [name, animation] of this.animations) {
            animation.update(deltaTime);
            
            if (animation.finished) {
                this.animations.delete(name);
            }
        }
    }

    /**
     * Renderiza efeitos visuais
     */
    renderEffects(ctx) {
        for (const effect of this.effects.values()) {
            effect.render(ctx);
        }
    }

    /**
     * Verifica colisão com outro objeto
     */
    checkCollision(other) {
        if (!this.solid || !other.solid || this.destroyed || other.destroyed) {
            return false;
        }
        
        const distance = this.position.distanceTo(other.position);
        const minDistance = this.collisionRadius + other.collisionRadius;
        
        return distance <= minDistance;
    }

    /**
     * Verifica se um ponto está dentro do objeto
     */
    containsPoint(x, y) {
        const distance = this.position.distanceTo(new Vector2D(x, y));
        return distance <= this.collisionRadius;
    }

    /**
     * Verifica se está dentro dos limites especificados
     */
    isWithinBounds(minX, minY, maxX, maxY) {
        return this.position.x >= minX && 
               this.position.x <= maxX && 
               this.position.y >= minY && 
               this.position.y <= maxY;
    }

    /**
     * Move o objeto para uma posição específica
     */
    moveTo(x, y) {
        this.position.set(x, y);
        this.emit('moved', this.position);
    }

    /**
     * Move o objeto por um offset
     */
    moveBy(dx, dy) {
        this.position.add(new Vector2D(dx, dy));
        this.emit('moved', this.position);
    }

    /**
     * Define a velocidade do objeto
     */
    setVelocity(vx, vy) {
        this.velocity.set(vx, vy);
    }

    /**
     * Adiciona velocidade ao objeto
     */
    addVelocity(vx, vy) {
        this.velocity.add(new Vector2D(vx, vy));
    }

    /**
     * Para o movimento do objeto
     */
    stop() {
        this.velocity.set(0, 0);
    }

    /**
     * Rotaciona o objeto para olhar para um ponto
     */
    lookAt(x, y) {
        this.rotation = this.position.angleTo(new Vector2D(x, y));
    }

    /**
     * Adiciona um efeito visual
     */
    addEffect(name, effect) {
        this.effects.set(name, effect);
    }

    /**
     * Remove um efeito visual
     */
    removeEffect(name) {
        this.effects.delete(name);
    }

    /**
     * Adiciona uma animação
     */
    addAnimation(name, animation) {
        this.animations.set(name, animation);
    }

    /**
     * Remove uma animação
     */
    removeAnimation(name) {
        this.animations.delete(name);
    }

    /**
     * Destrói o objeto
     */
    destroy() {
        if (this.destroyed) return;
        
        this.destroyed = true;
        this.active = false;
        this.visible = false;
        
        // Limpa efeitos e animações
        this.effects.clear();
        this.animations.clear();
        
        // Emite evento de destruição
        this.emit('destroyed');
        
        // Remove todos os listeners
        this.removeAllListeners();
    }

    /**
     * Clona o objeto
     */
    clone() {
        const cloned = new this.constructor(this.position.x, this.position.y);
        
        // Copia propriedades básicas
        cloned.velocity.copy(this.velocity);
        cloned.size = this.size;
        cloned.rotation = this.rotation;
        cloned.color = this.color;
        cloned.alpha = this.alpha;
        cloned.scale = this.scale;
        cloned.collisionRadius = this.collisionRadius;
        cloned.solid = this.solid;
        
        return cloned;
    }

    /**
     * Serializa o objeto para JSON
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            position: { x: this.position.x, y: this.position.y },
            velocity: { x: this.velocity.x, y: this.velocity.y },
            size: this.size,
            rotation: this.rotation,
            color: this.color,
            alpha: this.alpha,
            scale: this.scale,
            active: this.active,
            visible: this.visible,
            age: this.age
        };
    }

    /**
     * Carrega dados do JSON
     */
    fromJSON(data) {
        this.id = data.id || this.id;
        this.position.set(data.position.x, data.position.y);
        this.velocity.set(data.velocity.x, data.velocity.y);
        this.size = data.size || this.size;
        this.rotation = data.rotation || 0;
        this.color = data.color || this.color;
        this.alpha = data.alpha || 1.0;
        this.scale = data.scale || 1.0;
        this.active = data.active !== undefined ? data.active : true;
        this.visible = data.visible !== undefined ? data.visible : true;
        this.age = data.age || 0;
    }

    // Métodos abstratos que devem ser implementados pelas subclasses

    /**
     * Atualização específica da subclasse
     */
    onUpdate(deltaTime) {
        // Implementar nas subclasses
    }

    /**
     * Renderização específica da subclasse
     */
    onRender(ctx) {
        // Implementar nas subclasses
        // Renderização padrão: círculo simples
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = ColorUtils.darken(this.color, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    /**
     * Manipulação de colisão específica da subclasse
     */
    onCollision(other) {
        // Implementar nas subclasses
    }

    // Getters e setters úteis

    get x() {
        return this.position.x;
    }

    set x(value) {
        this.position.x = value;
    }

    get y() {
        return this.position.y;
    }

    set y(value) {
        this.position.y = value;
    }

    get centerX() {
        return this.position.x;
    }

    get centerY() {
        return this.position.y;
    }

    get left() {
        return this.position.x - this.size / 2;
    }

    get right() {
        return this.position.x + this.size / 2;
    }

    get top() {
        return this.position.y - this.size / 2;
    }

    get bottom() {
        return this.position.y + this.size / 2;
    }

    get bounds() {
        return {
            left: this.left,
            right: this.right,
            top: this.top,
            bottom: this.bottom,
            width: this.size,
            height: this.size
        };
    }
} 