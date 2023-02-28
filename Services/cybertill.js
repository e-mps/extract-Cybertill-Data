const getData = require('./controller').getData;
const { Parser } = require('json2csv');
const fs = require('fs');
let _ = require('lodash');

// Excel library that im changing the output to
let excel = require('excel4node');

// Create a new instance of a Workbook class
var workbook = new excel.Workbook();

// Clean the size format
const cleanSizeFormat = (format) => {
  const sizeRegex = /\d+(\.\d+)?/;
  const cmRegex = /cm/i;
  const mlRegex = /ml/i;

  let cleanedFormat = format.trim().toLowerCase();

  if (cleanedFormat.startsWith('size') || cleanedFormat.startsWith('siz ')) {
    cleanedFormat = cleanedFormat.replace(/(size|siz)\s*/, '');
  }

  if (cleanedFormat.endsWith('ml')) {
    cleanedFormat = cleanedFormat.replace(mlRegex, '');
  } else if (cleanedFormat.endsWith('cm')) {
    cleanedFormat = cleanedFormat.replace(cmRegex, '');
  }

  const match = cleanedFormat.match(sizeRegex);

  return match ? match[0] : 'No Size';
};

// Fetch cybertill data
const getCybertillData = async () => {
  const data = await getData();

  const sizeFormats = new Set();
  const regex = /Colour:\s*\w+\s*\/\s*Size:\s*([\w\s]+)\s*/i;

  data.forEach(item => {
    const match = item.Size.match(regex);
    const format = match ? cleanSizeFormat(match[1]) : 'No Size';
    const colorRegex = /Colour:\s*(\w+)\s*\/\s*Size:/i;
    const colorMatch = item.Size.match(colorRegex);
    const color = colorMatch ? colorMatch[1] : 'No Color';
    sizeFormats.add(format);
    item.Size = format;
    item.Colour = color;
});
 
  // console.table(Array.from(sizeFormats));
  // console.log(data)

  return data;
};

// const groupByIdGetMinMaxSize = async () => {
//   const data = await getCybertillData();

//   const groupedData = _.groupBy(data, 'ID');

//   const brands = _.uniqBy(data, 'Brand');
//   const brandNames = _.map(brands, 'Brand').sort();

//   brandNames.forEach((brandName) => {
//     const brandData = groupedData[brandName] || [];
//     const sheetName = brandName.toUpperCase().substring(0, 31);

//     // Create a new worksheet for the current brand
//     const worksheet = workbook.addWorksheet(sheetName);

//     // Set column headers
//     worksheet.cell(1, 1).string('Size');
//     worksheet.cell(1, 2).string('Description');
//     worksheet.cell(1, 3).string('Colour');
//     worksheet.cell(1, 4).string('Barcode');
//     worksheet.cell(1, 5).string('SKU');
//     worksheet.cell(1, 6).string('RRP');

//     let rowIndex = 2;

//     // Get the minimum and maximum sizes for each ID
//     const minMaxSizes = _(brandData)
//       .groupBy('ID')
//       .map((groupedItems, id) => ({
//         ID: id,
//         minSize: _.minBy(groupedItems, (item) => parseFloat(item.Size)),
//         maxSize: _.maxBy(groupedItems, (item) => parseFloat(item.Size)),
//       }))
//       .value();

//     // Add each item to the worksheet
//     minMaxSizes.forEach((item) => {
//       const { ID, minSize, maxSize } = item;

//       worksheet.cell(rowIndex, 1).string(`${minSize.Size} - ${maxSize.Size}`);
//       worksheet.cell(rowIndex, 2).string(minSize.Description);
//       worksheet.cell(rowIndex, 3).string(minSize.Colour);
//       worksheet.cell(rowIndex, 4).string(minSize.Barcode);
//       worksheet.cell(rowIndex, 5).string(minSize.SKU);
//       worksheet.cell(rowIndex, 6).string(minSize.RRP);
//       worksheet.cell(rowIndex, 7).string(minSize.Brand);

//       rowIndex++;
//     });
//   });
//   console.log(`${Object.keys(groupedData).length} worksheets created.`);
//   // console.log(minMaxSizes)

//   // Write the workbook to a file
//   workbook.write('cybertill-data.xlsx');
//   console.log('Workbook written to successfully!')
// };

// group output by Brand and make each brand a worksheet
const groupByIdGetMinMaxSize = async () => {
  const data = await getCybertillData();

  // Group data by ID and get minimum and maximum size for each group
  const groupedById = _.groupBy(data, 'ID');
  const minMaxSizes = _.map(groupedById, (group) => {
    const minSize = _.minBy(group, (item) => parseFloat(item.Size));
    const maxSize = _.maxBy(group, (item) => parseFloat(item.Size));
    const sizeRange = `${minSize?.Size || 'No Size'} - ${maxSize?.Size || 'No Size'}`;
    return {
      ...minSize,
      Size: sizeRange,
    };
  });
  // console.log(minMaxSizes)

  // Group data by brand
  const groupedByBrand = _.groupBy(minMaxSizes, 'Brand');
  const brands = Object.keys(groupedByBrand).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); //sort the brands array in a case-sensitive way

  brands.forEach(brand => {
    // create a new worksheet for each brand
    const worksheet = workbook.addWorksheet(brand);

    // Write the headers to the worksheet
    const headers = Object.keys(groupedByBrand[brand][0]).filter(header => header !== 'Brand' && header !== 'ID');
    headers.forEach((header, i) => {
      worksheet.cell(1, i + 1).string(header);
    });

    // Write the data to the worksheet
    groupedByBrand[brand].forEach((item, rowIndex) => {
      Object.keys(item).filter(key => key !== 'Brand' && key !== 'ID').forEach((key, columnIndex) => {
        const value = item[key];
        // Check if the value is numeric before converting
        if(!isNaN(value)) {
          worksheet.cell(rowIndex + 2, columnIndex + 1).number(Number(value));
        } else {
          worksheet.cell(rowIndex + 2, columnIndex + 1).string(value)
        }
      })
    })
  })

  //   // Write the workbook to a file
  workbook.write('cybertill-data.xlsx');
  console.log(`All worksheets created successfully!`);
};


module.exports = {
  groupByIdGetMinMaxSize,
};