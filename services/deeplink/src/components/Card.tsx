import React from 'react';
import styled from '@emotion/styled';

import { widths } from '../styles/variables';
import { getEmSize } from '../styles/mixins';

const StyledCard = styled.div`
  box-shadow: 0 2px 6px 0 rgba(219, 225, 237, 0.7);
  border: solid 1px #fbfcfe;
  background-color: #ffffff;
  margin-left: auto;
  margin-right: auto;
  width: auto;
  max-width: ${getEmSize(widths.lg)}em;
  padding: 20px;
`;

export const Card: React.FC = ({ children, className }) => {
  return <StyledCard className={className}>{children}</StyledCard>;
};

export default Card;
