import React from "react";
import styled from "styled-components";
import { Hash } from "@ckb-lumos/base";
import { AssetCard } from "./AssetCard";
import { AssetMetadata } from "../../stores/assets";
import { AssetTableRow } from "./AssetTableRow";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  border-radius: 5px;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0 auto;
  border-radius: 5px;
`;

export interface AssetData {
  id: Hash;
  balance: BigInt | undefined;
  metadata?: AssetMetadata;
}

interface Props {
  assets: AssetData[];
}

export const AssetTransferList = (props: Props) => {
  const { assets } = props;

  const renderListItems = () => {
    return assets.map((asset) => {
      return <AssetTableRow asset={asset} />;
    });
  };

  return (
    <Wrapper>
      {assets.length > 0 && (
        <table>
          <tr>
            <th>Icon</th>
            <th>Symbol</th>
            <th>Name</th>
            <th>Account Balance</th>
          </tr>
          {renderListItems()}
        </table>
      )}
      {assets.length === 0 && "No assets found for active account"}
    </Wrapper>
  );
};
