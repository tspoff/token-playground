import { Cell, Script } from "@ckb-lumos/base";

export function printCell(cell: Cell, message: string | undefined = undefined) {
  if (message) {
    console.log(message);
  }

  console.dir(cell, { depth: null });
}

export function printScript(
  script: Script,
  message: string | undefined = undefined
) {
  if (message) {
    console.log(message);
  }

  console.dir(script, { depth: null });
}

export function printObj(
    value: object,
    message: string | undefined = undefined
  ) {
    if (message) {
      console.log(message);
    }
  
    console.dir(value, { depth: null });
  }
  