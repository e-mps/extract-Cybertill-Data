const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '643899119539-kl3jfr1ce8ffs5r06agi3vu5s4v26m37.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04r9N5UdrQufsCgYIARAAGAQSNwF-L9IrstnusWtJbxgekIhj4knXT0RUB3u8yJoNto9N2D0tY7gphURHzHPSRaEO3By2PxUfpjE';

// Initialise oauth 2 client
const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Set credentials
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Initialise Google Drive
const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

const fileName = 'cybertill-data.xlsx';
const parentId = '10OpHE0VCpeGxCeEl8sTeXeM4okn9ogxY';

let uploadFile = async () => {
  try {
    // Check if file already exists
    const query = `name='${fileName}' and trashed=false and parents in '${parentId}'`;
    const response = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name)',
    });
    const existingFiles = response.data.files;

    // If file already exists, delete it
    if (existingFiles.length > 0) {
      for (let i = 0; i < existingFiles.length; i++) {
        const fileId = existingFiles[i].id;
        await drive.files.delete({ fileId });
        console.log(`Deleted file with ID: ${fileId}`);
      }
    }

    // Upload new file
    const filePath = path.join(process.cwd(), fileName);
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        parents: [parentId]
      },
      media: {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: fs.createReadStream(filePath)
      }
    });
    console.log(`File ${uploadResponse.data.name} with ID: ${uploadResponse.data.id} updated successfully`);
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  uploadFile
};
