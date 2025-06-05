/**
 * GameRenderer - Gerencia toda a renderização do jogo
 * Implementa o padrão Strategy para diferentes tipos de renderização
 */
class GameRenderer extends EventEmitter {
    constructor(canvas, ctx) {
        super();
        
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Referências para sistemas
        this.gameManager = null;
        this.effectSystem = null;
        
        // Configurações de renderização
        this.config = {
            showDebugInfo: false,
            showRangeIndicators: true,
            showPathfinding: false,
            showFPS: false,
            backgroundColor: '#2d5016',
            gridColor: 'rgba(255, 255, 255, 0.1)',
            pathColor: '#8B4513'
        };
        
        // Cache de renderização
        this.renderCache = {
            background: null,
            path: null,
            grid: null
        };
        
        // Estratégias de renderização
        this.renderStrategies = new Map();
        this.setupRenderStrategies();
        
        // Inicializa background
        this.initializeBackground();
    }
    
    /**
     * Configura estratégias de renderização
     */
    setupRenderStrategies() {
        this.renderStrategies.set('enemy', new EnemyRenderStrategy());
        this.renderStrategies.set('tower', new TowerRenderStrategy());
        this.renderStrategies.set('projectile', new ProjectileRenderStrategy());
        this.renderStrategies.set('effect', new EffectRenderStrategy());
        this.renderStrategies.set('ui', new UIRenderStrategy());
    }
    
    /**
     * Define referência para o GameManager
     */
    setGameManager(gameManager) {
        this.gameManager = gameManager;
    }
    
    /**
     * Define referência para o EffectSystem
     */
    setEffectSystem(effectSystem) {
        this.effectSystem = effectSystem;
    }
    
    /**
     * Renderiza o jogo
     */
    render(deltaTime) {
        this.clearCanvas();
        this.renderBackground();
        this.renderPath();
        this.renderGrid();
        this.renderEntities();
        this.renderEffects();
        this.renderUI();
        this.renderDebugInfo();
    }
    
    /**
     * Limpa o canvas
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Renderiza o fundo
     */
    renderBackground() {
        if (!this.renderCache.background) {
            this.createBackgroundCache();
        }
        
        this.ctx.drawImage(this.renderCache.background, 0, 0);
    }
    
    /**
     * Cria cache do fundo
     */
    createBackgroundCache() {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.canvas.width;
        bgCanvas.height = this.canvas.height;
        const bgCtx = bgCanvas.getContext('2d');
        
        // Gradiente de fundo
        const gradient = bgCtx.createLinearGradient(0, 0, 0, bgCanvas.height);
        gradient.addColorStop(0, '#4a7c59');
        gradient.addColorStop(0.5, this.config.backgroundColor);
        gradient.addColorStop(1, '#1a3a0f');
        
        bgCtx.fillStyle = gradient;
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        // Textura de grama
        this.addGrassTexture(bgCtx, bgCanvas.width, bgCanvas.height);
        
        this.renderCache.background = bgCanvas;
    }
    
    /**
     * Adiciona textura de grama
     */
    addGrassTexture(ctx, width, height) {
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3 + 1;
            
            ctx.fillStyle = `hsl(${90 + Math.random() * 30}, 60%, ${30 + Math.random() * 20}%)`;
            ctx.fillRect(x, y, size, size * 2);
        }
        
        ctx.globalAlpha = 1;
    }
    
    /**
     * Renderiza o caminho
     */
    renderPath() {
        if (!this.renderCache.path) {
            this.createPathCache();
        }
        
        this.ctx.drawImage(this.renderCache.path, 0, 0);
    }
    
    /**
     * Cria cache do caminho
     */
    createPathCache() {
        const pathCanvas = document.createElement('canvas');
        pathCanvas.width = this.canvas.width;
        pathCanvas.height = this.canvas.height;
        const pathCtx = pathCanvas.getContext('2d');
        
        const path = GAME_CONFIG.PATH;
        
        // Desenha o caminho principal
        pathCtx.strokeStyle = this.config.pathColor;
        pathCtx.lineWidth = 40;
        pathCtx.lineCap = 'round';
        pathCtx.lineJoin = 'round';
        
        pathCtx.beginPath();
        pathCtx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            pathCtx.lineTo(path[i].x, path[i].y);
        }
        
        pathCtx.stroke();
        
        // Desenha bordas do caminho
        pathCtx.strokeStyle = '#654321';
        pathCtx.lineWidth = 44;
        pathCtx.globalCompositeOperation = 'destination-over';
        
        pathCtx.beginPath();
        pathCtx.moveTo(path[0].x, path[0].y);
        
        for (let i = 1; i < path.length; i++) {
            pathCtx.lineTo(path[i].x, path[i].y);
        }
        
        pathCtx.stroke();
        
        this.renderCache.path = pathCanvas;
    }
    
    /**
     * Renderiza grade (se habilitada)
     */
    renderGrid() {
        if (!this.config.showDebugInfo) return;
        
        if (!this.renderCache.grid) {
            this.createGridCache();
        }
        
        this.ctx.drawImage(this.renderCache.grid, 0, 0);
    }
    
    /**
     * Cria cache da grade
     */
    createGridCache() {
        const gridCanvas = document.createElement('canvas');
        gridCanvas.width = this.canvas.width;
        gridCanvas.height = this.canvas.height;
        const gridCtx = gridCanvas.getContext('2d');
        
        const gridSize = 40;
        
        gridCtx.strokeStyle = this.config.gridColor;
        gridCtx.lineWidth = 1;
        
        // Linhas verticais
        for (let x = 0; x <= this.canvas.width; x += gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(x, 0);
            gridCtx.lineTo(x, this.canvas.height);
            gridCtx.stroke();
        }
        
        // Linhas horizontais
        for (let y = 0; y <= this.canvas.height; y += gridSize) {
            gridCtx.beginPath();
            gridCtx.moveTo(0, y);
            gridCtx.lineTo(this.canvas.width, y);
            gridCtx.stroke();
        }
        
        this.renderCache.grid = gridCanvas;
    }
    
    /**
     * Renderiza todas as entidades
     */
    renderEntities() {
        if (!this.gameManager) return;
        
        // Renderiza torres primeiro (ficam atrás)
        this.renderTowers();
        
        // Renderiza projéteis
        this.renderProjectiles();
        
        // Renderiza inimigos por último (ficam na frente)
        this.renderEnemies();
        
        // Renderiza indicadores de seleção
        this.renderSelectionIndicators();
    }
    
    /**
     * Renderiza torres
     */
    renderTowers() {
        const towers = this.gameManager.getTowers();
        const strategy = this.renderStrategies.get('tower');
        
        towers.forEach(tower => {
            strategy.render(this.ctx, tower, this.config);
            
            // Renderiza alcance se torre estiver selecionada
            if (this.gameManager.getSelectedTower() === tower) {
                this.renderTowerRange(tower);
            }
        });
    }
    
    /**
     * Renderiza alcance da torre
     */
    renderTowerRange(tower) {
        this.ctx.save();
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.arc(tower.position.x, tower.position.y, tower.range, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    /**
     * Renderiza projéteis
     */
    renderProjectiles() {
        const projectiles = this.gameManager.getProjectiles();
        const strategy = this.renderStrategies.get('projectile');
        
        projectiles.forEach(projectile => {
            strategy.render(this.ctx, projectile, this.config);
        });
    }
    
    /**
     * Renderiza inimigos
     */
    renderEnemies() {
        const enemies = this.gameManager.getEnemies();
        const strategy = this.renderStrategies.get('enemy');
        
        enemies.forEach(enemy => {
            strategy.render(this.ctx, enemy, this.config);
        });
    }
    
    /**
     * Renderiza indicadores de seleção
     */
    renderSelectionIndicators() {
        // Indicador de colocação de torre
        const selectedTowerType = this.gameManager.getSelectedTowerType();
        if (selectedTowerType) {
            this.renderTowerPlacementIndicator(selectedTowerType);
        }
    }
    
    /**
     * Renderiza indicador de colocação de torre
     */
    renderTowerPlacementIndicator(towerType) {
        // Implementar indicador visual para colocação de torre
        // Baseado na posição do mouse
    }
    
    /**
     * Renderiza efeitos
     */
    renderEffects() {
        if (!this.effectSystem) return;
        
        // Chama diretamente o EffectSystem para renderizar todos os efeitos
        this.effectSystem.render(this.ctx);
    }
    
    /**
     * Renderiza elementos de UI no canvas
     */
    renderUI() {
        const strategy = this.renderStrategies.get('ui');
        
        // Renderiza elementos de UI específicos do canvas
        if (this.gameManager) {
            const uiData = {
                selectedTower: this.gameManager.getSelectedTower(),
                selectedTowerType: this.gameManager.getSelectedTowerType(),
                mousePosition: this.gameManager.mousePosition
            };
            
            strategy.render(this.ctx, uiData, this.config);
        }
    }
    
    /**
     * Renderiza informações de debug
     */
    renderDebugInfo() {
        if (!this.config.showDebugInfo || !this.gameManager) return;
        
        this.ctx.save();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 120);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px monospace';
        
        const debugInfo = [
            `Inimigos: ${this.gameManager.getEnemies().length}`,
            `Torres: ${this.gameManager.getTowers().length}`,
            `Projéteis: ${this.gameManager.getProjectiles().length}`,
            `Ouro: ${this.gameManager.getGold()}`,
            `Vida: ${this.gameManager.getHealth()}`,
            `Wave: ${this.gameManager.getCurrentWave()}`,
            `Score: ${this.gameManager.getScore()}`
        ];
        
        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 15, 30 + index * 15);
        });
        
        this.ctx.restore();
    }
    
    /**
     * Alterna modo debug
     */
    toggleDebugMode() {
        this.config.showDebugInfo = !this.config.showDebugInfo;
        
        // Limpa cache da grade para recriar
        this.renderCache.grid = null;
    }
    
    /**
     * Alterna indicadores de alcance
     */
    toggleRangeIndicators() {
        this.config.showRangeIndicators = !this.config.showRangeIndicators;
    }
    
    /**
     * Alterna pathfinding visual
     */
    togglePathfinding() {
        this.config.showPathfinding = !this.config.showPathfinding;
    }
    
    /**
     * Invalida cache de renderização
     */
    invalidateCache(type = 'all') {
        if (type === 'all') {
            this.renderCache.background = null;
            this.renderCache.path = null;
            this.renderCache.grid = null;
        } else if (this.renderCache[type]) {
            this.renderCache[type] = null;
        }
    }
    
    /**
     * Inicializa background
     */
    initializeBackground() {
        // Força criação do cache de background
        this.createBackgroundCache();
        this.createPathCache();
    }
    
    /**
     * Redimensiona renderer
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Invalida todos os caches
        this.invalidateCache();
        
        // Recria background
        this.initializeBackground();
    }
    
    /**
     * Obtém configurações de renderização
     */
    getConfig() {
        return { ...this.config };
    }
    
    /**
     * Atualiza configurações de renderização
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        // Invalida caches relevantes
        if (newConfig.backgroundColor || newConfig.pathColor) {
            this.invalidateCache();
            this.initializeBackground();
        }
    }
    
    /**
     * Destrói o renderer
     */
    destroy() {
        this.removeAllListeners();
        
        // Limpa caches
        this.renderCache.background = null;
        this.renderCache.path = null;
        this.renderCache.grid = null;
        
        // Limpa estratégias
        this.renderStrategies.clear();
    }
}

/**
 * Estratégia base para renderização
 */
class RenderStrategy {
    render(ctx, entity, config) {
        throw new Error('Método render deve ser implementado pela estratégia concreta');
    }
}

/**
 * Estratégia de renderização para inimigos
 */
class EnemyRenderStrategy extends RenderStrategy {
    render(ctx, enemy, config) {
        ctx.save();
        
        // Desenha sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(enemy.position.x + 2, enemy.position.y + 2, enemy.size * 0.8, enemy.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Desenha corpo do inimigo
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.position.x, enemy.position.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Desenha borda
        ctx.strokeStyle = enemy.borderColor || '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Desenha barra de vida
        this.renderHealthBar(ctx, enemy);
        
        // Desenha efeitos de status
        this.renderStatusEffects(ctx, enemy);
        
        ctx.restore();
    }
    
    renderHealthBar(ctx, enemy) {
        const barWidth = enemy.size * 2;
        const barHeight = 4;
        const x = enemy.position.x - barWidth / 2;
        const y = enemy.position.y - enemy.size - 10;
        
        // Fundo da barra
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Vida atual
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Borda da barra
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }
    
    renderStatusEffects(ctx, enemy) {
        if (!enemy.statusEffects) return;
        
        let iconX = enemy.position.x - enemy.size;
        const iconY = enemy.position.y - enemy.size - 20;
        const iconSize = 8;
        
        enemy.statusEffects.forEach(effect => {
            switch (effect.type) {
                case 'slow':
                    ctx.fillStyle = '#87CEEB';
                    break;
                case 'poison':
                    ctx.fillStyle = '#9ACD32';
                    break;
                case 'freeze':
                    ctx.fillStyle = '#00FFFF';
                    break;
                default:
                    ctx.fillStyle = '#FFF';
            }
            
            ctx.fillRect(iconX, iconY, iconSize, iconSize);
            iconX += iconSize + 2;
        });
    }
}

/**
 * Estratégia de renderização para torres
 */
class TowerRenderStrategy extends RenderStrategy {
    render(ctx, tower, config) {
        ctx.save();
        
        // Desenha base da torre
        this.renderTowerBase(ctx, tower);
        
        // Desenha torre principal
        this.renderTowerBody(ctx, tower);
        
        // Desenha canhão/arma
        this.renderTowerWeapon(ctx, tower);
        
        // Desenha nível da torre
        this.renderTowerLevel(ctx, tower);
        
        ctx.restore();
    }
    
    renderTowerBase(ctx, tower) {
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(tower.position.x, tower.position.y + 5, tower.size + 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    renderTowerBody(ctx, tower) {
        ctx.fillStyle = tower.color;
        ctx.beginPath();
        ctx.arc(tower.position.x, tower.position.y, tower.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = tower.borderColor || '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Desenha ícone da torre
        ctx.fillStyle = '#FFF';
        ctx.font = `${tower.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tower.icon, tower.position.x, tower.position.y);
    }
    
    renderTowerWeapon(ctx, tower) {
        if (!tower.target) return;
        
        // Calcula ângulo para o alvo
        const angle = Math.atan2(
            tower.target.position.y - tower.position.y,
            tower.target.position.x - tower.position.x
        );
        
        ctx.save();
        ctx.translate(tower.position.x, tower.position.y);
        ctx.rotate(angle);
        
        // Desenha canhão
        ctx.fillStyle = '#444';
        ctx.fillRect(0, -3, tower.size * 0.8, 6);
        
        ctx.restore();
    }
    
    renderTowerLevel(ctx, tower) {
        if (tower.level <= 1) return;
        
        ctx.fillStyle = '#FFD700';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            `★${tower.level}`,
            tower.position.x,
            tower.position.y - tower.size - 15
        );
    }
}

/**
 * Estratégia de renderização para projéteis
 */
class ProjectileRenderStrategy extends RenderStrategy {
    render(ctx, projectile, config) {
        ctx.save();
        
        switch (projectile.type) {
            case 'arrow':
                this.renderArrow(ctx, projectile);
                break;
            case 'fireball':
                this.renderFireball(ctx, projectile);
                break;
            case 'ice':
                this.renderIceShard(ctx, projectile);
                break;
            case 'poison':
                this.renderPoisonBolt(ctx, projectile);
                break;
            case 'cannonball':
                this.renderCannonball(ctx, projectile);
                break;
            case 'lightning':
                this.renderLightning(ctx, projectile);
                break;
            default:
                this.renderDefault(ctx, projectile);
        }
        
        ctx.restore();
    }
    
    renderArrow(ctx, projectile) {
        const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
        
        ctx.save();
        ctx.translate(projectile.position.x, projectile.position.y);
        ctx.rotate(angle);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-8, -1, 16, 2);
        
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(4, -3);
        ctx.lineTo(4, 3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    renderFireball(ctx, projectile) {
        // Núcleo da bola de fogo
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Chamas externas
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, projectile.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Brilho interno
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, projectile.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderIceShard(ctx, projectile) {
        ctx.fillStyle = '#87CEEB';
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(projectile.position.x, projectile.position.y - projectile.size);
        ctx.lineTo(projectile.position.x + projectile.size, projectile.position.y + projectile.size);
        ctx.lineTo(projectile.position.x - projectile.size, projectile.position.y + projectile.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    renderPoisonBolt(ctx, projectile) {
        ctx.fillStyle = '#9ACD32';
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Efeito de veneno
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    renderCannonball(ctx, projectile) {
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    renderLightning(ctx, projectile) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(projectile.position.x - 5, projectile.position.y - 5);
        ctx.lineTo(projectile.position.x + 5, projectile.position.y + 5);
        ctx.moveTo(projectile.position.x + 5, projectile.position.y - 5);
        ctx.lineTo(projectile.position.x - 5, projectile.position.y + 5);
        ctx.stroke();
    }
    
    renderDefault(ctx, projectile) {
        ctx.fillStyle = projectile.color || '#FFF';
        ctx.beginPath();
        ctx.arc(projectile.position.x, projectile.position.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * Estratégia de renderização para efeitos
 */
class EffectRenderStrategy extends RenderStrategy {
    render(ctx, effect, config) {
        ctx.save();
        
        switch (effect.type) {
            case 'explosion':
                this.renderExplosion(ctx, effect);
                break;
            case 'damage_text':
                this.renderDamageText(ctx, effect);
                break;
            case 'heal':
                this.renderHealEffect(ctx, effect);
                break;
            default:
                this.renderParticleEffect(ctx, effect);
        }
        
        ctx.restore();
    }
    
    renderExplosion(ctx, effect) {
        const progress = effect.getProgress();
        const radius = effect.radius * progress;
        const alpha = 1 - progress;
        
        ctx.globalAlpha = alpha;
        
        // Onda de choque
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(effect.position.x, effect.position.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Núcleo da explosão
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.arc(effect.position.x, effect.position.y, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderDamageText(ctx, effect) {
        const progress = effect.getProgress();
        const alpha = 1 - progress;
        const y = effect.position.y - progress * 30;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = effect.color || '#FFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(effect.text, effect.position.x, y);
    }
    
    renderHealEffect(ctx, effect) {
        const progress = effect.getProgress();
        const alpha = 1 - progress;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#4CAF50';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`+${effect.healing}`, effect.position.x, effect.position.y);
    }
    
    renderParticleEffect(ctx, effect) {
        if (!effect.particles) return;
        
        effect.particles.forEach(particle => {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

/**
 * Estratégia de renderização para UI no canvas
 */
class UIRenderStrategy extends RenderStrategy {
    render(ctx, uiData, config) {
        this.renderTowerPlacementPreview(ctx, uiData, config);
        this.renderSelectionHighlight(ctx, uiData, config);
    }
    
    renderTowerPlacementPreview(ctx, uiData, config) {
        if (!uiData.selectedTowerType || !uiData.mousePosition) return;
        
        const towerConfig = TOWER_TYPES[uiData.selectedTowerType];
        if (!towerConfig) return;
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        
        // Desenha preview da torre
        ctx.fillStyle = towerConfig.color;
        ctx.beginPath();
        ctx.arc(uiData.mousePosition.x, uiData.mousePosition.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Desenha alcance
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(uiData.mousePosition.x, uiData.mousePosition.y, towerConfig.range, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    renderSelectionHighlight(ctx, uiData, config) {
        if (!uiData.selectedTower) return;
        
        const tower = uiData.selectedTower;
        
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        
        ctx.beginPath();
        ctx.arc(tower.position.x, tower.position.y, tower.size + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
} 