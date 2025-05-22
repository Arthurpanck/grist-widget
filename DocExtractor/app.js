// Chargement dynamique de l'API Grist
const scriptGrist = document.createElement('script');
scriptGrist.src = 'https://docs.getgrist.com/grist-plugin-api.js';
scriptGrist.onload = initializeGrist;
scriptGrist.onerror = () => console.error('Erreur de chargement du script Grist');
document.head.appendChild(scriptGrist);

function initializeGrist() {
  console.log('Script Grist chargé.');

  // Charger dynamiquement PizZip et docxtemplater
  const scriptPizZip = document.createElement('script');
  scriptPizZip.src = 'https://unpkg.com/pizzip@3.1.1/dist/pizzip.js';
  scriptPizZip.onload = () => {
    const scriptPizZipUtils = document.createElement('script');
    scriptPizZipUtils.src = 'https://unpkg.com/pizzip@3.1.1/dist/pizzip-utils.js';
    scriptPizZipUtils.onload = () => {
      const scriptDocxtemplater = document.createElement('script');
      scriptDocxtemplater.src = 'https://cdnjs.cloudflare.com/ajax/libs/docxtemplater/3.57.3/docxtemplater.min.js';
      scriptDocxtemplater.onload = main;
      document.head.appendChild(scriptDocxtemplater);
    };
    document.head.appendChild(scriptPizZipUtils);
  };
  document.head.appendChild(scriptPizZip);
}

function main() {
  console.log('Toutes les librairies chargées.');
  // Initialisation de Grist en précisant les colonnes utilisées.
  // Adaptez "VotreTable" selon le nom réel de votre table.
  grist.ready({ requiredAccess: 'full', columns: ['DocxFile', 'Rempli_1', 'Rempli_2', 'Rempli_3'] });

  // Sélecteurs pour les champs de formulaire
  const start1 = document.getElementById('start1');
  const end1   = document.getElementById('end1');
  const start2 = document.getElementById('start2');
  const end2   = document.getElementById('end2');
  const start3 = document.getElementById('start3');
  const end3   = document.getElementById('end3');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // Restauration des valeurs sauvegardées dans localStorage
  start1.value = localStorage.getItem('start1') || '';
  end1.value   = localStorage.getItem('end1') || '';
  start2.value = localStorage.getItem('start2') || '';
  end2.value   = localStorage.getItem('end2') || '';
  start3.value = localStorage.getItem('start3') || '';
  end3.value   = localStorage.getItem('end3') || '';

  // Sauvegarder automatiquement les modifications dans localStorage
  [start1, end1, start2, end2, start3, end3].forEach(field => {
    field.addEventListener('input', () => {
      localStorage.setItem(field.id, field.value);
    });
  });

  // Fonction pour télécharger le DOCX depuis Grist
  async function downloadDocxFromGrist(attachmentId) {
    const tokenInfo = await grist.docApi.getAccessToken({ readOnly: true });
    const url = `${tokenInfo.baseUrl}/attachments/${attachmentId}/download?auth=${tokenInfo.token}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status} : ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const doc = new window.docxtemplater(zip);
    return doc.getFullText();
  }

  // Fonction d'extraction entre deux mots (première occurrence)
  function extractBetween(text, startWord, endWord) {
    if (!startWord || !endWord) { return ""; }
    const startIndex = text.indexOf(startWord);
    if (startIndex === -1) { return `(Début introuvable: "${startWord}")`; }
    const afterStart = startIndex + startWord.length;
    const endIndex = text.indexOf(endWord, afterStart);
    if (endIndex === -1) { return `(Fin introuvable après "${startWord}": "${endWord}")`; }
    return text.substring(afterStart, endIndex).trim();
  }

  // Abonnement aux changements de la table via grist.onRecords
  grist.onRecords(async (records) => {
    // Pour chaque enregistrement de la table "VotreTable"
    for (const record of records) {
      // Vérifier que l'enregistrement contient un fichier DOCX et n'a pas encore été traité
      if (record.DocxFile && (!record.Rempli_1 || record.Rempli_1 === "")) {
        try {
          // Télécharger le texte complet depuis le fichier DOCX (attachment)
          const fullText = await downloadDocxFromGrist(record.DocxFile);
          // Extraire les segments en utilisant les bornes définies par l'utilisateur
          const snippet1 = extractBetween(fullText, start1.value, end1.value);
          const snippet2 = extractBetween(fullText, start2.value, end2.value);
          const snippet3 = extractBetween(fullText, start3.value, end3.value);

          // Mettre à jour l'enregistrement avec les extraits dans la table "VotreTable"
          await grist.docApi.applyUserActions([
            ["UpdateRecord", "Test", record.id, {
              "Rempli_1": snippet1,
              "Rempli_2": snippet2,
              "Rempli_3": snippet3
            }]
          ]);

          console.log(`Extraction réussie pour l'enregistrement ${record.id}.`);
          successMessage.textContent = `Extraction réussie pour l'enregistrement ${record.id}.`;
          successMessage.style.display = 'block';
          // On peut masquer le message après quelques secondes
          setTimeout(() => successMessage.style.display = 'none', 5000);
        } catch (err) {
          console.error(`Erreur lors de l'extraction pour l'enregistrement ${record.id} :`, err);
          errorMessage.textContent = `Erreur pour l'enregistrement ${record.id} : ${err.message}`;
          errorMessage.style.display = 'block';
          setTimeout(() => errorMessage.style.display = 'none', 5000);
        }
      }
    }
  });
}
