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
import { toShannons } from "../../utils/formatters";
import {
  BuyTokenSaleParams,
  tokenSaleService,
} from "../../services/TokenSaleService";
import { Hash } from "@ckb-lumos/base";
import { TokenSaleCells } from "../../stores/TokenSaleStore";
import { TokenSaleCellList } from "./TokenSaleCellList";

type Inputs = {
  recipientAddress: string;
  amount: string;
};

interface Props {
  udtTypeHash: Hash;
  cells: TokenSaleCells;
}

const BuyTokenSaleForm = (props: Props) => {
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

      const params: BuyTokenSaleParams = {
        sender: activeAccount!.address,
        recipient: activeAccount!.address,
        udtAmount: toShannons(formData.amount).toString(),
        pricePerToken: "100",
        sudtArgs: props.udtTypeHash,
        txFee: getConfig().DEFAULT_TX_FEE.toString(),
      };

      const tx = await tokenSaleService.buildBuyTokenSale(params);

      const signatures = await wallet!.signTransaction(
        tx,
        activeAccount!.lockHash
      );

      const txHash = await tokenSaleService.buyTokenSale(params, signatures);

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
    <div onSubmit={handleSubmit(onSubmit)}>
      <form>
        <FormTitle>Buy Sudt</FormTitle>
        <label htmlFor="recipientAddress">Amount to Buy</label>
        <FormInput
          type="number"
          name="amount"
          ref={register({ required: true })}
        />
        {errors.amount && <FormError>Please enter amount</FormError>}
        <Button disabled={!walletState.activeAccount} type="submit">
          Buy
        </Button>
        {error.length > 0 && <FormError>{error}</FormError>}
      </form>
      <TokenSaleCellList cells={props.cells}/>
      <TransactionStatusList />
    </div>
  );
};

export default BuyTokenSaleForm;
