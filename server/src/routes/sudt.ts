import express from "express";
import { rpc } from "../index";
import { Script } from "@ckb-lumos/base";
import { sealTransaction } from "@ckb-lumos/helpers";
import { Address, Cell } from "@ckb-lumos/base";
import { issueSudt, transferUdt, getSudtBalance } from "../generators/sudt";

const routes = express.Router();

routes.post("/get-balance", async (req: any, res) => {
  const params = req.body;
  try {
    const balance = await getSudtBalance(params);
    console.log('balance', balance.toString())
    return res
      .status(200)
      .json(JSON.stringify({ balance: balance.toString() }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/build-issue-sudt", async (req: any, res) => {
  const params = req.body;
  try {
    const txSkeleton = await issueSudt(params);
    return res
      .status(200)
      .json(JSON.stringify({ params: req.body, txSkeleton }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/issue-sudt", async (req: any, res) => {
  const { params, signatures } = req.body;
  const { sender, amount } = params;
  try {
    const txSkeleton = await issueSudt(params);
    console.log('issue-sudt', JSON.stringify(txSkeleton))
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/build-transfer", async (req: any, res) => {
  const params = req.body;
  try {
    const txSkeleton = await transferUdt(params);
    return res
      .status(200)
      .json(JSON.stringify({ params: req.body, txSkeleton }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/transfer", async (req: any, res) => {
  const { params, signatures } = req.body;
  try {
    const txSkeleton = await transferUdt(params);
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

export default routes;
