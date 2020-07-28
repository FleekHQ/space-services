import React, { useState } from 'react';
import { Global } from '@emotion/core';
import { LeftSection, RightSection, PasswordModal } from './components';

import { Container, Section, globalStyles } from './styles';

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
