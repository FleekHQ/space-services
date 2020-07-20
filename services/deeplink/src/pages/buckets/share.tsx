import React, { useEffect } from 'react';
import { Link } from 'gatsby';
import styled from '@emotion/styled';

import Page from '../../components/Page';
import Button from '../../components/Button';
import Container from '../../components/Container';
import AvailableOn from '../../components/AvailableOn';
import IndexLayout from '../../layouts';
import withLocation from '../../hocs/withLocation';

const MainContainer = styled(Container)`
  text-align: center;
  padding-top: 176px;
  font-size: 22px;
`;

const Margin = styled.div`
  height: 25px;
`;

interface ShareBucketProps {
  search: {
    bucket?: string;
    multiaddr?: string;
    invitationid?: string;
    key?: string;
  };
}

const ShareBucket: React.FC<ShareBucketProps> = ({
  search,
}: ShareBucketProps) => {
  const { bucket, multiaddr, invitationid, key } = search;
  const deeplink = `space://buckets/share?bucket=${bucket}&multiaddr=${multiaddr}&invitationid=${invitationid}&key=${key}`;
  useEffect(() => {
    console.log('Attempting to open Space App...', deeplink);
    window.location = deeplink;
  });
  return (
    <IndexLayout>
      <Page>
        <MainContainer>
          <p>
            If you have Space installed, <a href={deeplink}>launch Space</a>.
          </p>
          <p>
            Otherwise,{' '}
            <Link to="https://space.storage/download">
              download and run Space
            </Link>
            .
          </p>
          <Margin />
          <Button primary>Download Space</Button>
          <Margin />
          <AvailableOn />
        </MainContainer>
      </Page>
    </IndexLayout>
  );
};

export default withLocation(ShareBucket);
