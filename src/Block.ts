// Implementação do bloco quer será usado na cadeia de blocos
export class Block {
  public index: number; //Posição do bloco
  public hash: string; // Hash do bloco
  public previousHash: string; //Hash do bloco anterior
  public timeStamp: number; //Marca temporal de quando o bloco foi criado
  public data: string; //Conteudo do bloco
  public difficulty: number;
  public nonce: number;

  constructor(
    index: number,
    hash: string,
    previousHash: string,
    timeStamp: number,
    data: string,
    difficulty: number,
    nonce: number
  ) {
    this.index = index;
    this.previousHash = previousHash;
    this.timeStamp = timeStamp;
    this.data = data;
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}
