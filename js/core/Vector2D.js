/**
 * Classe Vector2D para operações matemáticas de posição e movimento
 * Implementa o princípio Single Responsibility
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    /**
     * Cria uma cópia do vetor
     */
    clone() {
        return new Vector2D(this.x, this.y);
    }

    /**
     * Define novos valores para o vetor
     */
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * Copia valores de outro vetor
     */
    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    }

    /**
     * Adiciona outro vetor a este
     */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    /**
     * Subtrai outro vetor deste
     */
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    /**
     * Multiplica o vetor por um escalar
     */
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    /**
     * Divide o vetor por um escalar
     */
    divide(scalar) {
        if (scalar !== 0) {
            this.x /= scalar;
            this.y /= scalar;
        }
        return this;
    }

    /**
     * Calcula a magnitude (comprimento) do vetor
     */
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Calcula a magnitude ao quadrado (mais eficiente para comparações)
     */
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Normaliza o vetor (magnitude = 1)
     */
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divide(mag);
        }
        return this;
    }

    /**
     * Limita a magnitude do vetor
     */
    limit(max) {
        const mag = this.magnitude();
        if (mag > max) {
            this.normalize().multiply(max);
        }
        return this;
    }

    /**
     * Calcula a distância para outro vetor
     */
    distanceTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calcula a distância ao quadrado para outro vetor
     */
    distanceSquaredTo(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return dx * dx + dy * dy;
    }

    /**
     * Calcula o ângulo do vetor em radianos
     */
    angle() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Calcula o ângulo para outro vetor
     */
    angleTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }

    /**
     * Rotaciona o vetor por um ângulo em radianos
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newX = this.x * cos - this.y * sin;
        const newY = this.x * sin + this.y * cos;
        this.x = newX;
        this.y = newY;
        return this;
    }

    /**
     * Calcula o produto escalar com outro vetor
     */
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    /**
     * Calcula o produto vetorial com outro vetor (em 2D retorna um escalar)
     */
    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    /**
     * Interpola linearmente entre este vetor e outro
     */
    lerp(vector, factor) {
        this.x = MathUtils.lerp(this.x, vector.x, factor);
        this.y = MathUtils.lerp(this.y, vector.y, factor);
        return this;
    }

    /**
     * Verifica se o vetor é igual a outro (com tolerância)
     */
    equals(vector, tolerance = 0.001) {
        return Math.abs(this.x - vector.x) < tolerance && 
               Math.abs(this.y - vector.y) < tolerance;
    }

    /**
     * Verifica se o vetor é zero
     */
    isZero(tolerance = 0.001) {
        return this.magnitude() < tolerance;
    }

    /**
     * Retorna uma representação string do vetor
     */
    toString() {
        return `Vector2D(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }

    // Métodos estáticos para criar vetores sem modificar os originais

    /**
     * Adiciona dois vetores e retorna um novo vetor
     */
    static add(v1, v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }

    /**
     * Subtrai dois vetores e retorna um novo vetor
     */
    static subtract(v1, v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    }

    /**
     * Multiplica um vetor por um escalar e retorna um novo vetor
     */
    static multiply(vector, scalar) {
        return new Vector2D(vector.x * scalar, vector.y * scalar);
    }

    /**
     * Divide um vetor por um escalar e retorna um novo vetor
     */
    static divide(vector, scalar) {
        if (scalar !== 0) {
            return new Vector2D(vector.x / scalar, vector.y / scalar);
        }
        return new Vector2D(vector.x, vector.y);
    }

    /**
     * Calcula a distância entre dois vetores
     */
    static distance(v1, v2) {
        return v1.distanceTo(v2);
    }

    /**
     * Calcula o ângulo entre dois vetores
     */
    static angle(v1, v2) {
        return v1.angleTo(v2);
    }

    /**
     * Interpola linearmente entre dois vetores
     */
    static lerp(v1, v2, factor) {
        return new Vector2D(
            MathUtils.lerp(v1.x, v2.x, factor),
            MathUtils.lerp(v1.y, v2.y, factor)
        );
    }

    /**
     * Cria um vetor a partir de um ângulo e magnitude
     */
    static fromAngle(angle, magnitude = 1) {
        return new Vector2D(
            Math.cos(angle) * magnitude,
            Math.sin(angle) * magnitude
        );
    }

    /**
     * Cria um vetor aleatório com magnitude específica
     */
    static random(magnitude = 1) {
        const angle = Math.random() * Math.PI * 2;
        return Vector2D.fromAngle(angle, magnitude);
    }

    /**
     * Vetor zero
     */
    static get ZERO() {
        return new Vector2D(0, 0);
    }

    /**
     * Vetor unitário para cima
     */
    static get UP() {
        return new Vector2D(0, -1);
    }

    /**
     * Vetor unitário para baixo
     */
    static get DOWN() {
        return new Vector2D(0, 1);
    }

    /**
     * Vetor unitário para esquerda
     */
    static get LEFT() {
        return new Vector2D(-1, 0);
    }

    /**
     * Vetor unitário para direita
     */
    static get RIGHT() {
        return new Vector2D(1, 0);
    }
} 