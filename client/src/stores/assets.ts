import { Hash } from "@ckb-lumos/base";
import ckb from "../assets/ckb.png";
import meter from "../assets/meter.jpg";
import unknown from "../assets/unknown.png";

export enum KnownAssets {
  CKB = "0x0000000000000000000000000000000000000000000000000000000000000000",
  METER = "0x2",
}

export interface AssetMetadata {
  name: string;
  symbol: string;
  decimals: BigInt;
  icon: string;
}

export const assetMetadata = {} as { [index: string]: AssetMetadata };
assetMetadata[KnownAssets.CKB] = {
  name: "CKBytes",
  symbol: "CKB",
  decimals: BigInt(8),
  icon: ckb,
};
assetMetadata["default"] = {
  name: "User Defined",
  symbol: "UDT",
  decimals: BigInt(8),
  icon: unknown,
};
assetMetadata[KnownAssets.METER] = {
  name: "Meter",
  symbol: "MTR",
  decimals: BigInt(8),
  icon: meter,
};

export function getAssetMetadata(
  id: Hash,
  placeholderIfUnknown = true
): AssetMetadata {
  let metadata: AssetMetadata;

  if (isKnownAsset(id)) {
    metadata = assetMetadata[id];
  } else if (!isKnownAsset(id) && placeholderIfUnknown) {
    metadata = assetMetadata["default"];
  } else {
    throw new Error(`Asset with id ${id} not found`);
  }
  return metadata;
}

export function isKnownAsset(hash: Hash): boolean {
  const found = Object.values(KnownAssets).find((assetId) => {
    return assetId === hash;
  });

  return !!found;
}
