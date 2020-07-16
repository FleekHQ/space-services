import React, { useEffect } from 'react';

import Page from '../../components/Page';
import Container from '../../components/Container';
import IndexLayout from '../../layouts';

const ShareBucket = () => {
  const deeplink = `space://buckets/share?q1=123`;
  useEffect(() => {
    console.log('Attempting to open Space App...');
    window.location = deeplink;
  });
  return (
    <IndexLayout>
      <Page>
        <Container>
          <h3>
            If you have Space installed, <a href={deeplink}>launch Space</a>.
          </h3>
          <h3>
            Otherwise, <a>download and run Space</a>.
          </h3>
        </Container>
      </Page>
    </IndexLayout>
  );
};

export default ShareBucket;
