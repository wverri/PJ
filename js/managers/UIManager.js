/**
 * UIManager - Gerencia toda a interface do usuário
 * Implementa o padrão Observer e Command
 * Aprimorado para suportar sistema de evolução
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
            towerName: document.getElementById('tower-name'),
            towerDescription: document.getElementById('tower-description'),
            towerDamage: document.getElementById('tower-damage'),
            towerRange: document.getElementById('tower-range'),
            towerSpeed: document.getElementById('tower-speed'),
            towerLevel: document.getElementById('tower-level'),
            gameOverModal: document.getElementById('game-over-modal'),
            restartBtn: document.getElementById('restart-btn'),
            menuBtn: document.getElementById('menu-btn'),
            upgradeTowerBtn: document.getElementById('upgrade-tower-btn'),
            evolveTowerBtn: document.getElementById('evolve-tower-btn'),
            sellTowerBtn: document.getElementById('sell-tower-btn'),
            evolutionOptions: document.getElementById('evolution-options'),
            evolutionList: document.getElementById('evolution-list')
        };
        
        // Estado da UI
        this.state = {
            selectedTowerType: null,
            selectedTower: null,
            isShopVisible: true,
            isGameOverVisible: false,
            showingEvolutionOptions: false,
            isPaused: false
        };
        
        // Configurações de UI
        this.config = {
            animationDuration: 300,
            notificationDuration: 3000,
            tooltipDelay: 500,
            evolutionAnimationDuration: 800
        };
        
        // Sistema de notificações
        this.notifications = [];
        this.tooltips = new Map();
        
        this.setupEventHandlers();
        this.createNotificationSystem();
        this.createTooltipSystem();
    }
    
    /**
     * Configura manipuladores de eventos
     */
    setupEventHandlers() {
        // Botões principais
        this.elements.startWaveBtn?.addEventListener('click', () => {
            this.emit('waveStarted');
            this.animateButton(this.elements.startWaveBtn);
        });
        
        this.elements.pauseBtn?.addEventListener('click', () => {
            this.togglePause();
        });
        
        this.elements.restartBtn?.addEventListener('click', () => {
            this.emit('gameRestarted');
            this.animateButton(this.elements.restartBtn);
        });
        
        this.elements.menuBtn?.addEventListener('click', () => {
            this.showMainMenu();
        });
        
        // Botões de torre
        this.elements.upgradeTowerBtn?.addEventListener('click', () => {
            if (this.state.selectedTower) {
                this.emit('towerUpgraded', this.state.selectedTower);
                this.animateButton(this.elements.upgradeTowerBtn);
            }
        });
        
        this.elements.evolveTowerBtn?.addEventListener('click', () => {
            this.toggleEvolutionOptions();
        });
        
        this.elements.sellTowerBtn?.addEventListener('click', () => {
            if (this.state.selectedTower) {
                this.emit('towerSold', this.state.selectedTower);
                this.animateButton(this.elements.sellTowerBtn);
                this.hideTowerInfo();
            }
        });
        
        // Teclas de atalho
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
        
        // Clique fora para fechar opções de evolução
        document.addEventListener('click', (event) => {
            if (this.state.showingEvolutionOptions && 
                !this.elements.evolutionOptions?.contains(event.target) &&
                !this.elements.evolveTowerBtn?.contains(event.target)) {
                this.hideEvolutionOptions();
            }
        });
    }
    
    /**
     * Inicializa loja de torres
     */
    initializeTowerShop() {
        if (!this.elements.towerShop) return;
        
        this.elements.towerShop.innerHTML = '';
        
        // Mostra apenas torres básicas (tier 1) na loja
        Object.entries(TOWER_TYPES).forEach(([type, config]) => {
            // Só adiciona torres básicas (tier 1) à loja
            if (config.tier === 1) {
                const towerButton = this.createTowerButton(type, config);
                this.elements.towerShop.appendChild(towerButton);
            }
        });
        
        // Adiciona animação de entrada
        this.animateShopItems();
    }
    
    /**
     * Cria botão de torre aprimorado
     */
    createTowerButton(type, config) {
        const button = document.createElement('div');
        button.className = 'tower-item';
        button.dataset.towerType = type;
        
        button.innerHTML = `
            <div class="tower-icon">${config.icon}</div>
            <div class="tower-name">${config.name}</div>
            <div class="tower-cost">${config.cost} 🪙</div>
            <div class="tower-stats-preview">
                <div class="stat-preview">⚔️ ${config.damage}</div>
                <div class="stat-preview">🎯 ${config.range}</div>
                <div class="stat-preview">⚡ ${config.attackSpeed}ms</div>
            </div>
        `;
        
        // Eventos do botão
        button.addEventListener('click', () => {
            this.selectTowerType(type);
        });
        
        button.addEventListener('mouseenter', () => {
            this.showTowerTooltip(button, config);
            button.classList.add('hover');
        });
        
        button.addEventListener('mouseleave', () => {
            this.hideTowerTooltip();
            button.classList.remove('hover');
        });
        
        return button;
    }
    
    /**
     * Anima itens da loja
     */
    animateShopItems() {
        const items = this.elements.towerShop.querySelectorAll('.tower-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    /**
     * Seleciona tipo de torre
     */
    selectTowerType(type) {
        console.log('🏗️ Torre selecionada:', type);
        
        // Remove seleção anterior
        this.clearTowerSelection();
        
        // Seleciona nova torre
        this.state.selectedTowerType = type;
        
        const button = this.elements.towerShop.querySelector(`[data-tower-type="${type}"]`);
        if (button) {
            button.classList.add('selected');
            this.animateSelection(button);
        }
        
        this.emit('towerTypeSelected', type);
        this.showNotification(`Torre ${TOWER_TYPES[type].name} selecionada`, 'success');
    }
    
    /**
     * Anima seleção de torre
     */
    animateSelection(button) {
        button.style.transform = 'scale(1.1)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
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
        
        this.emit('towerSelectionCleared');
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
        if (!this.elements.gold) return;
        
        const oldValue = parseInt(this.elements.gold.textContent) || 0;
        const difference = amount - oldValue;
        
        this.animateValueChange(this.elements.gold, amount);
        
        // Mostra ganho/perda de ouro
        if (difference !== 0) {
            this.showGoldChange(difference);
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
        if (!element) return;
        
        const oldValue = parseInt(element.textContent) || 0;
        const difference = newValue - oldValue;
        const duration = 500;
        const steps = 30;
        const stepValue = difference / steps;
        const stepDuration = duration / steps;
        
        let currentStep = 0;
        
        const animate = () => {
            if (currentStep < steps) {
                const currentValue = Math.round(oldValue + (stepValue * currentStep));
                element.textContent = currentValue;
                currentStep++;
                setTimeout(animate, stepDuration);
            } else {
                element.textContent = newValue;
            }
        };
        
        animate();
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
     * Mostra informações da torre selecionada
     */
    showTowerInfo(tower) {
        if (!this.elements.towerInfo || !tower) return;
        
        this.state.selectedTower = tower;
        
        // Atualiza informações básicas
        if (this.elements.towerName) {
            this.elements.towerName.textContent = this.getTowerDisplayName(tower);
        }
        
        if (this.elements.towerDescription) {
            this.elements.towerDescription.textContent = this.getTowerDescription(tower);
        }
        
        // Atualiza estatísticas
        this.updateTowerStats(tower);
        
        // Atualiza botões de ação
        this.updateTowerActionButtons(tower);
        
        // Mostra painel com animação
        this.elements.towerInfo.classList.remove('hidden');
        this.animateTowerInfoShow();
        
        // Esconde opções de evolução se estiverem visíveis
        this.hideEvolutionOptions();
    }
    
    /**
     * Obtém nome de exibição da torre
     */
    getTowerDisplayName(tower) {
        let name = TOWER_TYPES[tower.towerType]?.name || 'Torre Desconhecida';
        
        if (tower.currentEvolution) {
            const evolutionData = tower.evolutionTree.getEvolution(tower.currentEvolution);
            if (evolutionData) {
                name = evolutionData.name;
            }
        }
        
        return `${name} (Nível ${tower.level})`;
    }
    
    /**
     * Obtém descrição da torre
     */
    getTowerDescription(tower) {
        if (tower.currentEvolution) {
            const evolutionData = tower.evolutionTree.getEvolution(tower.currentEvolution);
            if (evolutionData) {
                return evolutionData.description;
            }
        }
        
        return TOWER_TYPES[tower.towerType]?.description || 'Descrição não disponível';
    }
    
    /**
     * Atualiza estatísticas da torre
     */
    updateTowerStats(tower) {
        if (this.elements.towerDamage) {
            this.elements.towerDamage.textContent = Math.round(tower.getCurrentDamage());
        }
        
        if (this.elements.towerRange) {
            this.elements.towerRange.textContent = Math.round(tower.getCurrentRange());
        }
        
        if (this.elements.towerSpeed) {
            this.elements.towerSpeed.textContent = `${tower.getCurrentAttackSpeed()}ms`;
        }
        
        if (this.elements.towerLevel) {
            this.elements.towerLevel.textContent = tower.level;
        }
    }
    
    /**
     * Atualiza botões de ação da torre
     */
    updateTowerActionButtons(tower) {
        // Botão de upgrade
        if (this.elements.upgradeTowerBtn) {
            const canUpgrade = tower.level < 5; // Máximo 5 níveis
            const upgradeCost = tower.getUpgradeCost('damage');
            
            this.elements.upgradeTowerBtn.disabled = !canUpgrade;
            this.elements.upgradeTowerBtn.textContent = canUpgrade ? 
                `Melhorar (${upgradeCost} 🪙)` : 'Máximo';
        }
        
        // Botão de evolução
        if (this.elements.evolveTowerBtn) {
            const availableEvolutions = tower.getAvailableEvolutions();
            const canEvolve = availableEvolutions.length > 0;
            
            this.elements.evolveTowerBtn.disabled = !canEvolve;
            this.elements.evolveTowerBtn.textContent = canEvolve ? 'Evoluir' : 'Sem Evoluções';
            
            if (canEvolve) {
                this.elements.evolveTowerBtn.classList.add('pulse');
            } else {
                this.elements.evolveTowerBtn.classList.remove('pulse');
            }
        }
        
        // Botão de venda
        if (this.elements.sellTowerBtn) {
            const sellValue = tower.getSellValue();
            this.elements.sellTowerBtn.textContent = `Vender (${sellValue} 🪙)`;
        }
    }
    
    /**
     * Anima exibição do painel de informações
     */
    animateTowerInfoShow() {
        if (!this.elements.towerInfo) return;
        
        this.elements.towerInfo.style.transform = 'perspective(1000px) rotateX(15deg) translateY(20px)';
        this.elements.towerInfo.style.opacity = '0';
        
        requestAnimationFrame(() => {
            this.elements.towerInfo.style.transition = 'all 0.3s ease';
            this.elements.towerInfo.style.transform = 'perspective(1000px) rotateX(0deg) translateY(0)';
            this.elements.towerInfo.style.opacity = '1';
        });
    }
    
    /**
     * Esconde informações da torre
     */
    hideTowerInfo() {
        if (!this.elements.towerInfo) return;
        
        this.elements.towerInfo.style.transform = 'perspective(1000px) rotateX(15deg) translateY(20px)';
        this.elements.towerInfo.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.towerInfo.classList.add('hidden');
            this.state.selectedTower = null;
        }, 300);
        
        this.hideEvolutionOptions();
    }
    
    /**
     * Alterna opções de evolução
     */
    toggleEvolutionOptions() {
        if (this.state.showingEvolutionOptions) {
            this.hideEvolutionOptions();
        } else {
            this.showEvolutionOptions();
        }
    }
    
    /**
     * Mostra opções de evolução
     */
    showEvolutionOptions() {
        if (!this.state.selectedTower || !this.elements.evolutionOptions) return;
        
        const availableEvolutions = this.state.selectedTower.getAvailableEvolutions();
        if (availableEvolutions.length === 0) return;
        
        this.populateEvolutionOptions(availableEvolutions);
        
        this.elements.evolutionOptions.classList.remove('hidden');
        this.state.showingEvolutionOptions = true;
        
        // Animação de entrada
        this.animateEvolutionOptionsShow();
    }
    
    /**
     * Popula opções de evolução
     */
    populateEvolutionOptions(evolutions) {
        if (!this.elements.evolutionList) return;
        
        this.elements.evolutionList.innerHTML = '';
        
        evolutions.forEach((evolution, index) => {
            const option = this.createEvolutionOption(evolution);
            this.elements.evolutionList.appendChild(option);
            
            // Animação escalonada
            setTimeout(() => {
                option.style.opacity = '1';
                option.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
    
    /**
     * Cria opção de evolução
     */
    createEvolutionOption(evolution) {
        const option = document.createElement('div');
        option.className = 'evolution-option';
        option.dataset.evolutionType = evolution.type;
        
        // Estilo inicial para animação
        option.style.opacity = '0';
        option.style.transform = 'translateX(-20px)';
        option.style.transition = 'all 0.3s ease';
        
        option.innerHTML = `
            <div class="evolution-name">${evolution.data.name}</div>
            <div class="evolution-description">${evolution.data.description}</div>
            <div class="evolution-cost">Custo: ${evolution.data.cost} 🪙</div>
        `;
        
        // Evento de clique
        option.addEventListener('click', () => {
            this.selectEvolution(evolution.type);
        });
        
        // Efeitos hover
        option.addEventListener('mouseenter', () => {
            this.showEvolutionTooltip(option, evolution);
        });
        
        option.addEventListener('mouseleave', () => {
            this.hideEvolutionTooltip();
        });
        
        return option;
    }
    
    /**
     * Seleciona evolução
     */
    selectEvolution(evolutionType) {
        if (!this.state.selectedTower) return;
        
        this.emit('towerEvolved', this.state.selectedTower, evolutionType);
        this.hideEvolutionOptions();
        
        // Animação de evolução
        this.animateEvolution();
        
        this.showNotification('Torre evoluída com sucesso!', 'success');
    }
    
    /**
     * Anima evolução da torre
     */
    animateEvolution() {
        if (!this.elements.towerInfo) return;
        
        // Efeito de brilho
        this.elements.towerInfo.classList.add('glow');
        
        // Animação de pulsação
        this.elements.towerInfo.style.animation = 'pulse 0.8s ease-in-out';
        
        setTimeout(() => {
            this.elements.towerInfo.classList.remove('glow');
            this.elements.towerInfo.style.animation = '';
            
            // Atualiza informações da torre
            if (this.state.selectedTower) {
                this.updateTowerStats(this.state.selectedTower);
                this.updateTowerActionButtons(this.state.selectedTower);
            }
        }, 800);
    }
    
    /**
     * Anima exibição das opções de evolução
     */
    animateEvolutionOptionsShow() {
        if (!this.elements.evolutionOptions) return;
        
        this.elements.evolutionOptions.style.maxHeight = '0';
        this.elements.evolutionOptions.style.opacity = '0';
        
        requestAnimationFrame(() => {
            this.elements.evolutionOptions.style.transition = 'all 0.3s ease';
            this.elements.evolutionOptions.style.maxHeight = '300px';
            this.elements.evolutionOptions.style.opacity = '1';
        });
    }
    
    /**
     * Esconde opções de evolução
     */
    hideEvolutionOptions() {
        if (!this.elements.evolutionOptions) return;
        
        this.elements.evolutionOptions.style.maxHeight = '0';
        this.elements.evolutionOptions.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.evolutionOptions.classList.add('hidden');
            this.state.showingEvolutionOptions = false;
        }, 300);
    }
    
    /**
     * Mostra tooltip de evolução
     */
    showEvolutionTooltip(element, evolution) {
        const bonuses = evolution.data.bonuses;
        let bonusText = '';
        
        Object.entries(bonuses).forEach(([key, value]) => {
            if (typeof value === 'number') {
                const sign = value > 0 ? '+' : '';
                bonusText += `${key}: ${sign}${value}\n`;
            }
        });
        
        const tooltip = this.createTooltip(`
            <strong>${evolution.data.name}</strong><br>
            ${evolution.data.description}<br><br>
            <strong>Bônus:</strong><br>
            ${bonusText.replace(/\n/g, '<br>')}
        `);
        
        this.positionTooltip(tooltip, element);
        this.tooltips.set('evolution', tooltip);
    }
    
    /**
     * Esconde tooltip de evolução
     */
    hideEvolutionTooltip() {
        const tooltip = this.tooltips.get('evolution');
        if (tooltip) {
            tooltip.remove();
            this.tooltips.delete('evolution');
        }
    }
    
    /**
     * Anima botão
     */
    animateButton(button) {
        if (!button) return;
        
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    /**
     * Alterna pausa
     */
    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.textContent = this.state.isPaused ? 'Continuar' : 'Pausar';
            this.elements.pauseBtn.classList.toggle('active', this.state.isPaused);
        }
        
        this.emit('gamePaused', this.state.isPaused);
        this.animateButton(this.elements.pauseBtn);
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
     * Mostra mudança de ouro
     */
    showGoldChange(difference) {
        const goldElement = this.elements.gold;
        if (!goldElement) return;
        
        const changeElement = document.createElement('div');
        changeElement.className = 'gold-change';
        changeElement.textContent = difference > 0 ? `+${difference}` : `${difference}`;
        changeElement.style.cssText = `
            position: absolute;
            color: ${difference > 0 ? '#27ae60' : '#e74c3c'};
            font-weight: bold;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transform: translateY(0);
            transition: all 1s ease;
        `;
        
        const rect = goldElement.getBoundingClientRect();
        changeElement.style.left = `${rect.right + 10}px`;
        changeElement.style.top = `${rect.top}px`;
        
        document.body.appendChild(changeElement);
        
        // Anima
        requestAnimationFrame(() => {
            changeElement.style.opacity = '1';
            changeElement.style.transform = 'translateY(-30px)';
        });
        
        // Remove após animação
        setTimeout(() => {
            changeElement.remove();
        }, 1000);
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
        // Remove event listeners
        Object.values(this.elements).forEach(element => {
            if (element && element.removeEventListener) {
                element.removeEventListener('click', () => {});
            }
        });
        
        // Remove tooltips
        this.tooltips.forEach(tooltip => tooltip.remove());
        this.tooltips.clear();
        
        // Remove container de tooltip
        if (this.tooltipContainer) {
            this.tooltipContainer.remove();
        }
        
        // Limpa notificações
        this.notifications.forEach(notification => {
            if (notification.element) {
                notification.element.remove();
            }
        });
        this.notifications.length = 0;
        
        // Remove listeners de eventos
        this.removeAllListeners();
    }
    
    /**
     * Cria sistema de tooltip
     */
    createTooltipSystem() {
        // Container para tooltips
        this.tooltipContainer = document.createElement('div');
        this.tooltipContainer.className = 'tooltip-container';
        this.tooltipContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(this.tooltipContainer);
    }
    
    /**
     * Cria tooltip
     */
    createTooltip(content) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = content;
        tooltip.style.cssText = `
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #ecf0f1;
            padding: 10px 15px;
            border-radius: 8px;
            border: 1px solid #3498db;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            font-size: 12px;
            line-height: 1.4;
            max-width: 250px;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
        `;
        
        this.tooltipContainer.appendChild(tooltip);
        
        // Anima entrada
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });
        
        return tooltip;
    }
    
    /**
     * Posiciona tooltip
     */
    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let top = rect.top - tooltipRect.height - 10;
        
        // Ajusta se sair da tela
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        if (top < 10) {
            top = rect.bottom + 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
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
     * Atualiza estado do botão de wave
     */
    updateWaveButton(canStart) {
        if (this.elements.startWaveBtn) {
            this.elements.startWaveBtn.disabled = !canStart;
            this.elements.startWaveBtn.textContent = canStart ? 'Iniciar Wave' : 'Wave em Progresso';
        }
    }
} 