import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'gatsby';
import styled from '@emotion/styled';

import Page from '../../components/Page';
import Button, { BlackButton, WhiteButton } from '../../components/Button';
import Container from '../../components/Container';
import AvailableOn from '../../components/AvailableOn';
import { Card } from '../../components/Card';
import Logo from '../../images/logo.svg';
import RecommendedIcon from '../../images/recommended.svg';
import StandaloneLayout from '../../layouts/standalone';
import { downloadEncryptedFile } from '../../utils/downloadSharedFile';
import { useQueryParams } from '../../hooks/useQueryParams';

// required to support server side rendering on gatsby
const StreamSaver = typeof window !== 'undefined' ? require('streamsaver') : {};

const MainSection = styled(Container)`
  text-align: center;
  padding-top: 176px;
  font-size: 22px;
  max-width: 352px;
  min-height: 100vh;
  line-height: 32px;
`;

const DownloadSection = styled.div`
  text-align: center;
  padding-top: 176px;
  font-size: 22px;
  line-height: 32px;
  min-height: 100vh;
  background-color: #f6f8fc;
`;

const Margin = styled.div`
  height: 25px;
`;

const Description = styled.div`
  font-size: 28px;
`;

const FilesList = styled.div`
  max-width: 280px;
  height: 55px;
  border-radius: 4px;
  border: solid 1px #e6e6e6;
  display: inline-block;
  padding: 15px 20px;
`;

const StyledRecommendedText = styled.div`
  font-size: 16px;
  color: #00aa63;
  margin-bottom: 17px;
`;

const StyledRecommendedIcon = styled(RecommendedIcon)`
  vertical-align: text-bottom;
`;

const NotSecureTextStyle = styled.div`
  font-size: 16px;
  margin-bottom: 17px;
`;

interface SharedFileQueryParams {
  fname?: string;
  hash?: string;
  key?: string;
  username?: string;
}

const ShareFile: React.FC = () => {
  const queryParams = useQueryParams() as SharedFileQueryParams;
  const { fname, hash, key, username } = queryParams;
  const deeplink = `space://files/share?fname=${fname}&hash=${hash}&key=${key}`;
  const [saveWriter, setSaveWriter] = useState();
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  const onDownloadClicked = useCallback(() => {
    if (downloadInProgress) {
      alert('Download already in progress.');
      return;
    }
    setDownloadInProgress(true);

    const saveWriteStream = StreamSaver.createWriteStream(fname, {});
    const saveStreamWriter = saveWriteStream.getWriter();
    setSaveWriter(saveWriter);
    downloadEncryptedFile(hash, key, saveStreamWriter)
      .then(() => {
        saveStreamWriter.close();
      })
      .catch(() => {
        // TODO: Show nice error message
        alert(
          'An error occurred while downloading. Try again or download space app'
        );
      })
      .finally(() => {
        setDownloadInProgress(false);
      });
  }, [hash, key]);

  useEffect(() => {
    window.location = deeplink;
  }, [queryParams]);
  useEffect(() => {
    // abort so it dose not look stuck
    window.onunload = (): void => {
      if (saveWriter) {
        saveWriter.abort();
      }
    };
  }, [saveWriter]);

  return (
    <StandaloneLayout>
      <MainSection>
        <Margin />
        <FilesList>
          {/* TODO: Use FileIcon from external dependency */}
          {fname}
        </FilesList>
        <Margin />
        <Description>
          <b>{username ? `@${username}` : 'Private Sender'}</b> is sharing a{' '}
          <b>Private File</b> with you
        </Description>
        <Margin />
        <Card>
          <StyledRecommendedText>
            <StyledRecommendedIcon /> Recommended
          </StyledRecommendedText>
          <a href={deeplink}>
            <BlackButton>Open File in Space</BlackButton>
          </a>
        </Card>
        <Margin />
        or
        <Margin />
        <Card>
          <NotSecureTextStyle>Not as secure</NotSecureTextStyle>
          {!downloadInProgress && (
            <WhiteButton onClick={onDownloadClicked}>Download File</WhiteButton>
          )}
          {downloadInProgress && (
            <div>
              Download in progress... Do not close your browser till download is
              done.
            </div>
          )}
        </Card>
      </MainSection>
      <DownloadSection>
        <Logo />
        <Margin />
        Don't have Space installed?
        <Margin />
        <Link to="https://space.storage/download">
          <Button primary>Download for Free</Button>
        </Link>
        <AvailableOn />
      </DownloadSection>
    </StandaloneLayout>
  );
};

export default ShareFile;
