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

// Fonction pour ajouter les étiquettes au tableau croisé dynamique
function addPivotTableLabels() {
    // 1. Ajouter l'étiquette "Valeur Σ" à côté de la SECONDE liste déroulante (celle du bas)
    // Recherchons spécifiquement la seconde liste déroulante dans la cellule pvtVals
    const pvtValsCell = document.querySelector('.pvtVals.pvtUiCell');
    if (pvtValsCell) {
        // Rechercher tous les éléments select dans cette cellule
        const selects = pvtValsCell.querySelectorAll('select');
        
        // Si nous avons au moins 2 selects, nous ciblons le second
        if (selects.length >= 2) {
            const secondSelect = selects[1]; // Le deuxième select (index 1)
            
            // Vérifier si l'étiquette n'existe pas déjà
            if (!document.getElementById('sum-value-label')) {
                const sumLabel = document.createElement('span');
                sumLabel.id = 'sum-value-label';
                sumLabel.textContent = 'Valeur Σ';
                sumLabel.style.fontWeight = '600';
                sumLabel.style.marginRight = '8px';
                sumLabel.style.color = 'var(--primary-color)';
                sumLabel.style.display = 'inline-block';
                sumLabel.style.verticalAlign = 'middle';
                
                // Insérer l'étiquette avant la seconde liste déroulante
                secondSelect.parentNode.insertBefore(sumLabel, secondSelect);
            }
        } 
        // Si nous n'avons qu'un seul select, essayons de trouver le bon contexte
        else if (selects.length === 1) {
            // Chercher si un élément br précède ce select (indiquant qu'il pourrait être le second)
            const br = pvtValsCell.querySelector('br');
            if (br) {
                // Trouver le select qui suit le br
                let nextElement = br.nextElementSibling;
                while (nextElement && nextElement.tagName !== 'SELECT') {
                    nextElement = nextElement.nextElementSibling;
                }
                
                if (nextElement && nextElement.tagName === 'SELECT' && !document.getElementById('sum-value-label')) {
                    const sumLabel = document.createElement('span');
                    sumLabel.id = 'sum-value-label';
                    sumLabel.textContent = 'Valeur Σ';
                    sumLabel.style.fontWeight = '600';
                    sumLabel.style.marginRight = '8px';
                    sumLabel.style.color = 'var(--primary-color)';
                    sumLabel.style.display = 'inline-block';
                    sumLabel.style.verticalAlign = 'middle';
                    
                    // Insérer l'étiquette avant ce select
                    nextElement.parentNode.insertBefore(sumLabel, nextElement);
                }
            }
        }
    }
    
    // 2. Ajouter l'étiquette "Lignes" au-dessus de la zone de rangées, centrée
    const rowsContainer = document.querySelector('.pvtRows');
    if (rowsContainer && !document.getElementById('rows-label')) {
        // Supprimer l'étiquette existante si elle existe
        const existingLabel = document.getElementById('rows-label');
        if (existingLabel) {
            existingLabel.remove();
        }
        
        const rowsLabel = document.createElement('div');
        rowsLabel.id = 'rows-label';
        rowsLabel.textContent = 'Lignes';
        rowsLabel.style.fontWeight = '600';
        rowsLabel.style.color = 'var(--primary-color)';
        rowsLabel.style.padding = '5px 0';
        rowsLabel.style.textAlign = 'center'; // Centré
        rowsLabel.style.fontSize = '14px';
        rowsLabel.style.marginBottom = '5px';
        rowsLabel.style.pointerEvents = 'none'; // Pour ne pas interférer avec le glisser-déposer
        rowsLabel.style.position = 'absolute'; // Position absolue
        rowsLabel.style.width = '100%'; // Largeur complète pour le centrage
        rowsLabel.style.top = '5px'; // Un peu d'espace en haut
        rowsLabel.style.left = '0'; // Aligné à gauche du conteneur
        
        // Assurons-nous que le conteneur a une position relative pour le positionnement absolu
        if (getComputedStyle(rowsContainer).position === 'static') {
            rowsContainer.style.position = 'relative';
        }
        
        // Ajouter un peu d'espace au-dessus du premier élément
        rowsContainer.style.paddingTop = '30px';
        
        // Insérer l'étiquette au début du conteneur des lignes
        rowsContainer.insertBefore(rowsLabel, rowsContainer.firstChild);
    }
    
    // 3. Ajouter l'étiquette "Colonne" avec un espace réservé stable
    // D'abord, ajoutons un style global pour réserver l'espace
    if (!document.getElementById('cols-space-reservation-style')) {
        const colsSpaceStyle = document.createElement('style');
        colsSpaceStyle.id = 'cols-space-reservation-style';
        colsSpaceStyle.textContent = `
            /* Réserver un espace pour l'étiquette Colonne */
            .pvtCols {
                position: relative !important;
                padding-top: 25px !important; /* Espace pour l'étiquette */
            }
            
            /* Assurer la compatibilité avec le mode plein écran */
            #fullscreen-table-container .pvtCols {
                padding-top: 25px !important;
            }
        `;
        document.head.appendChild(colsSpaceStyle);
    }
    
    const colsContainer = document.querySelector('.pvtCols');
    if (colsContainer && !document.getElementById('cols-label')) {
        // Supprimer l'étiquette existante si elle existe
        const existingLabel = document.getElementById('cols-label');
        if (existingLabel) {
            existingLabel.remove();
        }
        
        const colsLabel = document.createElement('div');
        colsLabel.id = 'cols-label';
        colsLabel.textContent = 'Colonnes';
        colsLabel.style.fontWeight = '600';
        colsLabel.style.color = 'var(--primary-color)';
        colsLabel.style.padding = '3px 8px';
        colsLabel.style.fontSize = '14px';
        colsLabel.style.pointerEvents = 'none'; // Pour ne pas interférer avec le glisser-déposer
        colsLabel.style.position = 'absolute'; // Position absolue
        colsLabel.style.left = '10px'; // Légèrement décalé de la gauche
        colsLabel.style.top = '3px'; // En haut de la zone réservée
        colsLabel.style.zIndex = '5'; // S'assurer qu'il est au-dessus des autres éléments
        
        // Insérer l'étiquette au début du conteneur des colonnes
        colsContainer.insertBefore(colsLabel, colsContainer.firstChild);
    }
    
    // Ajouter des styles pour le mode sombre si pas déjà présents
    if (!document.getElementById('pivot-labels-dark-mode-styles')) {
        const darkModeStyles = document.createElement('style');
        darkModeStyles.id = 'pivot-labels-dark-mode-styles';
        darkModeStyles.textContent = `
            @media (prefers-color-scheme: dark) {
                #sum-value-label, #rows-label, #cols-label {
                    color: var(--primary-light) !important;
                }
            }
        `;
        document.head.appendChild(darkModeStyles);
    }
}

// Observer les changements dans le DOM pour ajouter les étiquettes quand nécessaire
function setupLabelsObserver() {
    // Créer un observateur qui surveille les modifications du DOM
    const observer = new MutationObserver((mutations) => {
        // Pour chaque mutation, vérifier l'ajout de nouveaux nœuds
        let shouldAddLabels = false;
        
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                // Vérifier si les éléments de structure du pivot sont présents
                const pivotUI = document.querySelector('.pvtUi');
                if (pivotUI) {
                    shouldAddLabels = true;
                    break;
                }
            }
            
            // Vérifier également si l'une des étiquettes a été supprimée accidentellement
            if (mutation.removedNodes.length) {
                if ((!document.getElementById('cols-label') && document.querySelector('.pvtCols')) ||
                    (!document.getElementById('rows-label') && document.querySelector('.pvtRows')) ||
                    (!document.getElementById('sum-value-label') && document.querySelector('.pvtVals'))) {
                    shouldAddLabels = true;
                    break;
                }
            }
        }
        
        if (shouldAddLabels) {
            // Appliquer les étiquettes avec un court délai pour s'assurer que le DOM est stable
            setTimeout(addPivotTableLabels, 100);
        }
    });
    
    // Observer les deux conteneurs (normal et plein écran)
    const containers = ['table', 'fullscreen-table-container'];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    });
}

// Fonction pour réagir aux interactions qui pourraient modifier le tableau
function setupInteractionListeners() {
    // 1. Lors du changement de vue
    const viewModeSelect = document.getElementById('view-mode-select');
    if (viewModeSelect) {
        viewModeSelect.addEventListener('change', () => {
            setTimeout(addPivotTableLabels, 200);
        });
    }
    
    // 2. Lors de la sortie du mode plein écran
    const fullscreenExitButton = document.getElementById('fullscreen-exit-button');
    if (fullscreenExitButton) {
        fullscreenExitButton.addEventListener('click', () => {
            setTimeout(addPivotTableLabels, 200);
        });
    }
    
    // 3. Surveiller les interactions de glisser-déposer avec une approche plus robuste
    document.addEventListener('mouseup', (event) => {
        // Après un glisser-déposer, vérifier si les étiquettes sont toujours présentes
        setTimeout(() => {
            const needsUpdate = (!document.getElementById('cols-label') && document.querySelector('.pvtCols')) ||
                              (!document.getElementById('rows-label') && document.querySelector('.pvtRows')) ||
                              (!document.getElementById('sum-value-label') && document.querySelector('.pvtVals select:nth-child(2)'));
            
            if (needsUpdate) {
                addPivotTableLabels();
            }
        }, 200);
    });
    
    // 4. Observer les modifications de style en direct
    const styleObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                // Si le style d'un conteneur change, vérifier si les étiquettes sont correctement positionnées
                setTimeout(addPivotTableLabels, 100);
                break;
            }
        }
    });
    
    // Observer les conteneurs principaux pour les changements de style
    const containers = ['.pvtCols', '.pvtRows', '.pvtVals'];
    containers.forEach(selector => {
        const container = document.querySelector(selector);
        if (container) {
            styleObserver.observe(container, { attributes: true, attributeFilter: ['style'] });
        }
    });
}

// Fonction d'initialisation principale
function initializePivotTableLabels() {
    // Essayer d'ajouter les étiquettes immédiatement
    addPivotTableLabels();
    
    // Configurer l'observateur pour les changements futurs
    setupLabelsObserver();
    
    // Configurer les écouteurs d'événements
    setupInteractionListeners();
    
    // Vérifier à nouveau après un court délai pour s'assurer que tout est bien en place
    setTimeout(addPivotTableLabels, 500);
    setTimeout(addPivotTableLabels, 1000); // Double vérification après un délai plus long
}

// Exécuter lorsque le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', initializePivotTableLabels);

// Exécuter également maintenant au cas où le DOM est déjà chargé
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    initializePivotTableLabels();
}

// Définir explicitement une fonction addValueSumLabel pour compatibilité
function addValueSumLabel() {
    addPivotTableLabels();
}

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
