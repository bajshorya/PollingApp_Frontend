const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function base64UrlToUint8Array(base64Url: string) {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function uint8ArrayToBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function signupWithPasskey(username: string) {
  const startRes = await fetch(`${API_BASE}/register_start/${username}`, {
    method: "POST",
    credentials: "include",
  });
  if (!startRes.ok) throw new Error("Failed to start registration");

  const options = await startRes.json();

  options.publicKey.challenge = base64UrlToUint8Array(
    options.publicKey.challenge,
  );
  options.publicKey.user.id = base64UrlToUint8Array(options.publicKey.user.id);

  const credential = await navigator.credentials.create({
    publicKey: options.publicKey,
  });

  if (!credential) throw new Error("Passkey creation cancelled");

  const cred = credential as PublicKeyCredential;
  const attestation = cred.response as AuthenticatorAttestationResponse;

  const payload = {
    id: cred.id,
    rawId: uint8ArrayToBase64Url(new Uint8Array(cred.rawId)),
    type: cred.type,
    response: {
      attestationObject: uint8ArrayToBase64Url(
        new Uint8Array(attestation.attestationObject),
      ),
      clientDataJSON: uint8ArrayToBase64Url(
        new Uint8Array(attestation.clientDataJSON),
      ),
    },
  };

  const finishRes = await fetch(`${API_BASE}/register_finish`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!finishRes.ok) throw new Error("Registration failed");
  return finishRes.json();
}

export async function signinWithPasskey(username: string) {
  const startRes = await fetch(`${API_BASE}/login_start/${username}`, {
    method: "POST",
    credentials: "include",
  });
  if (!startRes.ok) throw new Error("Failed to start authentication");

  const options = await startRes.json();

  options.publicKey.challenge = base64UrlToUint8Array(
    options.publicKey.challenge,
  );

  if (options.publicKey.allowCredentials) {
    options.publicKey.allowCredentials = options.publicKey.allowCredentials.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cred: any) => ({
        ...cred,
        id: base64UrlToUint8Array(cred.id),
      }),
    );
  }

  const assertion = await navigator.credentials.get({
    publicKey: options.publicKey,
  });

  if (!assertion) throw new Error("Authentication cancelled");

  const cred = assertion as PublicKeyCredential;
  const auth = cred.response as AuthenticatorAssertionResponse;

  const payload = {
    id: cred.id,
    rawId: uint8ArrayToBase64Url(new Uint8Array(cred.rawId)),
    type: cred.type,
    response: {
      authenticatorData: uint8ArrayToBase64Url(
        new Uint8Array(auth.authenticatorData),
      ),
      clientDataJSON: uint8ArrayToBase64Url(
        new Uint8Array(auth.clientDataJSON),
      ),
      signature: uint8ArrayToBase64Url(new Uint8Array(auth.signature)),
    },
  };

  const finishRes = await fetch(`${API_BASE}/login_finish`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!finishRes.ok) throw new Error("Authentication failed");
  return finishRes.json();
}
