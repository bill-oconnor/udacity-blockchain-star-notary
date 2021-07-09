import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    console.log("start!");
    const { web3 } = this;
    console.log({web3});
    window.web3 = web3;

    try {
      console.log("start trying!");
      // get contract instance
      const networkId = await new Promise(resolve => this.web3.eth.net.getId(resolve));
      console.log({networkId});
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      console.log({deployedNetwork});
      this.meta = new this.web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );
      console.log({meta: this.meta});

      // get accounts
      const accounts = await web3.eth.getAccounts();
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
    const starID = document.getElementById("lookid");
    if (starID) {
      const starName = await lookUptokenIdToStarInfo(starID);
      App.setStatus(`The name of the star with id=${starID} is ${starName}`);
    }
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    console.log("window.ethereum checks out");
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
    console.log("done enabling");
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"),);
  }
  console.log("starting App");
  App.start();
});