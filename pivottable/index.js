window.onerror = (err) => {
  console.trace();
  alert(String(err));
};

grist.ready({
  requiredAccess: 'read table'
});

function wavg (n) {
  if (!n) { return; }
  n = n.filter(([note]) => typeof (note) === 'number');
  if (n.length) { return n.map(([note, coef]) => note * coef).reduce((a, b) => a + b) / n.map(([_note, coef]) => coef).reduce((a, b) => a + b); }
}

function weightedAverage ([val, coef]) {
  return (_data, _rowKey, _colKey) => ({
    values: [],
    push: function (rec) { this.values.push([rec[val], rec[coef]]); },
    value: function () { return wavg(this.values); },
    format: function (x) { return (Math.round(x * 100) / 100).toFixed(2); },
    numInputs: 2
  });
}

// Traduction du nom des opérations mathématiques en français
$.extend(
  $.pivotUtilities.aggregators,
  $.pivotUtilities.locales.fr.aggregators,
  { 'Moyenne pondérée': weightedAverage }
);

// Traduction du nom des types de visualisation en français
$.extend(
  $.pivotUtilities.renderers,
  $.pivotUtilities.locales.fr.renderers
);

// Rendu allégé de la pivot table sans les autres possibilités de visualisation + traduction de Moyenne pondérée
grist.onRecords(async rec => {
  let { rows, cols, vals, aggregatorName, rendererName } =
    await grist.getOption('settings') ?? {};

  // Si l'ancien label était en anglais, on le mappe en FR
  const mapEnToFr = { 'Weighted Average': 'Moyenne pondérée' };
  if (aggregatorName in mapEnToFr) {
    aggregatorName = mapEnToFr[aggregatorName];
  }

  let first = true;
  $('#table').pivotUI(
    rec,
    {
      rows,
      cols,
      vals,
      onRefresh(config) {
        if (first) { first = false; return; }
        grist.setOption('settings', {
          rows:   config.rows,
          cols:   config.cols,
          vals:   config.vals,
          aggregatorName: config.aggregatorName,
          rendererName:   config.rendererName,
        });
      },
      aggregatorName,
      rendererName,
    },
    false,  // overwrite = false
    'fr'    // locale française
  );
});
