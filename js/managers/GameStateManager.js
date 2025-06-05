/**
 * GameStateManager - Gerencia o estado global do jogo
 * Implementa o padrão Singleton e State Pattern
 */
class GameStateManager extends EventEmitter {
    constructor() {
        super();
        
        if (GameStateManager.instance) {
            return GameStateManager.instance;
        }
        
        this.state = {
            isRunning: false,
            isPaused: false,
            lastFrameTime: 0,
            deltaTime: 0,
            fps: 0,
            frameCount: 0,
            currentScene: 'MENU'
        };
        
        this.scenes = new Map();
        this.transitions = new Map();
        
        GameStateManager.instance = this;
    }
    
    /**
     * Obtém instância singleton
     */
    static getInstance() {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }
    
    /**
     * Registra uma nova cena
     */
    registerScene(name, scene) {
        this.scenes.set(name, scene);
    }
    
    /**
     * Muda para uma nova cena
     */
    changeScene(sceneName, transitionType = 'INSTANT') {
        if (!this.scenes.has(sceneName)) {
            throw new Error(`Cena não encontrada: ${sceneName}`);
        }
        
        const currentScene = this.scenes.get(this.state.currentScene);
        const newScene = this.scenes.get(sceneName);
        
        this.executeTransition(currentScene, newScene, transitionType);
        this.state.currentScene = sceneName;
        
        this.emit('sceneChanged', sceneName);
    }
    
    /**
     * Executa transição entre cenas
     */
    executeTransition(fromScene, toScene, transitionType) {
        const transition = this.transitions.get(transitionType);
        
        if (transition) {
            transition.execute(fromScene, toScene);
        } else {
            // Transição instantânea
            if (fromScene) fromScene.exit();
            if (toScene) toScene.enter();
        }
    }
    
    /**
     * Pausa o jogo
     */
    pause() {
        if (!this.state.isPaused) {
            this.state.isPaused = true;
            this.emit('gamePaused');
        }
    }
    
    /**
     * Resume o jogo
     */
    resume() {
        if (this.state.isPaused) {
            this.state.isPaused = false;
            this.emit('gameResumed');
        }
    }
    
    /**
     * Alterna pausa
     */
    togglePause() {
        if (this.state.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    /**
     * Inicia o jogo
     */
    start() {
        this.state.isRunning = true;
        this.emit('gameStarted');
    }
    
    /**
     * Para o jogo
     */
    stop() {
        this.state.isRunning = false;
        this.emit('gameStopped');
    }
    
    /**
     * Atualiza FPS
     */
    updateFPS(currentTime) {
        this.state.deltaTime = currentTime - this.state.lastFrameTime;
        this.state.lastFrameTime = currentTime;
        this.state.frameCount++;
        
        if (this.state.deltaTime > 0) {
            this.state.fps = Math.round(1000 / this.state.deltaTime);
        }
    }
    
    /**
     * Obtém estado atual
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Verifica se o jogo está rodando
     */
    isRunning() {
        return this.state.isRunning;
    }
    
    /**
     * Verifica se o jogo está pausado
     */
    isPaused() {
        return this.state.isPaused;
    }
    
    /**
     * Obtém FPS atual
     */
    getFPS() {
        return this.state.fps;
    }
    
    /**
     * Obtém delta time
     */
    getDeltaTime() {
        return this.state.deltaTime;
    }
} 