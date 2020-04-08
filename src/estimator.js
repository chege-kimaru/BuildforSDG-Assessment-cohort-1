/**
 * Input data format
 * {
      region: {
        name: "Africa",
        avgAge: 19.7,
        avgDailyIncomeInUSD: 5,
        avgDailyIncomePopulation: 0.71
      },
      periodType: "days",
      timeToElapse: 58,
      reportedCases: 674,
      population: 66622705,
      totalHospitalBeds: 1380614
   }
 *
 * Output data format
 * {
      data: {}, // the input data you got
      impact: {}, // your best case estimation
      severeImpact: {} // your severe case estimation
   }
 */

const normalizeTime = (data) => {
  switch (data.periodType) {
    case 'days':
      return data.timeToElapse;
    case 'weeks':
      return data.timeToElapse * 7;
    case 'months':
      return data.timeToElapse * 30;
    default:
      throw new Error('Unrecognized period type');
  }
};

// challenge 1
const currentlyInfected = (data, severe) => (severe ? data.reportedCases * 50 : data.reportedCases
  * 10);

// challenge 2
const infectionsByRequestedTime = (data, severe) => currentlyInfected(data, severe)
  * 2 ** Math.trunc((normalizeTime(data) / 3));

const severeCasesByRequestedTime = (data, severe) => 0.15
  * infectionsByRequestedTime(data, severe);

const hospitalBedsByRequestedTime = (data, severe) => 0.35
  * data.totalHospitalBeds - severeCasesByRequestedTime(data, severe);

// challenge 3
const casesForICUByRequestedTime = (data, severe) => 0.5
  * infectionsByRequestedTime(data, severe);

const casesForVentilatorsByRequestedTime = (data, severe) => 0.2
  * infectionsByRequestedTime(data, severe);

const dollarsInFlight = (data, severe) => infectionsByRequestedTime(data, severe)
  * data.region.avgDailyIncomePopulation * data.region.avgDailyIncomeInUSD * normalizeTime(data);


const covid19ImpactEstimator = (data) => ({
  data,
  impact: {
    currentlyInfected: currentlyInfected(data, 0),
    infectionsByRequestedTime: infectionsByRequestedTime(data, 0),
    severeCasesByRequestedTime: severeCasesByRequestedTime(data, 0),
    hospitalBedsByRequestedTime: hospitalBedsByRequestedTime(data, 0),
    casesForICUByRequestedTime: casesForICUByRequestedTime(data, 0),
    casesForVentilatorsByRequestedTime: casesForVentilatorsByRequestedTime(data, 0),
    dollarsInFlight: dollarsInFlight(data, 0)
  },
  severeImpact: {
    currentlyInfected: currentlyInfected(data, 1),
    infectionsByRequestedTime: infectionsByRequestedTime(data, 1),
    severeCasesByRequestedTime: severeCasesByRequestedTime(data, 1),
    hospitalBedsByRequestedTime: hospitalBedsByRequestedTime(data, 1),
    casesForICUByRequestedTime: casesForICUByRequestedTime(data, 1),
    casesForVentilatorsByRequestedTime: casesForVentilatorsByRequestedTime(data, 1),
    dollarsInFlight: dollarsInFlight(data, 1)
  }
});

export default covid19ImpactEstimator;
