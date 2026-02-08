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

export async function signupWithPasskey(username: string) {
  if (!API_BASE) {
    throw new Error("API URL not configured");
  }

  try {
    const startRes = await fetch(`${API_BASE}/register_start/${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!startRes.ok) {
      const errorData = await startRes.json().catch(() => ({}));

      if (startRes.status === 400) {
        if (
          errorData.message?.toLowerCase().includes("already exists") ||
          errorData.message?.toLowerCase().includes("already registered")
        ) {
          throw new Error(
            "Username already exists. Please choose a different username.",
          );
        }
      }

      if (startRes.status === 404) {
        throw new Error("User not found during registration start");
      }

      throw new Error(errorData.message || "Failed to start registration");
    }

    const startData = await startRes.json();

    const options = startData.public_key || startData;
    const registration_state = startData.registration_state;
    const user_id = startData.user_id;

    // If excludeCredentials is populated and non-empty, user already exists
    if (
      options.publicKey.excludeCredentials &&
      options.publicKey.excludeCredentials.length > 0
    ) {
      throw new Error(
        "Username already exists. Please choose a different username.",
      );
    }

    options.publicKey.challenge = base64UrlToUint8Array(
      options.publicKey.challenge,
    );
    options.publicKey.user.id = base64UrlToUint8Array(
      options.publicKey.user.id,
    );

    if (options.publicKey.excludeCredentials) {
      options.publicKey.excludeCredentials =
        options.publicKey.excludeCredentials.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (cred: any) => ({
            ...cred,
            id: base64UrlToUint8Array(cred.id),
          }),
        );
    }

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
      const errorData = await finishRes.json().catch(() => ({}));

      if (finishRes.status === 400) {
        if (
          errorData.message?.toLowerCase().includes("already exists") ||
          errorData.message?.toLowerCase().includes("duplicate")
        ) {
          throw new Error(
            "Username already exists. Please choose a different username.",
          );
        }
      }

      throw new Error(errorData.message || "Registration failed");
    }

    const finishData = await finishRes.json();

    if (finishData.access_token) {
      localStorage.setItem("auth_token", finishData.access_token);
    }

    return finishData;
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message;
      if (
        errorMessage.includes("The operation either timed out") ||
        errorMessage.includes("https://www.w3.org/TR/webauthn")
      ) {
        throw new Error(
          "Passkey creation timed out or was cancelled. Please try again.",
        );
      }
      throw error;
    }
    throw new Error("Registration failed. Please try again.");
  }
}

export async function signinWithPasskey(username: string) {
  try {
    const startRes = await fetch(`${API_BASE}/login_start/${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!startRes.ok) {
      const errorData = await startRes.json().catch(() => ({}));

      if (startRes.status === 404) {
        throw new Error("User does not exist. Please check your username.");
      }

      if (startRes.status === 400) {
        throw new Error(errorData.message || "Invalid username format.");
      }

      throw new Error(errorData.message || "Failed to start authentication");
    }

    const startData = await startRes.json();

    const options = startData.public_key || startData;
    const authentication_state = startData.authentication_state;
    const user_id = startData.user_id;

    options.publicKey.challenge = base64UrlToUint8Array(
      options.publicKey.challenge,
    );

    if (options.publicKey.allowCredentials) {
      options.publicKey.allowCredentials =
        options.publicKey.allowCredentials.map(
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
      const errorData = await finishRes.json().catch(() => ({}));

      if (finishRes.status === 401) {
        if (
          errorData.message?.toLowerCase().includes("passkey") ||
          errorData.message?.toLowerCase().includes("credential")
        ) {
          throw new Error(
            "Passkey invalid or not registered. Please register a passkey first.",
          );
        }
        throw new Error(
          "Authentication failed. Please check your passkey and try again.",
        );
      }

      if (finishRes.status === 404) {
        throw new Error("User or passkey not found.");
      }

      throw new Error(errorData.message || "Authentication failed");
    }

    const finishData = await finishRes.json();

    if (finishData.access_token) {
      localStorage.setItem("auth_token", finishData.access_token);
    }

    return finishData;
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message;
      if (
        errorMessage.includes("The operation either timed out") ||
        errorMessage.includes("https://www.w3.org/TR/webauthn")
      ) {
        throw new Error(
          "Passkey authentication timed out or was cancelled. Please try again.",
        );
      }
      throw error;
    }
    throw new Error("Authentication failed. Please try again.");
  }
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
