var fs = require('node:fs');
var percepData = [];
var climateData = [];

async function mapCSVData() {
    const d3 = await import('d3');
    const dsv = await import('d3-dsv');

    hotdry = fs.readFileSync('x177_exp_hotdryday_dryday_2019-05-16.csv', 'utf8')
    percepcsv = fs.readFileSync('perception_data_county.csv', 'utf8');
    climatevars = fs.readFileSync('cc_data_county.csv', 'utf8');

    parsedPerc = dsv.csvParse(percepcsv);
    parsedClimate = dsv.csvParse(climatevars);
    parsedHotdry = dsv.csvParse(hotdry);

    parsedHotdry.forEach(county => { target = parsedPerc.find(c => +c.geoid === +county.GEOID); percepData.push(Object.assign({}, county, target)) })
    parsedHotdry.forEach(county => { target = parsedClimate.find(c => +c.geoid === +county.GEOID); climateData.push(Object.assign({}, county, target)) })
    fs.writeFileSync('./perception-data.csv', dsv.csvFormat(percepData))
    fs.writeFileSync('./climate-data.csv', dsv.csvFormat(climateData))
    return [percepData, climateData];
}

mapCSVData()