import express from "express";
import { rpc } from "../index";
import { Script } from "@ckb-lumos/base";
import { sealTransaction } from "@ckb-lumos/helpers";
import { Address, Cell } from "@ckb-lumos/base";
import { issueSudt, transferUdt, getSudtBalance } from "../generators/sudt";
import { createTokenSale, buyTokenSale } from "../generators/sudt-sale";

const routes = express.Router();

routes.post("/get-token-sale-cells", async (req: any, res) => {
  const params = req.body;
  try {
    const balance = await getSudtBalance(params);
    return res
      .status(200)
      .json(JSON.stringify({ balance: balance.toString() }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/build-create-token-sale", async (req: any, res) => {
  const params = req.body;
  try {
    const txSkeleton = await createTokenSale(params);
    return res
      .status(200)
      .json(JSON.stringify({ params: req.body, txSkeleton }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/create-token-sale", async (req: any, res) => {
  const { params, signatures } = req.body;
  const { sender, amount } = params;
  try {
    const txSkeleton = await createTokenSale(params);
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/build-buy-token-sale", async (req: any, res) => {
  const params = req.body;
  try {
    const txSkeleton = await buyTokenSale(params);
    return res
      .status(200)
      .json(JSON.stringify({ params: req.body, txSkeleton }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/buy-token-sale", async (req: any, res) => {
  const { params, signatures } = req.body;
  try {
    const txSkeleton = await buyTokenSale(params);
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

export default routes;
