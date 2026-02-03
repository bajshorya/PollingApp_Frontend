const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

// WebAuthn registration
export async function signupWithPasskey(username: string) {
  if (!API_BASE) {
    throw new Error("API URL not configured");
  }
  const startRes = await fetch(`${API_BASE}/register_start/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!startRes.ok) throw new Error("Failed to start registration");

  const startData = await startRes.json();

  const options = startData.public_key || startData;
  const registration_state = startData.registration_state;
  const user_id = startData.user_id;

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
    credential: {
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
    },
    registration_state,
    user_id,
    username,
  };

  const finishRes = await fetch(`${API_BASE}/register_finish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!finishRes.ok) {
    const errorData = await finishRes.json();
    throw new Error(errorData.message || "Registration failed");
  }

  const finishData = await finishRes.json();

  if (finishData.access_token) {
    localStorage.setItem("auth_token", finishData.access_token);
  }

  return finishData;
}

export async function signinWithPasskey(username: string) {
  const startRes = await fetch(`${API_BASE}/login_start/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!startRes.ok) throw new Error("Failed to start authentication");

  const startData = await startRes.json();

  const options = startData.public_key || startData;
  const authentication_state = startData.authentication_state;
  const user_id = startData.user_id;

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
    credential: {
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
    },
    authentication_state,
    user_id,
    username,
  };

  const finishRes = await fetch(`${API_BASE}/login_finish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!finishRes.ok) {
    const errorData = await finishRes.json();
    throw new Error(errorData.message || "Authentication failed");
  }

  const finishData = await finishRes.json();

  if (finishData.access_token) {
    localStorage.setItem("auth_token", finishData.access_token);
  }

  return finishData;
}

export const fetchPolls = async () => {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(`${API_BASE}/polls`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch polls");
  }

  return response.json();
};
