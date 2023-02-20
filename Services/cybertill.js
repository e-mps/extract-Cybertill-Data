const getData = require('./controller').getData;
const { Parser } = require('json2csv');
const fs = require('fs');
let _ = require('lodash');

// Excel library that im changing the output to
let excel = require('excel4node');

// Create a new instance of a Workbook class
var workbook = new excel.Workbook();


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
    // console.log(obj)
    let {ID, Size, Description, Colour, Barcode, SKU, RRP, Brand} = obj
    return { size, Description, color, Barcode, SKU, RRP, Brand };
  });
};


// group output by Brand and make each brand a worksheet
const groupByBrand = async () => {
  const data = await transformData();

  const groupedData = _.groupBy(data, 'Brand');
  const brands = Object.keys(groupedData);

  brands.forEach((brand) => {
    // Create a new worksheet for each brand
    const worksheet = workbook.addWorksheet(brand);

    // Write the headers to the worksheet
    const headers = Object.keys(groupedData[brand][0]);
    headers.forEach((header, i) => {
      worksheet.cell(1, i + 1).string(header);
    });

    // Write the data to the worksheet
    groupedData[brand].forEach((item, rowIndex) => {
      Object.values(item).forEach((value, columnIndex) => {
        if (!isNaN(value)) { // Check if the value is numeric before converting
          worksheet.cell(rowIndex + 2, columnIndex + 1).number(Number(value));
        } else {
          worksheet.cell(rowIndex + 2, columnIndex + 1).string(value);
        }
      });
    });
  });

  // Write the workbook to a file
  workbook.write('cybertill-data.xlsx');
};

// Generate csv
// const genCsv = async () => {
//     const data = await transformData();
//   // console.log(data);
//   const fields = ['size', 'Description', 'color', 'Barcode', 'SKU', 'RRP'];
//   const opts = { fields };
//   const parser = new Parser(opts);
//   const csv = parser.parse(data);
//   fs.writeFileSync('./sample.csv', csv);
//   console.log('CSV file generated succesfully!');
// };

module.exports = {
  groupByBrand,
};
