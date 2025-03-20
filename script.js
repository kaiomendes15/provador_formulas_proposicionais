// permite que o input seja deletado usando o botao de apagar
document.getElementById("formula").addEventListener("keydown", function (event) {
    if (event.key === "Backspace") {
        this.value = this.value.slice(0, -1); // Remove o último caractere
    }
    event.preventDefault(); // preventDefault impede que o evento(digita) não ocorra para os casos fora desse if de cima
});


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

        // Gerar todas as combinações possíveis de valores para as variáveis
        for (let i = colunas - 1; i >= 0; i--) { // agora gera ordenado, V primeiro e dps os F
            let linhas = {};
            for (let j = 0; j < qtdProp; j++) {
                linhas[variaveis[j]] = (i >> (qtdProp - 1 - j)) & 1; // desloca pra direita
            }
            linhas.result = validar(formula, linhas); // Avaliar a fórmula
            tabela.push(linhas);
        }

        let tableHTML = '<table><tr>';
        // Adiciona cabeçalhos (variáveis e resultado)
        variaveis.forEach(varName => tableHTML += `<th>${varName}</th>`);
        tableHTML += `<th>${formula}</th></tr>`;

        // Preenche a tabela com os valores
        tabela.forEach(row => {
            tableHTML += '<tr>';
            variaveis.forEach(varName => tableHTML += `<td>${row[varName] === 1 ? 'V' : 'F'}</td>`);  // Corrigido aqui
            tableHTML += `<td>${row.result === 1 ? 'V' : 'F'}</td></tr>`; // Corrigido aqui
        });
        tableHTML += '</table>';

        result.innerHTML = tableHTML;
    } catch (error) {
        console.log("Erro na tabela verdade", error);
    }
}

function validar(formula, valor) {
    function pegaValor(c) {
        return valor[c] !== undefined ? (valor[c] === 1 ? 1 : 0) : 0;  // Corrigido para tratar como booleano
    }

    function parentese(exp) {
        exp = exp.trim();

        // Caso seja uma variável, retorna seu valor
        if (/^[A-E]$/.test(exp)) {
            return pegaValor(exp);
        }

        // Caso seja um número (0 ou 1), retorna diretamente
        if (/^[0-1]$/.test(exp)) {
            return parseInt(exp);
        }

        // Removendo parênteses externos corretamente
        exp = removeParentesesExternos(exp);

        // Aplica a negação corretamente antes de continuar
        if (exp.startsWith('¬')) {
            let restante = exp.slice(1).trim();
            return 1 - parentese(restante);  // Negação
        }

        // Define os operadores lógicos e suas funções correspondentes
        const operadores = {
            '∧': (a, b) => a && b,
            '∨': (a, b) => a || b,
            '→': (a, b) => (!a || b) ? 1 : 0,
            '↔': (a, b) => (a === b) ? 1 : 0,
            '⊕': (a, b) => (a !== b) ? 1 : 0
        };

        // Percorre os operadores na ordem de precedência
        for (let op of ['→', '↔', '⊕', '∧', '∨']) {
            let parts = separa(exp, op);
            if (parts && parts.length === 2) {
                return operadores[op](parentese(parts[0]), parentese(parts[1]));
            }
        }

        // Caso não tenha encontrado uma expressão válida, retorna erro
        throw new Error("Erro na avaliação da fórmula");
    }

    // Função para remover parênteses externos corretamente
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

    // Função para separar a expressão em torno de um operador
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
        return null; // Retorna null se o operador não for encontrado
    }

    try {
        return parentese(formula) ? 1 : 0; // Avalia a fórmula
    } catch (e) {
        throw new Error("Erro na avaliação da fórmula");
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