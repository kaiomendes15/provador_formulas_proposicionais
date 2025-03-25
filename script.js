// Função para adicionar caracteres ao input
function char(c) {
    document.getElementById("formula").value += c;
}

// Função para limpar o input e resultado
function limpar() {
    document.getElementById("formula").value = "";
    document.getElementById("result").innerHTML = "";
}

// Permite que o input seja deletado usando o botão de apagar
document.getElementById("formula").addEventListener("keydown", function (event) {
    if (event.key === "Backspace") {
        this.value = this.value.slice(0, -1);
        event.preventDefault();
    }
});

// Função para determinar o status da fórmula
function verificarStatus(formula) {
    const variaveis = [...new Set(formula.match(/[A-E]/g) || [])].sort();
    const qtdProp = variaveis.length;
    const totalCombinacoes = Math.pow(2, qtdProp);
    let temVerdadeiro = false;
    let temFalso = false;

    for (let i = 0; i < totalCombinacoes; i++) {
        let linha = {};
        for (let j = 0; j < qtdProp; j++) {
            linha[variaveis[j]] = (i >> (qtdProp - 1 - j)) & 1;
        }
        
        const resultado = validar(formula, linha);
        if (resultado === 1) {
            temVerdadeiro = true;
        } else {
            temFalso = true;
        }

        // Otimização: se já encontrou ambos, pode parar
        if (temVerdadeiro && temFalso) break;
    }

    if (temVerdadeiro && !temFalso) return "tautologia";
    if (!temVerdadeiro && temFalso) return "contradicao";
    return "contingencia";
}

// Função principal que gera a tabela verdade
function tabelaVerdade() {
    const formula = document.getElementById('formula').value.trim();
    const result = document.getElementById('result');
    result.innerHTML = "";

    if (!formula) {
        result.innerHTML = "<p class='erro'>Por favor, insira uma fórmula.</p>";
        return;
    }

    
    try {
        // Extrai variáveis únicas e ordena
        const variaveis = [...new Set(formula.match(/[A-E]/g) || [])].sort();
        const numVariaveis = variaveis.length;
        const numCombinacoes = Math.pow(2, numVariaveis);
        
        let tabela = [];
        let todosVerdadeiros = true;
        let todosFalsos = true;

        // Gera todas combinações possíveis
        for (let i = 0; i < numCombinacoes; i++) {
            let combinacao = {};
            
            // Atribui valores para cada variável
            for (let j = 0; j < numVariaveis; j++) {
                combinacao[variaveis[j]] = (i >> (numVariaveis - 1 - j)) & 1;
            }
            
            // Avalia a fórmula
            combinacao.resultado = validar(formula, combinacao);
            tabela.push(combinacao);
            
            // Verifica status
            if (combinacao.resultado === 1) {
                todosFalsos = false;
            } else {
                todosVerdadeiros = false;
            }
        }

        // Determina o status
        let status;
        if (todosVerdadeiros) {
            status = '<div class="status tautologia">TAUTOLOGIA (sempre verdadeira)</div>';
        } else if (todosFalsos) {
            status = '<div class="status contradicao">CONTRADIÇÃO (sempre falsa)</div>';
        } else {
            status = '<div class="status contingencia">CONTINGÊNCIA (pode ser V ou F)</div>';
        }

        // Gera a tabela HTML
        let html = status + '<table><tr>';
        
        // Cabeçalhos
        variaveis.forEach(v => html += `<th>${v}</th>`);
        html += `<th>${formula}</th></tr>`;
        
        // Linhas
        tabela.forEach(linha => {
            html += '<tr>';
            variaveis.forEach(v => html += `<td>${linha[v] ? 'V' : 'F'}</td>`);
            html += `<td>${linha.resultado ? 'V' : 'F'}</td></tr>`;
        });
        
        html += '</table>';
        result.innerHTML = html;

    } catch (error) {
        result.innerHTML = `<p class="erro">Erro: ${error.message}</p>`;
        console.error("Erro:", error);
    }
}

// Função para avaliar a fórmula
function validar(formula, valor) {
    function pegaValor(c) {
        return valor[c] !== undefined ? (valor[c] === 1 ? 1 : 0) : 0;
    }

    function parentese(exp) {
        exp = exp.trim();

        if (/^[A-E]$/.test(exp)) {
            return pegaValor(exp);
        }

        if (/^[0-1]$/.test(exp)) {
            return parseInt(exp);
        }

        exp = removeParentesesExternos(exp);

        if (exp.startsWith('¬')) {
            let restante = exp.slice(1).trim();
            return 1 - parentese(restante);
        }

        const operadores = {
            '∧': (a, b) => a && b,
            '∨': (a, b) => a || b,
            '→': (a, b) => (!a || b) ? 1 : 0,
            '↔': (a, b) => (a === b) ? 1 : 0,
            '⊕': (a, b) => (a !== b) ? 1 : 0
        };

        for (let op of ['→', '↔', '⊕', '∧', '∨']) {
            let parts = separa(exp, op);
            if (parts && parts.length === 2) {
                return operadores[op](parentese(parts[0]), parentese(parts[1]));
            }
        }

        throw new Error("Erro na avaliação da fórmula");
    }

    function removeParentesesExternos(exp) {
        while (exp.startsWith('(') && exp.endsWith(')')) {
            let count = 0;
            let remover = true;

            for (let i = 0; i < exp.length; i++) {
                if (exp[i] === '(') count++;
                if (exp[i] === ')') count--;
                if (count === 0 && i < exp.length - 1) {
                    remover = false;
                    break;
                }
            }

            if (remover) {
                exp = exp.slice(1, -1).trim();
            } else {
                break;
            }
        }
        return exp;
    }

    function separa(exp, operador) {
        let tamanhoParentese = 0;
        for (let i = 0; i < exp.length; i++) {
            if (exp[i] === '(') {
                tamanhoParentese++;
            } else if (exp[i] === ')') {
                tamanhoParentese--;
            } else if (exp[i] === operador && tamanhoParentese === 0) {
                let parteEsquerda = exp.slice(0, i).trim();
                let parteDireita = exp.slice(i + 1).trim();
                return [parteEsquerda, parteDireita];
            }
        }
        return null;
    }

    try {
        return parentese(formula) ? 1 : 0;
    } catch (e) {
        throw new Error("Erro na avaliação da fórmula");
    }
}