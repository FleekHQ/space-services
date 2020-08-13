import styled from '@emotion/styled';
import { css as ecss } from '@emotion/core';

import recommendedIcon from '../../svgs/recommended.svg';

export const Title = styled.p`
  font-size: 28px;
  text-align: center;
  font-weight: 500;
  padding: 26px 0;
  line-height: 1.14;
`;

export const Card = styled.div`
  border-radius: 6px;
  border: solid 1px #fbfcfe;
  background-color: #fff;
  box-shadow: 0 2px 6px 0 rgba(219, 225, 237, 0.7);
  width: 100%;
`;

export const CardTitle = styled.p`
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0 18px 0;
  font-weight: 500;
`;

export const RecommendedIcon = styled(recommendedIcon)`
  width: 17px;
  margin-right: 6px;
`;

export const Button = styled.button`
  border-radius: 4px;
  border: none;
  cursor: pointer;
  height: 53px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-weight: 500;
  font-size: 18px;
`;

export const LineContainer = styled.div`
  display: block;
  position: relative;
  margin: 35px 0;
  width: 100%;
`;

export const Container = styled.div`
  max-width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  @media (max-width: 980px) {
    padding: 40px 10px;
  }
`;

const buttonblack = ecss`
  background-color: #000;
  font-size: 18px;
  color: #fff;
  &:hover {
    background-color: #4D4D4D;
    transition: all 0.3s ease;
  }
`;

const greentext = ecss`
  color: #00aa63;
`;

const spaceimage = ecss`
  width: 41px;
  margin-right: 14px;
`;

const cardsizing = ecss`
  padding: 18px 41px 21px;
  @media (max-width: 980px) {
    padding: 18px 21px 21px;;
  }
`;

const downloadicon = ecss`
  font-size: 32px;
  margin-right: 14px;
`;

const whitebutton = ecss`
  background-color: #fff;
  border: 1px solid #000;
  &:hover {
    background-color: #e6e6e6;
    transition: all 0.3s ease;
  }
`;

const line = ecss`
  width: 100%;
  height: 1px;
  background-color: #000;
`;

const ortext = ecss`
  width: 40px;
  background-color: #fff;
  font-size: 16px;
  padding: 0;
  margin: 0;
  height: 40px;
  position: absolute;
  top: -7px;
  left: calc(50% - 20px);
  text-align: center;
  font-weight: 500;
`;

const icon = ecss`
  width: 70px;
  height: 70px;
`;

export const css = {
  greentext,
  buttonblack,
  spaceimage,
  cardsizing,
  downloadicon,
  whitebutton,
  line,
  ortext,
  icon,
};
