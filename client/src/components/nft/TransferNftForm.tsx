import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Cell } from "@ckb-lumos/base";
import {
  FormWrapper,
  FormTitle,
  FormInput,
  FormError,
  Form,
} from "../common/Form";
import Button from "../common/Button";
import { isWalletConnected, WalletContext } from "../../stores/WalletStore";
import { TransactionStatusList } from "../TransactionStatusList";
import { nftService, GenerateNFTParams, TransferNFTParams } from "../../services/NftService";
import {
  TxTrackerContext,
  TxTrackerActions,
  TxStatus,
} from "../../stores/TxTrackerStore";

interface Props {
  nftCell: Cell;
}

type Inputs = {
  recipientAddress: string;
};

const TransferNftForm = (props: Props) => {
  const { walletState } = useContext(WalletContext);
  const { txTrackerDispatch } = useContext(TxTrackerContext);

  const [error, setError] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();
  const onSubmit = async (formData) => {
    if (!isWalletConnected(walletState)) return;

    const { activeAccount, wallet } = walletState;

    try {
      setError("");

      const params: TransferNFTParams = {
        fromAddress: activeAccount!.address,
        toAddress: formData.recipientAddress,
        nftCell: props.nftCell,
      };

      const tx = await nftService.buildTransferNft(params);

      const signatures = await wallet!.signTransaction(
        tx,
        activeAccount!.lockHash
      );

      const txHash = await nftService.transferNft(params, signatures);

      txTrackerDispatch({
        type: TxTrackerActions.SetTrackedTxStatus,
        txHash,
        txStatus: TxStatus.PENDING,
      });
    } catch (e) {
      setError(e.toString());
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit(onSubmit)}>
      <Form>
        <FormTitle>Transfer NFT</FormTitle>
        <label htmlFor="recipientAddress">Recipient Address</label>
        <FormInput
          type="text"
          name="recipientAddress"
          ref={register({ required: true })}
        />
        {errors.recipientAddress && (
          <FormError>Please enter recipient address</FormError>
        )}
        <Button disabled={!walletState.activeAccount} type="submit">
          Transfer
        </Button>
        {error.length > 0 && <FormError>{error}</FormError>}
      </Form>
      <TransactionStatusList />
    </FormWrapper>
  );
};

export default TransferNftForm;
