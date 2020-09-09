export type FileIconType =
  | 'audio'
  | 'pdf'
  | 'ptx'
  | 'text'
  | 'video'
  | 'zip'
  | 'image'
  | 'word'
  | 'unknown';

export const MapExtensionToFileIconType: {
  [extension: string]: FileIconType;
} = {
  pdf: 'pdf',
  zip: 'zip',
  doc: 'word',
  odt: 'word',
  rtf: 'word',
  tex: 'text',
  txt: 'text',
  md: 'text',
  wpd: 'word',
  qt: 'video',
  docx: 'word',
  jpg: 'image',
  png: 'image',
  gif: 'image',
  mp3: 'audio',
  wav: 'audio',
  aac: 'audio',
  m4a: 'audio',
  wma: 'audio',
  mp4: 'video',
  ogg: 'video',
  m4p: 'video',
  m4v: 'video',
  avi: 'video',
  wmv: 'video',
  mov: 'video',
  flv: 'video',
  swf: 'video',
  mpv: 'video',
  mpe: 'video',
  mpg: 'video',
  mp2: 'video',
  jpeg: 'image',
  mpeg: 'video',
  webm: 'video',
  ppt: 'ptx',
  pptx: 'ptx',
  key: 'ptx',
  odp: 'ptx',
  pps: 'ptx',
};
