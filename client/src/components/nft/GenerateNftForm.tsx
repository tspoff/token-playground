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
import { isWalletConnected, WalletContext } from "../../stores/WalletStore";
import { TransactionStatusList } from "../TransactionStatusList";
import { nftService, GenerateNFTParams } from "../../services/NftService";
import {
  TxTrackerContext,
  TxTrackerActions,
  TxStatus,
} from "../../stores/TxTrackerStore";

type Inputs = {
  recipientAddress: string;
  amount: string;
};

const GenerateNftForm = () => {
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

      const params: GenerateNFTParams = {
        fromAddress: activeAccount!.address,
        governanceLock: activeAccount!.lockScript,
        owner: formData.recipientAddress,
      };

      const tx = await nftService.buildGenerateNft(params);

      const signatures = await wallet!.signTransaction(
        tx,
        activeAccount!.lockHash
      );

      const txHash = await nftService.generateNft(params, signatures);

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
        <FormTitle>Generate NFT</FormTitle>
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
          Generate
        </Button>
        {error.length > 0 && <FormError>{error}</FormError>}
      </Form>
      <TransactionStatusList />
    </FormWrapper>
  );
};

export default GenerateNftForm;
