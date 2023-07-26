const scriptTag = document.createElement("script");

scriptTag.src = "https://sdk.openui5.org/resources/sap-ui-core.js";

let promResolve: () => void;
const prom = new Promise<void>((resolve) => {
  promResolve = resolve;
});

scriptTag.onload = () => {
  promResolve();
};

document.body.appendChild(scriptTag);

await prom;
