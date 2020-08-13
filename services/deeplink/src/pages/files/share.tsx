import React, { useState, useCallback, useEffect } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/core';

import normalize from '../../styles/normalize';
import LeftSection from '../../components/LeftSection';
import RightSection from '../../components/RightSection';
import PasswordModal from '../../components/PasswordModal';
import { useQueryParams } from '../../hooks/useQueryParams';
import {
  downloadEncryptedFile,
  writeDecodedData,
} from '../../utils/downloadShareFile';

// required to support server side rendering on gatsby
const StreamSaver = typeof window !== 'undefined' ? require('streamsaver') : {};

const Container = styled.div`
  display: flex;
  height: 100%;
  background-color: #f6f8fc;
  @media (max-width: 980px) {
    flex-direction: column;
  }
`;

const Section = styled.div`
  display: flex;
  width: 50%;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  @media (max-width: 980px) {
    width: 100%;
  }
`;

const globalStyles = css`
  html {
    height: 100%;
    @media (max-width: 980px) {
      height: auto;
    }
  }

  body,
  body > div,
  body > div > div {
    height: 100%;
  }
`;

interface SharedFileQueryParams {
  fname?: string;
  hash?: string;
}

/* eslint-disable no-console, @typescript-eslint/explicit-function-return-type */
const ShareView: React.FC = () => {
  const queryParams = useQueryParams() as SharedFileQueryParams;
  const { fname, hash } = queryParams;
  const deeplink = `space://files/share?fname=${fname}&hash=${hash}`;
  const [openModal, setOpenModal] = useState(false);
  const [saveWriter, setSaveWriter] = useState();
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  const closeModal = useCallback(() => setOpenModal(false), [setOpenModal]);

  const onDownloadFile = useCallback(() => setOpenModal(true), [setOpenModal]);

  const onOpenFileInSpace = useCallback(() => {
    window.location = deeplink;
  }, [deeplink]);

  // TODO: implement
  const onFormCompleted = useCallback(
    (password: string): void => {
      if (downloadInProgress) {
        return;
      }
      setOpenModal(false);
      setDownloadInProgress(true);

      downloadEncryptedFile(hash, password)
        .then(result => {
          const saveWriteStream = StreamSaver.createWriteStream(fname, {
            size: result.encryptedData.byteLength,
          });
          const saveStreamWriter = saveWriteStream.getWriter();
          setSaveWriter(saveStreamWriter);

          return writeDecodedData(
            result.key,
            result.iv,
            result.encryptedData,
            saveStreamWriter
          ).then(() => {
            saveStreamWriter.close();
          });
        })
        .catch(err => {
          // TODO: Show nice error message
          alert(`${err.message}`);
        })
        .finally(() => {
          setDownloadInProgress(false);
        });
    },
    [fname, hash, setSaveWriter, saveWriter]
  );

  useEffect(() => {
    // abort so it dose not look stuck
    window.onunload = (): void => {
      if (saveWriter) {
        saveWriter.abort();
      }
    };
  }, [saveWriter]);

  return (
    <>
      <Global styles={globalStyles} />
      <Global styles={css(normalize)} />
      <PasswordModal
        open={openModal}
        onCancel={closeModal}
        onOuterClick={closeModal}
        onOpen={onFormCompleted}
        onClose={closeModal}
      />
      <Container>
        <Section>
          <LeftSection
            onDownloadFile={onDownloadFile}
            onOpenFileInSpace={onOpenFileInSpace}
          />
        </Section>
        <Section>
          <RightSection />
        </Section>
      </Container>
    </>
  );
};

export default ShareView;
