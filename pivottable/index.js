window.onerror = (err) => {
  console.trace();
  alert(String(err));
};

grist.ready({
  requiredAccess: 'read table'
});

let currentViewMode = 'pivot'; 
let lastPivotData = null;      
let currentPivotConfig = {};  

// Import of DynamiwView.JS 
function updateFullscreenTable() {
  const $pivotTableInUI = $('#table').find('table.pvtTable'); 
  const $fullscreenContainer = $('#fullscreen-table-container');
  $fullscreenContainer.empty(); 
  if ($pivotTableInUI.length) {
    const $clonedTable = $pivotTableInUI.clone(true, true);
    $fullscreenContainer.append($clonedTable);
  } else {
    $fullscreenContainer.html('<p style="text-align:center; padding-top:50px; font-style:italic;">Aucun tableau à afficher en plein écran.</p>');
  }
}

function applyViewMode() {
  const $pivotUIContainer = $('#table');
  const $fullscreenContainer = $('#fullscreen-table-container');
  const $body = $('body');
  // Le sélecteur de vue original et le bouton de sortie sont gérés par CSS via la classe .fullscreen-active

  if (currentViewMode === 'fullscreen') {
    updateFullscreenTable(); 
    $pivotUIContainer.hide();
    $fullscreenContainer.show();
    $body.addClass('fullscreen-active');
    $(window).trigger('resize'); 
  } else { // 'pivot' mode
    $fullscreenContainer.hide().empty();
    $pivotUIContainer.show();
    $body.removeClass('fullscreen-active');
    $(window).trigger('resize');
  }
}

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
$.extend($.pivotUtilities.locales.fr.renderers,
         $.pivotUtilities.export_renderers);

// Rendu allégé de la pivot table sans les autres possibilités de visualisation + traduction de Moyenne pondérée
grist.onRecords(async rec => {
  lastPivotData = rec;  // Sauvegarde globale des données reçues

  // Récupération des options de configuration précédemment sauvegardées
  let settings = await grist.getOption('settings') ?? {};
  let { rows, cols, vals, aggregatorName, rendererName } = settings;

  // Stockage centralisé de la config pour facilité de mise à jour
  currentPivotConfig = { rows, cols, vals, aggregatorName, rendererName };

  // Si l'ancien label était en anglais, on le mappe en français
  const mapEnToFr = { 'Weighted Average': 'Moyenne pondérée' };
  if (aggregatorName in mapEnToFr) {
    aggregatorName = mapEnToFr[aggregatorName];
    currentPivotConfig.aggregatorName = aggregatorName;  // Mise à jour dans config centrale
  }

  let firstRefresh = true; // Pour éviter d’écrire dans grist à la première initialisation

  $('#table').pivotUI(
    rec,
    {
      rows: currentPivotConfig.rows,
      cols: currentPivotConfig.cols,
      vals: currentPivotConfig.vals,

      // Lors d’une modification par l’utilisateur
      onRefresh(config) {
        if (firstRefresh) { 
          firstRefresh = false; 
          return; 
        }
        currentPivotConfig = {
          rows: config.rows,
          cols: config.cols,
          vals: config.vals,
          aggregatorName: config.aggregatorName,
          rendererName: config.rendererName,
        };

        // Sauvegarde des options modifiées dans Grist
        grist.setOption('settings', currentPivotConfig);

        // Si on est en mode fullscreen, mettre à jour le tableau cloné
        if (currentViewMode === 'fullscreen') {
          updateFullscreenTable();
        }
      },

      aggregatorName: currentPivotConfig.aggregatorName,
      rendererName: currentPivotConfig.rendererName,
    },
    false,  // overwrite = false, on ne remplace pas tout, on conserve ce qui existe
    'fr'    // locale française pour les labels par défaut
  );
  try {
    const savedViewMode = await grist.getOption('viewMode');
    if (savedViewMode && (savedViewMode === 'pivot' || savedViewMode === 'fullscreen')) {
      currentViewMode = savedViewMode;
      $('#view-mode-select').val(currentViewMode);
    }
  } catch (e) {
    console.error("Error loading viewMode from Grist options:", e);
  }
  applyViewMode(); 
});
$(document).ready(function() {
  // Gestionnaire pour le sélecteur de vue original
  $('#view-mode-select').on('change', function() {
    currentViewMode = $(this).val();
    grist.setOption('viewMode', currentViewMode).catch(err => {
        console.error("Failed to save viewMode:", err);
    });
    applyViewMode();
  });

  // Gestionnaire pour le bouton "Quitter plein écran"
  $('#fullscreen-exit-button').on('click', function() {
    currentViewMode = 'pivot';
    $('#view-mode-select').val('pivot'); // Synchroniser le dropdown original
    grist.setOption('viewMode', currentViewMode).catch(err => {
        console.error("Failed to save viewMode:", err);
    });
    applyViewMode();
  });
});
