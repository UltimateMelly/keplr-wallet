import { VaultService } from "../vault/service";
import { Buffer } from "buffer/";
import { Vault } from "../vault/types";
import {
  Hash,
  Mnemonic,
  PrivKeySecp256k1,
  PubKeySecp256k1,
} from "@keplr-wallet/crypto";
import { Env } from "@keplr-wallet/router";

export class KeyRingMnemonicService {
  constructor(protected readonly vaultService: VaultService) {}

  async init(): Promise<void> {
    // TODO: ?
  }

  supportedKeyRingType(): string {
    return "mnemonic";
  }

  addKeyRingVault(type: string): Promise<string> {}

  getPubKey(
    _: Env,
    vault: Vault,
    coinType: number,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): PubKeySecp256k1 {
    const tag = `pubKey-m/44'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`;

    if (vault.insensitive[tag]) {
      const pubKey = Buffer.from(vault.insensitive[tag] as string, "hex");
      return new PubKeySecp256k1(pubKey);
    }

    const privKey = this.getPrivKey(vault, coinType, bip44Path);

    const pubKey = privKey.getPubKey();

    const pubKeyText = Buffer.from(pubKey.toBytes()).toString("hex");
    this.vaultService.setAndMergeInsensitiveToVault("keyRing", vault.id, {
      [tag]: pubKeyText,
    });

    return pubKey;
  }

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
  ): Uint8Array {
    const privKey = this.getPrivKey(vault, coinType, bip44Path);

    let digest = new Uint8Array();
    switch (digestMethod) {
      case "sha256":
        digest = Hash.sha256(data);
        break;
      case "keccak256":
        digest = Hash.keccak256(data);
        break;
      default:
        throw new Error(`Unknown digest method: ${digestMethod}`);
    }

    return privKey.signDigest32(digest);
  }

  protected getPrivKey(
    vault: Vault,
    coinType: number,
    bip44Path: {
      account: number;
      change: number;
      addressIndex: number;
    }
  ): PrivKeySecp256k1 {
    const decrypted = this.vaultService.decrypt(vault.sensitive);
    const masterSeedText = decrypted.masterSeedText as string | undefined;
    if (!masterSeedText) {
      throw new Error("masterSeedText is null");
    }

    const masterSeed = Buffer.from(masterSeedText, "hex");
    return new PrivKeySecp256k1(
      Mnemonic.generatePrivateKeyFromMasterSeed(
        masterSeed,
        `m/44'/${coinType}'/${bip44Path.account}'/${bip44Path.change}/${bip44Path.addressIndex}`
      )
    );
  }
}
