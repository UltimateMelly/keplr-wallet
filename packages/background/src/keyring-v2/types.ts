import { Env } from "@keplr-wallet/router";
import { Vault } from "../vault/types";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";

export interface KeyRing {
  supportedKeyRingType(): string;
  getPubKey(
    _: Env,
    vault: Vault,
    coinType: number,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): PubKeySecp256k1 | Promise<PubKeySecp256k1>;
  sign(
    _: Env,
    vault: Vault,
    coinType: number,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    },
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Uint8Array | Promise<Uint8Array>;
}
