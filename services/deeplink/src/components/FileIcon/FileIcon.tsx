import React from 'react';
import PropTypes from 'prop-types';

import PdfIcon from '../../svgs/PDF.svg';
import ZipIcon from '../../svgs/ZIP.svg';
import VideIcon from '../../svgs/Video.svg';
import AudioIcon from '../../svgs/Audio.svg';
import TextIcon from '../../svgs/TextDoc.svg';
import UnknownIcon from '../../svgs/Unknown.svg';
import PresentationIcon from '../../svgs/Presentation.svg';

export interface FileIconProps {
  icon: 'audio' | 'pdf' | 'ptx' | 'text' | 'video' | 'zip' | 'unknown';
}

const getFileIcon = (icon: FileIconProps['icon']): React.FC => {
  const icons = {
    pdf: PdfIcon as React.FC,
    zip: ZipIcon as React.FC,
    text: TextIcon as React.FC,
    video: VideIcon as React.FC,
    audio: AudioIcon as React.FC,
    unknown: UnknownIcon as React.FC,
    ptx: PresentationIcon as React.FC,
  };

  return icons[icon] || icons.unknown;
};

const FileIcon: React.FC<FileIconProps> = props => {
  const { icon = 'unknown', ...restProps } = props;

  const Icon = getFileIcon(icon);

  return <Icon {...restProps} />;
};

FileIcon.propTypes = {
  icon: PropTypes.oneOf([
    'audio',
    'pdf',
    'ptx',
    'text',
    'video',
    'zip',
    'unknown',
  ]),
};

export default FileIcon;