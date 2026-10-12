import { NOTE_PASSKEY, STORAGE_NAMES } from "@/constants";
import {
  clear,
  createStore,
  del,
  delMany,
  entries,
  get,
  set,
  type UseStore,
} from "idb-keyval";
import { shallowRef } from "vue";
import { decrypt, encrypt, randomBytes, type Sealed } from "./crypto";
import type { LockedAtOf } from "./locked-notes";
import { fromBase64, toBase64 } from "./protocol";

type Account = { id: string; email: string; name: string };

type SavedPassword = Sealed & { lockedAt: number };

const CREDENTIAL = "credential";
const PASSWORD = "password:";

const prfSalt = () => new TextEncoder().encode(NOTE_PASSKEY.prfSalt);

const prfSecret = (credential: PublicKeyCredential) =>
  credential.getClientExtensionResults().prf?.results?.first;

const importPrfKey = (credential: PublicKeyCredential) => {
  const secret = prfSecret(credential);
  if (!secret) throw new Error("This passkey can't unlock notes.");
  return crypto.subtle.importKey("raw", secret, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
};

const isSupported = async () => {
  if (!window.PublicKeyCredential?.getClientCapabilities) return false;
  const capabilities = await PublicKeyCredential.getClientCapabilities();
  return !!capabilities["extension:prf"];
};

export class NotePasskeys {
  readonly supported = shallowRef(false);
  readonly registered = shallowRef(false);
  readonly saved = shallowRef<Record<string, number>>({});
  private store: UseStore;
  private key: Promise<CryptoKey> | null = null;

  constructor(private account: Account) {
    this.store = createStore(STORAGE_NAMES.passkeys(account.id), "passkeys");
  }

  async load(lockedAtOf: LockedAtOf) {
    this.supported.value = await isSupported().catch(() => false);
    this.registered.value = !!(await get(CREDENTIAL, this.store));
    const passwords = (await entries<string, SavedPassword>(this.store))
      .filter(([key]) => key.startsWith(PASSWORD))
      .map(([key, saved]) => [key.slice(PASSWORD.length), saved] as const);
    const isCurrent = ([noteId, saved]: (typeof passwords)[number]) =>
      lockedAtOf(noteId) === saved.lockedAt;
    await delMany(
      passwords
        .filter((entry) => !isCurrent(entry))
        .map(([noteId]) => PASSWORD + noteId),
      this.store,
    );
    this.saved.value = Object.fromEntries(
      passwords
        .filter(isCurrent)
        .map(([noteId, saved]) => [noteId, saved.lockedAt]),
    );
  }

  has(noteId: string, lockedAt: number | null | undefined) {
    return !!lockedAt && this.saved.value[noteId] === lockedAt;
  }

  unlockKey() {
    this.key ??= this.deriveKey().catch((error) => {
      this.key = null;
      throw error;
    });
    return this.key;
  }

  async remember(noteId: string, lockedAt: number, password: string) {
    const key = await this.unlockKey();
    const sealed = await encrypt(key, new TextEncoder().encode(password));
    await set(
      PASSWORD + noteId,
      { ...sealed, lockedAt } satisfies SavedPassword,
      this.store,
    );
    this.saved.value = { ...this.saved.value, [noteId]: lockedAt };
  }

  async recall(noteIds: string[]) {
    const key = await this.unlockKey();
    const decoder = new TextDecoder();
    const passwords = await Promise.all(
      noteIds.map(async (noteId) => {
        const saved = await get<SavedPassword>(PASSWORD + noteId, this.store);
        if (!saved) return null;
        return [noteId, decoder.decode(await decrypt(key, saved))] as const;
      }),
    );
    return new Map(passwords.filter((entry) => entry !== null));
  }

  async forget(noteId: string) {
    const { [noteId]: _, ...saved } = this.saved.value;
    this.saved.value = saved;
    await del(PASSWORD + noteId, this.store);
  }

  async clear() {
    this.key = null;
    this.saved.value = {};
    this.registered.value = false;
    await clear(this.store);
  }

  private async deriveKey() {
    const credentialId = await get<string>(CREDENTIAL, this.store);
    if (credentialId) return importPrfKey(await this.assert(credentialId));
    const created = await this.register();
    const id = toBase64(new Uint8Array(created.rawId));
    await set(CREDENTIAL, id, this.store);
    this.registered.value = true;
    if (prfSecret(created)) return importPrfKey(created);
    return importPrfKey(await this.assert(id));
  }

  private async register() {
    const credential = (await navigator.credentials.create({
      publicKey: {
        rp: { name: "cylip|notes" },
        user: {
          id: new TextEncoder().encode(this.account.id),
          name: this.account.email,
          displayName: this.account.name || this.account.email,
        },
        challenge: randomBytes(NOTE_PASSKEY.challengeLength),
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          residentKey: "preferred",
          userVerification: "required",
        },
        timeout: NOTE_PASSKEY.timeout,
        extensions: { prf: { eval: { first: prfSalt() } } },
      },
    })) as PublicKeyCredential | null;
    if (!credential) throw new Error("Passkey setup was cancelled.");
    const { prf } = credential.getClientExtensionResults();
    if (!prf?.enabled && !prf?.results) {
      throw new Error("This device's passkeys can't unlock notes.");
    }
    return credential;
  }

  private async assert(credentialId: string) {
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(NOTE_PASSKEY.challengeLength),
        allowCredentials: [
          { type: "public-key", id: fromBase64(credentialId) },
        ],
        userVerification: "required",
        timeout: NOTE_PASSKEY.timeout,
        extensions: { prf: { eval: { first: prfSalt() } } },
      },
    })) as PublicKeyCredential | null;
    if (!credential) throw new Error("Passkey check was cancelled.");
    return credential;
  }
}
