const getData = require('./controller').getData;
const { Parser } = require('json2csv');
const fs = require('fs');
let _ = require('lodash');


// Fetch cybertill data
const getCybertillData = async () => {
  const data = await getData();
  return data;
};

// Transform data to desired output
const transformData = async () => {
  const data = await getCybertillData();
  return data.map(obj => {
    const colorAndSize = obj.Size ? obj.Size.split('/') : [];
    const colorItem = colorAndSize.find(item => item.trim().startsWith('Colour:'));
    const sizeItem = colorAndSize.find(item => item.trim().startsWith('Size:'));
    let color = colorItem ? colorItem.split(':')[1].trim() : '';
    let size;
    // let size = sizeItem ? sizeItem.split(':')[1].trim() : '';
    // size = Number(size.match(/\d+/));
    return { ...obj, color, size };
  });
};




// Generate csv
const genCsv = async () => {
    const data = await transformData();
  // console.log(data)
  const fields = ['size', 'Description', 'color', 'Barcode', 'SKU', 'RRP'];
  const opts = { fields };
  const parser = new Parser(opts);
  const csv = parser.parse(data);
  fs.writeFileSync('./sample.csv', csv);
  console.log('CSV file generated succesfully!');
};

module.exports = {
  genCsv,
};
