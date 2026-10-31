// SlideCraft - Canva-Style Web PowerPoint Editor Engine
let currentDeck = null;
let currentSlideIndex = 0;
let fabricCanvas = null;
let currentZoom = 1.0;
let undoStack = [];
let redoStack = [];

// DOM References
const uploadView = document.getElementById('uploadView');
const editorView = document.getElementById('editorView');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const menuFileInput = document.getElementById('menuFileInput');
const btnLoadSample = document.getElementById('btnLoadSample');
const btnCreateBlankDeck = document.getElementById('btnCreateBlankDeck');
const menuCreateNew = document.getElementById('menuCreateNew');
const btnCopyDesignLink = document.getElementById('btnCopyDesignLink');
const uploadLoader = document.getElementById('uploadLoader');
const loaderText = document.getElementById('loaderText');

// --- CANVA URL & ID GENERATION UTILITIES ---
// Sinh Canva Design ID: tiền tố 'DA' + 9 ký tự ngẫu nhiên (tổng 11 ký tự, e.g. DAHZkAweP4E)
function generateCanvaDesignId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let id = 'DA';
  for (let i = 0; i < 9; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Sinh Canva Edit Token: 22 ký tự Base64 URL-safe (e.g. wUu2lyK44xWo7cA5B31vBg)
function generateCanvaEditToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let token = '';
  for (let i = 0; i < 22; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function updateBrowserUrlForDesign(designId, editToken) {
  if (!designId || !editToken) return;
  const targetPath = `/design/${designId}/${editToken}/edit`;
  if (window.location.pathname !== targetPath) {
    window.history.pushState({ designId, editToken }, '', targetPath);
  }
}

function saveDeckToLocalStorage(deck) {
  if (!deck || !deck.designId) return;
  try {
    localStorage.setItem(`canva_design_${deck.designId}`, JSON.stringify(deck));
    localStorage.setItem('canva_last_design_id', deck.designId);
  } catch (e) {
    console.warn("Could not save deck to localStorage:", e);
  }
}

function getDeckFromLocalStorage(designId) {
  try {
    const raw = localStorage.getItem(`canva_design_${designId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

const deckTitleInput = document.getElementById('deckTitleInput');
const saveStatus = document.getElementById('saveStatus');
const thumbnailContainer = document.getElementById('thumbnailContainer');
const slideTotalBadge = document.getElementById('slideTotalBadge');
const btnAddSlide = document.getElementById('btnAddSlide');
const btnAddSlideBottom = document.getElementById('btnAddSlideBottom');
const bottomSlideCounter = document.getElementById('bottomSlideCounter');
const activeSlideTitleText = document.getElementById('activeSlideTitleText');

// Canva Drawer & Rail
const canvaDrawer = document.getElementById('canvaDrawer');
const btnCollapseDrawer = document.getElementById('btnCollapseDrawer');
const navTabBtns = document.querySelectorAll('.nav-tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Canva Floating Context Toolbar Groups
const ctxCanvasGroup = document.getElementById('ctxCanvasGroup');
const ctxTextGroup = document.getElementById('ctxTextGroup');
const ctxShapeGroup = document.getElementById('ctxShapeGroup');
const ctxImageGroup = document.getElementById('ctxImageGroup');
const ctxUniversalGroup = document.getElementById('ctxUniversalGroup');

// Text Controls
const fontFamilySelect = document.getElementById('fontFamilySelect');
const customFontsGroup = document.getElementById('customFontsGroup');
const fontSizeInput = document.getElementById('fontSizeInput');
const btnFontInc = document.getElementById('btnFontInc');
const btnFontDec = document.getElementById('btnFontDec');
const textColorInput = document.getElementById('textColorInput');
const btnBold = document.getElementById('btnBold');
const btnItalic = document.getElementById('btnItalic');
const btnUnderline = document.getElementById('btnUnderline');
const btnAlignLeft = document.getElementById('btnAlignLeft');

// Shape Controls
const shapeFillInput = document.getElementById('shapeFillInput');
const shapeStrokeInput = document.getElementById('shapeStrokeInput');
const shapeStrokeWidth = document.getElementById('shapeStrokeWidth');

// Image Controls
const imageOpacityInput = document.getElementById('imageOpacityInput');

// Universal Layer Controls
const btnBringForward = document.getElementById('btnBringForward');
const btnDuplicateObj = document.getElementById('btnDuplicateObj');
const btnDeleteObj = document.getElementById('btnDeleteObj');

// Undo / Redo
const btnUndo = document.getElementById('btnUndo');
const btnRedo = document.getElementById('btnRedo');

// Toggle Edit Overlay
const btnToggleEditOverlay = document.getElementById('btnToggleEditOverlay');
const toggleEditText = document.getElementById('toggleEditText');

// Drawer Element Buttons
const btnAddHeading = document.getElementById('btnAddHeading');
const btnAddSubheading = document.getElementById('btnAddSubheading');
const btnAddBody = document.getElementById('btnAddBody');
const btnAddRect = document.getElementById('btnAddRect');
const btnAddCircle = document.getElementById('btnAddCircle');
const btnAddTriangle = document.getElementById('btnAddTriangle');
const btnAddStar = document.getElementById('btnAddStar');
const btnAddLine = document.getElementById('btnAddLine');
const btnAddTable = document.getElementById('btnAddTable');
const imageUploaderInput = document.getElementById('imageUploaderInput');

// Background Controls
const btnRestoreOriginalBg = document.getElementById('btnRestoreOriginalBg');
const slideCustomBg = document.getElementById('slideCustomBg');

// Zoom & Bottom Bar Controls
const zoomSlider = document.getElementById('zoomSlider');
const zoomLevelText = document.getElementById('zoomLevelText');
const btnPrevSlideBottom = document.getElementById('btnPrevSlideBottom');
const btnNextSlideBottom = document.getElementById('btnNextSlideBottom');
const btnGridToggle = document.getElementById('btnGridToggle');
const btnFullscreenBottom = document.getElementById('btnFullscreenBottom');

// Presentation & Export
const btnPresent = document.getElementById('btnPresent');
const presentModal = document.getElementById('presentModal');
const presentImg = document.getElementById('presentImg');
const presentCounter = document.getElementById('presentCounter');
const btnClosePresent = document.getElementById('btnClosePresent');
const btnPresentPrev = document.getElementById('btnPresentPrev');
const btnPresentNext = document.getElementById('btnPresentNext');
const btnExportPPTX = document.getElementById('btnExportPPTX');
const menuDownloadPPTX = document.getElementById('menuDownloadPPTX');

// Toast
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// --- 1. INITIALIZE FABRIC CANVAS ---
function initFabricCanvas() {
  fabricCanvas = new fabric.Canvas('fabricCanvas', {
    width: 960,
    height: 540,
    backgroundColor: null, // Transparent, no white bleaching!
    preserveObjectStacking: true,
    selection: true,
  });

  // Canva-style clean selection handles
  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.cornerColor = '#00c4cc';
  fabric.Object.prototype.cornerStrokeColor = '#ffffff';
  fabric.Object.prototype.borderColor = '#00c4cc';
  fabric.Object.prototype.cornerSize = 9;
  fabric.Object.prototype.cornerStyle = 'circle';
  fabric.Object.prototype.borderDashArray = [3, 3];

  fabricCanvas.on('selection:created', onObjectSelected);
  fabricCanvas.on('selection:updated', onObjectSelected);
  fabricCanvas.on('selection:cleared', onObjectDeselected);

  fabricCanvas.on('object:modified', () => {
    markSlideDirty();
    updateCurrentSlideThumbnail();
    saveCanvasState();
  });
  fabricCanvas.on('object:added', (e) => {
    if (e.target && !e.target.isSystemLoaded) {
      markSlideDirty();
      saveCanvasState();
    }
  });
  fabricCanvas.on('object:removed', () => {
    markSlideDirty();
    updateCurrentSlideThumbnail();
    saveCanvasState();
  });

  window.addEventListener('keydown', handleGlobalKeydown);

  // Initialize Canva Nav Rail
  setupCanvaNavRail();

  if (window.lucide) lucide.createIcons();
}

function markSlideDirty() {
  if (currentDeck && currentDeck.slides[currentSlideIndex]) {
    currentDeck.slides[currentSlideIndex].isEdited = true;
    saveStatus.textContent = "Đang lưu...";
    setTimeout(() => {
      saveStatus.textContent = "Đã lưu";
    }, 1000);
  }
}

// --- 2. CANVA NAV RAIL & DRAWER MANAGEMENT ---
function setupCanvaNavRail() {
  navTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // If drawer is collapsed, expand it
      if (canvaDrawer.classList.contains('w-0')) {
        expandDrawer();
      }

      // Highlight active tab
      navTabBtns.forEach(b => b.classList.remove('canva-tab-active', 'bg-slate-800'));
      btn.classList.add('bg-slate-800');

      // Switch pane
      tabPanes.forEach(pane => pane.classList.add('hidden'));
      const activePane = document.getElementById(targetTab.replace('tab-', 'pane-'));
      if (activePane) {
        activePane.classList.remove('hidden');
      }
    });
  });

  // Activate first tab by default
  if (navTabBtns.length > 0) {
    navTabBtns[0].classList.add('bg-slate-800');
  }

  btnCollapseDrawer.addEventListener('click', toggleDrawer);
  btnGridToggle.addEventListener('click', () => {
    // Open slides tab
    expandDrawer();
    navTabBtns[0].click();
  });
}

function toggleDrawer() {
  if (canvaDrawer.classList.contains('w-0')) {
    expandDrawer();
  } else {
    collapseDrawer();
  }
}

function collapseDrawer() {
  canvaDrawer.classList.remove('w-80');
  canvaDrawer.classList.add('w-0', 'overflow-hidden');
  btnCollapseDrawer.innerHTML = '<i data-lucide="chevron-right" class="w-4 h-4"></i>';
  if (window.lucide) lucide.createIcons();
}

function expandDrawer() {
  canvaDrawer.classList.remove('w-0', 'overflow-hidden');
  canvaDrawer.classList.add('w-80');
  btnCollapseDrawer.innerHTML = '<i data-lucide="chevron-left" class="w-4 h-4"></i>';
  if (window.lucide) lucide.createIcons();
}

// --- 3. UPLOAD & IMPORT HANDLING ---
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) uploadPPTX(e.target.files[0]);
});
menuFileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) uploadPPTX(e.target.files[0]);
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-cyan-400', 'bg-cyan-950/20');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-cyan-400', 'bg-cyan-950/20');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-cyan-400', 'bg-cyan-950/20');
  if (e.dataTransfer.files.length > 0) uploadPPTX(e.dataTransfer.files[0]);
});

btnLoadSample.addEventListener('click', loadSampleDeck);

async function loadSampleDeck() {
  showLoader("Đang nạp slide mẫu và bóc tách font nhúng...");
  try {
    const res = await fetch('/api/demo/sample', { method: 'POST' });
    if (!res.ok) throw new Error("Không thể tải slide mẫu");
    const data = await res.json();
    setupDeck(data);
  } catch (err) {
    showToast("Lỗi: " + err.message, true);
  } finally {
    hideLoader();
  }
}

async function uploadPPTX(file) {
  if (!file.name.match(/\.(pptx|ppt)$/i)) {
    showToast("Vui lòng tải lên tệp PowerPoint (.pptx)", true);
    return;
  }

  showLoader(`Đang xử lý ${file.name} (Bóc tách font & vector)...`);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/import/pptx', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Xử lý file thất bại");
    }
    const data = await res.json();
    setupDeck(data);
  } catch (err) {
    showToast("Lỗi khi import file: " + err.message, true);
  } finally {
    hideLoader();
  }
}

function showLoader(text) {
  loaderText.textContent = text;
  uploadLoader.classList.remove('hidden');
}
function hideLoader() {
  uploadLoader.classList.add('hidden');
}

// --- 4. DECK SETUP & FONT REGISTRATION ---
function setupDeck(deck, updateUrl = true, toastMsgText = null) {
  currentDeck = deck;
  currentSlideIndex = 0;

  // Đảm bảo có định danh Canva Design ID và Edit Token
  if (!currentDeck.designId) {
    currentDeck.designId = generateCanvaDesignId();
  }
  if (!currentDeck.editToken) {
    currentDeck.editToken = generateCanvaEditToken();
  }

  // Cập nhật đường dẫn URL trình duyệt dạng: /design/DAHZkAweP4E/wUu2lyK44xWo7cA5B31vBg/edit
  if (updateUrl) {
    updateBrowserUrlForDesign(currentDeck.designId, currentDeck.editToken);
  }

  saveDeckToLocalStorage(currentDeck);

  deckTitleInput.value = (deck.filename || "Thiết kế không tên - Bài thuyết trình").replace(/\.(pptx|ppt)$/i, '');
  slideTotalBadge.textContent = deck.slideCount || deck.slides.length;
  bottomSlideCounter.textContent = `1 / ${deck.slideCount || deck.slides.length}`;

  if (!fabricCanvas) {
    initFabricCanvas();
  }

  loadCustomFonts(deck.customFonts || []);

  uploadView.classList.add('hidden');
  editorView.classList.remove('hidden');

  renderSlideThumbnails();
  loadSlideToCanvas(0);

  if (toastMsgText) {
    showToast(toastMsgText);
  } else {
    showToast(`Đã mở bài thiết kế: ${currentDeck.designId}`);
  }

  if (window.lucide) lucide.createIcons();
}

// Tạo Bản Thuyết Trình Trắng Mới (Canva New Presentation)
function createNewBlankPresentation() {
  const designId = generateCanvaDesignId();
  const editToken = generateCanvaEditToken();

  const newDeck = {
    id: designId,
    designId: designId,
    editToken: editToken,
    filename: "Thiết kế không tên - Bài thuyết trình",
    slideCount: 1,
    canvas: {
      width: 1920,
      height: 1080,
      aspectRatio: 1.78
    },
    customFonts: [],
    slides: [
      {
        index: 0,
        title: "Trang 1",
        width: 1920,
        height: 1080,
        elements: [],
        fabricJson: null,
        isEdited: true,
        useCustomColor: true,
        customColor: "#ffffff"
      }
    ]
  };

  setupDeck(newDeck, true, `Đã tạo bản thuyết trình mới! (${designId})`);
}

function loadCustomFonts(customFonts) {
  customFontsGroup.innerHTML = '';
  if (!customFonts || customFonts.length === 0) return;

  customFonts.forEach(fontInfo => {
    const family = fontInfo.family;
    const url = fontInfo.url;

    const fontFace = new FontFace(family, `url(${url})`);
    fontFace.load().then(loaded => {
      document.fonts.add(loaded);
      console.log(`Loaded custom font: ${family}`);
      if (fabricCanvas) fabricCanvas.requestRenderAll();
    }).catch(err => {
      console.warn(`Could not load font ${family}:`, err);
    });

    const opt = document.createElement('option');
    opt.value = family;
    opt.textContent = `${family} (Font Nhúng)`;
    customFontsGroup.appendChild(opt);
  });
}

// --- 5. CANVA-STYLE SLIDE THUMBNAILS (2-COLUMN GRID) ---
function renderSlideThumbnails() {
  thumbnailContainer.innerHTML = '';
  if (!currentDeck || !currentDeck.slides) return;

  currentDeck.slides.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.id = `slide-thumb-${idx}`;
    card.className = `p-1.5 rounded-lg border border-slate-700/60 bg-slate-900/90 cursor-pointer flex flex-col gap-1 relative group transition-all ${
      idx === currentSlideIndex ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400' : 'hover:border-slate-500'
    }`;

    // Thumbnail Preview Frame
    const frame = document.createElement('div');
    frame.className = 'w-full aspect-video bg-black rounded overflow-hidden relative shadow-sm border border-slate-800';

    const img = document.createElement('img');
    img.id = `thumb-img-${idx}`;
    img.src = (slide.isEdited && slide.thumbnailUrl) ? slide.thumbnailUrl : (slide.renderPngUrl || slide.thumbnailUrl || '');
    img.alt = `Slide ${idx + 1}`;
    img.className = 'w-full h-full object-contain';

    const badge = document.createElement('span');
    badge.className = 'absolute bottom-1 left-1 bg-black/80 text-[9px] text-white font-bold px-1 py-0.5 rounded';
    badge.textContent = idx + 1;

    frame.appendChild(img);
    frame.appendChild(badge);

    // Title
    const titleP = document.createElement('p');
    titleP.className = 'text-[10px] font-medium text-slate-300 truncate px-0.5';
    titleP.textContent = slide.title || `Trang ${idx + 1}`;

    // Hover Action Buttons (Duplicate, Delete)
    const hoverActions = document.createElement('div');
    hoverActions.className = 'absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5 bg-slate-900/95 p-0.5 rounded border border-slate-700 z-10';

    const btnDup = document.createElement('button');
    btnDup.title = 'Nhân bản slide';
    btnDup.className = 'p-1 hover:text-cyan-400 text-slate-300';
    btnDup.innerHTML = '<i data-lucide="copy" class="w-3 h-3"></i>';
    btnDup.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateSlide(idx);
    });

    const btnDel = document.createElement('button');
    btnDel.title = 'Xóa slide';
    btnDel.className = 'p-1 hover:text-red-400 text-slate-300';
    btnDel.innerHTML = '<i data-lucide="trash-2" class="w-3 h-3"></i>';
    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSlide(idx);
    });

    hoverActions.appendChild(btnDup);
    hoverActions.appendChild(btnDel);

    card.appendChild(frame);
    card.appendChild(titleP);
    card.appendChild(hoverActions);

    card.addEventListener('click', () => {
      if (currentSlideIndex !== idx) {
        saveCurrentSlideState();
        loadSlideToCanvas(idx);
      }
    });

    thumbnailContainer.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function updateCurrentSlideThumbnail() {
  if (!fabricCanvas || !currentDeck || !currentDeck.slides[currentSlideIndex]) return;
  if (!currentDeck.slides[currentSlideIndex].isEdited) return;

  const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 0.8 });
  const thumbImg = document.getElementById(`thumb-img-${currentSlideIndex}`);
  if (thumbImg) {
    thumbImg.src = dataUrl;
  }
  currentDeck.slides[currentSlideIndex].thumbnailUrl = dataUrl;
}

function saveCurrentSlideState() {
  if (!fabricCanvas || !currentDeck || !currentDeck.slides[currentSlideIndex]) return;
  if (currentDeck.slides[currentSlideIndex].isEdited) {
    currentDeck.slides[currentSlideIndex].fabricJson = fabricCanvas.toJSON();
  }
  saveDeckToLocalStorage(currentDeck);
}

// --- 6. LOAD SLIDE (NEVER AUTO-WHITEWASH / 100% PRISTINE BACKGROUND) ---
function loadSlideToCanvas(idx) {
  if (!currentDeck || !currentDeck.slides[idx]) return;
  currentSlideIndex = idx;

  // Update left thumbnail highlight
  currentDeck.slides.forEach((_, i) => {
    const el = document.getElementById(`slide-thumb-${i}`);
    if (el) {
      if (i === idx) {
        el.className = 'p-1.5 rounded-lg border border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 cursor-pointer flex flex-col gap-1 relative group';
      } else {
        el.className = 'p-1.5 rounded-lg border border-slate-700/60 bg-slate-900/90 hover:border-slate-500 cursor-pointer flex flex-col gap-1 relative group';
      }
    }
  });

  const slide = currentDeck.slides[idx];
  activeSlideTitleText.textContent = slide.title || `Trang ${idx + 1}`;
  bottomSlideCounter.textContent = `${idx + 1} / ${currentDeck.slides.length}`;

  fabricCanvas.clear();
  fabricCanvas.backgroundColor = null; // Transparent, NO white bleaching!

  const targetW = 960;
  const targetH = 540;

  slide.isEditOverlayActive = false;
  toggleEditText.textContent = "Bật Sửa Chữ Trên Slide";

  if (slide.useCustomColor && slide.customColor) {
    fabricCanvas.backgroundColor = slide.customColor;
  } else if (slide.renderPngUrl) {
    // 100% PRISTINE FULL COLOR ORIGINAL SLIDE
    fabric.Image.fromURL(slide.renderPngUrl, (bgImg) => {
      bgImg.set({
        scaleX: targetW / bgImg.width,
        scaleY: targetH / bgImg.height,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
        opacity: 1.0 // 100% sharp, zero bleach!
      });
      fabricCanvas.setBackgroundImage(bgImg, fabricCanvas.renderAll.bind(fabricCanvas));
    });
  } else {
    fabricCanvas.backgroundColor = '#ffffff';
  }

  // Restore user-added objects if any
  if (slide.fabricJson && slide.fabricJson.objects && slide.fabricJson.objects.length > 0) {
    fabric.util.enlivenObjects(slide.fabricJson.objects, (enlivenedObjects) => {
      enlivenedObjects.forEach((obj) => {
        obj.isSystemLoaded = true;
        fabricCanvas.add(obj);
      });
      fabricCanvas.renderAll();
    });
  } else {
    fabricCanvas.renderAll();
  }
}

// Toggle Extracted Text Overlay
btnToggleEditOverlay.addEventListener('click', () => {
  if (!currentDeck || !currentDeck.slides[currentSlideIndex]) return;
  const slide = currentDeck.slides[currentSlideIndex];

  if (slide.isEditOverlayActive) {
    const objects = fabricCanvas.getObjects().slice();
    objects.forEach(obj => {
      if (obj.isExtractedOverlay) fabricCanvas.remove(obj);
    });
    slide.isEditOverlayActive = false;
    toggleEditText.textContent = "Bật Sửa Chữ Trên Slide";
    showToast("Đã tắt lớp sửa chữ, hiển thị slide gốc 100%");
  } else {
    if (!slide.elements || slide.elements.length === 0) {
      showToast("Trang này không có văn bản nào bóc tách được", true);
      return;
    }

    const origW = currentDeck.canvas.width || 1280;
    const origH = currentDeck.canvas.height || 720;
    const targetW = 960;
    const targetH = 540;
    const scaleX = targetW / origW;
    const scaleY = targetH / origH;

    let addedCount = 0;
    slide.elements.forEach(el => {
      if (el.type === 'text') {
        const textObj = new fabric.Textbox(el.content || '', {
          left: Math.round(el.x * scaleX),
          top: Math.round(el.y * scaleY),
          width: Math.max(80, Math.round(el.width * scaleX)),
          fontSize: Math.max(12, Math.round((el.style.fontSize || 16) * scaleY)),
          fontFamily: el.style.fontFamily || 'Inter',
          fill: el.style.color || '#0f172a',
          fontWeight: el.style.bold ? '700' : '400',
          fontStyle: el.style.italic ? 'italic' : 'normal',
          textAlign: el.style.align || 'left',
          splitByGrapheme: false,
          isExtractedOverlay: true,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 4,
          stroke: '#00c4cc',
          strokeWidth: 1,
          strokeDashArray: [3, 3],
        });
        textObj.isSystemLoaded = true;
        fabricCanvas.add(textObj);
        addedCount++;
      }
    });

    slide.isEditOverlayActive = true;
    toggleEditText.textContent = "Tắt Sửa Chữ Trên Slide";
    fabricCanvas.renderAll();
    showToast(`Đã bật ${addedCount} hộp chữ để chỉnh sửa trực tiếp!`);
  }
});

// Restore Original Background
btnRestoreOriginalBg.addEventListener('click', () => {
  if (!currentDeck || !currentDeck.slides[currentSlideIndex]) return;
  const slide = currentDeck.slides[currentSlideIndex];

  slide.useCustomColor = false;
  slide.customColor = null;

  fabricCanvas.backgroundColor = null;
  if (slide.renderPngUrl) {
    fabric.Image.fromURL(slide.renderPngUrl, (bgImg) => {
      bgImg.set({
        scaleX: 960 / bgImg.width,
        scaleY: 540 / bgImg.height,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
        opacity: 1.0
      });
      fabricCanvas.setBackgroundImage(bgImg, fabricCanvas.renderAll.bind(fabricCanvas));
    });
  }
  showToast("Đã khôi phục nền gốc 100%!");
});

// Apply Solid Color
document.querySelectorAll('[data-color]').forEach(btn => {
  btn.addEventListener('click', () => {
    applySolidBackgroundColor(btn.getAttribute('data-color'));
  });
});
slideCustomBg.addEventListener('input', () => {
  applySolidBackgroundColor(slideCustomBg.value);
});

function applySolidBackgroundColor(color) {
  if (!currentDeck || !currentDeck.slides[currentSlideIndex]) return;
  const slide = currentDeck.slides[currentSlideIndex];

  fabricCanvas.setBackgroundImage(null, () => {
    fabricCanvas.backgroundColor = color;
    fabricCanvas.renderAll();
  });

  slide.useCustomColor = true;
  slide.customColor = color;
  markSlideDirty();
  updateCurrentSlideThumbnail();
  showToast("Đã đổi màu nền slide!");
}

// Add New Blank Slide
btnAddSlide.addEventListener('click', addNewSlide);
btnAddSlideBottom.addEventListener('click', addNewSlide);

function addNewSlide() {
  if (!currentDeck) return;
  saveCurrentSlideState();
  const newIdx = currentDeck.slides.length;
  const newSlide = {
    index: newIdx,
    title: `Trang ${newIdx + 1}`,
    elements: [],
    fabricJson: null,
    isEdited: true,
  };
  currentDeck.slides.push(newSlide);
  slideTotalBadge.textContent = currentDeck.slides.length;
  renderSlideThumbnails();
  loadSlideToCanvas(newIdx);
  showToast("Đã thêm trang mới!");
}

function duplicateSlide(idx) {
  if (!currentDeck || !currentDeck.slides[idx]) return;
  saveCurrentSlideState();
  const sourceSlide = currentDeck.slides[idx];
  const duplicated = JSON.parse(JSON.stringify(sourceSlide));
  duplicated.index = idx + 1;
  duplicated.title = `${sourceSlide.title} (Bản sao)`;
  duplicated.isEdited = true;
  currentDeck.slides.splice(idx + 1, 0, duplicated);
  
  currentDeck.slides.forEach((s, i) => s.index = i);
  slideTotalBadge.textContent = currentDeck.slides.length;
  renderSlideThumbnails();
  loadSlideToCanvas(idx + 1);
  showToast("Đã nhân bản slide!");
}

function deleteSlide(idx) {
  if (!currentDeck || currentDeck.slides.length <= 1) {
    showToast("Không thể xóa slide duy nhất!", true);
    return;
  }
  currentDeck.slides.splice(idx, 1);
  currentDeck.slides.forEach((s, i) => s.index = i);
  slideTotalBadge.textContent = currentDeck.slides.length;
  renderSlideThumbnails();
  const targetIdx = Math.min(idx, currentDeck.slides.length - 1);
  loadSlideToCanvas(targetIdx);
  showToast("Đã xóa slide!");
}

// --- 7. CANVA CONTEXTUAL FLOATING TOOLBAR ---
function onObjectSelected() {
  const activeObj = fabricCanvas.getActiveObject();
  if (!activeObj) {
    onObjectDeselected();
    return;
  }

  ctxUniversalGroup.classList.remove('hidden');
  ctxCanvasGroup.classList.add('hidden');

  const type = activeObj.type;

  if (type === 'textbox' || type === 'text' || type === 'i-text') {
    ctxTextGroup.classList.remove('hidden');
    ctxTextGroup.classList.add('flex');
    ctxShapeGroup.classList.add('hidden');
    ctxImageGroup.classList.add('hidden');

    fontFamilySelect.value = activeObj.fontFamily || 'Inter';
    fontSizeInput.value = Math.round(activeObj.fontSize || 20);
    textColorInput.value = activeObj.fill || '#0f172a';

    btnBold.className = activeObj.fontWeight === '700' || activeObj.fontWeight === 'bold'
      ? 'w-7 h-7 flex items-center justify-center font-bold bg-cyan-600 rounded text-white'
      : 'w-7 h-7 flex items-center justify-center font-bold hover:bg-slate-800 rounded text-slate-300';

    btnItalic.className = activeObj.fontStyle === 'italic'
      ? 'w-7 h-7 flex items-center justify-center italic bg-cyan-600 rounded text-white'
      : 'w-7 h-7 flex items-center justify-center italic hover:bg-slate-800 rounded text-slate-300';

    btnUnderline.className = activeObj.underline
      ? 'w-7 h-7 flex items-center justify-center underline bg-cyan-600 rounded text-white'
      : 'w-7 h-7 flex items-center justify-center underline hover:bg-slate-800 rounded text-slate-300';

  } else if (type === 'rect' || type === 'circle' || type === 'triangle' || type === 'polygon' || type === 'line') {
    ctxShapeGroup.classList.remove('hidden');
    ctxShapeGroup.classList.add('flex');
    ctxTextGroup.classList.add('hidden');
    ctxImageGroup.classList.add('hidden');

    shapeFillInput.value = activeObj.fill || '#3b82f6';
    shapeStrokeInput.value = activeObj.stroke || '#000000';
    shapeStrokeWidth.value = activeObj.strokeWidth || 0;

  } else if (type === 'image') {
    ctxImageGroup.classList.remove('hidden');
    ctxImageGroup.classList.add('flex');
    ctxTextGroup.classList.add('hidden');
    ctxShapeGroup.classList.add('hidden');

    imageOpacityInput.value = Math.round((activeObj.opacity || 1) * 100);
  }
}

function onObjectDeselected() {
  ctxCanvasGroup.classList.remove('hidden');
  ctxTextGroup.classList.add('hidden');
  ctxShapeGroup.classList.add('hidden');
  ctxImageGroup.classList.add('hidden');
  ctxUniversalGroup.classList.add('hidden');
}

// Text Controls Listeners
fontFamilySelect.addEventListener('change', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    activeObj.set('fontFamily', fontFamilySelect.value);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
});

btnFontInc.addEventListener('click', () => {
  fontSizeInput.value = (parseInt(fontSizeInput.value) || 20) + 2;
  updateFontSize();
});
btnFontDec.addEventListener('click', () => {
  fontSizeInput.value = Math.max(8, (parseInt(fontSizeInput.value) || 20) - 2);
  updateFontSize();
});
fontSizeInput.addEventListener('input', updateFontSize);

function updateFontSize() {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    activeObj.set('fontSize', parseInt(fontSizeInput.value) || 16);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
}

textColorInput.addEventListener('input', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    activeObj.set('fill', textColorInput.value);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
});

btnBold.addEventListener('click', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    const isBold = activeObj.fontWeight === 'bold' || activeObj.fontWeight === '700';
    activeObj.set('fontWeight', isBold ? 'normal' : '700');
    fabricCanvas.requestRenderAll();
    onObjectSelected();
    markSlideDirty();
    saveCanvasState();
  }
});

btnItalic.addEventListener('click', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    const isItalic = activeObj.fontStyle === 'italic';
    activeObj.set('fontStyle', isItalic ? 'normal' : 'italic');
    fabricCanvas.requestRenderAll();
    onObjectSelected();
    markSlideDirty();
    saveCanvasState();
  }
});

btnUnderline.addEventListener('click', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    activeObj.set('underline', !activeObj.underline);
    fabricCanvas.requestRenderAll();
    onObjectSelected();
    markSlideDirty();
    saveCanvasState();
  }
});

btnAlignLeft.addEventListener('click', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    const currentAlign = activeObj.textAlign;
    const nextAlign = currentAlign === 'left' ? 'center' : (currentAlign === 'center' ? 'right' : 'left');
    activeObj.set('textAlign', nextAlign);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
});

// Shape Controls Listeners
shapeFillInput.addEventListener('input', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    activeObj.set('fill', shapeFillInput.value);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
});

shapeStrokeInput.addEventListener('input', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    activeObj.set('stroke', shapeStrokeInput.value);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
});

shapeStrokeWidth.addEventListener('input', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    activeObj.set('strokeWidth', parseInt(shapeStrokeWidth.value) || 0);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
});

// Image Opacity
imageOpacityInput.addEventListener('input', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj && activeObj.set) {
    activeObj.set('opacity', parseInt(imageOpacityInput.value) / 100);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
});

// Layer & Delete
btnBringForward.addEventListener('click', () => {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj) {
    activeObj.bringForward();
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
});

btnDuplicateObj.addEventListener('click', duplicateActiveObject);
btnDeleteObj.addEventListener('click', deleteActiveObject);

function duplicateActiveObject() {
  const activeObj = fabricCanvas.getActiveObject();
  if (!activeObj) return;
  activeObj.clone((cloned) => {
    cloned.set({
      left: activeObj.left + 20,
      top: activeObj.top + 20,
      evented: true,
    });
    fabricCanvas.add(cloned);
    fabricCanvas.setActiveObject(cloned);
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  });
}

function deleteActiveObject() {
  const activeObj = fabricCanvas.getActiveObject();
  if (activeObj) {
    fabricCanvas.remove(activeObj);
    fabricCanvas.discardActiveObject();
    fabricCanvas.requestRenderAll();
    markSlideDirty();
    saveCanvasState();
  }
}

function handleGlobalKeydown(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'Delete' || e.key === 'Backspace') {
    deleteActiveObject();
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    handleUndo();
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault();
    handleRedo();
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    duplicateActiveObject();
  } else if (e.key === 'F5') {
    e.preventDefault();
    openPresentationMode();
  }
}

// --- 8. DRAWER ELEMENT CREATION ---
btnAddHeading.addEventListener('click', () => {
  const text = new fabric.Textbox('Tiêu Đề Lớn', {
    left: 120,
    top: 100,
    width: 600,
    fontSize: 44,
    fontFamily: 'Inter',
    fontWeight: '700',
    fill: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 6,
  });
  fabricCanvas.add(text);
  fabricCanvas.setActiveObject(text);
  markSlideDirty();
  saveCanvasState();
});

btnAddSubheading.addEventListener('click', () => {
  const text = new fabric.Textbox('Tiêu Đề Phụ Thuyết Trình', {
    left: 120,
    top: 180,
    width: 500,
    fontSize: 26,
    fontFamily: 'Inter',
    fontWeight: '600',
    fill: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 4,
  });
  fabricCanvas.add(text);
  fabricCanvas.setActiveObject(text);
  markSlideDirty();
  saveCanvasState();
});

btnAddBody.addEventListener('click', () => {
  const text = new fabric.Textbox('Nhập nội dung đoạn văn bản giải thích chi tiết tại đây...', {
    left: 120,
    top: 240,
    width: 450,
    fontSize: 16,
    fontFamily: 'Inter',
    fill: '#ffffff',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 4,
  });
  fabricCanvas.add(text);
  fabricCanvas.setActiveObject(text);
  markSlideDirty();
  saveCanvasState();
});

btnAddRect.addEventListener('click', () => {
  const rect = new fabric.Rect({
    left: 200,
    top: 150,
    width: 220,
    height: 140,
    fill: '#00c4cc',
    rx: 8,
    ry: 8,
  });
  fabricCanvas.add(rect);
  fabricCanvas.setActiveObject(rect);
  markSlideDirty();
  saveCanvasState();
});

btnAddCircle.addEventListener('click', () => {
  const circle = new fabric.Circle({
    left: 250,
    top: 160,
    radius: 70,
    fill: '#10b981',
  });
  fabricCanvas.add(circle);
  fabricCanvas.setActiveObject(circle);
  markSlideDirty();
  saveCanvasState();
});

btnAddTriangle.addEventListener('click', () => {
  const tri = new fabric.Triangle({
    left: 260,
    top: 160,
    width: 140,
    height: 120,
    fill: '#f59e0b',
  });
  fabricCanvas.add(tri);
  fabricCanvas.setActiveObject(tri);
  markSlideDirty();
  saveCanvasState();
});

btnAddStar.addEventListener('click', () => {
  const points = [
    {x: 75, y: 0}, {x: 95, y: 50}, {x: 150, y: 55}, {x: 108, y: 90},
    {x: 122, y: 145}, {x: 75, y: 115}, {x: 28, y: 145}, {x: 42, y: 90},
    {x: 0, y: 55}, {x: 55, y: 50}
  ];
  const star = new fabric.Polygon(points, {
    left: 250,
    top: 150,
    fill: '#eab308',
    scaleX: 0.9,
    scaleY: 0.9,
  });
  fabricCanvas.add(star);
  fabricCanvas.setActiveObject(star);
  markSlideDirty();
  saveCanvasState();
});

btnAddLine.addEventListener('click', () => {
  const line = new fabric.Line([50, 50, 300, 50], {
    left: 200,
    top: 200,
    stroke: '#7d2ae8',
    strokeWidth: 4,
  });
  fabricCanvas.add(line);
  fabricCanvas.setActiveObject(line);
  markSlideDirty();
  saveCanvasState();
});

imageUploaderInput.addEventListener('change', (e) => {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target.result, (img) => {
        img.scaleToWidth(300);
        img.set({ left: 200, top: 150 });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        markSlideDirty();
        saveCanvasState();
        showToast("Đã chèn ảnh thành công!");
      });
    };
    reader.readAsDataURL(e.target.files[0]);
  }
});

btnAddTable.addEventListener('click', () => {
  const rows = 3;
  const cols = 3;
  const cellW = 160;
  const cellH = 45;
  const startX = 180;
  const startY = 150;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isHeader = r === 0;
      const cellRect = new fabric.Rect({
        left: startX + c * cellW,
        top: startY + r * cellH,
        width: cellW,
        height: cellH,
        fill: isHeader ? '#0e7490' : (r % 2 === 0 ? '#1e293b' : '#0f172a'),
        stroke: '#334155',
        strokeWidth: 1,
      });

      const cellText = new fabric.Textbox(isHeader ? `Cột ${c + 1}` : `Dữ liệu ${r},${c + 1}`, {
        left: startX + c * cellW + 10,
        top: startY + r * cellH + 12,
        width: cellW - 20,
        fontSize: isHeader ? 14 : 12,
        fontWeight: isHeader ? '700' : '400',
        fill: '#ffffff',
        fontFamily: 'Inter',
      });

      fabricCanvas.add(cellRect);
      fabricCanvas.add(cellText);
    }
  }
  fabricCanvas.renderAll();
  markSlideDirty();
  saveCanvasState();
  showToast("Đã chèn bảng dữ liệu!");
});

// --- 9. ZOOM & BOTTOM BAR CONTROLS ---
zoomSlider.addEventListener('input', () => {
  setZoom(parseInt(zoomSlider.value) / 100);
});

function setZoom(val) {
  currentZoom = Math.round(val * 100) / 100;
  zoomLevelText.textContent = `${Math.round(currentZoom * 100)}%`;
  zoomSlider.value = Math.round(currentZoom * 100);
  const wrapper = document.getElementById('canvasWrapper');
  if (wrapper) {
    wrapper.style.transform = `scale(${currentZoom})`;
    wrapper.style.transformOrigin = 'center center';
  }
}

btnPrevSlideBottom.addEventListener('click', () => {
  if (currentDeck && currentSlideIndex > 0) {
    saveCurrentSlideState();
    loadSlideToCanvas(currentSlideIndex - 1);
  }
});

btnNextSlideBottom.addEventListener('click', () => {
  if (currentDeck && currentSlideIndex < currentDeck.slides.length - 1) {
    saveCurrentSlideState();
    loadSlideToCanvas(currentSlideIndex + 1);
  }
});

btnFullscreenBottom.addEventListener('click', openPresentationMode);

// --- 10. STATE & UNDO/REDO ---
function saveCanvasState() {
  if (!fabricCanvas) return;
  undoStack.push(JSON.stringify(fabricCanvas.toJSON()));
  redoStack = [];
  if (undoStack.length > 30) undoStack.shift();
  saveCurrentSlideState();
}

btnUndo.addEventListener('click', handleUndo);
btnRedo.addEventListener('click', handleRedo);

function handleUndo() {
  if (undoStack.length > 1) {
    const current = undoStack.pop();
    redoStack.push(current);
    const prev = undoStack[undoStack.length - 1];
    fabricCanvas.loadFromJSON(prev, () => {
      fabricCanvas.renderAll();
      updateCurrentSlideThumbnail();
    });
  }
}

function handleRedo() {
  if (redoStack.length > 0) {
    const next = redoStack.pop();
    undoStack.push(next);
    fabricCanvas.loadFromJSON(next, () => {
      fabricCanvas.renderAll();
      updateCurrentSlideThumbnail();
    });
  }
}

// --- 11. FULLSCREEN PRESENTATION MODE (F5) ---
btnPresent.addEventListener('click', openPresentationMode);
btnClosePresent.addEventListener('click', closePresentationMode);
btnPresentPrev.addEventListener('click', () => navigatePresentSlide(-1));
btnPresentNext.addEventListener('click', () => navigatePresentSlide(1));

function openPresentationMode() {
  if (!currentDeck || currentDeck.slides.length === 0) return;
  saveCurrentSlideState();
  presentModal.classList.remove('hidden');
  updatePresentationSlide(currentSlideIndex);

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function closePresentationMode() {
  presentModal.classList.add('hidden');
  if (document.exitFullscreen && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

function navigatePresentSlide(step) {
  if (!currentDeck) return;
  const newIdx = currentSlideIndex + step;
  if (newIdx >= 0 && newIdx < currentDeck.slides.length) {
    currentSlideIndex = newIdx;
    updatePresentationSlide(newIdx);
  }
}

function updatePresentationSlide(idx) {
  const slide = currentDeck.slides[idx];
  presentCounter.textContent = `${idx + 1} / ${currentDeck.slides.length}`;
  if (slide.isEdited && slide.thumbnailUrl) {
    presentImg.src = slide.thumbnailUrl;
  } else if (slide.renderPngUrl) {
    presentImg.src = slide.renderPngUrl;
  }
}

window.addEventListener('keydown', (e) => {
  if (!presentModal.classList.contains('hidden')) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      navigatePresentSlide(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      navigatePresentSlide(-1);
    } else if (e.key === 'Escape') {
      closePresentationMode();
    }
  }
});

// --- 12. EXPORT ENGINE: EXPORT TO NATIVE .PPTX ---
btnExportPPTX.addEventListener('click', exportDeckToPPTX);
menuDownloadPPTX.addEventListener('click', exportDeckToPPTX);

async function exportDeckToPPTX() {
  if (!currentDeck || currentDeck.slides.length === 0) {
    showToast("Không có slide nào để xuất!", true);
    return;
  }

  saveCurrentSlideState();
  showToast("Đang tạo file PowerPoint (.pptx)...");

  try {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    const filename = (deckTitleInput.value.trim() || "SlideCraft_Presentation") + ".pptx";

    for (let i = 0; i < currentDeck.slides.length; i++) {
      const slide = currentDeck.slides[i];
      const pptxSlide = pptx.addSlide();

      if (slide.useCustomColor && slide.customColor) {
        pptxSlide.background = { color: slide.customColor.replace('#', '') };
      } else {
        let bgUrl = (slide.isEdited && slide.thumbnailUrl) ? slide.thumbnailUrl : slide.renderPngUrl;
        if (bgUrl) {
          pptxSlide.addImage({
            data: bgUrl,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
          });
        }
      }

      if (slide.fabricJson && slide.fabricJson.objects) {
        slide.fabricJson.objects.forEach(obj => {
          if (obj.type === 'textbox' || obj.type === 'text') {
            const inchX = (obj.left / 960) * 13.333;
            const inchY = (obj.top / 540) * 7.5;
            const inchW = (obj.width / 960) * 13.333;
            const inchH = (obj.height / 540) * 7.5;

            pptxSlide.addText(obj.text || '', {
              x: inchX,
              y: inchY,
              w: Math.max(1.0, inchW),
              h: Math.max(0.4, inchH),
              fontSize: obj.fontSize ? Math.min(60, obj.fontSize * 0.75) : 16,
              fontFace: obj.fontFamily || 'Arial',
              color: (obj.fill || '#FFFFFF').replace('#', ''),
              bold: !!(obj.fontWeight === 'bold' || obj.fontWeight === '700'),
              italic: !!(obj.fontStyle === 'italic'),
              align: obj.textAlign || 'left',
              valign: 'middle',
            });
          }
        });
      }
    }

    await pptx.writeFile({ fileName: filename });
    showToast(`Xuất file "${filename}" thành công!`);
  } catch (err) {
    console.error("Export error:", err);
    showToast("Lỗi khi xuất file PPTX: " + err.message, true);
  }
}

// --- 13. TOAST HELPER ---
function showToast(msg, isError = false) {
  toastMsg.textContent = msg;
  if (isError) {
    toast.className = "fixed bottom-12 right-6 bg-red-950 border border-red-700 text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 transition-all transform toast-visible z-50";
  } else {
    toast.className = "fixed bottom-12 right-6 bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 transition-all transform toast-visible z-50";
  }

  setTimeout(() => {
    toast.classList.remove('toast-visible');
  }, 3500);
}

// --- 14. CANVA URL ROUTING & LINK SHARING ---
if (btnCopyDesignLink) {
  btnCopyDesignLink.addEventListener('click', () => {
    if (!currentDeck || !currentDeck.designId) {
      showToast("Chưa có bài thiết kế nào đang mở", true);
      return;
    }
    const fullUrl = `${window.location.origin}/design/${currentDeck.designId}/${currentDeck.editToken}/edit`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast("Đã sao chép link bài thiết kế!");
      }).catch(() => {
        prompt("Sao chép liên kết bài thiết kế:", fullUrl);
      });
    } else {
      prompt("Sao chép liên kết bài thiết kế:", fullUrl);
    }
  });
}

if (menuCreateNew) {
  menuCreateNew.addEventListener('click', createNewBlankPresentation);
}

if (btnCreateBlankDeck) {
  btnCreateBlankDeck.addEventListener('click', createNewBlankPresentation);
}

deckTitleInput.addEventListener('change', () => {
  if (currentDeck) {
    currentDeck.filename = deckTitleInput.value.trim() || "Thiết kế không tên - Bài thuyết trình";
    saveDeckToLocalStorage(currentDeck);
  }
});

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.designId) {
    const deck = getDeckFromLocalStorage(e.state.designId);
    if (deck) {
      setupDeck(deck, false);
    }
  }
});

// Auto-route on initial page load
async function initAppRouting() {
  const path = window.location.pathname;
  // Match /design/:designId/:editToken/edit
  const match = path.match(/^\/design\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)\/edit\/?$/);

  if (match) {
    const designId = match[1];
    const editToken = match[2];

    // 1. Try local storage first
    const cachedDeck = getDeckFromLocalStorage(designId);
    if (cachedDeck) {
      cachedDeck.editToken = editToken;
      setupDeck(cachedDeck, false, `Đã mở lại bài thiết kế: ${designId}`);
      return;
    }

    // 2. Fetch starter demo deck from backend
    showLoader("Đang tải bài thiết kế...");
    try {
      const res = await fetch('/api/demo/sample', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        data.designId = designId;
        data.editToken = editToken;
        setupDeck(data, false, `Đã mở bài thiết kế: ${designId}`);
      } else {
        createNewBlankPresentation();
      }
    } catch (err) {
      createNewBlankPresentation();
    } finally {
      hideLoader();
    }
  }
}

// Run routing check
initAppRouting();
