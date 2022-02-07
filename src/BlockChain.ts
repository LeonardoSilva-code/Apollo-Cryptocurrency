import * as CryptoJS from "crypto-js";
import { Block } from "./Block";
import { broadcastLatest } from "./P2P";

//Bloco genesis é o primeiro bloco da Blockchain e precissa ser inserido na mãp
const genesisBlock: Block = new Block(
  0,
  "99a1bae571c467b78921b6c5b769d9de909ea8a91db070bbd3348c53b7999b51",
  "",
  1465154705,
  "genesis block!!",
  10,
  0
);

// Define em segundo quanto tempo deve levar para cada bloco ser minerado
const BLOCK_GENERATION_INTERVAL: number = 10;

//Para cada dez blocos a dificuldade é ajustada
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

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
  data: string,
  difficulty: number,
  nonce: number
) {
  return CryptoJS.SHA256(
    index + previousHash + timestamp + data + difficulty + nonce
  ).toString();
}

//Calcula o hash do bloco
function calculateHashForBlock(block: Block) {
  return calculateHash(
    block.index,
    block.previousHash,
    block.timeStamp,
    block.data,
    block.difficulty,
    block.nonce
  );
}

//Gera o proximo bloco
function generateNextBlock(blockData: string) {
  const previousBlock: Block = getLatestBlock();
  const nextIndex: number = previousBlock.index + 1;
  const nextTimeStamp: number = getCurrentTimestamp();
  const difficulty: number = getDifficulty(getBlockChain());
  console.log("difficulty: " + difficulty);
  const newBlock: Block = findBlock(
    nextIndex,
    previousBlock.hash,
    nextTimeStamp,
    blockData,
    difficulty
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
  } else if (!isValidTimestamp(newBlock, previousBlock)) {
    console.log("block invalid");
    return false;
  } else if (!hasValidHash(newBlock)) {
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

function findBlock(
  index: number,
  previousHash: string,
  timeStamp: number,
  data: string,
  difficulty: number
) {
  let nonce = 0;
  while (true) {
    const hash = calculateHash(
      index,
      previousHash,
      timeStamp,
      data,
      difficulty,
      nonce
    );
    if (hashMatchesDifficulty(hash, difficulty))
      return new Block(
        index,
        hash,
        previousHash,
        timeStamp,
        data,
        difficulty,
        nonce
      );
    nonce++;
  }
}

function hashMatchesDifficulty(hash: string, difficulty: number) {
  // const hashInBinary: string = parseInt(hash.toString(), 16).toString(2); //Converter hex para bin
  const requiredPrefix: string = "0".repeat(difficulty);
  return hash.startsWith(requiredPrefix);
}

const getDifficulty = (aBlockchain: Block[]): number => {
  const latestBlock: Block = aBlockchain[blockChain.length - 1];
  if (
    latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
    latestBlock.index !== 0
  ) {
    return getAdjustedDifficulty(latestBlock, aBlockchain);
  } else {
    return latestBlock.difficulty;
  }
};

//Aumenta ou diminui em 1 a dificultade baseado no tempo em que os blocos demorar para serem minerados.
function getAdjustedDifficulty(latestBlock: Block, BlockChain: Block[]) {
  //Ultimo ajuste feito
  const prevAdjustmentBlock: Block =
    BlockChain[blockChain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  //Tempo esperado
  const timeExpected: number =
    BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  //Tempo que realmente levou
  const timeTaken: number =
    latestBlock.timeStamp - prevAdjustmentBlock.timeStamp;
  if (timeTaken < timeExpected / 2) {
    return prevAdjustmentBlock.difficulty + 1;
  } else if (timeTaken > timeExpected * 2) {
    return prevAdjustmentBlock.difficulty - 1;
  } else {
    return prevAdjustmentBlock.difficulty;
  }
}

function isValidTimestamp(newBlock: Block, previousBlock: Block): boolean {
  return (
    previousBlock.timeStamp - 60 < newBlock.timeStamp &&
    newBlock.timeStamp - 60 < getCurrentTimestamp()
  );
}

function getCurrentTimestamp() {
  return Math.round(new Date().getTime() / 1000);
}

function hasValidHash(block: Block): boolean {
  if (!hashMatchesBlockContent(block)) {
    console.log("invalid hash");
    return false;
  }

  if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
    console.log(
      "block difficulty not satisfied. Expected: " +
        block.difficulty +
        "got: " +
        block.hash
    );
  }
  return true;
}

function hashMatchesBlockContent(block: Block) {
  if (calculateHashForBlock(block) !== block.hash) return false;
  return true;
}

export {
  getBlockChain,
  getLatestBlock,
  generateNextBlock,
  replaceChain,
  addBlockToChain,
};
