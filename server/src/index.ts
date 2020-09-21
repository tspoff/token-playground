import dotenv from "dotenv";
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
import { Indexer, TransactionCollector } from "@ckb-lumos/indexer";
import { initializeConfig, getConfig } from "@ckb-lumos/config-manager";
import { RPC } from "ckb-js-toolkit";

// Configure environment
dotenv.config();
initializeConfig();

import indexerRoutes from "./routes/indexer";
import ckbRoutes from "./routes/ckb";
import generalRoutes from "./routes/general";
import nftRoutes from "./routes/nft";
import sudtRoutes from "./routes/sudt";

// Initialize Services
export const rpc = new RPC(process.env.RPC_URL);
export const indexer = new Indexer(
  process.env.RPC_URL,
  process.env.INDEXER_DATA_DIR
);

// Server Setup
const app = express();
app.use(bodyParser.json());

// Allow CORS for localhost
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Routes
app.use("/", generalRoutes);
app.use("/indexer", indexerRoutes);
app.use("/ckb", ckbRoutes);
app.use("/nft", nftRoutes);
app.use("/sudt", sudtRoutes);

app.listen(process.env.PORT, () => {
  indexer.startForever();
  console.log(`token-mint-server listening on port ${process.env.PORT}`);
});
