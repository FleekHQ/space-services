import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/core';

import LeftSection from '../../components/LeftSection';
import RightSection from '../../components/RightSection';
import PasswordModal from '../../components/PasswordModal';

const Container = styled.div`
  display: flex;
  height: 100%;
`;

const Section = styled.div`
  display: flex;
  width: 50%;
  align-items: center;
  justify-content: center;
`;

const globalStyles = css`
  html {
    height: 100%;
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
