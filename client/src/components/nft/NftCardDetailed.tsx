import React, { useContext } from "react";
import styled from "styled-components";
import { Cell } from "@ckb-lumos/base";
import HashView from "../common/HashView";
import { Row, Col } from "../common/Grid";
import { generateAddress } from "../../utils/scriptUtils";
import AddressView from "../common/AddressView";
import ActionButton from "../common/ActionButton";
import { ModalActions, ModalContext, Modals, TransferModalPanels } from "../../stores/ModalStore";

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
  const { modalDispatch } = useContext(ModalContext);
  const { nftCell } = props;

  console.log('NftCardDetailed Props', props);

  const openTransferModal = () => {
      modalDispatch({
        type: ModalActions.setModalState,
        modalName: Modals.transferModal,
        newState: {
          visible: true,
          nftCell: nftCell,
          activePanel: TransferModalPanels.TRANSFER_NFT,
        },
      });
  };

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
      <div>
      <ActionButton onClick={openTransferModal}>Transfer</ActionButton>
      </div>
    </Wrapper>
  );
};
