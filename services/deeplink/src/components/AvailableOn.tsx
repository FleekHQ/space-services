import React from 'react';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faApple,
  faLinux,
  faWindows,
} from '@fortawesome/free-brands-svg-icons';
import { dimensions } from '../styles/variables';
import Container from './Container';

const Icon = styled(FontAwesomeIcon)`
  margin: 0 10px;
  font-size: ${dimensions.fontSize.large};
`;

const Paragraph = styled.p`
  font-size: ${dimensions.fontSize.regular}px;
  margin-bottom: 1em;
`;

const AvailableOn = () => (
  <Container>
    <Paragraph>Available on</Paragraph>
    <Icon icon={faApple} />
    <Icon icon={faWindows} />
    <Icon icon={faLinux} />
  </Container>
);

export default AvailableOn;
