import React, { useContext } from "react";
import styled from "styled-components";

import { getAssetMetadata, KnownAssets } from "../../stores/assets";
import ActionButton from "../common/ActionButton";
import { AssetData } from "./AssetTransferList";
import CkbValue from "../common/CkbValue";
import {
  ModalActions,
  ModalContext,
  Modals,
  TransferModalPanels,
} from "../../stores/ModalStore";

const Image = styled.img`
  max-width: 40px;
`;

interface Props {
  asset: AssetData;
}

export const AssetTableRow = (props: Props) => {
  const { asset } = props;
  const { modalDispatch } = useContext(ModalContext);
  const metadata = getAssetMetadata(asset.id);

  console.log('render asset for',{
    asset,
    metadata
  })

  const openTransferModal = () => {
    if (asset.id === KnownAssets.CKB) {
      modalDispatch({
        type: ModalActions.setModalState,
        modalName: Modals.transferModal,
        newState: {
          visible: true,
          activePanel: TransferModalPanels.TRANSFER_CKB,
        },
      });
    } else {
      modalDispatch({
        type: ModalActions.setModalState,
        modalName: Modals.transferModal,
        newState: {
          visible: true,
          activePanel: TransferModalPanels.TRANSFER_SUDT,
        },
      });
    }
  };

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
      <td>
        {" "}
        <CkbValue
          amount={asset.balance?.toString()}
          showPlaceholder={!asset.balance}
          decimals={BigInt(metadata.decimals)}
        />
      </td>
      <td>
        <ActionButton onClick={openTransferModal}>Transfer</ActionButton>
      </td>
    </tr>
  );
};
