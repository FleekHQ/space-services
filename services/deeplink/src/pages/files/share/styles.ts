import styled from '@emotion/styled';
import { css } from '@emotion/core';

export const Container = styled.div`
  display: flex;
  height: 100%;
`;

export const Section = styled.div`
  display: flex;
  width: 50%;
  align-items: center;
  justify-content: center;
`;

export const globalStyles = css`
  html {
    height: 100%;
  }

  body,
  body > div,
  body > div > div {
    height: 100%;
  }
`;
