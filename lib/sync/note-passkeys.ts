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

type Options = {
  account: { id: string; email: string; name: string };
  knownCredentialIds: () => string[];
  saveCredentialId: (credentialId: string) => Promise<void>;
};

type SavedPassword = Sealed & { lockedAt: number; credentialId: string };

type UnlockKey = { key: CryptoKey; credentialId: string };

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

const credentialIdOf = (credential: PublicKeyCredential) =>
  toBase64(new Uint8Array(credential.rawId));

const toDescriptors = (credentialIds: string[]) =>
  credentialIds.map((id) => ({
    type: "public-key" as const,
    id: fromBase64(id),
  }));

const isSupported = async () => {
  if (!window.PublicKeyCredential?.getClientCapabilities) return false;
  const capabilities = await PublicKeyCredential.getClientCapabilities();
  return !!capabilities["extension:prf"];
};

export class NotePasskeys {
  readonly supported = shallowRef(false);
  readonly saved = shallowRef<Record<string, number>>({});
  private store: UseStore;
  private unlockKey: Promise<UnlockKey> | null = null;

  constructor(private options: Options) {
    this.store = createStore(
      STORAGE_NAMES.passkeys(options.account.id),
      "passkeys",
    );
  }

  async load(lockedAtOf: LockedAtOf) {
    this.supported.value = await isSupported().catch(() => false);
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

  setUp() {
    return this.unlock({ allowCreate: true });
  }

  async remember(noteId: string, lockedAt: number, password: string) {
    const { key, credentialId } = await this.setUp();
    const sealed = await encrypt(key, new TextEncoder().encode(password));
    await set(
      PASSWORD + noteId,
      { ...sealed, lockedAt, credentialId } satisfies SavedPassword,
      this.store,
    );
    this.saved.value = { ...this.saved.value, [noteId]: lockedAt };
  }

  async recall(noteIds: string[]) {
    const unlockKey = await this.unlock({ allowCreate: false });
    const passwords = await Promise.all(
      noteIds.map((noteId) => this.recallPassword(noteId, unlockKey)),
    );
    return new Map(passwords.filter((entry) => entry !== null));
  }

  async forget(noteId: string) {
    const { [noteId]: _, ...saved } = this.saved.value;
    this.saved.value = saved;
    await del(PASSWORD + noteId, this.store);
  }

  async clear() {
    this.unlockKey = null;
    this.saved.value = {};
    await clear(this.store);
  }

  private async recallPassword(
    noteId: string,
    { key, credentialId }: UnlockKey,
  ) {
    const saved = await get<SavedPassword>(PASSWORD + noteId, this.store);
    const password =
      saved?.credentialId === credentialId
        ? await decrypt(key, saved).catch(() => null)
        : null;
    if (!password) {
      await this.forget(noteId);
      return null;
    }
    return [noteId, new TextDecoder().decode(password)] as const;
  }

  private unlock({ allowCreate }: { allowCreate: boolean }) {
    this.unlockKey ??= this.findOrCreate(allowCreate).catch((error) => {
      this.unlockKey = null;
      throw error;
    });
    return this.unlockKey;
  }

  private async findOrCreate(allowCreate: boolean) {
    const knownIds = await this.knownCredentialIds();
    if (!allowCreate) {
      if (!knownIds.length) throw new Error("No passkey is set up yet.");
      return this.use(await this.assert(knownIds));
    }
    const existing = knownIds.length
      ? await this.assert(knownIds).catch(() => null)
      : null;
    if (existing) return this.use(existing);
    const created = await this.register(knownIds);
    if (prfSecret(created)) return this.use(created);
    return this.use(await this.assert([credentialIdOf(created)]));
  }

  private async knownCredentialIds() {
    const local = await get<string>(CREDENTIAL, this.store);
    const known = this.options.knownCredentialIds();
    return [...new Set(local ? [local, ...known] : known)];
  }

  private async use(credential: PublicKeyCredential): Promise<UnlockKey> {
    const credentialId = credentialIdOf(credential);
    const key = await importPrfKey(credential);
    await set(CREDENTIAL, credentialId, this.store);
    if (!this.options.knownCredentialIds().includes(credentialId)) {
      this.options.saveCredentialId(credentialId).catch(() => {});
    }
    return { key, credentialId };
  }

  private async register(excludeIds: string[]) {
    const { account } = this.options;
    const credential = (await navigator.credentials
      .create({
        publicKey: {
          rp: { name: "cylip|notes" },
          user: {
            id: randomBytes(NOTE_PASSKEY.userIdLength),
            name: account.email,
            displayName: account.name || account.email,
          },
          challenge: randomBytes(NOTE_PASSKEY.challengeLength),
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          excludeCredentials: toDescriptors(excludeIds),
          authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "required",
          },
          timeout: NOTE_PASSKEY.timeout,
          extensions: { prf: { eval: { first: prfSalt() } } },
        },
      })
      .catch((error) => {
        if (error?.name !== "InvalidStateError") throw error;
        throw new Error(
          "This device already has a passkey for locked notes. Use it instead.",
        );
      })) as PublicKeyCredential | null;
    if (!credential) throw new Error("Passkey setup was cancelled.");
    const { prf } = credential.getClientExtensionResults();
    if (!prf?.enabled && !prf?.results) {
      throw new Error("This device's passkeys can't unlock notes.");
    }
    return credential;
  }

  private async assert(credentialIds: string[]) {
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: randomBytes(NOTE_PASSKEY.challengeLength),
        allowCredentials: toDescriptors(credentialIds),
        userVerification: "required",
        timeout: NOTE_PASSKEY.timeout,
        extensions: { prf: { eval: { first: prfSalt() } } },
      },
    })) as PublicKeyCredential | null;
    if (!credential) throw new Error("Passkey check was cancelled.");
    return credential;
  }
}
