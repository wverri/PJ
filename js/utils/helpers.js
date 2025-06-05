// Funções utilitárias reutilizáveis
class MathUtils {
    /**
     * Calcula a distância entre dois pontos
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calcula o ângulo entre dois pontos em radianos
     */
    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }

    /**
     * Converte graus para radianos
     */
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Converte radianos para graus
     */
    static toDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Limita um valor entre min e max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Interpolação linear entre dois valores
     */
    static lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    /**
     * Gera um número aleatório entre min e max
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Gera um número inteiro aleatório entre min e max (inclusive)
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Verifica se um ponto está dentro de um círculo
     */
    static pointInCircle(px, py, cx, cy, radius) {
        return this.distance(px, py, cx, cy) <= radius;
    }

    /**
     * Verifica se um ponto está dentro de um retângulo
     */
    static pointInRect(px, py, rx, ry, width, height) {
        return px >= rx && px <= rx + width && py >= ry && py <= ry + height;
    }
}

class ColorUtils {
    /**
     * Converte cor hexadecimal para RGB
     */
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Converte RGB para hexadecimal
     */
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Interpola entre duas cores
     */
    static lerpColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        if (!c1 || !c2) return color1;
        
        const r = Math.round(MathUtils.lerp(c1.r, c2.r, factor));
        const g = Math.round(MathUtils.lerp(c1.g, c2.g, factor));
        const b = Math.round(MathUtils.lerp(c1.b, c2.b, factor));
        
        return this.rgbToHex(r, g, b);
    }

    /**
     * Escurece uma cor por um fator
     */
    static darken(color, factor) {
        return this.lerpColor(color, '#000000', factor);
    }

    /**
     * Clareia uma cor por um fator
     */
    static lighten(color, factor) {
        return this.lerpColor(color, '#FFFFFF', factor);
    }
}

class DOMUtils {
    /**
     * Cria um elemento DOM com atributos
     */
    static createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }

    /**
     * Remove todos os filhos de um elemento
     */
    static clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Adiciona classe CSS com animação
     */
    static addClassWithAnimation(element, className, duration = 300) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }

    /**
     * Obtém posição do mouse relativa ao canvas
     */
    static getMousePosition(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }
}

class ArrayUtils {
    /**
     * Remove item de um array
     */
    static remove(array, item) {
        const index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    }

    /**
     * Remove item de um array por índice
     */
    static removeAt(array, index) {
        if (index >= 0 && index < array.length) {
            array.splice(index, 1);
        }
        return array;
    }

    /**
     * Embaralha um array
     */
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Obtém item aleatório de um array
     */
    static randomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Agrupa array por propriedade
     */
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }
}

class TimeUtils {
    /**
     * Formata tempo em milissegundos para string legível
     */
    static formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Debounce para limitar execução de funções
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle para limitar execução de funções
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

class ValidationUtils {
    /**
     * Valida se um valor é um número válido
     */
    static isValidNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }

    /**
     * Valida se uma string não está vazia
     */
    static isNonEmptyString(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    /**
     * Valida se um objeto tem todas as propriedades necessárias
     */
    static hasRequiredProperties(obj, requiredProps) {
        return requiredProps.every(prop => obj.hasOwnProperty(prop));
    }

    /**
     * Valida coordenadas dentro dos limites do canvas
     */
    static isValidPosition(x, y, canvasWidth, canvasHeight) {
        return x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight;
    }
}

class StorageUtils {
    /**
     * Salva dados no localStorage com tratamento de erro
     */
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    }

    /**
     * Carrega dados do localStorage com tratamento de erro
     */
    static load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item do localStorage
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    }

    /**
     * Limpa todo o localStorage
     */
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
            return false;
        }
    }
}

// Classe para gerenciar eventos customizados
class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Adiciona listener para um evento
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * Remove listener de um evento
     */
    off(event, callback) {
        if (!this.events[event]) return;
        
        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    /**
     * Emite um evento
     */
    emit(event, ...args) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Erro ao executar callback do evento ${event}:`, error);
            }
        });
    }

    /**
     * Remove todos os listeners de um evento
     */
    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
} 