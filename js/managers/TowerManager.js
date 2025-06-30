/**
 * TowerManager - Gerencia torres do jogo
 * Implementa padrões Factory e Observer
 */
class TowerManager extends EventEmitter {
    constructor() {
        super();
        
        this.towers = new Map();
        this.towerGrid = new Map();
        this.nextTowerId = 1;
        
        // Configurações de colocação
        this.placementConfig = {
            gridSize: 40,
            minDistanceFromPath: 15,
            maxTowersPerCell: 1
        };
        
        // Factory de torres
        this.towerFactory = new TowerFactory();
        
        // Validador de colocação
        this.placementValidator = new TowerPlacementValidator();
    }
    
    /**
     * Coloca uma nova torre
     */
    placeTower(position, towerType) {
        if (!this.canPlaceTower(position, towerType)) {
            throw new Error('Não é possível colocar torre nesta posição');
        }
        
        const tower = this.createTower(position, towerType);
        this.addTowerToGrid(tower);
        this.towers.set(tower.id, tower);
        
        this.emit('towerBuilt', tower);
        console.log(`🏗️ Torre ${towerType} construída em (${position.x}, ${position.y})`);
        
        return tower;
    }
    
    /**
     * Cria uma nova torre
     */
    createTower(position, towerType) {
        const tower = this.towerFactory.createTower(towerType, position);
        tower.id = this.generateTowerId();
        
        this.setupTowerEventHandlers(tower);
        
        return tower;
    }
    
    /**
     * Configura manipuladores de eventos da torre
     */
    setupTowerEventHandlers(tower) {
        tower.on('upgraded', () => {
            this.emit('towerUpgraded', tower);
        });
        
        tower.on('attacked', (target, damage) => {
            this.emit('towerAttacked', tower, target, damage);
        });
        
        tower.on('destroyed', () => {
            this.removeTower(tower);
        });
    }
    
    /**
     * Remove uma torre
     */
    removeTower(tower) {
        if (typeof tower === 'string') {
            tower = this.towers.get(tower);
        }
        
        if (!tower) return false;
        
        this.removeFromGrid(tower);
        this.towers.delete(tower.id);
        
        tower.destroy();
        
        this.emit('towerRemoved', tower);
        console.log(`🗑️ Torre removida: ${tower.towerType}`);
        
        return true;
    }
    
    /**
     * Verifica se pode colocar torre na posição
     */
    canPlaceTower(position, towerType) {
        const result = this.placementValidator.validate(position, towerType, {
            existingTowers: this.towers,
            towerGrid: this.towerGrid,
            placementConfig: this.placementConfig
        });
        
        return result;
    }
    
    /**
     * Adiciona torre à grade
     */
    addTowerToGrid(tower) {
        const gridKey = this.getGridKey(tower.position);
        
        if (!this.towerGrid.has(gridKey)) {
            this.towerGrid.set(gridKey, []);
        }
        
        this.towerGrid.get(gridKey).push(tower);
    }
    
    /**
     * Remove torre da grade
     */
    removeFromGrid(tower) {
        const gridKey = this.getGridKey(tower.position);
        const cellTowers = this.towerGrid.get(gridKey);
        
        if (cellTowers) {
            const index = cellTowers.indexOf(tower);
            if (index !== -1) {
                cellTowers.splice(index, 1);
            }
            
            if (cellTowers.length === 0) {
                this.towerGrid.delete(gridKey);
            }
        }
    }
    
    /**
     * Obtém chave da grade para posição
     */
    getGridKey(position) {
        const gridX = Math.floor(position.x / this.placementConfig.gridSize);
        const gridY = Math.floor(position.y / this.placementConfig.gridSize);
        return `${gridX},${gridY}`;
    }
    
    /**
     * Obtém torre na posição
     */
    getTowerAt(position, tolerance = 25) {
        for (const tower of this.towers.values()) {
            const distance = Vector2D.distance(tower.position, position);
            if (distance <= tolerance) {
                return tower;
            }
        }
        return null;
    }
    
    /**
     * Obtém torres em área
     */
    getTowersInArea(center, radius) {
        const towersInArea = [];
        
        for (const tower of this.towers.values()) {
            const distance = Vector2D.distance(tower.position, center);
            if (distance <= radius) {
                towersInArea.push(tower);
            }
        }
        
        return towersInArea;
    }
    
    /**
     * Obtém torres por tipo
     */
    getTowersByType(towerType) {
        return Array.from(this.towers.values())
            .filter(tower => tower.towerType === towerType);
    }
    
    /**
     * Melhora torre
     */
    upgradeTower(towerId) {
        const tower = this.towers.get(towerId);
        
        if (!tower) {
            throw new Error('Torre não encontrada');
        }
        
        if (!tower.canUpgrade()) {
            throw new Error('Torre não pode ser melhorada');
        }
        
        tower.upgrade();
        this.emit('towerUpgraded', tower);
        
        return tower;
    }
    
    /**
     * Vende torre
     */
    sellTower(towerId) {
        const tower = this.towers.get(towerId);
        
        if (!tower) {
            throw new Error('Torre não encontrada');
        }
        
        const sellValue = tower.getSellValue();
        this.removeTower(tower);
        
        this.emit('towerSold', tower, sellValue);
        
        return sellValue;
    }
    
    /**
     * Gera ID único para torre
     */
    generateTowerId() {
        return `tower_${this.nextTowerId++}`;
    }
    
    /**
     * Obtém todas as torres
     */
    getAllTowers() {
        return Array.from(this.towers.values());
    }
    
    /**
     * Obtém estatísticas das torres
     */
    getTowerStatistics() {
        const stats = {
            totalTowers: this.towers.size,
            towersByType: {},
            totalValue: 0,
            averageLevel: 0
        };
        
        let totalLevel = 0;
        
        for (const tower of this.towers.values()) {
            // Contagem por tipo
            if (!stats.towersByType[tower.towerType]) {
                stats.towersByType[tower.towerType] = 0;
            }
            stats.towersByType[tower.towerType]++;
            
            // Valor total
            stats.totalValue += tower.getTotalInvestment();
            
            // Nível médio
            totalLevel += tower.level;
        }
        
        if (this.towers.size > 0) {
            stats.averageLevel = totalLevel / this.towers.size;
        }
        
        return stats;
    }
    
    /**
     * Encontra melhor posição para torre
     */
    findBestPosition(towerType, targetArea) {
        const candidates = this.generatePositionCandidates(targetArea);
        
        return candidates
            .filter(pos => this.canPlaceTower(pos, towerType))
            .sort((a, b) => this.evaluatePosition(b, towerType) - this.evaluatePosition(a, towerType))
            [0] || null;
    }
    
    /**
     * Gera candidatos de posição
     */
    generatePositionCandidates(area) {
        const candidates = [];
        const step = this.placementConfig.gridSize;
        
        for (let x = area.x; x < area.x + area.width; x += step) {
            for (let y = area.y; y < area.y + area.height; y += step) {
                candidates.push({ x, y });
            }
        }
        
        return candidates;
    }
    
    /**
     * Avalia qualidade da posição
     */
    evaluatePosition(position, towerType) {
        let score = 0;
        
        // Distância do caminho (mais próximo = melhor)
        const pathDistance = this.getDistanceToPath(position);
        score += Math.max(0, 100 - pathDistance);
        
        // Cobertura de outras torres (evita sobreposição)
        const nearbyTowers = this.getTowersInArea(position, 100);
        score -= nearbyTowers.length * 10;
        
        // Posição estratégica (curvas do caminho)
        const strategicValue = this.getStrategicValue(position);
        score += strategicValue;
        
        return score;
    }
    
    /**
     * Obtém distância para o caminho
     */
    getDistanceToPath(position) {
        const path = GAME_CONFIG.PATH;
        let minDistance = Infinity;
        
        for (let i = 0; i < path.length - 1; i++) {
            const distance = this.distanceToLineSegment(
                position,
                path[i],
                path[i + 1]
            );
            minDistance = Math.min(minDistance, distance);
        }
        
        return minDistance;
    }
    
    /**
     * Obtém valor estratégico da posição
     */
    getStrategicValue(position) {
        // Implementar lógica para identificar posições estratégicas
        // como curvas do caminho, gargalos, etc.
        return 0;
    }
    
    /**
     * Reseta o gerenciador
     */
    reset() {
        // Remove todas as torres
        for (const tower of this.towers.values()) {
            tower.destroy();
        }
        
        this.towers.clear();
        this.towerGrid.clear();
        this.nextTowerId = 1;
        
        this.emit('towerManagerReset');
    }
    
    /**
     * Destrói o gerenciador
     */
    destroy() {
        this.reset();
        this.removeAllListeners();
    }
}

/**
 * Factory para criação de torres
 */
class TowerFactory {
    /**
     * Cria torre baseada no tipo
     */
    createTower(towerType, position) {
        const config = TOWER_TYPES[towerType];
        
        if (!config) {
            throw new Error(`Tipo de torre inválido: ${towerType}`);
        }
        
        const tower = new Tower(position.x, position.y, towerType);
        
        // Configura estratégia de ataque
        const attackStrategy = AttackStrategyFactory.createStrategy(towerType);
        tower.setAttackStrategy(attackStrategy);
        
        return tower;
    }
    
    /**
     * Obtém tipos de torre disponíveis
     */
    getAvailableTowerTypes() {
        return Object.keys(TOWER_TYPES);
    }
    
    /**
     * Verifica se tipo de torre é válido
     */
    isValidTowerType(towerType) {
        return TOWER_TYPES.hasOwnProperty(towerType);
    }
}

/**
 * Validador de colocação de torres
 */
class TowerPlacementValidator {
    /**
     * Valida se pode colocar torre na posição
     */
    validate(position, towerType, context) {
        console.log('🔍 Validando colocação de torre:', { position, towerType });
        
        const validations = [
            { name: 'Position', fn: this.validatePosition },
            { name: 'TowerType', fn: this.validateTowerType },
            { name: 'PathDistance', fn: this.validatePathDistance },
            { name: 'GridOccupancy', fn: this.validateGridOccupancy },
            { name: 'Bounds', fn: this.validateBounds }
        ];
        
        for (const validation of validations) {
            const result = validation.fn.call(this, position, towerType, context);
            if (!result) {
                console.log(`❌ Falha na validação: ${validation.name}`);
                return false;
            }
        }
        
        console.log('✅ Todas as validações passaram!');
        return true;
    }
    
    /**
     * Valida posição básica
     */
    validatePosition(position, towerType, context) {
        return position && 
               typeof position.x === 'number' && 
               typeof position.y === 'number' &&
               !isNaN(position.x) && 
               !isNaN(position.y);
    }
    
    /**
     * Valida tipo de torre
     */
    validateTowerType(position, towerType, context) {
        return TOWER_TYPES.hasOwnProperty(towerType);
    }
    
    /**
     * Valida distância do caminho
     */
    validatePathDistance(position, towerType, context) {
        const path = GAME_CONFIG.PATH;
        const minDistance = context.placementConfig.minDistanceFromPath;
        
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            
            const distance = this.distanceToLineSegment(position, start, end);
            
            if (distance < minDistance) {
                console.log(`❌ Muito próximo do caminho (distância: ${distance.toFixed(1)})`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Valida ocupação da grade
     */
    validateGridOccupancy(position, towerType, context) {
        const gridKey = this.getGridKey(position, context.placementConfig.gridSize);
        const cellTowers = context.towerGrid.get(gridKey) || [];
        
        return cellTowers.length < context.placementConfig.maxTowersPerCell;
    }
    
    /**
     * Valida limites do canvas
     */
    validateBounds(position, towerType, context) {
        const towerSize = TOWER_TYPES[towerType].size || 20;
        const margin = Math.floor(towerSize / 2);
        
        const bounds = {
            minX: margin,
            minY: margin,
            maxX: GAME_CONFIG.CANVAS_WIDTH - margin,
            maxY: GAME_CONFIG.CANVAS_HEIGHT - margin
        };
        
        const isValid = position.x >= bounds.minX &&
               position.y >= bounds.minY &&
               position.x <= bounds.maxX &&
               position.y <= bounds.maxY;
               
        if (!isValid) {
            console.log(`❌ Fora dos limites (${position.x}, ${position.y})`);
        }
               
        return isValid;
    }
    
    /**
     * Calcula distância para segmento de linha
     */
    distanceToLineSegment(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) {
            return Math.sqrt(A * A + B * B);
        }
        
        const param = dot / lenSq;
        
        let xx, yy;
        
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Obtém chave da grade
     */
    getGridKey(position, gridSize) {
        const gridX = Math.floor(position.x / gridSize);
        const gridY = Math.floor(position.y / gridSize);
        return `${gridX},${gridY}`;
    }
} 