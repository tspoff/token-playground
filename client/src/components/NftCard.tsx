import React from "react";
import styled from "styled-components";
import { Cell } from "@ckb-lumos/base";
import HashView from "./common/HashView";
import { Link } from "react-router-dom";

const Wrapper = styled.div`
  max-width: 250px;
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  border-radius: 5px;
  margin: 20px;
`;

const Image = styled.img`
  max-width: 250px;
`;

interface Props {
  nftCell: Cell;
}

export const NftCard = (props: Props) => {
  const { nftCell } = props;
  return (
    <Wrapper>
      <Link to={`nft/${nftCell.data}`}>
        <Image src={`http://robohash.org/${nftCell.data}`} alt="NFT Robohash" />
      </Link>
      <div>
        Id: <HashView hash={nftCell.data} />
      </div>
    </Wrapper>
  );
};
