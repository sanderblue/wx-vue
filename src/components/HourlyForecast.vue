// let hourlyUrl = `${apiPrefix}/hourly/q/${value.latitude},${value.longitude}.json`;

// axios.get(hourlyUrl).then((res) => {
//   let data = res.data.hourly_forecast;

//   let mappedData = _.map(data, (hourlyData) => {
//     // console.debug('value', hourlyData);

//     return {
//       epoch: hourlyData.FCTTIME.epoch,
//       temp: {
//         f: hourlyData.temp.english,
//         c: hourlyData.temp.metric
//       },
//       relativeHumidity: hourlyData.humidity
//     };
//   });

//   this.forecast.hourly = mappedData;
//   this.chartLabels = this.extractDates(this.forecast.hourly);

//   let temps = _.map(this.forecast.hourly, 'temp.f');
//   temps.length = 12;

//   this.chartDatasets = [
//     {
//       label: 'Temp',
//       fill: false,
//       data: temps,
//       borderColor: red,
//       pointRadius: 0.5,
//       pointHitRadius: 5,
//       pointHoverBackgroundColor: red,
//       pointHoverBorderColor: red
//     }
//   ];

//   // console.debug('extractDates', this.extractDates(this.forecast.hourly));

//   let hourlyTimes = this.extractDates(this.forecast.hourly);

//   console.debug('this.chartDatasets', hourlyTimes.length);

//   hourlyTimes.length = 12;

//   this.setLabels(hourlyTimes);
//   this.setDatasets(this.chartDatasets);
//   this.renderChart(true);

//   // console.debug('Hourly data...', this.forecast.hourly);
// });
