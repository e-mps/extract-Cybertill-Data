const axios = require('axios');
const qs = require('qs');
const fs = require('fs');

var data = qs.stringify({
    'query': `"SELECT stkp.id as ID, sti.style_string as Size, stkp.descr_short as Description, sti.style_string as Colour, sti.barcode as Barcode, sti.ref as SKU, stidp.price_rrp as RRP FROM stk_product stkp INNER JOIN stk_item sti ON stkp.id = sti.stk_product_id INNER JOIN stk_item_default_price stidp ON sti.id = stidp.stk_item_id WHERE sti.ref REGEXP '^[a-zA-Z]{3}[0-9]{4}$' GROUP BY stkp.id"`
});
var config = {
    method: 'post',
    url: 'https://tuffnels.e-mps.co.uk/tl-odbc/api/getData',
    timeout: 300000,
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Connection': 'keep-alive',
      "Accept": "*/*"
    },
    data : data
  };

let getData = async() => {
    const response = await axios(config);
    const data = await response.data;
    return data
};

module.exports = {
    getData
}