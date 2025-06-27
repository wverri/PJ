/**
 * InputManager - Gerencia entrada do usuário
 * Implementa padrão Command e Observer
 */
class InputManager extends EventEmitter {
    constructor(canvas) {
        super();
        
        this.canvas = canvas;
        this.isEnabled = true;
        
        // Comandos registrados
        this.commands = new Map();
        
        // Estado do mouse
        this.mouseState = {
            x: 0,
            y: 0,
            isDown: false,
            button: -1
        };
        
        // Estado do teclado
        this.keyState = new Map();
        
        // Configurações
        this.config = {
            doubleClickDelay: 300,
            longPressDelay: 500
        };
        
        this.setupEventHandlers();
        console.log('🎮 InputManager inicializado');
    }
    
    /**
     * Configura manipuladores de eventos
     */
    setupEventHandlers() {
        // Eventos do mouse no canvas
        this.canvas.addEventListener('click', (event) => {
            this.handleCanvasClick(event);
        });
        
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.handleCanvasRightClick(event);
        });
        
        this.canvas.addEventListener('mousemove', (event) => {
            this.handleCanvasMouseMove(event);
        });
        
        this.canvas.addEventListener('mousedown', (event) => {
            this.handleCanvasMouseDown(event);
        });
        
        this.canvas.addEventListener('mouseup', (event) => {
            this.handleCanvasMouseUp(event);
        });
        
        // Eventos do teclado
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
        
        // Eventos da janela
        window.addEventListener('blur', () => {
            this.emit('windowBlur');
        });
        
        window.addEventListener('focus', () => {
            this.emit('windowFocus');
        });
        
        console.log('⌨️ Event handlers do InputManager configurados');
    }
    
    /**
     * Registra um comando
     */
    registerCommand(name, command) {
        this.commands.set(name, command);
        console.log(`⌨️ Comando registrado: ${name}`);
    }
    
    /**
     * Manipula clique no canvas
     */
    handleCanvasClick(event) {
        if (!this.isEnabled) return;
        
        const position = this.getCanvasPosition(event);
        console.log('🎯 Clique em:', position);
        
        this.mouseState.x = position.x;
        this.mouseState.y = position.y;
        
        this.emit('canvasClick', position);
    }
    
    /**
     * Manipula clique direito no canvas
     */
    handleCanvasRightClick(event) {
        if (!this.isEnabled) return;
        
        const position = this.getCanvasPosition(event);
        
        this.emit('canvasRightClick', position);
    }
    
    /**
     * Manipula movimento do mouse no canvas
     */
    handleCanvasMouseMove(event) {
        if (!this.isEnabled) return;
        
        const position = this.getCanvasPosition(event);
        
        this.mouseState.x = position.x;
        this.mouseState.y = position.y;
        
        this.emit('canvasMouseMove', position);
    }
    
    /**
     * Manipula mouse pressionado
     */
    handleCanvasMouseDown(event) {
        if (!this.isEnabled) return;
        
        this.mouseState.isDown = true;
        this.mouseState.button = event.button;
        
        const position = this.getCanvasPosition(event);
        this.emit('canvasMouseDown', position, event.button);
    }
    
    /**
     * Manipula mouse solto
     */
    handleCanvasMouseUp(event) {
        if (!this.isEnabled) return;
        
        this.mouseState.isDown = false;
        this.mouseState.button = -1;
        
        const position = this.getCanvasPosition(event);
        this.emit('canvasMouseUp', position, event.button);
    }
    
    /**
     * Obtém posição relativa ao canvas
     */
    getCanvasPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        const position = {
            x: Math.round((event.clientX - rect.left) * scaleX),
            y: Math.round((event.clientY - rect.top) * scaleY)
        };
        
        return position;
    }
    
    /**
     * Manipula tecla pressionada
     */
    handleKeyDown(event) {
        if (!this.isEnabled) return;
        
        const key = event.code;
        
        if (!this.keyState.get(key)) {
            this.keyState.set(key, true);
            this.emit('keyDown', key, event);
            
            // Executa comando se registrado
            const command = this.getCommandForKey(key);
            if (command) {
                command.execute();
            }
        }
    }
    
    /**
     * Manipula tecla solta
     */
    handleKeyUp(event) {
        if (!this.isEnabled) return;
        
        const key = event.code;
        this.keyState.set(key, false);
        this.emit('keyUp', key, event);
    }
    
    /**
     * Obtém comando para tecla
     */
    getCommandForKey(key) {
        const keyMappings = {
            'Space': 'PAUSE_GAME',
            'Escape': 'PAUSE_GAME',
            'KeyR': 'RESTART_GAME',
            'KeyD': 'TOGGLE_DEBUG',
            'Digit1': 'SELECT_TOWER_ARCHER',
            'Digit2': 'SELECT_TOWER_MAGE',
            'Digit3': 'SELECT_TOWER_ICE_MAGE',
            'Digit4': 'SELECT_TOWER_POISON',
            'Digit5': 'SELECT_TOWER_CANNON',
            'Digit6': 'SELECT_TOWER_LIGHTNING',
            'KeyQ': 'CAST_FIREBALL',
            'KeyW': 'CAST_FREEZE',
            'KeyE': 'CAST_LIGHTNING_STORM',
            'KeyT': 'CAST_HEAL'
        };
        
        const commandName = keyMappings[key];
        return commandName ? this.commands.get(commandName) : null;
    }
    
    /**
     * Verifica se uma tecla está pressionada
     */
    isKeyPressed(key) {
        return this.keyState.get(key) || false;
    }
    
    /**
     * Obtém posição atual do mouse
     */
    getMousePosition() {
        return {
            x: this.mouseState.x,
            y: this.mouseState.y
        };
    }
    
    /**
     * Limpa todas as teclas
     */
    clearKeys() {
        this.keyState.clear();
    }
    
    /**
     * Verifica se mouse está pressionado
     */
    isMouseDown() {
        return this.mouseState.isDown;
    }
    
    /**
     * Habilita/desabilita entrada
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🎮 InputManager ${enabled ? 'habilitado' : 'desabilitado'}`);
    }
    
    /**
     * Destrói o manager
     */
    destroy() {
        // Remove event listeners
        this.canvas.removeEventListener('click', this.handleCanvasClick);
        this.canvas.removeEventListener('contextmenu', this.handleCanvasRightClick);
        this.canvas.removeEventListener('mousemove', this.handleCanvasMouseMove);
        this.canvas.removeEventListener('mousedown', this.handleCanvasMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleCanvasMouseUp);
        
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        window.removeEventListener('blur', () => {});
        window.removeEventListener('focus', () => {});
        
        // Limpa estado
        this.commands.clear();
        this.keyState.clear();
        
        this.removeAllListeners();
        
        console.log('🗑️ InputManager destruído');
    }
} 