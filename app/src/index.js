import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";
import detectEthereumProvider from "@metamask/detect-provider";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    console.log("start!");
    const { web3 } = this;
    console.log({web3});

    try {
      console.log("start trying!");
      // get contract instance
      const networkId = 4;//await window.web3.eth.net.getId();
      console.log({networkId});
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      console.log({deployedNetwork});
      this.meta = new this.web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );
      console.log({meta: this.meta});
      window.Contract = this.meta;

      // get accounts
      const accounts = (await ethereum.request({ method: "eth_requestAccounts" }));
      console.log(accounts);
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
      console.error(error);
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    await createStar(name, id).send({from: this.account});
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    const starIDInput = document.getElementById("lookid");
    const starID = starIDInput && starIDInput.value;
    if (starID) {
      const starName = await lookUptokenIdToStarInfo(starID).call();
      App.setStatus(`The name of the star with id=${starID} is ${starName}`);
    }
  }

};

window.App = App;

window.addEventListener("load", async function() {
  const provider = await detectEthereumProvider();
  if (provider) {
    // use MetaMask's provider
    console.log("window.ethereum checks out");
    const web3 = new Web3(provider);
    window.web3 = web3;
    App.web3 = web3;
    const accounts = await provider.enable(); // get permission to access accounts
    console.log("done enabling");
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const validConnection = accounts.length > 0;
    console.log({validConnection, chainId});
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }
  console.log("starting App");
  App.start();
});