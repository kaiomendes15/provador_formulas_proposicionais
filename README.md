# Provador de Fórmulas Proposicionais

Este projeto implementa um **Provador de Fórmulas Proposicionais**, que analisa expressões lógicas verificando se são **bem formuladas (FBF)**, e gera a **tabela verdade** para determinar se a expressão é uma **tautologia, contingência ou contradição**.

## 📌 Funcionalidades
- **Analisador Léxico**: Verifica se a fórmula contém apenas símbolos válidos.
- **Analisador Sintático**: Garante que a fórmula está corretamente estruturada.
- **Tabela Verdade Dinâmica**: Exibe todas as possíveis combinações de valores verdade.
- **Classificação Automática**: Informa se a expressão é tautologia, contingência ou contradição.

## 🛠️ Tecnologias Utilizadas
- **HTML** → Interface do usuário
- **CSS** → Estilização da interface
- **JavaScript (ES6+)** → Implementação da lógica de análise e prova

## 🚀 Como Executar o Projeto
1. **Clone este repositório**
   ```sh
   git clone https://github.com/seu-usuario/prova-logica.git
   ```
2. **Acesse a pasta do projeto**
   ```sh
   cd prova-logica
   ```
3. **Abra o arquivo `index.html` em seu navegador**

## 📝 Como Usar
1. **Digite uma fórmula proposicional** no campo de entrada.
2. **Clique no botão "Verificar Fórmula"** para validar e processar a expressão.
3. **Confira os resultados**:
   - Erros léxicos/sintáticos serão exibidos na tela.
   - Se a fórmula for válida, a **tabela verdade** será gerada automaticamente.
   - No final, o sistema informará se a expressão é **tautologia, contingência ou contradição**.

## 📌 Exemplos de Entrada e Saída
| Entrada               | Resultado                          |
|----------------------|--------------------------------|
| `(A → B) ∧ (B → A)` | Gera tabela verdade e classifica |
| `A)) ∧∧ → BC`       | Erro: Fórmula mal formada       |
| `∼P ∨ (Q ∧ R)`      | Gera tabela e classifica        |

## 📜 Licença
Este projeto está sob a licença MIT. Sinta-se livre para modificá-lo e usá-lo conforme necessário.

---
Feito com 💡 e 💻 para ajudar no estudo da Lógica Proposicional! 🚀

