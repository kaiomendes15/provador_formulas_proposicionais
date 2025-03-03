const formula = document.getElementById('formula')

// verifica se possui os conectivos e as proposicoes
// ainda tem que fazer uma função para verificar se os parenteses estao fechando e se nao possui um conectivo depois do outro.
export function analisadorLexico(formula) {
    const simbolosValidos = new Set(['∼', '∧', '∨', '→', '↔', '∨/', '(', ')']); // set n aceita repetição
    const proposicoes = /^[A-E]$/ // regex para salvar as 5 proposicoes maiusculas.

    // percorre por cada caractere da formula
    for (let char of formula) {

        // verifica se possui algum dos simbolos validos ou alguma das proposicoes
        if (!simbolosValidos.has(char) && !proposicoes.test(char)) {
            return { 
                valido: false,
                 erro: `Símbolo inválido encontrado: ${char}` 
            }
        }
    }

    return { valido: true };
}


analisadorLexico(formula)