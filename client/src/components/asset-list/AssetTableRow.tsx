import React from "react";
import styled from "styled-components";

import { getAssetMetadata } from "../../stores/assets";
import ActionButton from "../common/ActionButton";
import { AssetData } from "./AssetTransferList";
import CkbValue from "../common/CkbValue";

const Image = styled.img`
  max-width: 40px;
`;


interface Props {
  asset: AssetData;
}

export const AssetTableRow = (props: Props) => {
  const { asset } = props;
  const metadata = getAssetMetadata(asset.id);

  return (
    <tr>
      <td>
        <Image src={metadata.icon} alt="Asset Logo" />
      </td>
      <td>
        <p>{metadata.symbol}</p>
      </td>
      <td>
        <p>{metadata.name}</p>
      </td>
      <td> <CkbValue amount={asset.balance?.toString()} showPlaceholder={!asset.balance}/></td>
      <td>
        <ActionButton>Transfer</ActionButton>
      </td>
    </tr>
  );
};
