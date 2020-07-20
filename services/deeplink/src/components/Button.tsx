import React from 'react';
import styled from '@emotion/styled';
import { dimensions, colors } from '../styles/variables';

const StyledButton = styled.button`
  padding: 0.9rem 2rem;
  font-size: ${dimensions.fontSize.regular}px;
  font-weight: ${dimensions.fontWeight.bold};
  background-color: ${props =>
    props.primary ? colors.brand : colors.secondary};
  color: ${colors.white};
  border-radius: 4px;
  margin-bottom: 1rem;
  cursor: pointer;
  &:hover,
  &:focus {
    background-color: ${props =>
      props.primary ? colors.lightPrimary : colors.lightSecondary};
  }

  transition: background-color 0.2s ease-in-out;
`;

interface ButtonProps {
  primary?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, primary, onClick }) => (
  <StyledButton primary={primary} onClick={onClick}>
    {children}
  </StyledButton>
);

export default Button;
