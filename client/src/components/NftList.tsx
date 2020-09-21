import React from "react";
import styled from "styled-components";
import { NftMap } from "../stores/NftStore";
import { NftCard } from "./NftCard";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  border-radius: 5px;
`;

interface Props {
  nfts: NftMap;
}

export const NftList = (props: Props) => {
  const { nfts } = props;
  
  const renderListItems = () => {
    return Object.keys(nfts).map((key) => {
      const nft = nfts[key];
      return (
        <React.Fragment key={nft.data}>
          <NftCard nftCell={nft} />
        </React.Fragment>
      );
    });
  };

  return (
    <Wrapper>
      <ListWrapper>{renderListItems()}</ListWrapper>
    </Wrapper>
  );
};
