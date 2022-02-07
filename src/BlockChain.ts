import * as CryptoJS from "crypto-js";
import { Block } from "./Block";
import { broadcastLatest } from "./P2P";

//Bloco genesis é o primeiro bloco da Blockchain e precissa ser inserido na mãp
const genesisBlock: Block = new Block(
  0,
  "99a1bae571c467b78921b6c5b769d9de909ea8a91db070bbd3348c53b7999b51",
  "",
  1465154705,
  "genesis block!!"
);

//Inicio da blockchain com o bloco genesis como primeiro bloco
let blockChain: Block[] = [genesisBlock];

function getLatestBlock() {
  return blockChain[blockChain.length - 1];
}

function getBlockChain() {
  return blockChain;
}

//Função para calcular o hash SHA256 baseaso nos dados do bloco
function calculateHash(
  index: number,
  previousHash: string,
  timestamp: number,
  data: string
) {
  return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
}

//Calcula o hash do bloco
function calculateHashForBlock(block: Block) {
  return calculateHash(
    block.index,
    block.previousHash,
    block.timeStamp,
    block.data
  );
}

//Gera o proximo bloco
function generateNextBlock(blockData: string) {
  const previousBlock: Block = getLatestBlock();
  const nextIndex: number = previousBlock.index + 1;
  const nextTimeStamp: number = new Date().getTime() / 1000;
  const nextHash: string = calculateHash(
    nextIndex,
    previousBlock.hash,
    nextTimeStamp,
    blockData
  );
  const newBlock: Block = new Block(
    nextIndex,
    nextHash,
    previousBlock.hash,
    nextTimeStamp,
    blockData
  );
  addBlockToChain(newBlock);
  broadcastLatest();
  return newBlock;
}

//Valida se um bloco é valido
function isValidNewBlock(newBlock: Block, previousBlock: Block) {
  if (previousBlock.index + 1 !== newBlock.index) {
    console.log("block invalid");
    return false;
  } else if (newBlock.previousHash !== previousBlock.hash) {
    console.log("block invalid");
    return false;
  } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
    console.log("block invalid");
    return false;
  }
  return true;
}

//Valida se uma cadeia de blocos é valida
function isValidChain(chainToValidate: Block[]) {
  if (JSON.stringify(chainToValidate[0]) !== JSON.stringify(genesisBlock))
    return false;

  for (let i = 1; i < chainToValidate.length; i++)
    if (!isValidNewBlock(chainToValidate[i], chainToValidate[i - 1]))
      return false;

  return true;
}

//Escolhe a maior cadeia como sendo a válida
function replaceChain(newBlocks: Block[]) {
  if (isValidChain(newBlocks) && newBlocks.length > blockChain.length) {
    console.log("Received chain is valid");
    blockChain = newBlocks;
    broadcastLatest();
  } else {
    console.log("Received chain is invalid");
  }
}

//Adiciona um bloco a blockChain
const addBlockToChain = (newBlock: Block) => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    blockChain.push(newBlock);
    return true;
  }
  return false;
};

export {
  getBlockChain,
  getLatestBlock,
  generateNextBlock,
  replaceChain,
  addBlockToChain,
};
