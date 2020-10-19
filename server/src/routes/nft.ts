import express from "express";
import { rpc } from "../index";
import { Script } from "@ckb-lumos/base";
import { sealTransaction } from "@ckb-lumos/helpers";
import { Address, Cell } from "@ckb-lumos/base";
import {
  listNftTokens,
  transferNftToken,
  generateNftToken,
  listNftTokensByLock,
  getNftById,
} from "../generators/nft";

interface TransferNFTParams {
  nftCell: Cell;
  toAddress: Address;
}

interface GenerateNFTParams {
  fromAddress: Address;
  governanceLock: Script;
  owner: Address;
}

const routes = express.Router();

routes.post("/build-transfer", async (req: any, res) => {
  console.log('build-transfer params', req.body);
  const { nftCell, toAddress } = req.body;
  try {
    const txSkeleton = await transferNftToken(nftCell, toAddress);
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
    const txSkeleton = await transferNftToken(params.nftCell, params.toAddress);
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/build-generate", async (req: any, res) => {
  const { fromAddress, governanceLock, owner } = req.body;

  try {
    const txSkeleton = await generateNftToken(
      fromAddress,
      governanceLock,
      owner
    );
    return res
      .status(200)
      .json(JSON.stringify({ params: req.body, txSkeleton }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/generate", async (req: any, res) => {
  const { params, signatures } = req.body;
  try {
    const { fromAddress, governanceLock, owner } = params;
    const txSkeleton = await generateNftToken(
      fromAddress,
      governanceLock,
      owner
    );
    const tx = sealTransaction(txSkeleton, signatures);
    const txHash = await rpc.send_transaction(tx);
    return res.status(200).json(JSON.stringify({ txHash }));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/get-nfts", async (req: any, res) => {
  const { governanceLock } = req.body;
  try {
    const nftCells: Cell[] = await listNftTokens(governanceLock);
    return res.status(200).json(JSON.stringify({ nftCells }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/get-nft-by-id", async (req: any, res) => {
  const { governanceLock, nftId } = req.body;
  try {
    const nftCells: Cell[] = await getNftById(governanceLock, nftId);
    console.log(nftCells);
    if (nftCells.length === 0) {
      return res.status(200).json(JSON.stringify({ found: false }));
    } else if  (nftCells.length === 1) {
      return res.status(200).json(JSON.stringify({ found: true, cell: nftCells[0] }));
    } else if (nftCells.length > 1) {
      throw new Error('Multiple NFTs with same unique ID found');
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

routes.post("/get-nfts-by-lock", async (req: any, res) => {
  const { lockScript, governanceLock } = req.body;
  try {
    const nftCells: Cell[] = await listNftTokensByLock(lockScript, governanceLock);
    console.log(nftCells);
    return res.status(200).json(JSON.stringify({ nftCells }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default routes;
