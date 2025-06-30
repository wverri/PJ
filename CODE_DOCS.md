# Documentação do Código

Este documento descreve de forma resumida cada pasta e arquivo de código do projeto *Ultima Online Tower Defense*. As descrições auxiliam na navegação do código e complementam os comentários já presentes em cada módulo.

## Estrutura Geral

- **js/core**: classes fundamentais que servem de base para as entidades.
- **js/entities**: todas as entidades do jogo (torres, inimigos e projéteis).
- **js/managers**: gerenciadores responsáveis pela lógica central do jogo.
- **js/renderers**: sistema de renderização e estratégias visuais.
- **js/strategies**: estratégias de ataque e padrões de onda.
- **js/systems**: sistemas auxiliares como efeitos visuais.
- **js/utils**: utilidades e constantes.

A seguir é apresentado um resumo de cada arquivo principal.

## js/core

### GameObject.js
Classe base que implementa o padrão Template Method. Fornece funcionalidade comum de atualização, renderização, efeitos e eventos a todos os objetos do jogo.

### Vector2D.js
Utilitário para manipulação de vetores 2D, usado em cálculos de posição e movimento.

## js/entities

### Enemy.js
Define os inimigos que percorrem o caminho. Controla movimentação, vida, efeitos e renderização individual.

### Tower.js
Representa as torres defensivas. Trabalha em conjunto com `TowerEvolutionTree` para evolução e com `AttackStrategy` para executar ataques.

### TowerEvolutionTree.js
Gerencia a árvore de evolução das torres. Permite definir novos tipos e efeitos especiais de evolução.

### Projectile.js
Modela os projéteis disparados pelas torres, incluindo comportamentos específicos de cada tipo.

## js/managers

### GameManager.js
Coordena toda a lógica do jogo, mantendo referências para torres, inimigos e projéteis. Orquestra ondas e estados de vitória/derrota.

### TowerManager.js
Responsável por criar, posicionar e evoluir torres. Utiliza uma fábrica de torres e validadores de posicionamento.

### WaveManager.js
Controla as ondas de inimigos. Possui diferentes estratégias de geração de ondas.

### GameLoopManager.js
Implementa o loop principal do jogo, atualizando e renderizando as entidades registradas.

### GameStateManager.js
Gerencia o estado global (pausa, cena atual, FPS) e segue o padrão Singleton.

### InputManager.js
Trata entradas do usuário e converte em comandos para o jogo.

### UIManager.js
Atualiza a interface do usuário, exibindo informações de jogo e opções de evolução das torres.

## js/renderers

### GameRenderer.js
Camada responsável por desenhar no canvas. Usa estratégias de renderização para inimigos, torres, projéteis, efeitos e interface.

## js/strategies

### AttackStrategy.js
Define várias estratégias de ataque das torres e uma fábrica para instanciá-las.

## js/systems

### EffectSystem.js
Sistema de efeitos visuais, incluindo partículas e tremores de tela.

## js/utils

### constants.js
Contém todas as constantes utilizadas no jogo, como configurações de torres e inimigos.

### helpers.js
Coleção de funções utilitárias de matemática, cor, DOM, arrays, tempo e armazenamento.

### tower-evolution.js
Estrutura de dados que descreve a árvore de evolução das torres.

---

Para informações de regras de contribuição e detalhes arquiteturais, consulte o `README.md` principal.

