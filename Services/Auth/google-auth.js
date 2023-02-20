const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '643899119539-kl3jfr1ce8ffs5r06agi3vu5s4v26m37.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04aSKeXuX3eLJCgYIARAAGAQSNwF-L9IrCv_wL9AFHXX7040XIenNFWh1Ua6NABzJAhtSxcgLXpZCmwb2nCgyxWjU5XeS44449Vc';

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

const filePath = path.join(process.cwd(), 'cybertill-data.xlsx');

// Upload
let uploadFile = async() => {
  try {
    // Check if file already exists
    const query = "name='cybertill-data.xlsx' and trashed = false";
    const response = await drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name)',
    });
    const existingFile = response.data.files[0];

    // If file already exists, update it
    if (existingFile) {
      const fileId = existingFile.id;
      const response = await drive.files.update({
        fileId: fileId,
        media: {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          body: fs.createReadStream(filePath)
        }
      });
      console.log(response.data)
    } else {
      // If file does not exist, create a new one
      const response = await drive.files.create({
        requestBody: {
          name: `cybertill-data.xlsx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          parents: ['10OpHE0VCpeGxCeEl8sTeXeM4okn9ogxY']
        },
        media: {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          body: fs.createReadStream(filePath)
        }
      });
      console.log(response.data)
      console.log(`File ${response.data.name} with ID: ${response.data.id} updated succesfully`)
    }
  } catch(err) {
    console.log(err.message)
  }
};

// Delete file
// let deleteFile = async() => {
//   try {
//     const response = await drive.files.delete({
//       fileId: `${fileId}`
//     });
//     console.log(response.data, response.status)
//   } catch(err) {
//     console.log(err.message)
//   }
// }


module.exports = {
  uploadFile
};
