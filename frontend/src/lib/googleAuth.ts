"use client";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function loadGoogleAuthScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.google?.accounts?.id) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve(Boolean(window.google?.accounts?.id));
        return;
      }

      existingScript.addEventListener("load", () => resolve(Boolean(window.google?.accounts?.id)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve(Boolean(window.google?.accounts?.id));
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function promptGoogleSignIn(
  role: "student" | "alumni",
  onCredential: (credential: string) => Promise<void>
): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Google sign-in is not configured for this deployment.");
  }

  const isReady = await loadGoogleAuthScript();

  if (!isReady || !window.google?.accounts?.id) {
    throw new Error("Google sign-in is not available right now.");
  }

  return new Promise<void>((resolve, reject) => {
    window.google?.accounts?.id?.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          if (!response.credential) {
            reject(new Error("Google sign-in was cancelled."));
            return;
          }

          await onCredential(response.credential);
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Google sign-in failed."));
        }
      },
    });

    window.google?.accounts?.id?.prompt();
  });
}
