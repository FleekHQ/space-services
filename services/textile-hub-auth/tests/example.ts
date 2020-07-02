import { Client } from '@textile/hub';

it('connects to textile hub correctly', async () => {
  const client = await Client.withKeyInfo(
    {
      key: 'bg3dxt46i6rhzcjkem73sr663he',
      secret: 'bezbekp2mkrjt74ddd4grvfjmff4mtnqt3q5fn5i',
      type: 1,
    },
    'http://textile-hub-dev.fleek.co:3007'
  );

  const random = await Client.randomIdentity();
  console.log('textile client created', random.public.toString());
  const token = await client.getTokenChallenge(
    random.public.toString(),
    async c => {
      const signature = await random.sign(c);
      console.log(signature);
      return signature;
      // console.log(signature);
      // return Promise.resolve(Buffer.from(signature));
    }
  );

  console.log(token);
});
