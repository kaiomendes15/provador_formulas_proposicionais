function analisadorLexico(formula) {
    const validos = /^[A-E→∧∨¬↔() ]*$/;

    // percorre por cada caractere da formula
    for (let char of formula) {
        // verifica se possui algum dos simbolos validos ou alguma das proposicoes
        if (!validos.test(char)) {
            return { 
                valido: false,
                erro: `Símbolo inválido encontrado: ${char}` 
            };
        }
    }

    return { valido: true };
}

function tabelaVerdade() {
    const formula = document.getElementById('formula').value;
    const result = document.getElementById('result');
    result.innerHTML = "";

    if (!formula) {
        result.innerHTML = "Por favor, insira uma fórmula.";
        return;
    }

    const analise = analisadorLexico(formula);
    if (analise.valido == false) {
        result.innerHTML = `<p class="erro">${analise.erro}</p>`;
        return;
    }

    try {
        const variaveis = [...new Set(formula.match(/[A-E]/g) || [])].sort();
        const qtdProp = variaveis.length;
        const colunas = Math.pow(2, qtdProp);
        var tabela = [];
        for (let i = 0; i < colunas; i++) {
            let linhas = {};
            for (let j = 0; j < qtdProp; j++) {
                linhas[variaveis[j]] = (i >> (qtdProp - 1 - j)) & 1; // desloca pra direita
            }
            linhas.result = validar(formula, linhas);
            tabela.push(linhas);
        }
        let tableHTML = '<table><tr>';
        // Adiciona cabeçalhos (variáveis e resultado)
        variaveis.forEach(varName => tableHTML += `<th>${varName}</th>`);
        tableHTML += `<th>${formula}</th></tr>`;

        // Preenche a tabela com os valores
        tabela.forEach(row => {
            tableHTML += '<tr>';
            variaveis.forEach(varName => tableHTML += `<td>${row[varName]}</td>`);
            tableHTML += `<td>${row.result}</td></tr>`;
        });
        tableHTML += '</table>';

        result.innerHTML = tableHTML;
    } catch (error) {
        console.log("Erro na tabela verdade", error);
    }
}

function validar(formula, valor) {
    function pegaValor(c) {
        return valor[c] || 1;
    }

    function parentese(inseridos) {
        if (!inseridos) {
            return 0;
        }
        inseridos = inseridos.trim();
        while (inseridos.startsWith('¬')) {
            inseridos = inseridos.slice(1).trim();
            return 1 - parentese(inseridos);
        }
        if (/^[A-E]$/.test(inseridos)) {
            return pegaValor(inseridos);
        }
        let tamanhoParentese = 0;
        let comeco = -1;
        let fim = -1;
        for (let i = 0; i < inseridos.length; i++) {
            if (inseridos[i] === '(') {
                tamanhoParentese++;
            } else if (inseridos[i] === ')') {
                tamanhoParentese--;
            }
            if (tamanhoParentese == 1 && comeco == -1) {
                comeco = i;
            }
            if (tamanhoParentese == 0 && comeco != -1) {
                fim = i;
                break;
            }
        }
        if (comeco != -1 && fim != -1) {
            return parentese(inseridos.slice(comeco + 1, fim));
        }
        const operadores = {
            '∧': (a, b) => a && b, // E lógico
            '∨': (a, b) => a || b, // OU lógico
            '→': (a, b) => (a === 1 && b === 0) ? 0 : 1, // Implicação
            '↔': (a, b) => (a === b) ? 1 : 0 // Bicondicional
            '⨁': (a, b) => (a!=b)? 1
        };
        let resultado = 0;
        let expressao = inseridos;
        for (let op of ['∧', '∨']) {
            if (expressao.includes(op)) {
                let parts = separa(expressao, op);
                resultado = operadores[op](parentese(parts[0]), parentese(parts[1]));
                expressao = resultado.toString();
            }
        }
        for (let op of ['→', '↔']) {
            if (expressao.includes(op)) {
                let parts = separa(expressao, op);
                resultado = operadores[op](parentese(parts[0]), parentese(parts[1]));
                expressao = resultado.toString();
            }
        }
        if (/^[0-1]$/.test(expressao)) {
            return parseInt(expressao);
        }
        return validaSimples(expressao);
    }

    function separa(exp, operador) {
        var tamanhoParentese = 0;
        for (let i = 0; i < exp.length; i++) {
            if (exp[i] === '{') {
                tamanhoParentese++;
            } else if (exp[i] === ')') {
                tamanhoParentese--;
            } else if (exp[i] == operador && tamanhoParentese == 0) {
                return [exp.slice(0, i).trim(), exp.slice(i + 1).trim()];
            }
        }
        return [exp, ''];
    }

    function validaSimples(inseridos) {
        if (/^[A-E]$/.test(inseridos)) {
            return pegaValor(inseridos);
        }
        if (/^[0-1]$/.test(inseridos)) {
            return parseInt(inseridos);
        }
        console.log("Expressao inválida");
    }
    try {
        return parentese(formula);
    } catch (e) {
        throw new Error("erro na avaliacao da formula");
    }
}

function char(c) {
    const formula = document.getElementById('formula');
    formula.value += c;
}

function limpar() {
    document.getElementById('formula').value = "";
    document.getElementById('result').innerHTML = "";
}