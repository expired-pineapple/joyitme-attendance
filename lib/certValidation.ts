export function extractCertificateInfo() {
    return new Promise((resolve, reject) => {
      if (window.crypto && window.crypto.subtle) {
        navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            rpId: window.location.hostname,
            userVerification: "required",
          }
        }).then(credential => {
            // @ts-ignore
          const publicKey = credential?.response.publicKey;
          window.crypto.subtle.importKey(
            "spki",
            publicKey,
            {
              name: "RSASSA-PKCS1-v1_5",
              hash: "SHA-256",
            },
            true,
            ["verify"]
          ).then(key => {
            window.crypto.subtle.exportKey("jwk", key).then(jwk => {
              resolve({
                id: credential?.id,
                type: credential?.type,
               
                publicKey: {
                  kty: jwk.kty,
                  n: jwk.n,
                  e: jwk.e
                }
              });
            });
          });
        }).catch(err => {
          reject('No valid certificate found or access denied');
        });
      } else {
        reject('Web Crypto API not supported');
      }
    });
  }