/**
 * InputManager - Gerencia todas as entradas do usuário
 * Implementa o padrão Command e Observer
 */
class InputManager extends EventEmitter {
    constructor(canvas) {
        super();
        
        this.canvas = canvas;
        this.keys = new Map();
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            button: -1
        };
        
        this.commands = new Map();
        this.keyBindings = new Map();
        
        this.setupDefaultBindings();
        this.attachEventListeners();
    }
    
    /**
     * Configura bindings padrão
     */
    setupDefaultBindings() {
        this.keyBindings.set('Space', 'PAUSE_GAME');
        this.keyBindings.set('Escape', 'PAUSE_GAME');
        this.keyBindings.set('KeyR', 'RESTART_GAME');
        this.keyBindings.set('KeyD', 'TOGGLE_DEBUG');
        this.keyBindings.set('Digit1', 'SELECT_TOWER_ARCHER');
        this.keyBindings.set('Digit2', 'SELECT_TOWER_MAGE');
        this.keyBindings.set('Digit3', 'SELECT_TOWER_ICE_MAGE');
        this.keyBindings.set('Digit4', 'SELECT_TOWER_POISON');
        this.keyBindings.set('Digit5', 'SELECT_TOWER_CANNON');
        this.keyBindings.set('Digit6', 'SELECT_TOWER_LIGHTNING');
        this.keyBindings.set('KeyQ', 'CAST_FIREBALL');
        this.keyBindings.set('KeyW', 'CAST_FREEZE');
        this.keyBindings.set('KeyE', 'CAST_LIGHTNING_STORM');
        this.keyBindings.set('KeyT', 'CAST_HEAL');
    }
    
    /**
     * Anexa event listeners
     */
    attachEventListeners() {
        // Eventos do canvas
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleCanvasMouseMove.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleCanvasMouseLeave.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleCanvasRightClick.bind(this));
        
        // Eventos do teclado
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Eventos da janela
        window.addEventListener('focus', this.handleWindowFocus.bind(this));
        window.addEventListener('blur', this.handleWindowBlur.bind(this));
    }
    
    /**
     * Registra um comando
     */
    registerCommand(name, command) {
        this.commands.set(name, command);
    }
    
    /**
     * Executa um comando
     */
    executeCommand(commandName, ...args) {
        const command = this.commands.get(commandName);
        if (command && typeof command.execute === 'function') {
            command.execute(...args);
        }
    }
    
    /**
     * Manipula clique no canvas
     */
    handleCanvasClick(event) {
        const position = DOMUtils.getMousePosition(this.canvas, event);
        this.emit('canvasClick', position, event);
    }
    
    /**
     * Manipula movimento do mouse no canvas
     */
    handleCanvasMouseMove(event) {
        const position = DOMUtils.getMousePosition(this.canvas, event);
        this.mouse.x = position.x;
        this.mouse.y = position.y;
        this.emit('canvasMouseMove', position, event);
    }
    
    /**
     * Manipula saída do mouse do canvas
     */
    handleCanvasMouseLeave(event) {
        this.emit('canvasMouseLeave', event);
    }
    
    /**
     * Manipula clique direito no canvas
     */
    handleCanvasRightClick(event) {
        event.preventDefault();
        const position = DOMUtils.getMousePosition(this.canvas, event);
        this.emit('canvasRightClick', position, event);
    }
    
    /**
     * Manipula tecla pressionada
     */
    handleKeyDown(event) {
        const key = event.code;
        
        if (!this.keys.get(key)) {
            this.keys.set(key, true);
            
            const command = this.keyBindings.get(key);
            if (command) {
                this.executeCommand(command);
                this.emit('commandExecuted', command);
            }
            
            this.emit('keyDown', key, event);
        }
    }
    
    /**
     * Manipula tecla solta
     */
    handleKeyUp(event) {
        const key = event.code;
        this.keys.set(key, false);
        this.emit('keyUp', key, event);
    }
    
    /**
     * Manipula foco da janela
     */
    handleWindowFocus() {
        this.emit('windowFocus');
    }
    
    /**
     * Manipula perda de foco da janela
     */
    handleWindowBlur() {
        // Limpa todas as teclas quando perde o foco
        this.keys.clear();
        this.emit('windowBlur');
    }
    
    /**
     * Verifica se uma tecla está pressionada
     */
    isKeyPressed(key) {
        return this.keys.get(key) || false;
    }
    
    /**
     * Obtém posição atual do mouse
     */
    getCurrentMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    /**
     * Define binding de tecla
     */
    setKeyBinding(key, command) {
        this.keyBindings.set(key, command);
    }
    
    /**
     * Remove binding de tecla
     */
    removeKeyBinding(key) {
        this.keyBindings.delete(key);
    }
    
    /**
     * Limpa todas as teclas
     */
    clearKeys() {
        this.keys.clear();
    }
    
    /**
     * Destrói o manager
     */
    destroy() {
        // Remove event listeners
        this.canvas.removeEventListener('click', this.handleCanvasClick);
        this.canvas.removeEventListener('mousemove', this.handleCanvasMouseMove);
        this.canvas.removeEventListener('mouseleave', this.handleCanvasMouseLeave);
        this.canvas.removeEventListener('contextmenu', this.handleCanvasRightClick);
        
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        window.removeEventListener('focus', this.handleWindowFocus);
        window.removeEventListener('blur', this.handleWindowBlur);
        
        // Limpa dados
        this.keys.clear();
        this.commands.clear();
        this.keyBindings.clear();
        this.removeAllListeners();
    }
} 