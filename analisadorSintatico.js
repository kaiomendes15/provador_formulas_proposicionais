let formula = "A^↔B"

function verificaParenteses(formula) {
    let parentesesFecha = [] // controla os parenteses.
    // a cada interação ele reseta/volta a estar vazio.

    // percorre toda a formula
    for (let i = 0; i < formula.length; i++) {
        
        let char = formula[i];

        // verifica se possui um parentese abrindo
        if (char === "(") {
            // adiciona no array de controle
            parentesesFecha.push(char)

            // verifica se possui um parentese fechando
        } else if (char === ")") {

            // se o array de controle estiver vazio, significa que esse parentese fechando virá primeiro. => não pode
            if (parentesesFecha.length === 0) {
                return { valido: false, erro:"Parênteses desbalanceados." };
            }

            // se nao for o primeiro valor, significa que os parenteses estão ok.
            parentesesFecha.pop()   
        }

        
    }

    if (parentesesFecha.length > 0) return { valido: false, erro: "Parênteses desbalanceados" };
    return { valido: true };

}

function analisadorSintatico(formula) {

    // verifica se os parenteses estão balanceados
    const isParentesesOk = verificaParenteses(formula)

    // se não estiverem, já retorna a fórmula como inválida.
    if (!isParentesesOk.valido) {
        return { valido: false, erro: isParentesesOk.erro }
    }

    // armazena o caractere anterior
    let anterior = '';

    // percorre a fórmula.
    for (let i = 0; i < formula.length; i++) {
        let char =  formula[i]
        // console.log(`[${i}]: ${'^∨→↔∨/~'.includes(char) && '^∨→↔∨/~'.includes(anterior)}`)

        // verifica se o caractere atual é um conectivo igual ao caractere anterior
        if ('^∨→↔∨/~'.includes(char) && '^∨→↔∨/~'.includes(anterior)) {
            return { valido: false, erro:"Conectivos em sequência." }
        }

        // atualiza o valor do caractere anterior para a próxima interação
        anterior = char;
    }

    return { valido: true };
}

console.log(analisadorSintatico(formula))