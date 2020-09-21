import React from "react";
import styled from "styled-components";
import { Cell } from "@ckb-lumos/base";
import HashView from "./common/HashView";
import { Row, Col } from "./common/Grid";
import { generateAddress } from "../utils/scriptUtils";
import AddressView from "./AddressView";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px;
`;

const DetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px;
`;

const Image = styled.img`
  max-width: 250px;
`;

interface Props {
  nftCell: Cell;
}

export const NftCardDetailed = (props: Props) => {
  const { nftCell } = props;
  return (
    <Wrapper>
      <Image src={`http://robohash.org/${nftCell.data}`} alt="NFT Robohash" />
      <h3>Owner</h3>
      <DetailsWrapper>
        <Row>
          <Col>Owner</Col>
          <Col>
            <AddressView address={generateAddress(nftCell.cell_output.lock)} />
          </Col>
        </Row>
      </DetailsWrapper>
      <div>
        Id: <HashView hash={nftCell.data} />
      </div>
    </Wrapper>
  );
};
