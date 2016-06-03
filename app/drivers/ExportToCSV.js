function exportToCSVDriver(input$) {
  // `data` should be formatted as an Array of Arrays (= lines).
  // e.g: `[["name1", "city1", "other info"], ["name2", "city2", "more info"]]`
  input$.subscribe((data) => {
    // How to create a CSV file?
    // See http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
    let csvContent = 'data:text/csv;charset=utf-8,';
    data.forEach((infoArray, index) => {
      const dataString = infoArray.join(',');
      csvContent += index < data.length ? `${dataString}\n` : dataString;
    });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'trello-cfd.csv');

    // Required for FF
    document.body.appendChild(link);

    // Download the data file.
    link.click();
  });
}

export { exportToCSVDriver };
