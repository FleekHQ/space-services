import * as React from 'react';
import styled from '@emotion/styled';
import { transparentize } from 'polished';
import { Link } from 'gatsby';
import Logo from '../svgs/logo.svg';

import { heights, dimensions, colors } from '../styles/variables';
import Container from './Container';

const StyledHeader = styled.header`
  height: ${heights.header}px;
  padding: ${dimensions.containerVerticalPadding}rem
    ${dimensions.containerPadding}rem;
  color: ${transparentize(0.5, colors.white)};
`;

const HeaderInner = styled(Container)`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  min-height: 28px;
`;

const HomepageLink = styled(Link)`
  color: ${colors.white};
  font-weight: ${dimensions.fontWeight.bold}px;

  &:hover,
  &:focus {
    text-decoration: none;
  }
`;

const StyledLogo = styled(Logo)`
  width: ${dimensions.logoWidth}px;
  display: inline-block;
  vertical-align: middle;
`;

interface HeaderProps {
  title: string;
}

const NavButtons = styled(Container)`
  float: right;
  margin: 0 0 0 auto;
`;

const NavButton = styled(Link)`
  margin: 0 0.8rem;
  color: ${colors.black};
  font-weight: 500;
  font-size: ${dimensions.fontSize.small}px;
  &:hover,
  &:focus {
    text-decoration: none;
  }
`;

const Header: React.FC<HeaderProps> = () => {
  return (
    <StyledHeader>
      <HeaderInner>
        <HomepageLink to="https://space.storage">
          <StyledLogo />
        </HomepageLink>
        <NavButtons>
          <NavButton to="https://space.storage/devs">Developers</NavButton>
          <NavButton to="https://space.storage/docs">Documentation</NavButton>
          <NavButton to="https://space.storage/blog">Blog</NavButton>
        </NavButtons>
      </HeaderInner>
    </StyledHeader>
  );
};

export default Header;
