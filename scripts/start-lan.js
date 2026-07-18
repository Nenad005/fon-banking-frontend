const dgram = require("node:dgram");
const { isIP } = require("node:net");
const { networkInterfaces } = require("node:os");
const { spawn } = require("node:child_process");

const API_PORT = 8000;
const API_PATH = "/api/v1";
const PRINT_URL_FLAG = "--print-api-url";

const isUsableIpv4 = (address) =>
  isIP(address) === 4 && !address.startsWith("127.") && address !== "0.0.0.0";

const detectDefaultRouteIpv4 = () =>
  new Promise((resolve) => {
    const socket = dgram.createSocket("udp4");

    socket.once("error", () => {
      socket.close();
      resolve(null);
    });

    // No request is sent; connecting lets the OS select the active default route.
    socket.connect(53, "1.1.1.1", () => {
      const address = socket.address().address;
      socket.close();
      resolve(isUsableIpv4(address) ? address : null);
    });
  });

const getFallbackIpv4 = () => {
  const candidates = Object.entries(networkInterfaces()).flatMap(
    ([name, addresses]) =>
      (addresses ?? [])
        .filter(
          (address) =>
            address.family === "IPv4" &&
            !address.internal &&
            isUsableIpv4(address.address),
        )
        .map((address) => ({ name, address: address.address })),
  );

  if (candidates.length === 1) {
    return candidates[0].address;
  }

  if (candidates.length > 1) {
    const choices = candidates
      .map(({ name, address }) => `${name}: ${address}`)
      .join(", ");
    throw new Error(
      `Could not determine the active network interface. Set LAN_IP explicitly. Found: ${choices}`,
    );
  }

  throw new Error("No non-loopback IPv4 network interface was found.");
};

const main = async () => {
  const override = process.env.LAN_IP;

  if (override && !isUsableIpv4(override)) {
    throw new Error(`LAN_IP is not a valid non-loopback IPv4 address: ${override}`);
  }

  const address = override ?? (await detectDefaultRouteIpv4()) ?? getFallbackIpv4();
  const apiUrl = `http://${address}:${API_PORT}${API_PATH}`;
  const expoArgs = process.argv.slice(2).filter((arg) => arg !== PRINT_URL_FLAG);

  if (process.argv.includes(PRINT_URL_FLAG)) {
    console.log(apiUrl);
    return;
  }

  console.log(`Detected LAN address: ${address}`);
  console.log(`API URL: ${apiUrl}`);
  console.log("Starting Expo...");

  const expo = spawn(
    process.execPath,
    [require.resolve("expo/bin/cli"), "start", "--lan", ...expoArgs],
    {
      env: {
        ...process.env,
        EXPO_PUBLIC_API_URL: apiUrl,
      },
      stdio: "inherit",
    },
  );

  expo.once("error", (error) => {
    console.error(`Failed to start Expo: ${error.message}`);
    process.exitCode = 1;
  });

  expo.once("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exitCode = code ?? 1;
  });
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
