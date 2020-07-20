import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'gatsby';
import styled from '@emotion/styled';

import Page from '../../components/Page';
import Button from '../../components/Button';
import Container from '../../components/Container';
import AvailableOn from '../../components/AvailableOn';
import IndexLayout from '../../layouts';
import withLocation from '../../hocs/withLocation';
import { downloadEncryptedFile } from '../../utils/downloadSharedFile';
import useQueryParams from '../../hooks/useQueryParams';

// required to support server side rendering on
const StreamSaver = typeof window !== 'undefined' ? require('streamsaver') : {};

const MainContainer = styled(Container)`
  text-align: center;
  padding-top: 176px;
  font-size: 22px;
`;

const Margin = styled.div`
  height: 25px;
`;

const Username = styled.div`
  font-size: 42px;
`;

const FilesList = styled.div`
  max-width: 280px;
  height: 55px;
  border-radius: 4px;
  border: solid 1px #e6e6e6;
  display: inline-block;
  padding: 15px 20px;
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
    <IndexLayout>
      <Page>
        <MainContainer>
          <Username>
            <b>{username ? `@${username}` : 'A Space user'}</b> shared
          </Username>
          <Margin />
          <FilesList>
            {/* TODO: Use FileIcon from external dependency */}
            {fname}
          </FilesList>
          <Margin />
          <p>
            If you have Space installed,{' '}
            <a href={deeplink}>open file in Space</a>.
          </p>
          <p>
            Otherwise,{' '}
            <Link to="https://space.storage/download">
              download Space and open file in Space.
            </Link>
            .
          </p>
          <Margin />
          {!downloadInProgress && (
            <Button primary onClick={onDownloadClicked}>
              Download File
            </Button>
          )}
          {downloadInProgress && (
            <div>
              Download in progress... Do not close your browser till download is
              done.
            </div>
          )}
          <Margin />
          <AvailableOn />
        </MainContainer>
      </Page>
    </IndexLayout>
  );
};

export default ShareFile;
