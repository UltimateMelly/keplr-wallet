import { VaultService } from "../vault/service";
import { KeyRing } from "./types";
import { Env } from "@keplr-wallet/router";
import { Vault } from "../vault/types";
import { PubKeySecp256k1 } from "@keplr-wallet/crypto";
import { ChainsService } from "../chains";

export class KeyRingService {
  constructor(
    protected readonly chainsService: ChainsService,
    protected readonly vaultService: VaultService,
    protected readonly keyRings: KeyRing[]
  ) {}

  async init(): Promise<void> {
    // TODO: ?
  }

  getKeyRingVaults(): Vault[] {
    return this.vaultService.getVaults("keyRing");
  }

  getPubKey(
    env: Env,
    vaultId: string,
    coinType: number,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): Promise<PubKeySecp256k1> {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }
    return this.getPubKeyWithVault(env, vault, coinType, bip44Path);
  }

  sign(
    env: Env,
    vaultId: string,
    coinType: number,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    },
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Promise<Uint8Array> {
    const vault = this.vaultService.getVault("keyRing", vaultId);
    if (!vault) {
      throw new Error("Vault is null");
    }

    return this.signWithVault(
      env,
      vault,
      coinType,
      bip44Path,
      data,
      digestMethod
    );
  }

  getPubKeyWithVault(
    env: Env,
    vault: Vault,
    coinType: number,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): Promise<PubKeySecp256k1> {
    const keyRing = this.getSupportedKeyRing(vault);

    return Promise.resolve(keyRing.getPubKey(env, vault, coinType, bip44Path));
  }

  signWithVault(
    env: Env,
    vault: Vault,
    coinType: number,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    },
    data: Uint8Array,
    digestMethod: "sha256" | "keccak256"
  ): Promise<Uint8Array> {
    const keyRing = this.getSupportedKeyRing(vault);

    return Promise.resolve(
      keyRing.sign(env, vault, coinType, bip44Path, data, digestMethod)
    );
  }

  protected getSupportedKeyRing(vault: Vault): KeyRing {
    for (const keyRing of this.keyRings) {
      if (vault.meta["keyRingType"] === keyRing.supportedKeyRingType()) {
        return keyRing;
      }
    }

    throw new Error("Unsupported keyRing vault");
  }
}
