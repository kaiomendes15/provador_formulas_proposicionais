function analisadorSintatico(formula) {

}

let formula = "(A^B"

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

console.log(verificaParenteses(formula))