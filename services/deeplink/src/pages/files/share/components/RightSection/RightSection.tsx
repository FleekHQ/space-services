import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faApple } from '@fortawesome/free-brands-svg-icons/faApple';
import { faLinux } from '@fortawesome/free-brands-svg-icons/faLinux';
import { faWindows } from '@fortawesome/free-brands-svg-icons/faWindows';

import { Container, Title, Button, SubTitle, css } from './style';
import spaceLogo from '../../../../../images/space-logo.png';

export interface RightSectionProps {
  onDownloadSpace: () => void;
}

const RightSection: React.FC<RightSectionProps> = props => {
  const { onDownloadSpace } = props;

  return (
    <Container>
      <img src={spaceLogo} css={css.logo} alt="space-logo" />
      <Title>Don&apos;t have Space installed?</Title>
      <Button onClick={onDownloadSpace}>Download for Free</Button>
      <SubTitle>Available on</SubTitle>
      <div css={css.iconcontainer}>
        <FontAwesomeIcon icon={faApple} />
        <FontAwesomeIcon icon={faWindows} />
        <FontAwesomeIcon icon={faLinux} />
      </div>
    </Container>
  );
};

RightSection.propTypes = {
  onDownloadSpace: PropTypes.func.isRequired,
};

export default RightSection;
