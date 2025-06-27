/**
 * Arquivo principal do jogo Ultima Online Tower Defense
 * Refatorado seguindo princípios SOLID, DRY e Object Calisthenics
 */

/**
 * Classe principal do jogo - Coordena todos os sistemas
 * Implementa o padrão Facade e Mediator
 */
class GameApplication extends EventEmitter {
    constructor() {
        super();
        
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        
        // Managers principais
        this.gameStateManager = null;
        this.gameLoopManager = null;
        this.inputManager = null;
        this.effectSystem = null;
        
        // Managers de jogo
        this.gameManager = null;
        this.gameRenderer = null;
        this.uiManager = null;
        
        // Configuração de inicialização
        this.initConfig = {
            canvasId: 'game-canvas',
            canvasWidth: GAME_CONFIG.CANVAS_WIDTH,
            canvasHeight: GAME_CONFIG.CANVAS_HEIGHT
        };
    }
    
    /**
     * Inicializa a aplicação
     */
    async initialize() {
        try {
            console.log('🎮 Iniciando Ultima Online Tower Defense...');
            
            this.setupCanvas();
            this.createManagers();
            this.connectSystems();
            this.setupEventHandlers();
            this.loadGameData();
            
            this.isInitialized = true;
            this.emit('initialized');
            
            console.log('✅ Jogo inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar o jogo:', error);
            this.handleInitializationError(error);
        }
    }
    
    /**
     * Configura o canvas do jogo
     */
    setupCanvas() {
        this.canvas = document.getElementById(this.initConfig.canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas não encontrado: ${this.initConfig.canvasId}`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Contexto 2D não suportado');
        }
        
        this.configureCanvas();
        console.log(`📐 Canvas configurado: ${this.canvas.width}x${this.canvas.height}`);
    }
    
    /**
     * Configura propriedades do canvas
     */
    configureCanvas() {
        this.canvas.width = this.initConfig.canvasWidth;
        this.canvas.height = this.initConfig.canvasHeight;
        
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        this.canvas.classList.add('game-canvas');
    }
    
    /**
     * Cria todos os managers do sistema
     */
    createManagers() {
        // Managers de sistema
        this.gameStateManager = GameStateManager.getInstance();
        this.gameLoopManager = new GameLoopManager();
        this.inputManager = new InputManager(this.canvas);
        this.effectSystem = new EffectSystem();
        
        // Managers de jogo
        this.gameManager = new GameManager(this.canvas, this.ctx);
        this.gameRenderer = new GameRenderer(this.canvas, this.ctx);
        this.uiManager = new UIManager();
        
        console.log('🎯 Managers criados');
    }
    
    /**
     * Conecta os sistemas entre si
     */
    connectSystems() {
        this.connectGameLoop();
        this.connectInputSystem();
        this.connectGameSystems();
        this.connectUISystem();
        
        console.log('🔗 Sistemas conectados');
    }
    
    /**
     * Conecta o loop principal do jogo
     */
    connectGameLoop() {
        // Adiciona componentes ao loop
        this.gameLoopManager.addUpdateable(this.gameManager);
        this.gameLoopManager.addUpdateable(this.uiManager);
        this.gameLoopManager.addUpdateable(this.effectSystem);
        
        this.gameLoopManager.addRenderable(this.gameRenderer);
        // EffectSystem é renderizado através do GameRenderer, não diretamente
        
        // Conecta eventos do loop
        this.gameLoopManager.on('statsUpdated', (stats) => {
            this.emit('performanceStats', stats);
        });
        
        this.gameLoopManager.on('updateError', (error, component) => {
            console.error('Erro durante atualização:', error);
            this.handleRuntimeError(error, component);
        });
        
        this.gameLoopManager.on('renderError', (error, component) => {
            console.error('Erro durante renderização:', error);
            this.handleRuntimeError(error, component);
        });
    }
    
    /**
     * Conecta o sistema de entrada
     */
    connectInputSystem() {
        // Registra comandos
        this.registerInputCommands();
        
        // Conecta eventos de entrada
        this.inputManager.on('canvasClick', (position) => {
            console.log('🖱️ Clique detectado em:', position);
            this.gameManager.handleClick(position.x, position.y);
        });
        
        this.inputManager.on('canvasMouseMove', (position) => {
            this.gameManager.handleMouseMove(position.x, position.y);
        });
        
        this.inputManager.on('canvasRightClick', (position) => {
            console.log('🖱️ Clique direito detectado em:', position);
            this.gameManager.handleRightClick(position.x, position.y);
        });
        
        this.inputManager.on('windowBlur', () => {
            this.pauseGame();
        });
        
        this.inputManager.on('windowFocus', () => {
            this.resumeGame();
        });
    }
    
    /**
     * Registra comandos de entrada
     */
    registerInputCommands() {
        const commands = {
            'PAUSE_GAME': { execute: () => this.togglePause() },
            'RESTART_GAME': { execute: () => this.restartGame() },
            'TOGGLE_DEBUG': { execute: () => this.toggleDebugMode() },
            'SELECT_TOWER_ARCHER': { execute: () => this.selectTower('ARCHER') },
            'SELECT_TOWER_MAGE': { execute: () => this.selectTower('MAGE') },
            'SELECT_TOWER_ICE_MAGE': { execute: () => this.selectTower('ICE_MAGE') },
            'SELECT_TOWER_POISON': { execute: () => this.selectTower('POISON_TOWER') },
            'SELECT_TOWER_CANNON': { execute: () => this.selectTower('CANNON') },
            'SELECT_TOWER_LIGHTNING': { execute: () => this.selectTower('LIGHTNING') },
            'CAST_FIREBALL': { execute: () => this.castSpell('FIREBALL') },
            'CAST_FREEZE': { execute: () => this.castSpell('FREEZE') },
            'CAST_LIGHTNING_STORM': { execute: () => this.castSpell('LIGHTNING_STORM') },
            'CAST_HEAL': { execute: () => this.castSpell('HEAL') }
        };
        
        Object.entries(commands).forEach(([name, command]) => {
            this.inputManager.registerCommand(name, command);
        });
    }
    
    /**
     * Conecta sistemas de jogo
     */
    connectGameSystems() {
        // GameManager -> outros sistemas
        this.gameManager.on('goldChanged', (gold) => {
            this.uiManager.updateGold(gold);
        });
        
        this.gameManager.on('healthChanged', (health) => {
            this.uiManager.updateHealth(health);
        });
        
        this.gameManager.on('waveChanged', (wave) => {
            this.uiManager.updateWave(wave);
        });
        
        this.gameManager.on('gameOver', (result) => {
            this.handleGameOver(result);
        });
        
        this.gameManager.on('effectRequested', (effectType, config) => {
            this.effectSystem.createEffect(effectType, config);
        });
        
        // Conecta renderer
        this.gameRenderer.setGameManager(this.gameManager);
        this.gameRenderer.setEffectSystem(this.effectSystem);
    }
    
    /**
     * Conecta sistema de UI
     */
    connectUISystem() {
        this.uiManager.on('towerTypeSelected', (towerType) => {
            console.log('🎯 Torre selecionada via UI:', towerType);
            this.gameManager.selectTowerForPlacement(towerType);
        });
        
        this.uiManager.on('spellCast', (spellType) => {
            this.gameManager.castSpell(spellType);
        });
        
        this.uiManager.on('waveStarted', () => {
            this.gameManager.startNextWave();
        });
        
        this.uiManager.on('gamePaused', () => {
            this.pauseGame();
        });
        
        this.uiManager.on('gameResumed', () => {
            this.resumeGame();
        });
        
        this.uiManager.on('gameRestarted', () => {
            this.restartGame();
        });
        
        // Inicializa UI
        this.initializeUI();
    }
    
    /**
     * Inicializa interface do usuário
     */
    initializeUI() {
        this.uiManager.initializeTowerShop();
        this.uiManager.initializeSpellShop();
        
        // Define valores iniciais
        this.uiManager.updateGold(GAME_CONFIG.PLAYER.INITIAL_GOLD);
        this.uiManager.updateHealth(GAME_CONFIG.PLAYER.INITIAL_HEALTH);
        this.uiManager.updateWave(1);
        
        console.log('🎨 Interface inicializada');
    }
    
    /**
     * Configura manipuladores de eventos
     */
    setupEventHandlers() {
        // Eventos da janela
        window.addEventListener('beforeunload', (event) => {
            this.handleBeforeUnload(event);
        });
        
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
        
        // Eventos de estado do jogo
        this.gameStateManager.on('gamePaused', () => {
            this.gameLoopManager.pause();
        });
        
        this.gameStateManager.on('gameResumed', () => {
            this.gameLoopManager.resume();
        });
        
        console.log('⌨️ Event handlers configurados');
    }
    
    /**
     * Inicia o jogo
     */
    start() {
        if (!this.isInitialized) {
            throw new Error('Jogo não foi inicializado');
        }
        
        this.gameStateManager.start();
        this.gameLoopManager.start();
        
        this.emit('started');
        console.log('🔄 Jogo iniciado');
    }
    
    /**
     * Para o jogo
     */
    stop() {
        this.gameStateManager.stop();
        this.gameLoopManager.stop();
        
        this.emit('stopped');
        console.log('⏹️ Jogo parado');
    }
    
    /**
     * Pausa o jogo
     */
    pauseGame() {
        this.gameStateManager.pause();
        this.updatePauseButton(true);
    }
    
    /**
     * Resume o jogo
     */
    resumeGame() {
        this.gameStateManager.resume();
        this.updatePauseButton(false);
    }
    
    /**
     * Alterna pausa
     */
    togglePause() {
        this.gameStateManager.togglePause();
    }
    
    /**
     * Atualiza botão de pausa
     */
    updatePauseButton(isPaused) {
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = isPaused ? 'Continuar' : 'Pausar';
        }
    }
    
    /**
     * Reinicia o jogo
     */
    async restartGame() {
        console.log('🔄 Reiniciando jogo...');
        
        try {
            this.stop();
            
            // Limpa sistemas
            this.gameManager.reset();
            this.effectSystem.clear();
            this.uiManager.reset();
            
            // Esconde modal de game over
            this.hideGameOverModal();
            
            // Reinicia
            await this.delay(100);
            this.start();
            
            console.log('✅ Jogo reiniciado');
            
        } catch (error) {
            console.error('❌ Erro ao reiniciar:', error);
            this.showErrorMessage('Erro ao reiniciar o jogo. Recarregue a página.');
        }
    }
    
    /**
     * Seleciona torre para colocação
     */
    selectTower(towerType) {
        if (this.gameManager) {
            this.gameManager.selectTowerForPlacement(towerType);
        }
    }
    
    /**
     * Lança magia
     */
    castSpell(spellType) {
        if (this.gameManager) {
            this.gameManager.castSpell(spellType);
        }
    }
    
    /**
     * Alterna modo debug
     */
    toggleDebugMode() {
        window.DEBUG_MODE = !window.DEBUG_MODE;
        console.log(`Debug mode: ${window.DEBUG_MODE ? 'ON' : 'OFF'}`);
        this.emit('debugModeChanged', window.DEBUG_MODE);
    }
    
    /**
     * Manipula fim de jogo
     */
    handleGameOver(result) {
        this.uiManager.showGameOver(result);
        this.saveGameData();
        this.emit('gameOver', result);
    }
    
    /**
     * Manipula erro de inicialização
     */
    handleInitializationError(error) {
        this.showErrorMessage('Erro ao carregar o jogo. Recarregue a página.');
        this.emit('initializationError', error);
    }
    
    /**
     * Manipula erro em tempo de execução
     */
    handleRuntimeError(error, component) {
        this.pauseGame();
        this.showErrorMessage('Erro durante o jogo. Jogo pausado.');
        this.emit('runtimeError', error, component);
    }
    
    /**
     * Manipula antes de fechar a página
     */
    handleBeforeUnload(event) {
        this.saveGameData();
        
        if (this.gameStateManager.isRunning() && this.gameManager?.getCurrentWave() > 1) {
            event.preventDefault();
            event.returnValue = 'Tem certeza que deseja sair? O progresso será perdido.';
            return event.returnValue;
        }
    }
    
    /**
     * Manipula redimensionamento da janela
     */
    handleWindowResize() {
        // Implementar responsividade se necessário
        this.emit('windowResized');
    }
    
    /**
     * Salva dados do jogo
     */
    saveGameData() {
        if (!this.gameManager) return;
        
        try {
            const gameData = {
                highScore: this.gameManager.getHighScore(),
                settings: this.getGameSettings(),
                statistics: this.gameManager.getStatistics()
            };
            
            StorageUtils.save('uo_tower_defense_data', gameData);
            console.log('💾 Dados salvos');
            
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
        }
    }
    
    /**
     * Carrega dados salvos
     */
    loadGameData() {
        try {
            const gameData = StorageUtils.load('uo_tower_defense_data');
            
            if (gameData && this.gameManager) {
                this.gameManager.loadData(gameData);
                console.log('📁 Dados carregados');
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }
    
    /**
     * Obtém configurações do jogo
     */
    getGameSettings() {
        return {
            debugMode: window.DEBUG_MODE || false,
            // Outras configurações...
        };
    }
    
    /**
     * Esconde modal de game over
     */
    hideGameOverModal() {
        const modal = document.getElementById('game-over-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    /**
     * Mostra mensagem de erro
     */
    showErrorMessage(message) {
        let errorDiv = document.getElementById('error-message');
        
        if (!errorDiv) {
            errorDiv = this.createErrorElement();
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }
    
    /**
     * Cria elemento de erro
     */
    createErrorElement() {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #DC143C;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        return errorDiv;
    }
    
    /**
     * Utilitário para delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Obtém estatísticas de performance
     */
    getPerformanceStats() {
        return this.gameLoopManager.getStats();
    }
    
    /**
     * Destrói a aplicação
     */
    destroy() {
        this.stop();
        
        // Destrói managers
        this.inputManager?.destroy();
        this.gameLoopManager?.destroy();
        this.effectSystem?.clear();
        this.gameManager?.destroy();
        
        // Remove event listeners
        this.removeAllListeners();
        
        console.log('🗑️ Aplicação destruída');
    }
}

// Instância global da aplicação
let gameApp = null;

/**
 * Inicializa o jogo quando a página carrega
 */
document.addEventListener('DOMContentLoaded', async function() {
    try {
        gameApp = new GameApplication();
        await gameApp.initialize();
        gameApp.start();
        
        // Expõe funções globais para debug
        setupGlobalDebugFunctions();
        
    } catch (error) {
        console.error('❌ Erro fatal ao inicializar:', error);
    }
});

/**
 * Configura funções globais para debug
 */
function setupGlobalDebugFunctions() {
    window.DEBUG_MODE = false;
    
    window.toggleDebug = () => {
        if (gameApp) {
            gameApp.toggleDebugMode();
        }
    };
    
    window.getGameApp = () => gameApp;
    window.getPerformanceStats = () => gameApp?.getPerformanceStats();
    window.restartGame = () => gameApp?.restartGame();
    window.pauseGame = () => gameApp?.pauseGame();
    window.resumeGame = () => gameApp?.resumeGame();
} 