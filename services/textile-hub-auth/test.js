const EthCrypto = require('eth-crypto');

const publicKey =
  '9ffb61c036050674ce20ec646d7b43689b0d41ca2d30789ba6832cf9bdb8f308719e182ec6bf062985a4df7f9137070afc14d0143563f116001be3de202143fb';
const privateKey =
  '0x2b5d9595fa38eeef97168c0e0f8d5589948ba63ff24936cd8e0c1912e35abcd9';

// const address = '  ';
// const addr = EthCrypto.publicKey.toAddress(publicKey);
// console.log('address matching', addr === address);

const pubkey = EthCrypto.publicKeyByPrivateKey(privateKey);

console.log('pubkey match', pubkey === publicKey);

// const WebSocket = require('ws');

// const ws = new WebSocket(
//   'wss://gqo1oqz055.execute-api.us-west-2.amazonaws.com/dev'
// );

// ws.on('open', function open() {
//   ws.send(
//     JSON.stringify({
//       action: 'ethToken',
//       data: {
//         pubkey: publicKey,
//       },
//     })
//   );
// });

// ws.on('message', async function incoming(data) {
//   const obj = JSON.parse(data);

//   if (obj.type === 'challenge') {
//     const sig = await EthCrypto.decryptWithPrivateKey(privateKey, obj.value);

//     console.log('sending signature', sig);

//     ws.send(
//       JSON.stringify({
//         action: 'challenge',
//         data: {
//           pubkey: publicKey,
//           sig,
//         },
//       })
//     );
//   } else if (obj.type === 'ethToken') {
//     console.log('received', obj);
//   } else {
//     console.log('unexpected response', obj);
//   }
// });
