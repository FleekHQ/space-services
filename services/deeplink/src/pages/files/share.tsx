import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/core';

import normalize from '../../styles/normalize';
import LeftSection from '../../components/LeftSection';
import RightSection from '../../components/RightSection';
import PasswordModal from '../../components/PasswordModal';

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

/* eslint-disable no-console, @typescript-eslint/explicit-function-return-type */
const ShareView: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

  const closeModal = () => setOpenModal(false);

  const onDownloadFile = () => setOpenModal(true);

  // TODO: implement
  const onOpenFileInSpace = () => console.log('open file in space');

  // TODO: implement
  const onDownloadSpace = () => console.log('download space');

  // TODO: implement
  const onFormCompleted = (password: string): void => {
    console.log(password);
    setOpenModal(false);
  };

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
          <RightSection onDownloadSpace={onDownloadSpace} />
        </Section>
      </Container>
    </>
  );
};

export default ShareView;
