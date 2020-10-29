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
import {
  TxTrackerContext,
  TxTrackerActions,
  TxStatus,
} from "../../stores/TxTrackerStore";
import { getConfig } from "../../config/lumosConfig";
import {
  CreateTokenSaleParams,
  tokenSaleService,
} from "../../services/TokenSaleService";
import { TokenSaleCellList } from "./TokenSaleCellList";
import {
  getTokenSaleCellsForSudtArgs,
  TokenSaleCells,
  TokenSaleContext,
} from "../../stores/TokenSaleStore";
import { toShannons } from "../../utils/formatters";

type Inputs = {
  amountToMint: string;
  pricePerToken: string;
};

interface Props {
  sudtArgs: string;
}

const CreateTokenSaleForm = (props: Props) => {
  const { walletState } = useContext(WalletContext);
  const { tokenSaleState } = useContext(TokenSaleContext);
  const { txTrackerDispatch } = useContext(TxTrackerContext);
  const [error, setError] = useState("");

  console.log(tokenSaleState);

  const cells: TokenSaleCells | undefined = getTokenSaleCellsForSudtArgs(
    tokenSaleState,
    props.sudtArgs
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();
  const onSubmit = async (formData) => {
    if (!isWalletConnected(walletState)) return;
    const { activeAccount, wallet } = walletState;

    try {
      setError("");

      const params: CreateTokenSaleParams = {
        sender: activeAccount!.lockScript,
        supplyToMint: toShannons(formData.amountToMint),
        pricePerToken: BigInt(formData.pricePerToken),
        txFee: getConfig().DEFAULT_TX_FEE,
      };

      const tx = await tokenSaleService.buildCreateTokenSale(params);

      console.log(tx);

      const signatures = await wallet!.signTransaction(
        tx,
        activeAccount!.lockHash
      );

      const txHash = await tokenSaleService.createTokenSale(params, signatures);

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
        <FormTitle>Create Token Sale</FormTitle>
        <label htmlFor="amountToMint">Amount to Mint</label>
        <FormInput
          type="number"
          name="amountToMint"
          ref={register({ required: true })}
        />
        <label htmlFor="pricePerToken">Price Per Token (Shannons)</label>
        <FormInput
          type="number"
          name="pricePerToken"
          ref={register({ required: true })}
        />
        {errors.amountToMint && (
          <FormError>Please enter amount to mint</FormError>
        )}
        {errors.pricePerToken && (
          <FormError>Please enter price per token</FormError>
        )}
        <Button disabled={!walletState.activeAccount} type="submit">
          Create Sale
        </Button>
        {error.length > 0 && <FormError>{error}</FormError>}
      </Form>
      {cells && <TokenSaleCellList cells={cells} />}
      <TransactionStatusList />
    </FormWrapper>
  );
};

export default CreateTokenSaleForm;
