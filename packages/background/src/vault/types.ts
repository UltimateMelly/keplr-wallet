export type PlainRecord = Readonly<
  Record<string, string | number | boolean | undefined>
>;

export interface Vault {
  id: string;
  insensitive: PlainRecord;
  sensitive: Uint8Array;
  meta: PlainRecord;
}
