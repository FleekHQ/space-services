const fs = require('fs');
const path = require('path');

const shareObjectHtml = fs.readFileSync(path.join(__dirname, 'dist/shareObject.html'));
const shareFolderHtml = fs.readFileSync(path.join(__dirname, 'dist/shareFolder.html'));

/**
* @param {Object} serverless - Serverless instance
* @param {Object} options - runtime options
* @returns {Promise<{name: string, subject: string, html: string, text}[]>}
*/
module.exports = async (serverless, options) => [{
    name: 'ShareObject',
    subject: 'Share Object Subject',
    html: shareObjectHtml.toString(),
}, {
    name: 'ShareFolder',
    subject: 'Share Folder Subject',
    html: shareFolderHtml.toString(),
}];
