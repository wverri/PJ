/**
 * GameLoopManager - Gerencia o loop principal do jogo
 * Implementa o padrão Template Method para o ciclo de vida do jogo
 */
class GameLoopManager extends EventEmitter {
    constructor() {
        super();
        
        this.isRunning = false;
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.targetFPS = 60;
        this.maxDeltaTime = 1000 / 30; // Limita a 30 FPS mínimo
        
        // Componentes que serão atualizados
        this.updateables = new Set();
        this.renderables = new Set();
        
        // Estatísticas de performance
        this.stats = {
            fps: 0,
            frameCount: 0,
            updateTime: 0,
            renderTime: 0
        };
        
        this.fpsUpdateInterval = 60; // Atualiza FPS a cada 60 frames
    }
    
    /**
     * Adiciona componente que precisa ser atualizado
     */
    addUpdateable(component) {
        if (component && typeof component.update === 'function') {
            this.updateables.add(component);
        }
    }
    
    /**
     * Remove componente da atualização
     */
    removeUpdateable(component) {
        this.updateables.delete(component);
    }
    
    /**
     * Adiciona componente que precisa ser renderizado
     */
    addRenderable(component) {
        if (component && typeof component.render === 'function') {
            this.renderables.add(component);
        }
    }
    
    /**
     * Remove componente da renderização
     */
    removeRenderable(component) {
        this.renderables.delete(component);
    }
    
    /**
     * Inicia o loop do jogo
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.stats.frameCount = 0;
        
        this.gameLoop();
        this.emit('started');
    }
    
    /**
     * Para o loop do jogo
     */
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        this.emit('stopped');
    }
    
    /**
     * Loop principal do jogo - Template Method
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.calculateDeltaTime(currentTime);
        
        // Atualiza estatísticas
        this.updateStats();
        
        // Executa ciclo de atualização e renderização
        this.executeUpdateCycle();
        this.executeRenderCycle();
        
        // Agenda próximo frame
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
        
        this.emit('frameCompleted', this.deltaTime);
    }
    
    /**
     * Calcula delta time entre frames
     */
    calculateDeltaTime(currentTime) {
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Limita delta time para evitar grandes saltos
        this.deltaTime = Math.min(this.deltaTime, this.maxDeltaTime);
    }
    
    /**
     * Executa ciclo de atualização
     */
    executeUpdateCycle() {
        const startTime = performance.now();
        
        this.emit('beforeUpdate', this.deltaTime);
        
        // Atualiza todos os componentes
        for (const component of this.updateables) {
            try {
                component.update(this.deltaTime);
            } catch (error) {
                console.error('Erro durante atualização do componente:', error);
                this.emit('updateError', error, component);
            }
        }
        
        this.emit('afterUpdate', this.deltaTime);
        
        this.stats.updateTime = performance.now() - startTime;
    }
    
    /**
     * Executa ciclo de renderização
     */
    executeRenderCycle() {
        const startTime = performance.now();
        
        this.emit('beforeRender');
        
        // Renderiza todos os componentes
        for (const component of this.renderables) {
            try {
                component.render();
            } catch (error) {
                console.error('Erro durante renderização do componente:', error);
                this.emit('renderError', error, component);
            }
        }
        
        this.emit('afterRender');
        
        this.stats.renderTime = performance.now() - startTime;
    }
    
    /**
     * Atualiza estatísticas de performance
     */
    updateStats() {
        this.stats.frameCount++;
        
        // Atualiza FPS periodicamente
        if (this.stats.frameCount % this.fpsUpdateInterval === 0) {
            this.stats.fps = Math.round(1000 / this.deltaTime);
            this.emit('statsUpdated', this.getStats());
        }
    }
    
    /**
     * Obtém estatísticas atuais
     */
    getStats() {
        return {
            ...this.stats,
            deltaTime: this.deltaTime,
            isRunning: this.isRunning,
            componentCount: {
                updateables: this.updateables.size,
                renderables: this.renderables.size
            }
        };
    }
    
    /**
     * Define FPS alvo
     */
    setTargetFPS(fps) {
        this.targetFPS = Math.max(30, Math.min(120, fps));
        this.maxDeltaTime = 1000 / (this.targetFPS / 2);
    }
    
    /**
     * Pausa temporariamente o loop
     */
    pause() {
        if (this.isRunning) {
            this.stop();
            this.wasPaused = true;
            this.emit('paused');
        }
    }
    
    /**
     * Resume o loop pausado
     */
    resume() {
        if (this.wasPaused) {
            this.wasPaused = false;
            this.start();
            this.emit('resumed');
        }
    }
    
    /**
     * Limpa todos os componentes
     */
    clear() {
        this.updateables.clear();
        this.renderables.clear();
        this.emit('cleared');
    }
    
    /**
     * Destrói o manager
     */
    destroy() {
        this.stop();
        this.clear();
        this.removeAllListeners();
    }
} 