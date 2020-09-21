import React from "react";
import styled from "styled-components";
import { Hash } from "@ckb-lumos/base";
import { Link } from "react-router-dom";
import { CenteredCol } from "../common/Grid";

import {
  getAssetMetadata,
} from "../../stores/assets";
import ActionButton from "../common/ActionButton";
import { AssetData } from "./AssetTransferList";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const Image = styled.img`
  max-width: 40px;
`;

const CenteredColWithMargin = styled(CenteredCol)`
  margin-left: 10px;
`;

interface Props {
  asset: AssetData;
}

export const AssetCard = (props: Props) => {
  const { asset } = props;
  const metadata = getAssetMetadata(asset.id);

  return (
    <Wrapper>
      <CenteredCol size={2}>
        <Image src={metadata.icon} alt="Asset Logo" />
        <p>{metadata.symbol}</p>
      </CenteredCol>
      <CenteredColWithMargin size={4}>
        <p>{metadata.name}</p>
      </CenteredColWithMargin>
      <CenteredColWithMargin size={4}>
        {asset.balance?.toString()}
      </CenteredColWithMargin>
      <CenteredColWithMargin size={2}>
        <ActionButton>Transfer</ActionButton>
      </CenteredColWithMargin>
    </Wrapper>
  );
};
