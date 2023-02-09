const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const process = require('process');

const CLIENT_ID = '643899119539-kl3jfr1ce8ffs5r06agi3vu5s4v26m37.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const REFRESH_TOKEN = '1//04R6_PRR9VLjYCgYIARAAGAQSNwF-L9IrFdseTfbRSs0SWqhwc0ef_CU0LzyOMflWdd2OKHfPer8jfS7-1Ukw51tJMuGDc-KX5LM';


// Get date and time when csv gets uploaded
const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let hour = date.getHours();
let minutes = date.getMinutes();
let seconds = date.getSeconds(); 


// Initialise oauth 2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
)

// Set credentials
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Initialise Google Drive
const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
})

const filePath = path.join(process.cwd(), 'sample.csv');

// Upload
let uploadFile = async() => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: `sample-${hour}:${minutes}   ${day}-${month}-${year}`,
        mimeType: 'text/csv',
        parents: ['10OpHE0VCpeGxCeEl8sTeXeM4okn9ogxY']
      },
      media: {
        mimeType: 'text/csv',
        body: fs.createReadStream(filePath)
      }
    });
    console.log(response.data)
    // await deleteFile()
  } catch(err) {
    console.log(err.message)
  }
};

// Delete file
let deleteFile = async() => {
  try {
    const response = await drive.files.delete({
      fileId: '1-SWWe0Sos_A4UbT2V-RD1GS8wI-ff3A4'
    });
    console.log(response.data, response.status)
  } catch(err) {
    console.log(err.message)
  }
}

module.exports = {
  uploadFile
}