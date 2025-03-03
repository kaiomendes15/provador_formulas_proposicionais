function char(c) {
    const formula = document.getElementById('formula');
    formula.value += c;
   }
function limpar(){
    document.getElementById('formula')=""
    //adicionar para result ficar vazio quando tiver o resultado
}