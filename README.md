# 🏰 Ultima Online Tower Defense

Um jogo de Tower Defense baseado no universo de Ultima Online, desenvolvido em JavaScript vanilla com foco em Clean Code, princípios SOLID e Object Calisthenics.

## 🎮 Sobre o Jogo

Este é um jogo de defesa de torre inspirado no clássico MMORPG Ultima Online. Os jogadores devem defender seu território contra ondas de criaturas míticas usando diferentes tipos de torres mágicas e estratégias.

### 🌟 Características Principais

- **6 Tipos de Torres Únicas**: Cada uma com habilidades especiais baseadas em Ultima Online
- **6 Tipos de Inimigos**: Orcs, Esqueletos, Trolls, Dragões, Liches e Daemons
- **Sistema de Magias**: 4 magias especiais para momentos críticos
- **Sistema de Upgrades**: Melhore suas torres com ouro ganho
- **Efeitos Visuais**: Partículas, explosões e animações fluidas
- **Interface Medieval**: Design inspirado no tema de Ultima Online

## 🏗️ Arquitetura do Projeto (Refatorada)

O projeto foi completamente refatorado seguindo princípios de Clean Code e padrões de design avançados:

### 📁 Estrutura de Arquivos Refatorada

```
├── index.html              # Página principal
├── styles/                 # Estilos CSS
│   ├── main.css            # Estilos base e tema
│   ├── ui.css              # Interface do usuário
│   └── game.css            # Efeitos visuais do jogo
├── js/                     # Código JavaScript
│   ├── utils/              # Utilitários reutilizáveis
│   │   ├── constants.js    # Constantes do jogo
│   │   └── helpers.js      # Funções auxiliares
│   ├── core/               # Classes fundamentais
│   │   ├── Vector2D.js     # Matemática vetorial
│   │   └── GameObject.js   # Classe base para objetos
│   ├── entities/           # Entidades do jogo
│   │   ├── Enemy.js        # Inimigos
│   │   ├── Tower.js        # Torres
│   │   └── Projectile.js   # Projéteis
│   ├── systems/            # Sistemas especializados
│   │   └── EffectSystem.js # Sistema de efeitos visuais
│   ├── strategies/         # Padrões Strategy
│   │   └── AttackStrategy.js # Estratégias de ataque
│   ├── managers/           # Gerenciadores de sistema
│   │   ├── GameStateManager.js  # Estado global do jogo
│   │   ├── GameLoopManager.js   # Loop principal
│   │   ├── InputManager.js      # Entrada do usuário
│   │   ├── GameManager.js       # Lógica principal
│   │   ├── WaveManager.js       # Gerenciamento de ondas
│   │   ├── TowerManager.js      # Gerenciamento de torres
│   │   └── UIManager.js         # Interface do usuário
│   ├── renderers/          # Sistema de renderização
│   │   └── GameRenderer.js # Renderização do jogo
│   └── main.js             # Aplicação principal refatorada
└── README.md               # Documentação
```

### 🎯 Padrões de Design Implementados

1. **Template Method Pattern**: Classe `GameObject` e `GameLoopManager`
2. **Strategy Pattern**: `AttackStrategy` para diferentes tipos de ataque
3. **Observer Pattern**: Sistema de eventos robusto entre componentes
4. **Factory Pattern**: `AttackStrategyFactory` e `EffectSystem`
5. **Singleton Pattern**: `GameStateManager` para estado global
6. **Facade Pattern**: `GameApplication` como interface principal
7. **Mediator Pattern**: `GameApplication` coordena comunicação
8. **Command Pattern**: `InputManager` com comandos configuráveis
9. **Object Pool Pattern**: `EffectSystem` reutiliza objetos

### 🧹 Princípios Aplicados

#### SOLID
- **Single Responsibility**: Cada classe tem uma responsabilidade específica
- **Open/Closed**: Extensível através de strategies e factories
- **Liskov Substitution**: Subclasses podem substituir classes base
- **Interface Segregation**: Interfaces específicas para cada necessidade
- **Dependency Inversion**: Dependências abstraídas através de eventos

#### DRY (Don't Repeat Yourself)
- Código reutilizável em utilitários e classes base
- Strategies compartilhadas entre diferentes tipos
- Sistema de eventos centralizado

#### Object Calisthenics
- Métodos pequenos e focados (máximo 15 linhas)
- Sem estruturas `else` complexas
- Encapsulamento adequado com getters/setters
- Uma única responsabilidade por método
- Nomes descritivos e expressivos

### 🔧 Melhorias Implementadas

#### 1. GameApplication (main.js)
- **Antes**: Código procedural com funções globais
- **Depois**: Classe principal que coordena todos os sistemas
- **Benefícios**: Melhor organização, testabilidade e manutenibilidade

#### 2. GameLoopManager
- **Responsabilidade**: Gerencia o loop principal do jogo
- **Padrão**: Template Method para ciclo de vida
- **Benefícios**: Performance otimizada e tratamento de erros

#### 3. InputManager
- **Responsabilidade**: Gerencia todas as entradas do usuário
- **Padrão**: Command Pattern para ações configuráveis
- **Benefícios**: Controles customizáveis e reutilizáveis

#### 4. EffectSystem
- **Responsabilidade**: Sistema especializado para efeitos visuais
- **Padrões**: Factory + Object Pool + Strategy
- **Benefícios**: Performance otimizada e efeitos reutilizáveis

#### 5. AttackStrategy
- **Responsabilidade**: Estratégias de ataque para torres
- **Padrão**: Strategy Pattern
- **Benefícios**: Fácil adição de novos tipos de ataque

#### 6. GameStateManager
- **Responsabilidade**: Estado global do jogo
- **Padrão**: Singleton + State Pattern
- **Benefícios**: Estado centralizado e consistente

## 🎲 Tipos de Torres

### 🏹 Arqueiro (50 ouro)
- Torre básica com ataques à distância
- **Estratégia**: ProjectileAttackStrategy
- Upgrades: Dano, Alcance, Velocidade

### 🔥 Mago (100 ouro)
- Ataca com bolas de fogo que causam dano em área
- **Estratégia**: AreaAttackStrategy
- Upgrades: Dano, Alcance, Área de Explosão

### ❄️ Mago do Gelo (120 ouro)
- Congela inimigos, reduzindo velocidade
- **Estratégia**: SlowAttackStrategy
- Upgrades: Dano, Efeito de Lentidão, Duração

### ☠️ Torre Venenosa (80 ouro)
- Causa dano contínuo por veneno
- **Estratégia**: PoisonAttackStrategy
- Upgrades: Dano, Veneno, Duração

### 💣 Canhão (200 ouro)
- Alto dano e área de efeito, mas ataque lento
- **Estratégia**: AreaAttackStrategy (splash maior)
- Upgrades: Dano, Área de Explosão, Velocidade

### ⚡ Torre Elétrica (150 ouro)
- Ataque instantâneo que salta entre inimigos
- **Estratégia**: ChainAttackStrategy
- Upgrades: Dano, Alvos em Cadeia, Alcance

## 👹 Tipos de Inimigos

### 👹 Orc
- Inimigo básico, moderadamente resistente
- 30 HP, velocidade média
- Recompensa: 8 ouro

### 💀 Esqueleto
- Rápido mas frágil
- 20 HP, alta velocidade
- Recompensa: 6 ouro

### 👺 Troll
- Lento mas muito resistente
- 80 HP, baixa velocidade
- Recompensa: 15 ouro

### 🐉 Dragão
- Boss poderoso com resistência ao fogo
- 200 HP, 50% resistência ao fogo
- Recompensa: 50 ouro

### 🧙‍♂️ Lich
- Mago morto-vivo com resistência mágica
- 120 HP, 30% resistência à magia
- Recompensa: 30 ouro

### 😈 Daemon
- Demônio com regeneração e resistência ao fogo
- 150 HP, 70% resistência ao fogo, regenera 2 HP/s
- Recompensa: 40 ouro

## 🔮 Sistema de Magias

### 🔥 Bola de Fogo (100 ouro)
- Causa 100 de dano em área grande
- Cooldown: 30 segundos
- Ideal para emergências

### ❄️ Congelar (80 ouro)
- Congela todos os inimigos na tela
- Duração: 5 segundos
- Cooldown: 45 segundos

### ⚡ Tempestade Elétrica (120 ouro)
- 8 raios atingem inimigos aleatórios
- 40 de dano por raio
- Cooldown: 35 segundos

### 💚 Cura (60 ouro)
- Restaura 5 pontos de vida
- Cooldown: 20 segundos
- Essencial para sobrevivência

## 🎮 Como Jogar

### Controles Básicos
- **Clique**: Selecionar torres ou posicionar
- **Clique Direito**: Cancelar ação atual
- **Espaço**: Pausar/Continuar
- **Escape**: Cancelar ação
- **1-6**: Selecionar tipo de torre rapidamente
- **Q/W/E/T**: Lançar magias
- **D**: Alternar modo debug
- **Ctrl+R**: Reiniciar jogo

### Estratégias

1. **Início**: Comece com Arqueiros nas curvas do caminho
2. **Meio**: Adicione Magos para dano em área
3. **Avançado**: Use Torres Elétricas para dano alto
4. **Controle**: Magos do Gelo para desacelerar grupos
5. **Suporte**: Torres Venenosas para dano contínuo

### Dicas Importantes

- **Posicionamento**: Torres em curvas atingem inimigos por mais tempo
- **Diversificação**: Use diferentes tipos para cobrir resistências
- **Upgrades**: Melhore torres estratégicas em vez de construir muitas
- **Economia**: Gerencie ouro cuidadosamente para ondas difíceis
- **Magias**: Guarde para momentos críticos

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas**: Renderização gráfica
- **CSS3**: Estilização e animações
- **JavaScript ES6+**: Lógica do jogo (vanilla, sem dependências)
- **LocalStorage**: Persistência de dados

## 🚀 Como Executar

1. Clone o repositório
2. Abra `index.html` em um navegador moderno
3. Comece a jogar!

Não há dependências externas - o jogo roda completamente no navegador.

## 🎯 Funcionalidades Técnicas

### Performance Otimizada
- Loop de jogo otimizado com `GameLoopManager`
- Sistema de pooling para objetos reutilizáveis (`EffectSystem`)
- Renderização eficiente com separação de responsabilidades

### Arquitetura Robusta
- Sistema de eventos desacoplado
- Managers especializados para cada responsabilidade
- Estratégias intercambiáveis para diferentes comportamentos

### Tratamento de Erros
- Tratamento robusto de erros em tempo de execução
- Recuperação automática de falhas
- Logs detalhados para debugging

### Extensibilidade
- Fácil adição de novos tipos através de factories
- Sistema de strategies para comportamentos customizados
- Arquitetura modular e desacoplada

## 🔧 Desenvolvimento

### Estrutura de Classes Refatorada

```javascript
// Hierarquia principal
GameApplication (Facade/Mediator)
├── GameStateManager (Singleton)
├── GameLoopManager (Template Method)
├── InputManager (Command)
├── EffectSystem (Factory + Pool)
├── GameManager
├── GameRenderer
└── UIManager

// Entidades
GameObject (Template Method)
├── Enemy (Strategy)
├── Tower (Strategy)
└── Projectile (Strategy)

// Estratégias
AttackStrategy (Strategy)
├── ProjectileAttackStrategy
├── AreaAttackStrategy
├── InstantAttackStrategy
├── ChainAttackStrategy
├── SlowAttackStrategy
└── PoisonAttackStrategy
```

### Sistema de Eventos Robusto

```javascript
// Exemplo de comunicação entre sistemas
gameManager.on('enemyKilled', (enemy) => {
    effectSystem.createEffect('explosion', {
        x: enemy.position.x,
        y: enemy.position.y,
        type: 'death'
    });
    
    uiManager.showGoldGain(enemy.goldReward);
});
```

### Extensibilidade Aprimorada

```javascript
// Adicionar nova estratégia de ataque
class FreezeAttackStrategy extends AttackStrategy {
    execute(tower, target, context) {
        // Implementação específica
    }
}

// Registrar na factory
AttackStrategyFactory.registerStrategy('freeze', FreezeAttackStrategy);

// Usar automaticamente
const strategy = AttackStrategyFactory.createStrategy('ICE_MAGE');
```

## 📈 Melhorias Implementadas

### Antes da Refatoração
- ❌ Código procedural com funções globais
- ❌ Responsabilidades misturadas
- ❌ Difícil manutenção e teste
- ❌ Acoplamento forte entre componentes
- ❌ Código duplicado

### Depois da Refatoração
- ✅ Arquitetura orientada a objetos
- ✅ Responsabilidades bem definidas
- ✅ Fácil manutenção e teste
- ✅ Baixo acoplamento, alta coesão
- ✅ Código reutilizável e extensível
- ✅ Padrões de design aplicados
- ✅ Princípios SOLID seguidos
- ✅ Object Calisthenics aplicado

## 📊 Métricas de Qualidade

### Complexidade Ciclomática
- **Antes**: Métodos com 20+ linhas e múltiplas responsabilidades
- **Depois**: Métodos com máximo 15 linhas e responsabilidade única

### Acoplamento
- **Antes**: Dependências diretas entre classes
- **Depois**: Comunicação via eventos e interfaces

### Coesão
- **Antes**: Classes com múltiplas responsabilidades
- **Depois**: Classes com responsabilidade única e bem definida

### Testabilidade
- **Antes**: Difícil de testar devido ao acoplamento
- **Depois**: Fácil de testar com mocks e stubs

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Siga os padrões de código estabelecidos
4. Aplique princípios SOLID e Object Calisthenics
5. Teste suas alterações
6. Submeta um pull request

### Padrões de Código

- Use nomes descritivos e expressivos
- Mantenha métodos pequenos (máximo 15 linhas)
- Uma responsabilidade por classe/método
- Prefira composição sobre herança
- Use eventos para comunicação entre componentes

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🎉 Créditos

Desenvolvido com ❤️ seguindo as melhores práticas de desenvolvimento web, princípios SOLID, DRY, Object Calisthenics e inspirado no universo rico de Ultima Online.

### Agradecimentos Especiais

- **Clean Code** por Robert C. Martin
- **Design Patterns** por Gang of Four
- **Object Calisthenics** por Jeff Bay
- **Ultima Online** pela inspiração temática

---

**Divirta-se defendendo seu reino com código limpo e bem estruturado! 🏰⚔️** 