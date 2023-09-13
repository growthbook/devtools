const fs = require("fs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function checkVersion() {
  const packageName = "@growthbook/growthbook"; // Replace this with the package name you want to check
  const packageJson = JSON.parse(fs.readFileSync("package.json"));
  const localVersion =
    packageJson.dependencies[packageName] ||
    packageJson.devDependencies[packageName];

  const response = await fetch(`https://registry.npmjs.org/${packageName}`);
  const data = await response.json();
  const latestVersion = data["dist-tags"].latest;

  if (localVersion !== latestVersion) {
    console.error(
      `The local version of @growthbook/growthbook (${localVersion}) is not the latest version ${latestVersion}.`
    );
    process.exit(1);
  }
}

checkVersion();
