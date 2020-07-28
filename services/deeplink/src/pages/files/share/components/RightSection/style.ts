import styled from '@emotion/styled';
import { css as ecss } from '@emotion/core';

export const Container = styled.div`
  background-color: #f6f8fc;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  flex-direction: column;
`;

export const Title = styled.p`
  font-size: 28px;
  font-weight: 500;
  margin: 0;
  padding: 0;
`;

export const Button = styled.button`
  height: 53px;
  border-radius: 4px;
  background-color: #006eff;
  color: #fff;
  font-size: 18px;
  width: 220px;
  border: none;
  cursor: pointer;
  margin: 32px 0 21px 0;
  font-weight: 500;
  &:hover {
    transition: all 0.3s ease;
    background-color: #0055e6;
  }
`;

export const SubTitle = styled.p`
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 8px 0;
  padding: 0;
`;

const logo = ecss`
  height: 51px;
  margin-bottom: 31px;
`;

const iconcontainer = ecss`
  font-size: 23px;
  & > *:not(:last-child) {
    margin-right: 18px;
  }
`;

export const css = {
  logo,
  iconcontainer,
};
