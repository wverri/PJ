/**
 * UIManager - Gerencia toda a interface do usuário
 * Implementa o padrão Observer e Command
 */
class UIManager extends EventEmitter {
    constructor() {
        super();
        
        // Elementos da UI
        this.elements = {
            gold: document.getElementById('gold'),
            health: document.getElementById('health'),
            wave: document.getElementById('wave'),
            startWaveBtn: document.getElementById('start-wave-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            towerShop: document.getElementById('tower-shop'),
            spellShop: document.getElementById('spell-shop'),
            towerInfo: document.getElementById('tower-info'),
            gameOverModal: document.getElementById('game-over-modal'),
            restartBtn: document.getElementById('restart-btn'),
            menuBtn: document.getElementById('menu-btn'),
            upgradeTowerBtn: document.getElementById('upgrade-tower-btn'),
            sellTowerBtn: document.getElementById('sell-tower-btn')
        };
        
        // Estado da UI
        this.state = {
            selectedTowerType: null,
            selectedTower: null,
            isShopVisible: true,
            isGameOverVisible: false
        };
        
        // Configurações de UI
        this.config = {
            animationDuration: 300,
            notificationDuration: 3000,
            tooltipDelay: 500
        };
        
        this.setupEventHandlers();
        this.createNotificationSystem();
    }
    
    /**
     * Configura manipuladores de eventos
     */
    setupEventHandlers() {
        // Botões principais
        this.elements.startWaveBtn?.addEventListener('click', () => {
            this.emit('waveStarted');
        });
        
        this.elements.pauseBtn?.addEventListener('click', () => {
            this.togglePause();
        });
        
        this.elements.restartBtn?.addEventListener('click', () => {
            this.emit('gameRestarted');
        });
        
        this.elements.menuBtn?.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Botões de torre
        this.elements.upgradeTowerBtn?.addEventListener('click', () => {
            this.emit('towerUpgraded');
        });
        
        this.elements.sellTowerBtn?.addEventListener('click', () => {
            this.emit('towerSold');
        });
        
        // Teclas de atalho
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
    }
    
    /**
     * Inicializa loja de torres
     */
    initializeTowerShop() {
        if (!this.elements.towerShop) return;
        
        this.elements.towerShop.innerHTML = '';
        
        Object.entries(TOWER_TYPES).forEach(([type, config]) => {
            const towerButton = this.createTowerButton(type, config);
            this.elements.towerShop.appendChild(towerButton);
        });
    }
    
    /**
     * Cria botão de torre
     */
    createTowerButton(type, config) {
        const button = document.createElement('div');
        button.className = 'tower-item';
        button.dataset.towerType = type;
        
        button.innerHTML = `
            <div class="tower-icon">${config.icon}</div>
            <div class="tower-name">${config.name}</div>
            <div class="tower-cost">${config.cost} 🪙</div>
            <div class="tower-description">${config.description}</div>
        `;
        
        // Eventos do botão
        button.addEventListener('click', () => {
            this.selectTowerType(type);
        });
        
        button.addEventListener('mouseenter', () => {
            this.showTowerTooltip(button, config);
        });
        
        button.addEventListener('mouseleave', () => {
            this.hideTowerTooltip();
        });
        
        return button;
    }
    
    /**
     * Inicializa loja de magias
     */
    initializeSpellShop() {
        if (!this.elements.spellShop) return;
        
        this.elements.spellShop.innerHTML = '';
        
        Object.entries(SPELLS).forEach(([type, config]) => {
            const spellButton = this.createSpellButton(type, config);
            this.elements.spellShop.appendChild(spellButton);
        });
    }
    
    /**
     * Cria botão de magia
     */
    createSpellButton(type, config) {
        const button = document.createElement('div');
        button.className = 'spell-item';
        button.dataset.spellType = type;
        
        button.innerHTML = `
            <div class="spell-icon">${config.icon}</div>
            <div class="spell-name">${config.name}</div>
            <div class="spell-cost">${config.cost} 🪙</div>
            <div class="spell-cooldown">
                <div class="cooldown-bar"></div>
            </div>
        `;
        
        // Eventos do botão
        button.addEventListener('click', () => {
            this.castSpell(type);
        });
        
        button.addEventListener('mouseenter', () => {
            this.showSpellTooltip(button, config);
        });
        
        button.addEventListener('mouseleave', () => {
            this.hideSpellTooltip();
        });
        
        return button;
    }
    
    /**
     * Seleciona tipo de torre
     */
    selectTowerType(type) {
        // Remove seleção anterior
        this.clearTowerSelection();
        
        // Seleciona nova torre
        this.state.selectedTowerType = type;
        
        const button = this.elements.towerShop.querySelector(`[data-tower-type="${type}"]`);
        if (button) {
            button.classList.add('selected');
        }
        
        this.emit('towerPurchased', type);
        this.showNotification(`Torre ${TOWER_TYPES[type].name} selecionada`);
    }
    
    /**
     * Limpa seleção de torre
     */
    clearTowerSelection() {
        this.state.selectedTowerType = null;
        
        const selectedButton = this.elements.towerShop.querySelector('.selected');
        if (selectedButton) {
            selectedButton.classList.remove('selected');
        }
    }
    
    /**
     * Lança magia
     */
    castSpell(type) {
        const spellButton = this.elements.spellShop.querySelector(`[data-spell-type="${type}"]`);
        
        if (spellButton && !spellButton.classList.contains('cooldown')) {
            this.emit('spellCast', type);
            this.startSpellCooldown(spellButton, SPELLS[type]);
        }
    }
    
    /**
     * Inicia cooldown da magia
     */
    startSpellCooldown(button, spell) {
        button.classList.add('cooldown');
        
        const cooldownBar = button.querySelector('.cooldown-bar');
        const duration = spell.cooldown || 30000;
        
        // Animação do cooldown
        cooldownBar.style.transition = `width ${duration}ms linear`;
        cooldownBar.style.width = '0%';
        
        setTimeout(() => {
            button.classList.remove('cooldown');
            cooldownBar.style.transition = 'none';
            cooldownBar.style.width = '100%';
        }, duration);
    }
    
    /**
     * Atualiza ouro
     */
    updateGold(amount) {
        if (this.elements.gold) {
            this.animateValueChange(this.elements.gold, amount);
        }
        
        this.updateTowerAvailability(amount);
        this.updateSpellAvailability(amount);
    }
    
    /**
     * Atualiza vida
     */
    updateHealth(amount) {
        if (this.elements.health) {
            this.animateValueChange(this.elements.health, amount);
            
            // Efeito visual baseado na vida
            if (amount <= 5) {
                this.elements.health.classList.add('critical');
            } else if (amount <= 10) {
                this.elements.health.classList.add('warning');
            } else {
                this.elements.health.classList.remove('critical', 'warning');
            }
        }
    }
    
    /**
     * Atualiza wave
     */
    updateWave(waveNumber) {
        if (this.elements.wave) {
            this.animateValueChange(this.elements.wave, waveNumber);
        }
    }
    
    /**
     * Anima mudança de valor
     */
    animateValueChange(element, newValue) {
        const oldValue = parseInt(element.textContent) || 0;
        
        if (oldValue !== newValue) {
            element.classList.add('value-changed');
            element.textContent = newValue;
            
            setTimeout(() => {
                element.classList.remove('value-changed');
            }, this.config.animationDuration);
        }
    }
    
    /**
     * Atualiza disponibilidade das torres
     */
    updateTowerAvailability(gold) {
        const towerButtons = this.elements.towerShop.querySelectorAll('.tower-item');
        
        towerButtons.forEach(button => {
            const towerType = button.dataset.towerType;
            const cost = TOWER_TYPES[towerType].cost;
            
            if (gold >= cost) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        });
    }
    
    /**
     * Atualiza disponibilidade das magias
     */
    updateSpellAvailability(gold) {
        const spellButtons = this.elements.spellShop.querySelectorAll('.spell-item');
        
        spellButtons.forEach(button => {
            const spellType = button.dataset.spellType;
            const cost = SPELLS[spellType].cost;
            
            if (gold >= cost && !button.classList.contains('cooldown')) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
        });
    }
    
    /**
     * Mostra informações da torre
     */
    showTowerInfo(tower) {
        if (!this.elements.towerInfo) return;
        
        this.state.selectedTower = tower;
        
        const towerName = this.elements.towerInfo.querySelector('#tower-name');
        const towerDescription = this.elements.towerInfo.querySelector('#tower-description');
        const towerDamage = this.elements.towerInfo.querySelector('#tower-damage');
        const towerRange = this.elements.towerInfo.querySelector('#tower-range');
        const towerSpeed = this.elements.towerInfo.querySelector('#tower-speed');
        
        if (towerName) towerName.textContent = tower.name;
        if (towerDescription) towerDescription.textContent = tower.description;
        if (towerDamage) towerDamage.textContent = tower.damage;
        if (towerRange) towerRange.textContent = tower.range;
        if (towerSpeed) towerSpeed.textContent = `${tower.attackSpeed}s`;
        
        // Atualiza botões de ação
        this.updateTowerActionButtons(tower);
        
        this.elements.towerInfo.classList.remove('hidden');
    }
    
    /**
     * Esconde informações da torre
     */
    hideTowerInfo() {
        if (this.elements.towerInfo) {
            this.elements.towerInfo.classList.add('hidden');
        }
        
        this.state.selectedTower = null;
    }
    
    /**
     * Atualiza botões de ação da torre
     */
    updateTowerActionButtons(tower) {
        const upgradeBtn = this.elements.upgradeTowerBtn;
        const sellBtn = this.elements.sellTowerBtn;
        
        if (upgradeBtn) {
            const upgradeCost = tower.getUpgradeCost();
            upgradeBtn.textContent = `Melhorar (${upgradeCost} 🪙)`;
            upgradeBtn.disabled = !tower.canUpgrade();
        }
        
        if (sellBtn) {
            const sellValue = tower.getSellValue();
            sellBtn.textContent = `Vender (${sellValue} 🪙)`;
        }
    }
    
    /**
     * Mostra tooltip da torre
     */
    showTowerTooltip(button, config) {
        this.hideAllTooltips();
        
        const tooltip = this.createTooltip(`
            <strong>${config.name}</strong><br>
            Custo: ${config.cost} 🪙<br>
            Dano: ${config.damage}<br>
            Alcance: ${config.range}<br>
            ${config.description}
        `);
        
        this.positionTooltip(tooltip, button);
        document.body.appendChild(tooltip);
    }
    
    /**
     * Mostra tooltip da magia
     */
    showSpellTooltip(button, config) {
        this.hideAllTooltips();
        
        const tooltip = this.createTooltip(`
            <strong>${config.name}</strong><br>
            Custo: ${config.cost} 🪙<br>
            Cooldown: ${config.cooldown / 1000}s<br>
            ${config.description}
        `);
        
        this.positionTooltip(tooltip, button);
        document.body.appendChild(tooltip);
    }
    
    /**
     * Cria tooltip
     */
    createTooltip(content) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = content;
        return tooltip;
    }
    
    /**
     * Posiciona tooltip
     */
    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';
    }
    
    /**
     * Esconde tooltip da torre
     */
    hideTowerTooltip() {
        this.hideAllTooltips();
    }
    
    /**
     * Esconde tooltip da magia
     */
    hideSpellTooltip() {
        this.hideAllTooltips();
    }
    
    /**
     * Esconde todos os tooltips
     */
    hideAllTooltips() {
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }
    
    /**
     * Mostra game over
     */
    showGameOver(result) {
        if (!this.elements.gameOverModal) return;
        
        this.state.isGameOverVisible = true;
        
        const title = this.elements.gameOverModal.querySelector('#game-over-title');
        const message = this.elements.gameOverModal.querySelector('#game-over-message');
        
        if (result.result === 'victory') {
            if (title) title.textContent = 'Vitória!';
            if (message) {
                message.innerHTML = `
                    Parabéns! Você defendeu seu reino!<br>
                    Pontuação: ${result.score}<br>
                    Inimigos derrotados: ${result.statistics.enemiesKilled}<br>
                    Torres construídas: ${result.statistics.towersBuilt}
                `;
            }
        } else {
            if (title) title.textContent = 'Derrota';
            if (message) {
                message.innerHTML = `
                    Seu reino foi conquistado...<br>
                    Pontuação: ${result.score}<br>
                    Inimigos derrotados: ${result.statistics.enemiesKilled}<br>
                    Torres construídas: ${result.statistics.towersBuilt}
                `;
            }
        }
        
        this.elements.gameOverModal.classList.remove('hidden');
    }
    
    /**
     * Esconde game over
     */
    hideGameOver() {
        if (this.elements.gameOverModal) {
            this.elements.gameOverModal.classList.add('hidden');
        }
        
        this.state.isGameOverVisible = false;
    }
    
    /**
     * Alterna pausa
     */
    togglePause() {
        const isPaused = this.elements.pauseBtn.textContent === 'Continuar';
        
        if (isPaused) {
            this.emit('gameResumed');
            this.elements.pauseBtn.textContent = 'Pausar';
        } else {
            this.emit('gamePaused');
            this.elements.pauseBtn.textContent = 'Continuar';
        }
    }
    
    /**
     * Mostra menu principal
     */
    showMainMenu() {
        // Implementar navegação para menu principal
        this.emit('mainMenuRequested');
    }
    
    /**
     * Manipula teclas pressionadas
     */
    handleKeyPress(event) {
        switch (event.code) {
            case 'Space':
            case 'Escape':
                event.preventDefault();
                this.togglePause();
                break;
            case 'Digit1':
                this.selectTowerType('ARCHER');
                break;
            case 'Digit2':
                this.selectTowerType('MAGE');
                break;
            case 'Digit3':
                this.selectTowerType('ICE_MAGE');
                break;
            case 'Digit4':
                this.selectTowerType('POISON_TOWER');
                break;
            case 'Digit5':
                this.selectTowerType('CANNON');
                break;
            case 'Digit6':
                this.selectTowerType('LIGHTNING');
                break;
            case 'KeyQ':
                this.castSpell('FIREBALL');
                break;
            case 'KeyW':
                this.castSpell('FREEZE');
                break;
            case 'KeyE':
                this.castSpell('LIGHTNING_STORM');
                break;
            case 'KeyT':
                this.castSpell('HEAL');
                break;
        }
    }
    
    /**
     * Cria sistema de notificações
     */
    createNotificationSystem() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(this.notificationContainer);
    }
    
    /**
     * Mostra notificação
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 4px;
            font-size: 14px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        this.notificationContainer.appendChild(notification);
        
        // Anima entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove após duração
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, this.config.notificationDuration);
    }
    
    /**
     * Mostra ganho de ouro
     */
    showGoldGain(amount) {
        this.showNotification(`+${amount} 🪙`, 'success');
    }
    
    /**
     * Mostra erro de ouro insuficiente
     */
    showInsufficientGold(required) {
        this.showNotification(`Ouro insuficiente! Necessário: ${required} 🪙`, 'error');
    }
    
    /**
     * Atualiza estado do botão de wave
     */
    updateWaveButton(canStart) {
        if (this.elements.startWaveBtn) {
            this.elements.startWaveBtn.disabled = !canStart;
            this.elements.startWaveBtn.textContent = canStart ? 'Iniciar Wave' : 'Wave em Progresso';
        }
    }
    
    /**
     * Atualiza o jogo (para animações da UI)
     */
    update(deltaTime) {
        // Atualizar animações da UI se necessário
        this.updateCooldownAnimations();
    }
    
    /**
     * Atualiza animações de cooldown
     */
    updateCooldownAnimations() {
        const cooldownBars = this.elements.spellShop.querySelectorAll('.cooldown-bar');
        // Implementar atualizações de cooldown se necessário
    }
    
    /**
     * Reseta a UI
     */
    reset() {
        this.clearTowerSelection();
        this.hideTowerInfo();
        this.hideGameOver();
        this.hideAllTooltips();
        
        // Reseta cooldowns
        const spellButtons = this.elements.spellShop.querySelectorAll('.spell-item');
        spellButtons.forEach(button => {
            button.classList.remove('cooldown');
            const cooldownBar = button.querySelector('.cooldown-bar');
            if (cooldownBar) {
                cooldownBar.style.width = '100%';
            }
        });
        
        // Reseta valores
        this.updateGold(GAME_CONFIG.PLAYER.INITIAL_GOLD);
        this.updateHealth(GAME_CONFIG.PLAYER.INITIAL_HEALTH);
        this.updateWave(1);
        this.updateWaveButton(true);
    }
    
    /**
     * Destrói o manager
     */
    destroy() {
        this.removeAllListeners();
        this.hideAllTooltips();
        
        if (this.notificationContainer && this.notificationContainer.parentNode) {
            this.notificationContainer.parentNode.removeChild(this.notificationContainer);
        }
    }
} 