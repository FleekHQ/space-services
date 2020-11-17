import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple } from '@fortawesome/free-brands-svg-icons/faApple';
import { faLinux } from '@fortawesome/free-brands-svg-icons/faLinux';
import { faWindows } from '@fortawesome/free-brands-svg-icons/faWindows';

import { Container, Title, Button, SubTitle, css } from './style';
import spaceLogo from '../../images/space-logo.png';

const RightSection: React.FC = () => {
  return (
    <Container>
      <img src={spaceLogo} css={css.logo} alt="space-logo" />
      <Title>Don&apos;t have Space installed?</Title>
      <a href="https://github.com/FleekHQ/space-desktop/releases/latest" target="_blank" rel="noreferrer">
        <Button>Download for Free</Button>
      </a>
      <SubTitle>Available on</SubTitle>
      <div css={css.iconcontainer}>
        <FontAwesomeIcon icon={faApple} />
        <FontAwesomeIcon icon={faWindows} />
        <FontAwesomeIcon icon={faLinux} />
      </div>
    </Container>
  );
};

export default RightSection;
