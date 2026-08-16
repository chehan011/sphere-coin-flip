import { Sphere } from "@unicitylabs/sphere-sdk";
import { createBrowserProviders } from "@unicitylabs/sphere-sdk/impl/browser";
import { createWalletApiProviders } from "@unicitylabs/sphere-sdk/impl/shared/wallet-api";
import { autoConnect } from "@unicitylabs/sphere-sdk/connect/browser";

let sphere: Sphere | null = null;

export async function getSphere() {
  if (sphere) return sphere;

  const base = createBrowserProviders({
    network: "testnet2",
    oracle: {
      apiKey: "YOUR_ORACLE_KEY",
    },
  });

  const providers = createWalletApiProviders(base, {
    baseUrl: "https://wallet-api.unicity.network",
    network: "testnet2",
    deviceId: "coin-flip-arena",
  });

  const result = await Sphere.init({
    ...providers,
    network: "testnet2",
    autoGenerate: true,
  });

  sphere = result.sphere;

  return sphere;
}

export async function connectSphereWallet() {
  const result = await autoConnect({
    dapp: {
      name: "Coin Flip Arena",
      description: "A Coin Flip Arena built with Unicity Sphere",
      url: window.location.origin,
    },

    walletUrl: "https://sphere.unicity.network",

    network: {
      id: 4,
      name: "testnet2",
    },

    permissions: [
      "identity:read",
      "balance:read",
    ],
  });

  console.log("Sphere Connect result:", result);

  return result; // <-- IMPORTANT
}