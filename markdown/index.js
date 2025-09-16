var {dom, Observable} = grainjs;
var tableId = null;
var rowId = null;
var colId = null;
var cachedData = null;
var txt = null;  // EasyMDE instance
var editable = null;
var isEditMode = Observable.create(null, false);
let isNewRecord = Observable.create(null, true);

window.addEventListener('keypress', (ev) => {
  // If user pressed Enter or Space
  if (ev.keyCode === 13 || ev.keyCode === 32) {
    // and we are in the read mode
    if (txt.isPreviewActive() && editable) {
      // switch to edit mode.
      editMode();
      ev.preventDefault();
      return;
    }
  }
});

window.addEventListener('keydown', (ev) => {
  // If user pressed Ctrl + S
  if (ev.key === 's' && (ev.ctrlKey || ev.metaKey)) {
    // and in edit mode
    if (!txt.isPreviewActive()) {
      // save and go to read mode
      save();
      readMode();
      ev.preventDefault();
      return;
    }
  } else if (ev.keyCode === 27) {
    if (!txt.isPreviewActive()) {
      // If user pressed Escape, cancel edit
      cancel();
      readMode();
      ev.preventDefault();
    }
  }
})

window.addEventListener('blur', () => {
  if (txt.isPreviewActive()) { return; }

  save();
  readMode();
});

function editMode() {
  isEditMode.set(true);
  if (txt.isPreviewActive()) {
    txt.togglePreview();
    // Focus on the editor, but only if we have focus on the window itself,
    // We don't want to steal the focus from a table in Grist.
    if (!document.hasFocus()) {
      return;
    }
    // Warning: We are using internals here to focus on the inner code editor,
    // it might break in future easymde version.
    if (txt.codemirror && typeof txt.codemirror.focus === 'function') {
      txt.codemirror.focus();
    }
  }
}

function readMode() {
  isEditMode.set(false);
  if (!txt.isPreviewActive()) {
    // We are using internals to release the focus.
    if (txt.codemirror &&
        txt.codemirror.display &&
        txt.codemirror.display.input &&
        typeof txt.codemirror.display.input.blur === 'function') {
      txt.codemirror.display.input.blur();
    }
    txt.togglePreview();
  }
}

function showError(msg) {
  var el = document.getElementById('error')
  if (!msg) {
    el.style.display = 'none';
  } else {
    el.innerHTML = msg;
    el.style.display = 'block';
  }
}

function save() {
  if (!editable || !rowId || !tableId) { return; }
  var data = txt.value() || '';
  if (data === cachedData) { return; }
  console.log("SAVE", data);
  grist.docApi.applyUserActions([ ['UpdateRecord', tableId, rowId, {
    [colId]: data
  }]]).then(function(e) {
    showError(null);
  }).catch(function(e) {
    showError(String(e));
  });
}

function cancel() {
  txt.value("" + cachedData);
}

function downloadPDF() {
  if (!txt) { 
    showError("Editor not ready");
    return; 
  }
  
  try {
    // Ensure we're in preview mode to get the rendered HTML
    const wasInEditMode = !txt.isPreviewActive();
    if (wasInEditMode) {
      txt.togglePreview();
    }
    
    // Wait a bit for the preview to render
    setTimeout(() => {
      // Get the rendered HTML content from the preview
      const previewElement = txt.element.querySelector('.editor-preview-active') || 
                            txt.element.querySelector('.editor-preview');
      
      if (!previewElement) {
        showError("Unable to generate PDF: No preview content found");
        if (wasInEditMode) {
          txt.togglePreview();
        }
        return;
      }
      
      // Create a temporary container with the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = previewElement.innerHTML;
      
      // Add some basic styling for PDF
      tempDiv.style.cssText = `
        padding: 20px;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #fff;
        max-width: none;
      `;
      
      // Generate filename based on first line of content or use default
      const content = txt.value() || '';
      const firstLine = content.split('\n')[0].replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const filename = firstLine || 'grist_content';
      
      // Configure PDF options
      const opt = {
        margin: 1,
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // Generate and download PDF
      if (typeof html2pdf !== 'undefined') {
        console.log("Generating PDF...");
        html2pdf().set(opt).from(tempDiv).save().then(() => {
          console.log('PDF downloaded successfully');
          showError(null);
          // Restore edit mode if we were in it
          if (wasInEditMode) {
            txt.togglePreview();
          }
        }).catch((error) => {
          showError(`PDF generation failed: ${error.message}`);
          console.error('PDF generation error:', error);
          // Restore edit mode if we were in it
          if (wasInEditMode) {
            txt.togglePreview();
          }
        });
      } else {
        showError("PDF library not loaded. Please refresh the page and try again.");
        if (wasInEditMode) {
          txt.togglePreview();
        }
      }
    }, 200);
    
  } catch (error) {
    showError(`Error generating PDF: ${error.message}`);
    console.error('Download PDF error:', error);
  }
}

function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

var isMac = /Mac/.test(navigator.platform);
var toolbar = [
  "bold", "italic", "heading", "quote", "|", "link", "guide",
  {
    name: 'save',
    text: 'Save',
    action: function(editor) {
      save();
      readMode();
    },
    className: 'fa fa-save save-action',
    title: `Save (${isMac ? 'Cmd' : 'Ctrl'} + S)`
  },
  {
    name: 'cancel',
    text: 'Cancel',
    action: function(editor) {
      cancel();
      readMode();
    },
    className: 'fa fa-cancel cancel-action',
    title: `Cancel (Escape)`
  },
  {
    name: 'download',
    text: 'PDF',
    action: function(editor) {
      downloadPDF();
    },
    className: 'fa download-action',
    title: 'Download as PDF'
  },
  {
    name: 'edit',
    text: 'Edit',
    action: function(editor) {
      editMode();
    },
    className: 'fa fa-pencil edit-action',
    title: 'Edit (Enter or Space)'
  },
];

ready(() => {
  grist.ready({
    columns: [{ name: "Content", type: 'Text'}],
    requiredAccess: 'full'
  });

  grist.on('message', (e) => {
    if (e.tableId) { tableId = e.tableId; }
  });

  grist.onOptions((options, settings) => {
    const newEditable = (settings.accessLevel !== 'read table');
    if (newEditable !== editable) {
      editable = newEditable;
      txt = new EasyMDE({
        element: document.getElementById('txt'),
        spellChecker: false,
        status: false,
        minHeight: '0px',
        toolbar: editable ? toolbar : false,
      });
      
      if (editable) {
        // Wait for DOM to be ready
        setTimeout(() => {
          const editButton = document.querySelector(".edit-action");
          const saveButton = document.querySelector(".save-action");
          const downloadButton = document.querySelector(".download-action");
          
          console.log("Buttons found:", {
            edit: !!editButton,
            save: !!saveButton,
            download: !!downloadButton
          });
          
          if (editButton) {
            dom.update(editButton, dom.hide(isEditMode));
          }
          if (saveButton) {
            dom.update(saveButton, dom.show(isEditMode));
          }
          if (downloadButton) {
            // Download button should always be visible
            downloadButton.style.display = 'inline-block';
            console.log("Download button configured and visible");
          }
          
          if (txt.toolbar_div) {
            dom.update(txt.toolbar_div, dom.cls('toolbar-read-mode', use => !use(isEditMode)));
          }
        }, 100);
      }
      toggle(false);
    }
  });

  grist.onRecord(function(record, mappings) {
    isNewRecord.set(false);
    save();
    var nextRowId = record.id;
    delete record.id;
    var keys = Object.keys(record);
    rowId = null;
    colId = null;
    if (!mappings) {
      // We will fallback to reading a value from a single column to
      // support old way of mapping (exposing only a single column).
      // New widgets should only check if mappings object is truthy,
      // or use grist.mapColumnNames helper method.
      if (keys.length !== 1) {
        showError("Please pick a column to store content on Creator Panel");
        return;
      }
      colId = keys[0];
    } else if (mappings) {
      if (!mappings.Content) {
        showError("Please pick a column to store content on Creator Panel");
        return;
      }
      colId = mappings.Content;
    }
    showError(null);
    var data = record[colId] || '';
    if (nextRowId !== rowId || cachedData !== data) {
      txt.value("" + data);
      if (data) {
        readMode();
      } else {
        editMode();
      }
    }
    cachedData = data;
    rowId = nextRowId;
  });

  isNewRecord.addListener(isNew => {
    toggle(!isNew);
  });

  grist.onNewRecord(() => {
    save();
    isNewRecord.set(true);
    txt.value('');
    rowId = null;
    cachedData = null;
    colId = null;
    readMode();
  })
  
});

function toggle(show) {
  if (txt && txt.element) {
    txt.element.style.visibility = show ? 'visible' : 'hidden';
  }
  if (txt && txt.toolbar_div) {
    txt.toolbar_div.style.visibility = show ? 'visible' : 'hidden';
  }
}
