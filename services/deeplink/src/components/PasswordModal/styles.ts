import styled from '@emotion/styled';
import { css as ecss, keyframes } from '@emotion/core';
import { colors } from '../../styles/variables';

export const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
`;

export const Card = styled.div`
  width: 345px;
  border-radius: 6px;
  box-shadow: 0 2px 6px 0 rgba(219, 225, 237, 0.7);
  border: solid 1px #fbfcfe;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding: 15px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Input = styled.input`
  height: 34px;
  border-radius: 3px;
  border: solid 1px #c4c4c4;
  padding: 0 13px;
  margin: 18px 0 15px;
  &::placeholder {
    color: #666;
  }
`;

export const Title = styled.div`
  font-size: 16px;
`;

export const Button = styled.button`
  height: 32px;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
  cursor: pointer;
  padding: 0 20px;
  border: none;
  background-color: #fff;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const spinnerFrames = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div`
  margin: 5px 5px 5px;
  border-top: 3px solid ${colors.brand};
  border-right: 3px solid rgba(136, 136, 136, 0.2);
  border-bottom: 3px solid rgba(136, 136, 136, 0.2);
  border-left: 3px solid rgba(136, 136, 136, 0.2);
  animation: ${spinnerFrames} 0.9s linear infinite;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-block;
`;

export const SpinnerContainer = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
`;

export const ErrorText = styled.div`
  font-size: 12px;
  color: ${colors.warning};
  margin-bottom: 15px;
  line-height: 15px;
`;

const icon = ecss`
  cursor: pointer;
`;

const whitebutton = ecss`
  border: solid 1px #c4c4c4;
  color: #666;
  margin-right: 10px;
  &:hover {
    transition: all 0.3s ease;
    border-color: #000;
    color: #000;
  }
`;

const blackbutton = ecss`
  background-color: #cbcbcb;
  color: #7b7b7b;
  &:hover {
    transition: all 0.3s ease;
    background-color: #000;
    color: #fff;
  }
`;

export const css = {
  icon,
  whitebutton,
  blackbutton,
};
