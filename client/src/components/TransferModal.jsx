import React, { useState, useContext } from "react";
import styled from "styled-components";
import { Grid, Row, Col, CenteredRow } from "./common/Grid";
import Modal from "./common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { WalletContext } from "../stores/WalletStore";
import {
  Modals,
  ModalActions,
  ModalContext,
  TransferModalPanels,
} from "../stores/ModalStore";
import { BalanceContext } from "../stores/BalanceStore";
import TransferCkbForm from "./TransferCkbForm";
import TransferUdtForm from "./TransferUdtForm";

const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderRow = styled(Row)`
  padding: 10px 0px;
  padding-top: 20px;
  border-bottom: 1px solid black;
`;

const ErrorMsg = styled.p`
  color: red;
`;

const ContentWrapper = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
`;

const TransferModal = () => {
  const { walletState, walletDispatch } = useContext(WalletContext);
  const { balanceState } = useContext(BalanceContext);
  const { modalState, modalDispatch } = useContext(ModalContext);
  const [error, setError] = useState("");

  const dismissModal = () => {
    modalDispatch({
      type: ModalActions.setModalState,
      modalName: Modals.transferModal,
      newState: { visible: false },
    });
  };

  let walletText = {
    address: "-",
    balance: "-",
    title: "-",
  };

  const account = walletState.activeAccount;
  let balance = null;

  /* Display balance if already fetched */
  if (account && balanceState.ckbBalances[account.lockHash]) {
    balance = balanceState.ckbBalances[account.lockHash].toString();
  }

  /* Set wallet text based on active wallet */
  if (account) {
    walletText.address = account.address;
  }

  switch (modalState.walletModal.activePanel) {
    case TransferModalPanels.CONNECT_ACCOUNT:
      walletText.title = "Connect to Wallet";
      break;
    case TransferModalPanels.VIEW_ACCOUNT:
      walletText.title = "Active Account";
      break;
    default:
      walletText.title = "Unknown Panel";
  }

  const renderActivePanel = () => {
    switch (modalState.walletModal.activePanel) {
      case TransferModalPanels.TRANSFER_CKB:
        return renderTransferCKBPanel();
      case TransferModalPanels.TRANSFER_SUDT:
        return renderTransferSUDTPanel();
      case TransferModalPanels.TRANSFER_NFT:
        return renderTransferNFTPanel();
      default:
        return renderTransferCKBPanel();
    }
  };

  const renderTransferCKBPanel = () => {
    return (
      <React.Fragment>
        <TransferCkbForm />
      </React.Fragment>
    );
  };

  const renderTransferSUDTPanel = () => {
    return (
      <React.Fragment>
        <TransferUdtForm />
      </React.Fragment>
    );
  };

  const renderTransferNFTPanel = () => {
    return (
      <React.Fragment>
        <TransferCkbForm />
      </React.Fragment>
    );
  };

  //@ts-ignore
  return (
    <Modal
      onDismiss={dismissModal}
      visible={modalState[Modals.walletModal].visible}
    >
      <ModalWrapper>
        <Grid>
          <HeaderRow>
            <Col size={15}>
              <p>{walletText.title}</p>
            </Col>
            <Col size={1}>
              <FontAwesomeIcon onClick={dismissModal} icon={faTimes} />
            </Col>
          </HeaderRow>
          <ContentWrapper>{renderActivePanel()}</ContentWrapper>
          {error && (
            <CenteredRow>
              <ErrorMsg>{error}</ErrorMsg>
            </CenteredRow>
          )}
        </Grid>
      </ModalWrapper>
    </Modal>
  );
};

export default TransferModal;
