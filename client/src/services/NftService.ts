import { Cell, HexString, Hash, Address, Script } from "@ckb-lumos/base";
import { TransactionSkeletonType } from "@ckb-lumos/helpers";
import { Api } from "./Api";

export interface TransferNFTParams {
  nftCell: Cell;
  fromAddress: Address;
  toAddress: Address;
}

export interface GenerateNFTParams {
  fromAddress: Address;
  governanceLock: Script;
  owner: Address;
}

export interface TransferNFT {
  params: TransferNFTParams;
  description: string;
  txSkeleton: TransactionSkeletonType;
}

export interface GenerateNFT {
  params: GenerateNFTParams;
  description: string;
  txSkeleton: TransactionSkeletonType;
}

class NftService {
  dappServerUri: string;
  constructor(dappServerUri) {
    this.dappServerUri = dappServerUri;
  }

  async fetchNftsByGovernanceLock(governanceLock: Script): Promise<Cell[]> {
    const response = await Api.post(
      this.dappServerUri,
      "/nft/get-nfts",
      {
        governanceLock,
      }
    );

    return response.payload.nftCells;
  }

  async fetchNfts(governanceLock: Script, lockScript: Script): Promise<Cell[]> {
    const response = await Api.post(
      this.dappServerUri,
      "/nft/get-nfts-by-lock",
      {
        lockScript,
        governanceLock,
      }
    );

    return response.payload.nftCells;
  }

  async fetchNftById(governanceLock: Script, nftId: string): Promise<Cell | undefined> {
    const response = await Api.post(this.dappServerUri, "/nft/get-nft-by-id", {
      governanceLock,
      nftId,
    });

    const { found, cell } = response.payload;

    if (!found) {
      return undefined;
    } else {
      return cell as Cell;
    }
  }

  async buildTransferNft(
    params: TransferNFTParams
  ): Promise<TransferNFT> {
    console.log('params', params);
    const response = await Api.post(this.dappServerUri, "/nft/build-transfer", {
      nftCell: params.nftCell,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
    });

    const data = response.payload;
    return data;
  }

  async transferNft(
    params: TransferNFTParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/nft/transfer", {
      params,
      signatures,
    });

    return response.payload.txHash as Hash;
  }

  async buildGenerateNft(
    params: GenerateNFTParams
  ): Promise<GenerateNFT> {
    const response = await Api.post(this.dappServerUri, "/nft/build-generate", {
      fromAddress: params.fromAddress,
      governanceLock: params.governanceLock,
      owner: params.owner,
    });

    const data = response.payload;
    return data;
  }

  async generateNft(
    params: GenerateNFTParams,
    signatures: HexString[]
  ): Promise<Hash> {
    const response = await Api.post(this.dappServerUri, "/nft/generate", {
      params,
      signatures,
    });

    return response.payload.txHash as Hash;
  }
}

export const nftService = new NftService(process.env.REACT_APP_DAPP_SERVER_URI);
