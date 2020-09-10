import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/pro-light-svg-icons/faDownload';

import FileIcon from '../FileIcon';
import space from '../../images/space.png';

import {
  css,
  Card,
  Title,
  Button,
  Container,
  CardTitle,
  LineContainer,
  RecommendedIcon,
} from './styles';
import { FileIconType, MapExtensionToFileIconType } from '../FileIcon/types';

export interface LeftSectionProps {
  onOpenFileInSpace: () => void;
  onDownloadFile: () => void;
  filename: string;
}

// gets the file icon type from extension of file name
const getFileIconType = (filename: string): FileIconType => {
  if (!filename) {
    return 'unknown';
  }

  const parts = filename.split('.');
  if (parts.length <= 1) {
    return 'unknown';
  }

  return MapExtensionToFileIconType[parts[parts.length - 1]] || 'unknown';
};

const LeftSection: React.FC<LeftSectionProps> = props => {
  const { onDownloadFile, onOpenFileInSpace, filename } = props;

  return (
    <Container>
      <FileIcon icon={getFileIconType(filename)} css={css.icon} />
      <Title>
        <strong>Private Sender</strong> is sharing a{' '}
        <strong>{`${filename} File` || 'Private File'}</strong> with you.
      </Title>
      <Card css={css.cardsizing}>
        <CardTitle css={css.greentext}>
          <RecommendedIcon />
          Recommended
        </CardTitle>
        <Button css={css.buttonblack} onClick={onOpenFileInSpace}>
          <img src={space} alt="space" css={css.spaceimage} />
          Open File in Space
        </Button>
      </Card>
      <LineContainer>
        <p css={css.ortext}>or</p>
        <div css={css.line} />
      </LineContainer>
      <Card css={css.cardsizing}>
        <CardTitle>Not as secure</CardTitle>
        <Button css={css.whitebutton} onClick={onDownloadFile}>
          <FontAwesomeIcon css={css.downloadicon} icon={faDownload} />
          Download File
        </Button>
      </Card>
    </Container>
  );
};

LeftSection.propTypes = {
  onDownloadFile: PropTypes.func.isRequired,
  onOpenFileInSpace: PropTypes.func.isRequired,
  filename: PropTypes.string.isRequired,
};

export default LeftSection;
