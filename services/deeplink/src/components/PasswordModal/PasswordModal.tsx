import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-light-svg-icons/faTimes';
import { faEyeSlash } from '@fortawesome/pro-regular-svg-icons/faEyeSlash';
import { faEye } from '@fortawesome/pro-regular-svg-icons/faEye';

import {
  css,
  Card,
  Title,
  Input,
  Header,
  Button,
  Container,
  ButtonContainer,
  Spinner,
  SpinnerContainer,
  ErrorText,
  IconButton,
  InputWrapper,
} from './styles';

export interface PasswordModalProps {
  open: boolean;
  onOpen: (password: string) => void;
  onCancel: () => void;
  onOuterClick: () => void;
  onClose: () => void;
  loading: boolean;
  loadingText: string;
  errorText?: string;
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const PasswordModal: React.FC<PasswordModalProps> = props => {
  const {
    open,
    onOpen,
    onCancel,
    onClose,
    onOuterClick,
    loading,
    loadingText,
    errorText,
  } = props;

  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (!open) return null;

  return (
    <Container onClick={onOuterClick}>
      <Card onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Enter File Password</Title>
          <FontAwesomeIcon icon={faTimes} css={css.icon} onClick={onClose} />
        </Header>
        <InputWrapper>
          <Input
            placeholder="File Password"
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <IconButton
            onClick={() => setIsPasswordVisible(state => !state)}
          >
            <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
          </IconButton>
        </InputWrapper>
        {<ErrorText>{errorText}</ErrorText>}
        {!loading && (
          <ButtonContainer>
            <Button css={css.whitebutton} onClick={onCancel}>
              Cancel
            </Button>
            <Button
              css={css.blackbutton}
              onClick={() => onOpen(password)}
              disabled={!password}
            >
              Open
            </Button>
          </ButtonContainer>
        )}
        {loading && (
          <SpinnerContainer>
            <Spinner /> {loadingText}
          </SpinnerContainer>
        )}
      </Card>
    </Container>
  );
};

PasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOuterClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  loadingText: PropTypes.string.isRequired,
  errorText: PropTypes.string,
};

export default PasswordModal;
