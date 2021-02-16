// eslint-disable-next-line import/no-extraneous-dependencies,@typescript-eslint/no-var-requires
const shell = require('shelljs');

// Copy all the view templates
shell.cp('-R', 'src/emails/compiled-htmls', 'dist/');
