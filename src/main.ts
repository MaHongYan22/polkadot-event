import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';  
import { KeyringPair } from '@polkadot/keyring/types';
import { metadata } from '@polkadot/types/interfaces/essentials'
const WS_ADDRESS = "ws://127.0.0.1:9944";
const connectSubstrate = async ()=> {
  const wsProvider = new WsProvider(WS_ADDRESS);
  const api = await ApiPromise.create({ provider: wsProvider,types:{}})
  await api.isReady;
  console.log("connection to substrate is OK.")
  return api;
}



const subscribeAliceAndBob = async (api:ApiPromise) => {
  const keyring = new Keyring({type:'sr25519'})
  const alice = keyring.addFromUri('//Alice')
  await api.query.system.account(alice.address, (aliceAcc: { data: { free: any; }; }) => {
      console.log("Subscribe to Alice account")
      const aliceFreeSub = aliceAcc.data.free;
      console.log(`Alice Account (sub): ${aliceFreeSub}`)
  })
}
const subscribeEvents = async (api:ApiPromise) => {

api.query.system.events((events: any[]) => {
  console.log(`\nReceived ${events.length} events:`);


  events.forEach((record) => {
    
    const { event, phase } = record;
    const types = event.typeDef;

   
    console.log(`\t${event.section}:${event.method}:: (phase=${phase})`);
    console.log(`\t\t${event.meta.documentation}`);

   
    event.data.forEach((data: { toString: () => any; }, index: string | number) => {
      console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
    });
  });
});
}
const sleep = async (time:number) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

const main = async ()=> {
  const api = await connectSubstrate();
 
  await subscribeAliceAndBob(api)
  await subscribeEvents(api)
  await sleep(600000)

  console.log("successfuly exit")
}
main().then(()=> {
  console.log("connection succefully!")
  process.exit(0)
}).catch((err)=> {
  console.log("connection failed: " + err)
  process.exit(1)
})
