import * as bodyParser from "body-parser";
import express from "express";

import { generateNextBlock, getBlockChain } from "./BlockChain";
import { connectToPeers, getSockets, initP2PServer } from "./P2P";
import { Block } from "./Block";
const httpPort: number = 3001;
const p2pPort: number = 6001;

const initHttpServer = (myHttpPort: number) => {
  const app = express();
  app.use(bodyParser.json());

  app.get("/blocks", (req, res) => {
    res.send(getBlockChain());
  });
  app.post("/mineBlock", (req, res) => {
    const newBlock: Block = generateNextBlock(req.body.data);
    res.send(newBlock);
  });
  app.get("/peers", (req, res) => {
    res.send(
      getSockets().map(
        (s: any) => s._socket.remoteAddress + ":" + s._socket.remotePort
      )
    );
  });
  app.post("/addPeer", (req, res) => {
    connectToPeers(req.body.peer);
    res.send();
  });

  app.listen(myHttpPort, () => {
    console.log("Listening http on port: " + myHttpPort);
  });
};

initHttpServer(httpPort);
initP2PServer(p2pPort);
