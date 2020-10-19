import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FormWrapper,
  FormTitle,
  FormInput,
  FormError,
  Form,
} from "../common/Form";
import Button from "../common/Button";
import { dappService, CkbTransferParams } from "../../services/DappService";
import { isWalletConnected, WalletContext } from "../../stores/WalletStore";
import { getConfig } from "../../config/lumosConfig";
import { TransactionStatusList } from "../TransactionStatusList";
import { toShannons } from "../../utils/formatters";
import {
  TxTrackerContext,
  TxTrackerActions,
  TxStatus,
} from "../../stores/TxTrackerStore";

type Inputs = {
  recipientAddress: string;
  amount: string;
};

const TransferCkbForm = () => {
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

      const params: CkbTransferParams = {
        sender: activeAccount!.address,
        recipient: formData.recipientAddress,
        amount: toShannons(formData.amount),
        txFee: getConfig().DEFAULT_TX_FEE,
      };

      console.log('TransferCkbForm Params', params);

      const tx = await dappService.buildTransferCkbTx(params);
      console.log('generated, unsigned TX', tx);

      const signatures = await wallet!.signTransaction(
        tx,
        activeAccount!.lockHash
      );

      console.log('signed TX signatures', signatures);
      const txHash = await dappService.transferCkb(params, signatures);

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
        <FormTitle>Transfer CKB</FormTitle>
        <label htmlFor="recipientAddress">Recipient Address</label>
        <FormInput
          type="text"
          name="recipientAddress"
          ref={register({ required: true })}
        />
        {errors.recipientAddress && (
          <FormError>Please enter recipient address</FormError>
        )}
        <label htmlFor="amount">Amount</label>
        <FormInput
          type="number"
          name="amount"
          step="0.00000001"
          ref={register({ required: true })}
        />
        {errors.amount && <FormError>Please enter amount</FormError>}
        <Button disabled={!walletState.activeAccount} type="submit">
          Transfer
        </Button>
        {error.length > 0 && <FormError>{error}</FormError>}
      </Form>
      <TransactionStatusList />
    </FormWrapper>
  );
};

export default TransferCkbForm;
