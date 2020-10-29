import express from "express";
import { rpc } from "../index";
import { Script } from "@ckb-lumos/base";
import { sealTransaction } from "@ckb-lumos/helpers";
import { Address, Cell } from "@ckb-lumos/base";
import { issueSudt, transferUdt, getSudtBalance } from "../generators/sudt";
import {
  buildBuyTokenSale,
  buildCreateTokenSale,
  getTokenSaleCells,
} from "../generators/sudt-sale";

const routes = express.Router();

routes.post("/get-token-sale-cells", async (req: any, res) => {
  const params = req.body;
  // try {
  const { cells, metadata } = await getTokenSaleCells({
    sudtArgs: params.sudtArgs,
  });
  return res.status(200).json(JSON.stringify({ cells, metadata }));
  // } catch (error) {
  //   return res.status(500).json({ error: error.message });
  // }
});

routes.post("/build-create-token-sale", async (req: any, res) => {
  const params = req.body;
  // try {
  const txSkeleton = await buildCreateTokenSale(params);
  console.log(req.body);
  console.log("before body");
  JSON.stringify({ params: req.body });
  console.log("before skeleton");
  JSON.stringify({ txSkeleton });
  return res.status(200).json(JSON.stringify({ params: req.body, txSkeleton }));
  // } catch (error) {
  //   return res.status(500).json({ error: error.message });
  // }
});

routes.post("/create-token-sale", async (req: any, res) => {
  const { params, signatures } = req.body;
  const { sender, amount } = params;
  // try {
  const txSkeleton = await buildCreateTokenSale(params);
  const tx = sealTransaction(txSkeleton, signatures);
  const txHash = await rpc.send_transaction(tx);
  return res.status(200).json(JSON.stringify({ txHash }));
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).json({ error: error.message });
  // }
});

routes.post("/build-buy-token-sale", async (req: any, res) => {
  const {params} = req.body;
  // try {
    const txSkeleton = await buildBuyTokenSale(params);
    return res
      .status(200)
      .json(JSON.stringify({ params: req.body, txSkeleton }));
  // } catch (error) {
  //   return res.status(500).json({ error: error.message });
  // }
});

routes.post("/buy-token-sale", async (req: any, res) => {
  const { params, signatures } = req.body;
  try {
    const txSkeleton = await buildBuyTokenSale(params);
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

export default routes;
