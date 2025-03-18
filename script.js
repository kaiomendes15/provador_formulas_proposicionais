function analisadorLexico(formula) {
    const validos = /^[A-E→∧∨¬↔⊕() ]*$/;

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

function verificaParenteses(formula) {
    let parentesesFecha = []; // controla os parenteses.
    // a cada interação ele reseta/volta a estar vazio.

    // percorre toda a formula
    for (let i = 0; i < formula.length; i++) {
        let char = formula[i];

        // verifica se possui um parentese abrindo
        if (char === "(") {
            // adiciona no array de controle
            parentesesFecha.push(char);

            // verifica se possui um parentese fechando
        } else if (char === ")") {
            // se o array de controle estiver vazio, significa que esse parentese fechando virá primeiro. => não pode
            if (parentesesFecha.length === 0) {
                return { valido: false, erro: "Parênteses desbalanceados." };
            }

            // se nao for o primeiro valor, significa que os parenteses estão ok.
            parentesesFecha.pop();
        }
    }

    if (parentesesFecha.length > 0) return { valido: false, erro: "Parênteses desbalanceados" };
    return { valido: true };
}

function analisadorSintatico(formula) {
    // verifica se os parenteses estão balanceados
    const isParentesesOk = verificaParenteses(formula);

    // se não estiverem, já retorna a fórmula como inválida.
    if (!isParentesesOk.valido) {
        return { valido: false, erro: isParentesesOk.erro };
    }

    // armazena o caractere anterior
    let anterior = '';

    // percorre a fórmula.
    for (let i = 0; i < formula.length; i++) {
        let char = formula[i];
        // console.log(`[${i}]: ${'^∨→↔∨/~'.includes(char) && '^∨→↔∨/~'.includes(anterior)}`);

        // verifica se o caractere atual é um conectivo igual ao caractere anterior
        if ('∧∨→↔⊕¬'.includes(char) && '∧∨→↔⊕¬'.includes(anterior)) {
            return { valido: false, erro: "Conectivos em sequência." };
        }

        // atualiza o valor do caractere anterior para a próxima interação
        anterior = char;
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

    const analiseLexica = analisadorLexico(formula);
    if (analiseLexica.valido == false) {
        result.innerHTML = `<p class="erro">${analiseLexica.erro}</p>`;
        return;
    }

    const analiseSintatica = analisadorSintatico(formula);
    if (analiseSintatica.valido == false) {
        result.innerHTML = `<p class="erro">${analiseSintatica.erro}</p>`;
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
        return valor[c] !== undefined ? valor[c] : 0;
    }

    function parentese(exp) {
        exp = exp.trim();

        // Caso seja uma variável, retorna seu valor
        if (/^[A-E]$/.test(exp)) {
            return pegaValor(exp);
        }

        // Caso seja um número, retorna diretamente
        if (/^[0-1]$/.test(exp)) {
            return parseInt(exp);
        }

        // Aplica a negação corretamente antes de continuar
        while (exp.startsWith('¬')) {
            exp = exp.slice(1).trim();
            return 1 - parentese(exp);
        }

        // Verifica se a expressão está entre parênteses e resolve o conteúdo interno
        if (exp.startsWith('(') && exp.endsWith(')')) {
            return parentese(exp.slice(1, -1));
        }

        // Define os operadores lógicos e suas funções correspondentes
        const operadores = {
            '∧': (a, b) => a && b,
            '∨': (a, b) => a || b,
            '→': (a, b) => (!a || b) ? 1 : 0, // Correção da implicação
            '↔': (a, b) => (a === b) ? 1 : 0,
            '⊕': (a, b) => (a !== b) ? 1 : 0
        };

        // Percorre os operadores para encontrar o primeiro válido na expressão
        for (let op of ['→', '↔', '⊕', '∧', '∨']) {
            if (exp.includes(op)) {
                let parts = separa(exp, op);
                return operadores[op](parentese(parts[0]), parentese(parts[1]));
            }
        }

        // Caso não tenha encontrado uma expressão válida, retorna erro
        console.log("Expressão inválida:", exp);
        throw new Error("Erro na avaliação da fórmula");
    }

    function separa(exp, operador) {
        let tamanhoParentese = 0;
        for (let i = 0; i < exp.length; i++) {
            if (exp[i] === '(') {
                tamanhoParentese++;
            } else if (exp[i] === ')') {
                tamanhoParentese--;
            } else if (exp[i] === operador && tamanhoParentese === 0) {
                return [exp.slice(0, i).trim(), exp.slice(i + 1).trim()];
            }
        }
        return [exp, ''];
    }

    try {
        return parentese(formula);
    } catch (e) {
        console.error("Erro na avaliação da fórmula:", e);
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