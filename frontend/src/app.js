// SlideCraft - Canva-Style Web PowerPoint Editor Engine
let currentDeck = null;
let currentSlideIndex = 0;
let fabricCanvas = null;
let currentZoom = 1.0;
let undoStack = [];
let redoStack = [];

// DOM References
const homeView = document.getElementById('homeView');
const homeAuthBlock = document.getElementById('homeAuthBlock');
const homeGuestBlock = document.getElementById('homeGuestBlock');
const homeUserAvatarContainer = document.getElementById('homeUserAvatarContainer');
const homeUserAvatarLetter = document.getElementById('homeUserAvatarLetter');
const homeUserAvatarImg = document.getElementById('homeUserAvatarImg');
const homeUserNameText = document.getElementById('homeUserNameText');
const homeUserEmailText = document.getElementById('homeUserEmailText');
const btnHomeContinue = document.getElementById('btnHomeContinue');
const btnHomeContinueAnother = document.getElementById('btnHomeContinueAnother');
const btnHomeFirstLogin = document.getElementById('btnHomeFirstLogin');
const btnHomeFirstSignup = document.getElementById('btnHomeFirstSignup');
const btnBackFromUploadToHome = document.getElementById('btnBackFromUploadToHome');

const uploadView = document.getElementById('uploadView');
const editorView = document.getElementById('editorView');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const menuFileInput = document.getElementById('menuFileInput');
const btnLoadSample = document.getElementById('btnLoadSample');
const btnCreateBlankDeck = document.getElementById('btnCreateBlankDeck');
const menuCreateNew = document.getElementById('menuCreateNew');
const btnCopyDesignLink = document.getElementById('btnCopyDesignLink');
const btnHome = document.getElementById('btnHome');
const uploadLoader = document.getElementById('uploadLoader');
const loaderText = document.getElementById('loaderText');

// Global Loading Modal References
const globalLoadingOverlay = document.getElementById('globalLoadingOverlay');
const globalLoadingTitle = document.getElementById('globalLoadingTitle');
const globalLoadingFilename = document.getElementById('globalLoadingFilename');
const globalLoadingSubtitle = document.getElementById('globalLoadingSubtitle');

// Google Auth & Account Page References
const btnGoogleLoginUpload = document.getElementById('btnGoogleLoginUpload');
const uploadUserDropdownMenu = document.getElementById('uploadUserDropdownMenu');
const uploadDropdownAvatarImg = document.getElementById('uploadDropdownAvatarImg');
const uploadUserNameText = document.getElementById('uploadUserNameText');
const uploadUserEmailText = document.getElementById('uploadUserEmailText');
const btnUploadGoToAccountPage = document.getElementById('btnUploadGoToAccountPage');
const btnUploadLogout = document.getElementById('btnUploadLogout');

const btnGoogleLoginHeader = document.getElementById('btnGoogleLoginHeader');
const userLoggedInMenu = document.getElementById('userLoggedInMenu');
const userAvatarBtn = document.getElementById('userAvatarBtn');
const userAvatarImg = document.getElementById('userAvatarImg');
const userDropdownMenu = document.getElementById('userDropdownMenu');
const dropdownAvatarImg = document.getElementById('dropdownAvatarImg');
const userNameText = document.getElementById('userNameText');
const userEmailText = document.getElementById('userEmailText');
const btnGoToAccountPage = document.getElementById('btnGoToAccountPage');
const btnLogout = document.getElementById('btnLogout');

const accountPageView = document.getElementById('accountPageView');
const btnBackFromAccount = document.getElementById('btnBackFromAccount');
const btnAccountPageLogout = document.getElementById('btnAccountPageLogout');
const accPageAvatar = document.getElementById('accPageAvatar');
const accPageName = document.getElementById('accPageName');
const accPageEmail = document.getElementById('accPageEmail');
const accountRecentDecksList = document.getElementById('accountRecentDecksList');
const activeCollaboratorsStack = document.getElementById('activeCollaboratorsStack');
const headerRoleBadge = document.getElementById('headerRoleBadge');

// Share Design & Role Elements
const btnShareDesign = document.getElementById('btnShareDesign');
const shareDesignDropdown = document.getElementById('shareDesignDropdown');

// ======================== ADMIN PORTAL DOM REFERENCES ========================
const adminLoginView = document.getElementById('adminLoginView');
const adminDashboardView = document.getElementById('adminDashboardView');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginUsername = document.getElementById('adminLoginUsername');
const adminLoginPassword = document.getElementById('adminLoginPassword');
const adminLoginErrorAlert = document.getElementById('adminLoginErrorAlert');
const adminLoginErrorText = document.getElementById('adminLoginErrorText');
const btnAdminLoginBackHome = document.getElementById('btnAdminLoginBackHome');
const btnAdminLogout = document.getElementById('btnAdminLogout');
const btnAdminBackToEditor = document.getElementById('btnAdminBackToEditor');
const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
const adminPanes = document.querySelectorAll('.admin-pane');
const adminCurrentTabTitle = document.getElementById('adminCurrentTabTitle');
const btnAdminRefreshData = document.getElementById('btnAdminRefreshData');

const statTotalUsers = document.getElementById('statTotalUsers');
const statBannedUsers = document.getElementById('statBannedUsers');
const statTotalDesigns = document.getElementById('statTotalDesigns');
const statActiveTemplates = document.getElementById('statActiveTemplates');
const adminRecentUsersTableBody = document.getElementById('adminRecentUsersTableBody');
const adminRecentDesignsTableBody = document.getElementById('adminRecentDesignsTableBody');
const adminProfileInitial = document.getElementById('adminProfileInitial');
const adminProfileName = document.getElementById('adminProfileName');
const adminProfileRole = document.getElementById('adminProfileRole');

const adminUsersSearchInput = document.getElementById('adminUsersSearchInput');
const adminUsersStatusFilter = document.getElementById('adminUsersStatusFilter');
const btnRefreshAdminUsers = document.getElementById('btnRefreshAdminUsers');
const adminUsersTableBody = document.getElementById('adminUsersTableBody');
const adminUsersPaginationText = document.getElementById('adminUsersPaginationText');
const btnAdminUsersPrevPage = document.getElementById('btnAdminUsersPrevPage');
const btnAdminUsersNextPage = document.getElementById('btnAdminUsersNextPage');

const btnOpenCreateTemplateModal = document.getElementById('btnOpenCreateTemplateModal');
const adminTemplatesCategoryFilter = document.getElementById('adminTemplatesCategoryFilter');
const btnRefreshAdminTemplates = document.getElementById('btnRefreshAdminTemplates');
const adminTemplatesGrid = document.getElementById('adminTemplatesGrid');
const adminTemplateEditModal = document.getElementById('adminTemplateEditModal');
const adminTemplateForm = document.getElementById('adminTemplateForm');
const tmplEditId = document.getElementById('tmplEditId');
const tmplEditTitle = document.getElementById('tmplEditTitle');
const tmplEditCategory = document.getElementById('tmplEditCategory');
const tmplEditCategoryName = document.getElementById('tmplEditCategoryName');
const tmplEditTags = document.getElementById('tmplEditTags');
const tmplEditColorPicker = document.getElementById('tmplEditColorPicker');
const tmplEditCustomColor = document.getElementById('tmplEditCustomColor');
const tmplEditIsActive = document.getElementById('tmplEditIsActive');
const btnCloseAdminTemplateModal = document.getElementById('btnCloseAdminTemplateModal');
const btnCancelAdminTemplateModal = document.getElementById('btnCancelAdminTemplateModal');

const adminImportPptxModal = document.getElementById('adminImportPptxModal');
const btnCloseAdminImportPptxModal = document.getElementById('btnCloseAdminImportPptxModal');
const btnCancelAdminImportPptxModal = document.getElementById('btnCancelAdminImportPptxModal');
const adminImportPptxForm = document.getElementById('adminImportPptxForm');
const adminPptxDropzone = document.getElementById('adminPptxDropzone');
const adminPptxFileInput = document.getElementById('adminPptxFileInput');
const adminPptxDropzoneDefault = document.getElementById('adminPptxDropzoneDefault');
const adminPptxFileInfo = document.getElementById('adminPptxFileInfo');
const adminPptxFileName = document.getElementById('adminPptxFileName');
const adminPptxFileSize = document.getElementById('adminPptxFileSize');
const btnRemoveAdminPptxFile = document.getElementById('btnRemoveAdminPptxFile');
const adminPptxCategory = document.getElementById('adminPptxCategory');
const adminPptxCategoryName = document.getElementById('adminPptxCategoryName');
const adminPptxPrefixTitle = document.getElementById('adminPptxPrefixTitle');
const adminPptxTags = document.getElementById('adminPptxTags');
const adminPptxProgressBox = document.getElementById('adminPptxProgressBox');
const btnSubmitAdminImportPptx = document.getElementById('btnSubmitAdminImportPptx');
const btnOpenManualTemplateCreate = document.getElementById('btnOpenManualTemplateCreate');

const btnOpenCreateAdminModal = document.getElementById('btnOpenCreateAdminModal');
const adminListTableBody = document.getElementById('adminListTableBody');
const adminCreateModal = document.getElementById('adminCreateModal');
const adminCreateForm = document.getElementById('adminCreateForm');
const adminNewFullName = document.getElementById('adminNewFullName');
const adminNewUsername = document.getElementById('adminNewUsername');
const adminNewEmail = document.getElementById('adminNewEmail');
const adminNewPassword = document.getElementById('adminNewPassword');
const adminNewRole = document.getElementById('adminNewRole');
const btnCloseAdminCreateModal = document.getElementById('btnCloseAdminCreateModal');
const btnCancelAdminCreateModal = document.getElementById('btnCancelAdminCreateModal');
const shareRoleStatusBanner = document.getElementById('shareRoleStatusBanner');
const shareInviteSection = document.getElementById('shareInviteSection');
const shareGuestNotice = document.getElementById('shareGuestNotice');
const inputShareMemberEmail = document.getElementById('inputShareMemberEmail');
const selectShareRole = document.getElementById('selectShareRole');
const btnAddShareMember = document.getElementById('btnAddShareMember');
const shareMembersCountBadge = document.getElementById('shareMembersCountBadge');
const shareMembersDetailedList = document.getElementById('shareMembersDetailedList');
const accessLevelSelector = document.getElementById('accessLevelSelector');
const accessLevelMenu = document.getElementById('accessLevelMenu');
const accessLevelText = document.getElementById('accessLevelText');
const accessLevelSubText = document.getElementById('accessLevelSubText');
const accessLevelIcon = document.getElementById('accessLevelIcon');
const accessLevelIconWrapper = document.getElementById('accessLevelIconWrapper');
const accessLevelChevron = document.getElementById('accessLevelChevron');
const accessLevelDisabledNote = document.getElementById('accessLevelDisabledNote');
const btnCopyShareLinkModal = document.getElementById('btnCopyShareLinkModal');
const btnCopyShareLinkText = document.getElementById('btnCopyShareLinkText');
const btnCopyShareLinkIcon = document.getElementById('btnCopyShareLinkIcon');

// Access Denied Elements
const accessDeniedOverlay = document.getElementById('accessDeniedOverlay');
const btnDeniedLoginGoogle = document.getElementById('btnDeniedLoginGoogle');
const btnDeniedGoHome = document.getElementById('btnDeniedGoHome');

// Projects Dashboard Elements
const btnGoToProjectsFromUpload = document.getElementById('btnGoToProjectsFromUpload');
const btnGoToProjectsFromEditor = document.getElementById('btnGoToProjectsFromEditor');
const btnUploadGoToProjects = document.getElementById('btnUploadGoToProjects');
const btnMenuGoToProjects = document.getElementById('btnMenuGoToProjects');

const projectsPageView = document.getElementById('projectsPageView');
const btnProjectsBackHome = document.getElementById('btnProjectsBackHome');
const projectsTotalCountBadge = document.getElementById('projectsTotalCountBadge');
const inputProjectsSearch = document.getElementById('inputProjectsSearch');
const inputProjectsSearchMobile = document.getElementById('inputProjectsSearchMobile');
const btnProjectsImportPPTX = document.getElementById('btnProjectsImportPPTX');
const btnProjectsCreateNew = document.getElementById('btnProjectsCreateNew');
const projectsUserBadge = document.getElementById('projectsUserBadge');
const projectsUserAvatar = document.getElementById('projectsUserAvatar');
const projectsUserName = document.getElementById('projectsUserName');

const tabProjectsAll = document.getElementById('tabProjectsAll');
const tabProjectsMine = document.getElementById('tabProjectsMine');
const tabProjectsShared = document.getElementById('tabProjectsShared');
const tabCountAll = document.getElementById('tabCountAll');
const tabCountMine = document.getElementById('tabCountMine');
const tabCountShared = document.getElementById('tabCountShared');

const selectProjectsSort = document.getElementById('selectProjectsSort');
const btnProjectsRefresh = document.getElementById('btnProjectsRefresh');
const projectsLoadingState = document.getElementById('projectsLoadingState');
const projectsEmptyState = document.getElementById('projectsEmptyState');
const btnEmptyCreateNew = document.getElementById('btnEmptyCreateNew');
const btnEmptyImportPPTX = document.getElementById('btnEmptyImportPPTX');
const projectsGrid = document.getElementById('projectsGrid');

// Delete Project Modal
const deleteProjectModal = document.getElementById('deleteProjectModal');
const deleteProjectTargetTitle = document.getElementById('deleteProjectTargetTitle');
const btnCancelDeleteProject = document.getElementById('btnCancelDeleteProject');
const btnConfirmDeleteProject = document.getElementById('btnConfirmDeleteProject');

// Projects State Variables (Declared early to prevent TDZ on initial route load)
let previousViewBeforeProjects = 'upload';
let cachedProjectsList = [];
let currentProjectsFilter = 'all'; // 'all', 'mine', 'shared'
let currentProjectsSearch = '';
let currentProjectsSort = 'recent'; // 'recent', 'oldest', 'name_asc', 'name_desc'
let pendingDeleteProject = null;
let projectsSearchDebounceTimer = null;

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

// --- DATABASE & LOCAL STORAGE SYNC ENGINE ---
let autoSaveDebounceTimer = null;

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

async function apiSaveDeck(deck, showIndicator = true) {
  if (!deck || !deck.designId) return;

  const currentUser = getCurrentUser();
  if (typeof getDesignPermissions === 'function') {
    const perms = getDesignPermissions(deck, currentUser);
    if (!perms.canEdit) {
      if (showIndicator && saveStatus) {
        saveStatus.textContent = "Chỉ xem";
        saveStatus.className = "text-[11px] text-amber-300 font-medium";
      }
      return;
    }
  }

  if (showIndicator && saveStatus) {
    saveStatus.textContent = "Đang lưu...";
    saveStatus.className = "text-[11px] text-amber-400 font-medium";
  }

  const currentTitle = (deckTitleInput && deckTitleInput.value.trim()) || deck.filename || "Thiết kế không tên - Bài thuyết trình";

  const payload = {
    designId: deck.designId,
    editToken: deck.editToken || 'token',
    title: currentTitle,
    owner: currentUser ? {
      id: currentUser.id || currentUser.google_id || '',
      name: currentUser.name || '',
      email: currentUser.email || ''
    } : (deck.owner || null),
    slides: deck.slides || [],
    customFonts: deck.customFonts || [],
    thumbnailUrl: deck.slides?.[0]?.thumbnailUrl || deck.slides?.[0]?.renderPngUrl || '',
    shareAccessLevel: deck.shareAccessLevel || 'private',
    sharedMembers: deck.sharedMembers || []
  };

  try {
    const res = await fetch(`/api/designs/${deck.designId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      if (showIndicator && saveStatus) {
        saveStatus.textContent = "Đã lưu vào đám mây";
        saveStatus.className = "text-[11px] text-emerald-400 font-medium";
      }
      if (presenceBroadcastChannel) {
        try {
          presenceBroadcastChannel.postMessage({
            type: 'deck_data_sync',
            designId: deck.designId,
            title: currentTitle,
            updatedAt: Date.now()
          });
        } catch (e) {}
      }
    } else {
      if (showIndicator && saveStatus) {
        saveStatus.textContent = "Đã lưu";
        saveStatus.className = "text-[11px] text-slate-300 font-medium";
      }
    }
  } catch (err) {
    if (showIndicator && saveStatus) {
      saveStatus.textContent = "Đã lưu (cục bộ)";
      saveStatus.className = "text-[11px] text-slate-400 font-medium";
    }
  }
}

function saveDeck(deck, immediate = false) {
  if (!deck || !deck.designId) return;

  saveDeckToLocalStorage(deck);

  if (autoSaveDebounceTimer) {
    clearTimeout(autoSaveDebounceTimer);
    autoSaveDebounceTimer = null;
  }

  if (immediate) {
    apiSaveDeck(deck, true);
  } else {
    if (saveStatus) {
      saveStatus.textContent = "Đang lưu...";
      saveStatus.className = "text-[11px] text-amber-400 font-medium";
    }
    autoSaveDebounceTimer = setTimeout(() => {
      apiSaveDeck(deck, true);
    }, 600);
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

// Canva Drawer Templates & Real-time Search Elements
const drawerSearchInput = document.getElementById('drawerSearchInput');
const templatesGridContainer = document.getElementById('templatesGridContainer');
const templatesCountBadge = document.getElementById('templatesCountBadge');
const templatesSectionHeading = document.getElementById('templatesSectionHeading');
const templatesEmptyState = document.getElementById('templatesEmptyState');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const btnResetSearchFilters = document.getElementById('btnResetSearchFilters');
const btnToggleDeckSlidesSection = document.getElementById('btnToggleDeckSlidesSection');
const deckSlidesCollapsibleArea = document.getElementById('deckSlidesCollapsibleArea');
const deckSlidesSectionChevron = document.getElementById('deckSlidesSectionChevron');
const templateFilterPills = document.querySelectorAll('.template-filter-pill');

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
    updateCurrentSlideThumbnail();
    saveDeck(currentDeck, false);
  }
}

// --- 2. CANVA NAV RAIL & DRAWER MANAGEMENT ---
let isCanvaNavRailInitialized = false;
function setupCanvaNavRail() {
  if (isCanvaNavRailInitialized) return;
  isCanvaNavRailInitialized = true;

  navTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      if (currentDeck) {
        const user = getCurrentUser();
        const perms = getDesignPermissions(currentDeck, user);
        if (!perms.canEdit && targetTab !== 'tab-slides') {
          showToast("Bài thiết kế đang ở chế độ Chỉ xem. Bạn không thể chỉnh sửa hoặc thêm thành phần.", true);
          return;
        }
      }

      // If drawer is collapsed, expand it
      if (canvaDrawer.classList.contains('w-0')) {
        expandDrawer();
      }

      // Highlight active tab
      navTabBtns.forEach(b => b.classList.remove('bg-slate-800', 'text-white'));
      btn.classList.add('bg-slate-800', 'text-white');

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
    navTabBtns[0].classList.add('bg-slate-800', 'text-white');
  }

  btnCollapseDrawer.addEventListener('click', toggleDrawer);
  btnGridToggle.addEventListener('click', () => {
    // Open slides tab
    expandDrawer();
    navTabBtns[0].click();
  });

  // Khởi tạo Kho Mẫu Trang PPTX Sẵn Có & Lọc tìm kiếm thời gian thực
  initSystemTemplatesLibrary();
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

// ============================================================================
// --- 2.1 KHO MẪU TRANG PPTX SẴN CỦA HỆ THỐNG (SYSTEM PPTX TEMPLATES LIBRARY) ---
// ============================================================================

const SYSTEM_PPTX_TEMPLATES = [
  {
    id: 'travel-beach',
    title: 'Khám Phá Biển & Nghỉ Dưỡng Hè',
    category: 'travel',
    categoryName: 'Du lịch',
    tags: ['travel', 'du lich', 'beach', 'bien', 'resort', 'nghi duong', 'tour', 'summer', 'he', 'kham pha', 'dao', 'phu quoc', 'ha long'],
    bgGradient: 'linear-gradient(135deg, #032030 0%, #004d73 100%)',
    previewBadge: 'SUMMER 2026',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #032030 0%, #004d73 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-cyan-500/80 text-[8px] font-bold tracking-wider mb-1">SUMMER 2026</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">HÀNH TRÌNH DU LỊCH</p>
          <p class="text-[7px] text-cyan-200 mt-0.5 truncate">Khám phá thiên nhiên biển đảo & nghỉ dưỡng</p>
        </div>
        <div class="grid grid-cols-3 gap-1 my-auto">
          <div class="bg-cyan-950/70 p-1 rounded border border-cyan-700/50 text-[6px]">
            <span class="font-bold text-cyan-300 block">01. Phú Quốc</span>
            <span class="text-slate-300 text-[5px]">Biển ngọc 5★</span>
          </div>
          <div class="bg-cyan-950/70 p-1 rounded border border-cyan-500 text-[6px]">
            <span class="font-bold text-cyan-300 block">02. Hạ Long</span>
            <span class="text-slate-300 text-[5px]">Du thuyền vịnh</span>
          </div>
          <div class="bg-cyan-950/70 p-1 rounded border border-cyan-700/50 text-[6px]">
            <span class="font-bold text-cyan-300 block">03. Sapa</span>
            <span class="text-slate-300 text-[5px]">Săn mây Fansipan</span>
          </div>
        </div>
        <div class="text-[5px] text-cyan-300/80 border-t border-cyan-800/40 pt-0.5 truncate">
          Hotline: 1900 8888 • travel-vietnam.vn
        </div>
      </div>
    `,
    slideData: {
      customColor: '#032030',
      fabricJson: {
        objects: [
          { type: 'rect', left: 80, top: 40, width: 140, height: 30, fill: '#00a8cc', rx: 6, ry: 6 },
          { type: 'textbox', left: 92, top: 46, width: 120, text: 'SUMMER 2026', fontSize: 13, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 85, width: 800, text: 'HÀNH TRÌNH DU LỊCH & KHÁM PHÁ', fontSize: 34, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 135, width: 800, text: 'Trải nghiệm những bờ biển nguyên sơ, danh lam thắng cảnh và văn hóa bản địa độc đáo', fontSize: 16, fontFamily: 'Inter', fill: '#94d2bd' },
          { type: 'rect', left: 80, top: 195, width: 245, height: 260, fill: '#003a52', rx: 12, ry: 12, stroke: '#005c53', strokeWidth: 1 },
          { type: 'textbox', left: 100, top: 220, width: 205, text: '01. ĐẢO PHÚ QUỐC\n\n• Lặn ngắm san hô biển ngọc\n• Nghỉ dưỡng resort 5 sao\n• Trải nghiệm cáp treo vượt biển\n• Ẩm thực hải sản nướng than\n• Tour cano 4 đảo trọn gói', fontSize: 14, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'rect', left: 355, top: 195, width: 245, height: 260, fill: '#004766', rx: 12, ry: 12, stroke: '#00a8cc', strokeWidth: 2 },
          { type: 'textbox', left: 375, top: 220, width: 205, text: '02. VỊNH HẠ LONG\n\n• Du thuyền ngủ đêm trên vịnh\n• Chèo kayak qua hang động\n• Ngắm hoàng hôn trên biển\n• Tham quan làng chài cổ\n• Tiệc BBQ buffet hải sản', fontSize: 14, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'rect', left: 630, top: 195, width: 245, height: 260, fill: '#003a52', rx: 12, ry: 12, stroke: '#005c53', strokeWidth: 1 },
          { type: 'textbox', left: 650, top: 220, width: 205, text: '03. CAO NGUYÊN SAPA\n\n• Chinh phục đỉnh Fansipan\n• Bản Cát Cát mộng mơ\n• Thưởng thức lẩu cá hồi\n• Săn mây đèo Ô Quy Hồ\n• Giao lưu văn hóa bản địa', fontSize: 14, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'textbox', left: 80, top: 480, width: 800, text: 'Hotline đặt tour: 1900 8888  |  Email: contact@vietnam-travel.vn  |  Website: www.travel-vietnam.vn', fontSize: 13, fontFamily: 'Inter', fill: '#7dd3fc' }
        ]
      }
    }
  },
  {
    id: 'travel-itinerary',
    title: 'Lịch Trình Tour Khám Phá 4N3Đ',
    category: 'travel',
    categoryName: 'Du lịch',
    tags: ['travel', 'du lich', 'itinerary', 'lich trinh', 'tour', 'ke hoach', 'ngay', 'timeline', 'schedule', 'diem den', 'chuyen di'],
    bgGradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    previewBadge: 'TIMELINE',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-emerald-500/80 text-[8px] font-bold tracking-wider mb-1">TOUR 4N3Đ</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">LỊCH TRÌNH CHI TIẾT</p>
          <p class="text-[7px] text-emerald-200 mt-0.5 truncate">Hành trình khám phá trọn vẹn điểm đến</p>
        </div>
        <div class="grid grid-cols-4 gap-0.5 my-auto">
          <div class="bg-emerald-950/80 p-1 rounded border border-emerald-700/60 text-[5px]">
            <span class="font-bold text-emerald-300 block">N1: Đón đoàn</span>
            <span class="text-slate-300">Check-in</span>
          </div>
          <div class="bg-emerald-900/80 p-1 rounded border border-emerald-400 text-[5px]">
            <span class="font-bold text-emerald-200 block">N2: Vịnh biển</span>
            <span class="text-slate-200">Lặn san hô</span>
          </div>
          <div class="bg-emerald-950/80 p-1 rounded border border-emerald-700/60 text-[5px]">
            <span class="font-bold text-emerald-300 block">N3: Trekking</span>
            <span class="text-slate-300">Ẩm thực</span>
          </div>
          <div class="bg-emerald-950/80 p-1 rounded border border-emerald-700/60 text-[5px]">
            <span class="font-bold text-emerald-300 block">N4: Mua sắm</span>
            <span class="text-slate-300">Tiễn khách</span>
          </div>
        </div>
        <div class="text-[5px] text-emerald-300/80 border-t border-emerald-800/40 pt-0.5 truncate">
          Tiêu chuẩn xe đưa đón & khách sạn 4-5 sao
        </div>
      </div>
    `,
    slideData: {
      customColor: '#064e3b',
      fabricJson: {
        objects: [
          { type: 'textbox', left: 80, top: 45, width: 800, text: 'LỊCH TRÌNH CHI TIẾT TOUR 4 NGÀY 3 ĐÊM', fontSize: 30, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 90, width: 800, text: 'Hành trình kết hợp tham quan danh lam thắng cảnh, ẩm thực bản địa và nghỉ dưỡng tiêu chuẩn quốc tế', fontSize: 15, fontFamily: 'Inter', fill: '#a7f3d0' },
          { type: 'rect', left: 80, top: 145, width: 185, height: 320, fill: '#065f46', rx: 10, ry: 10 },
          { type: 'textbox', left: 95, top: 165, width: 155, text: 'NGÀY 01\n\nĐón Đoàn & Check-in\n\n• 08:00: Đón tại sân bay\n• 11:30: Ăn trưa đặc sản\n• 14:00: Nhận phòng resort\n• 16:30: Tự do tắm biển\n• 18:30: Tiệc BBQ bãi biển', fontSize: 13, fontFamily: 'Inter', fill: '#ecfdf5', lineHeight: 1.4 },
          { type: 'rect', left: 285, top: 145, width: 185, height: 320, fill: '#047857', rx: 10, ry: 10, stroke: '#34d399', strokeWidth: 2 },
          { type: 'textbox', left: 300, top: 165, width: 155, text: 'NGÀY 02\n\nKhám Phá Vịnh Biển\n\n• 07:00: Buffet sáng\n• 08:30: Lên tàu cano ra đảo\n• 10:30: Lặn ngắm san hô\n• 12:30: Ăn trưa bè nổi\n• 16:00: Sunset check-in', fontSize: 13, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'rect', left: 490, top: 145, width: 185, height: 320, fill: '#065f46', rx: 10, ry: 10 },
          { type: 'textbox', left: 505, top: 165, width: 155, text: 'NGÀY 03\n\nTrekking & Văn Hóa\n\n• 07:30: Thăm di tích lịch sử\n• 10:00: Trekking rừng nguyên sinh\n• 12:00: Ẩm thực cơm lam gà nướng\n• 15:00: Trải nghiệm làng nghề\n• 19:00: Chợ đêm dạo phố', fontSize: 13, fontFamily: 'Inter', fill: '#ecfdf5', lineHeight: 1.4 },
          { type: 'rect', left: 695, top: 145, width: 185, height: 320, fill: '#064e3b', stroke: '#34d399', strokeWidth: 1.5, rx: 10, ry: 10 },
          { type: 'textbox', left: 710, top: 165, width: 155, text: 'NGÀY 04\n\nMua Sắm & Tạm Biệt\n\n• 08:00: Cà phê ngắm bình minh\n• 10:00: Mua sắm đặc sản\n• 12:00: Check-out khách sạn\n• 14:00: Tiễn đoàn ra sân bay\n• Hẹn gặp lại quý khách!', fontSize: 13, fontFamily: 'Inter', fill: '#ecfdf5', lineHeight: 1.4 },
          { type: 'textbox', left: 80, top: 485, width: 800, text: 'Lưu ý: Lịch trình có thể linh hoạt điều chỉnh theo thời tiết thực tế để đảm bảo trải nghiệm tốt nhất.', fontSize: 12, fontFamily: 'Inter', fill: '#6ee7b7' }
        ]
      }
    }
  },
  {
    id: 'travel-pricing',
    title: 'Bảng Giá Gói Tour Nghỉ Dưỡng',
    category: 'travel',
    categoryName: 'Du lịch',
    tags: ['travel', 'du lich', 'pricing', 'bang gia', 'gia', 'cost', 'goi tour', 'hotel', 'resort', 'package', 'dich vu'],
    bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    previewBadge: 'BẢNG GIÁ',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-indigo-500/80 text-[8px] font-bold tracking-wider mb-1">GÓI DỊCH VỤ</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">BẢNG GIÁ TOUR 2026</p>
          <p class="text-[7px] text-indigo-200 mt-0.5 truncate">Lựa chọn phù hợp cho gia đình & đoàn thể</p>
        </div>
        <div class="grid grid-cols-3 gap-1 my-auto">
          <div class="bg-indigo-950/70 p-1 rounded border border-indigo-700/60 text-[6px]">
            <span class="font-semibold text-slate-300 block">Tiêu Chuẩn</span>
            <span class="font-bold text-indigo-300 text-[8px]">3.990k</span>
          </div>
          <div class="bg-indigo-900/90 p-1 rounded border border-amber-400 text-[6px]">
            <span class="font-bold text-amber-300 block">Cao Cấp ★</span>
            <span class="font-bold text-amber-300 text-[8px]">6.990k</span>
          </div>
          <div class="bg-indigo-950/70 p-1 rounded border border-indigo-700/60 text-[6px]">
            <span class="font-semibold text-slate-300 block">VIP Luxury</span>
            <span class="font-bold text-indigo-300 text-[8px]">12.990k</span>
          </div>
        </div>
        <div class="text-[5px] text-indigo-300/80 border-t border-indigo-800/40 pt-0.5 truncate">
          Đã bao gồm vé máy bay, khách sạn & bảo hiểm
        </div>
      </div>
    `,
    slideData: {
      customColor: '#1e1b4b',
      fabricJson: {
        objects: [
          { type: 'textbox', left: 80, top: 45, width: 800, text: 'BẢNG GIÁ DỊCH VỤ TOUR NGHỈ DƯỠNG TRỌN GÓI', fontSize: 28, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 90, width: 800, text: 'Chính sách giá minh bạch, trọn gói, không phát sinh phụ phí ẩn', fontSize: 15, fontFamily: 'Inter', fill: '#c7d2fe' },
          { type: 'rect', left: 80, top: 145, width: 245, height: 320, fill: '#2e1065', rx: 12, ry: 12 },
          { type: 'textbox', left: 100, top: 170, width: 205, text: 'GÓI TIÊU CHUẨN\n\n3.990.000 VNĐ / Khách\n\n• Khách sạn 3 sao trung tâm\n• Xe đưa đón máy lạnh\n• Ăn sáng buffet hàng ngày\n• Hướng dẫn viên nhiệt tình\n• Vé tham quan các điểm', fontSize: 13, fontFamily: 'Inter', fill: '#ede9fe', lineHeight: 1.4 },
          { type: 'rect', left: 355, top: 140, width: 250, height: 330, fill: '#3730a3', stroke: '#fbbf24', strokeWidth: 2, rx: 12, ry: 12 },
          { type: 'textbox', left: 375, top: 165, width: 210, text: 'GÓI CAO CẤP (PHỔ BIẾN NHẤT)\n\n6.990.000 VNĐ / Khách\n\n• Resort 4-5 sao view biển\n• Xe limousine đưa đón riêng\n• Vé máy bay khứ hồi gồm hành lý\n• Tiệc hải sản BBQ cao cấp\n• Cano riêng lặn ngắm san hô\n• Bảo hiểm du lịch 100 triệu', fontSize: 13, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'rect', left: 635, top: 145, width: 245, height: 320, fill: '#2e1065', rx: 12, ry: 12 },
          { type: 'textbox', left: 655, top: 170, width: 205, text: 'GÓI VIP LUXURY\n\n12.990.000 VNĐ / Khách\n\n• Villa hồ bơi riêng 5 sao+\n• Du thuyền riêng tham quan\n• Quản gia và đầu bếp phục vụ\n• Spa & massage trị liệu hàng ngày\n• Trải nghiệm bay trực thăng', fontSize: 13, fontFamily: 'Inter', fill: '#ede9fe', lineHeight: 1.4 },
          { type: 'textbox', left: 80, top: 490, width: 800, text: 'Ưu đãi: Giảm thêm 10% khi đăng ký nhóm từ 4 khách trước ngày 15 hàng tháng.', fontSize: 12, fontFamily: 'Inter', fill: '#a5b4fc' }
        ]
      }
    }
  },
  {
    id: 'travel-cuisine',
    title: 'Cẩm Nang Ẩm Thực Vùng Miền',
    category: 'travel',
    categoryName: 'Du lịch',
    tags: ['travel', 'du lich', 'am thuc', 'food', 'cuisine', 'mon an', 'dac san', 'chef', 'restaurant', 'nha hang'],
    bgGradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 100%)',
    previewBadge: 'ẨM THỰC',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #431407 0%, #7c2d12 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-amber-500/80 text-[8px] font-bold tracking-wider mb-1">FOOD & TRAVEL</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">CẨM NANG ẨM THỰC</p>
          <p class="text-[7px] text-amber-200 mt-0.5 truncate">Món ngon bản địa nhất định phải thử</p>
        </div>
        <div class="grid grid-cols-3 gap-1 my-auto">
          <div class="bg-amber-950/70 p-1 rounded border border-amber-700/60 text-[6px]">
            <span class="font-bold text-amber-300 block">Hải Sản Nướng</span>
            <span class="text-slate-300 text-[5px]">Tươi sống tại bè</span>
          </div>
          <div class="bg-amber-950/70 p-1 rounded border border-amber-500 text-[6px]">
            <span class="font-bold text-amber-300 block">Bún Quậy Đảo</span>
            <span class="text-slate-300 text-[5px]">Nước dùng thanh ngọt</span>
          </div>
          <div class="bg-amber-950/70 p-1 rounded border border-amber-700/60 text-[6px]">
            <span class="font-bold text-amber-300 block">Lẩu Cá Lá Giang</span>
            <span class="text-slate-300 text-[5px]">Hương vị truyền thống</span>
          </div>
        </div>
        <div class="text-[5px] text-amber-300/80 border-t border-amber-800/40 pt-0.5 truncate">
          Gợi ý địa chỉ quán ăn ngon chuẩn vị người bản xứ
        </div>
      </div>
    `,
    slideData: {
      customColor: '#431407',
      fabricJson: {
        objects: [
          { type: 'textbox', left: 80, top: 45, width: 800, text: 'TOP ĐẶC SẢN ẨM THỰC KHÔNG THỂ BỎ LỠ', fontSize: 30, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 90, width: 800, text: 'Hành trình đánh thức vị giác với những tinh hoa ẩm thực địa phương đặc trưng', fontSize: 15, fontFamily: 'Inter', fill: '#fed7aa' },
          { type: 'rect', left: 80, top: 150, width: 245, height: 300, fill: '#7c2d12', rx: 12, ry: 12 },
          { type: 'textbox', left: 100, top: 175, width: 205, text: '01. HẢI SẢN NƯỚNG THAN\n\n• Tôm hùm bông & mực nhảy\n• Nướng trực tiếp tại bè nổi\n• Muối tiêu chanh ớt xanh\n• Độ tươi ngon tuyệt đối', fontSize: 14, fontFamily: 'Inter', fill: '#ffedd5', lineHeight: 1.4 },
          { type: 'rect', left: 355, top: 150, width: 245, height: 300, fill: '#9a3412', stroke: '#fbbf24', strokeWidth: 2, rx: 12, ry: 12 },
          { type: 'textbox', left: 375, top: 175, width: 205, text: '02. BÚN QUẬY TRUYỀN THỐNG\n\n• Chả tôm & cá tươi quậy tại tô\n• Nước dùng thanh ngọt tự nhiên\n• Tự pha nước chấm gia truyền\n• Món ăn sáng yêu thích', fontSize: 14, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'rect', left: 630, top: 150, width: 245, height: 300, fill: '#7c2d12', rx: 12, ry: 12 },
          { type: 'textbox', left: 650, top: 175, width: 205, text: '03. LẨU CÁ BẢN ĐỊA\n\n• Nấu cùng lá giang rừng\n• Vị chua dịu, cay nồng ấm cúng\n• Kèm các loại rau sạch miệt vườn\n• Thích hợp cho bữa tiệc gia đình', fontSize: 14, fontFamily: 'Inter', fill: '#ffedd5', lineHeight: 1.4 },
          { type: 'textbox', left: 80, top: 485, width: 800, text: 'Gợi ý: Đặt bàn trước tại các nhà hàng nổi tiếng vào cuối tuần để có vị trí đẹp nhất.', fontSize: 12, fontFamily: 'Inter', fill: '#fed7aa' }
        ]
      }
    }
  },
  {
    id: 'business-report',
    title: 'Báo Cáo Doanh Thu & Tăng Trưởng Q3',
    category: 'business',
    categoryName: 'Doanh nghiệp',
    tags: ['business', 'doanh nghiep', 'bao cao', 'report', 'doanh thu', 'kpi', 'revenue', 'growth', 'tai chinh', 'kinh doanh'],
    bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    previewBadge: 'BÁO CÁO Q3',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-blue-500/80 text-[8px] font-bold tracking-wider mb-1">BUSINESS REPORT</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">KẾT QUẢ KINH DOANH Q3</p>
          <p class="text-[7px] text-blue-200 mt-0.5 truncate">Tăng trưởng vượt 145% chỉ tiêu đề ra</p>
        </div>
        <div class="grid grid-cols-3 gap-1 my-auto">
          <div class="bg-slate-900/90 p-1 rounded border border-blue-500/50 text-center">
            <span class="font-extrabold text-blue-400 text-[10px] block">+145%</span>
            <span class="text-[5px] text-slate-300">Doanh thu</span>
          </div>
          <div class="bg-slate-900/90 p-1 rounded border border-emerald-500/50 text-center">
            <span class="font-extrabold text-emerald-400 text-[10px] block">2.8M</span>
            <span class="text-[5px] text-slate-300">Khách hàng</span>
          </div>
          <div class="bg-slate-900/90 p-1 rounded border border-purple-500/50 text-center">
            <span class="font-extrabold text-purple-400 text-[10px] block">98.5%</span>
            <span class="text-[5px] text-slate-300">Hài lòng</span>
          </div>
        </div>
        <div class="text-[5px] text-slate-400 border-t border-slate-700/60 pt-0.5 truncate">
          Phòng Kế Hoạch & Tài Chính Chiến Lược
        </div>
      </div>
    `,
    slideData: {
      customColor: '#0f172a',
      fabricJson: {
        objects: [
          { type: 'textbox', left: 80, top: 45, width: 800, text: 'BÁO CÁO KẾT QUẢ KINH DOANH QUÝ 3 / 2026', fontSize: 30, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 90, width: 800, text: 'Tổng hợp các chỉ số tài chính, tăng trưởng thị phần và hiệu quả vận hành', fontSize: 15, fontFamily: 'Inter', fill: '#94a3b8' },
          { type: 'rect', left: 80, top: 150, width: 245, height: 160, fill: '#1e293b', rx: 12, ry: 12, stroke: '#3b82f6', strokeWidth: 1.5 },
          { type: 'textbox', left: 100, top: 175, width: 205, text: '+145% DOANH THU\n\nĐạt 48.5 tỷ VNĐ, vượt 25% so với kế hoạch quý 3 đã phê duyệt.', fontSize: 13, fontFamily: 'Inter', fill: '#60a5fa', lineHeight: 1.4 },
          { type: 'rect', left: 355, top: 150, width: 245, height: 160, fill: '#1e293b', rx: 12, ry: 12, stroke: '#10b981', strokeWidth: 1.5 },
          { type: 'textbox', left: 375, top: 175, width: 205, text: '2.8 TRIỆU NGƯỜI DÙNG\n\nLượng người dùng hoạt động hàng tháng (MAU) tăng trưởng 68% YoY.', fontSize: 13, fontFamily: 'Inter', fill: '#34d399', lineHeight: 1.4 },
          { type: 'rect', left: 630, top: 150, width: 245, height: 160, fill: '#1e293b', rx: 12, ry: 12, stroke: '#a855f7', strokeWidth: 1.5 },
          { type: 'textbox', left: 650, top: 175, width: 205, text: '98.5% HÀI LÒNG\n\nChỉ số NPS đạt kỷ lục nhờ cải tiến dịch vụ chăm sóc khách hàng 24/7.', fontSize: 13, fontFamily: 'Inter', fill: '#c084fc', lineHeight: 1.4 },
          { type: 'rect', left: 80, top: 335, width: 795, height: 125, fill: '#1e293b', rx: 12, ry: 12 },
          { type: 'textbox', left: 100, top: 355, width: 755, text: 'NHẬN ĐỊNH VÀ ĐỊNH HƯỚNG QUÝ 4:\n• Tiếp tục mở rộng hệ thống chi nhánh tại các thành phố trọng điểm\n• Đẩy mạnh tiếp thị số và chương trình tri ân khách hàng thân thiết\n• Tối ưu chi phí vận hành logistics để nâng biên lợi nhuận ròng lên trên 28%', fontSize: 13, fontFamily: 'Inter', fill: '#f1f5f9', lineHeight: 1.4 }
        ]
      }
    }
  },
  {
    id: 'pitch-deck',
    title: 'Startup Pitch Deck - Công Nghệ AI',
    category: 'pitch',
    categoryName: 'Pitch Deck',
    tags: ['pitch', 'pitch deck', 'startup', 'khoi nghiep', 'ai', 'cong nghe', 'goi von', 'investor', 'ke hoach'],
    bgGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    previewBadge: 'PITCH DECK',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-purple-600 text-[8px] font-bold tracking-wider mb-1">STARTUP PITCH</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">CÔNG NGHỆ ĐỘT PHÁ</p>
          <p class="text-[7px] text-zinc-400 mt-0.5 truncate">Nền tảng tự động hóa thông minh thế hệ mới</p>
        </div>
        <div class="grid grid-cols-2 gap-1 my-auto">
          <div class="bg-red-950/40 p-1 rounded border border-red-500/40 text-[6px]">
            <span class="font-bold text-red-400 block">Vấn Đề (Problem)</span>
            <span class="text-zinc-300 text-[5px]">Quy trình thủ công chậm</span>
          </div>
          <div class="bg-emerald-950/40 p-1 rounded border border-emerald-500/40 text-[6px]">
            <span class="font-bold text-emerald-400 block">Giải Pháp (Solution)</span>
            <span class="text-zinc-300 text-[5px]">AI tự động hóa 10x</span>
          </div>
        </div>
        <div class="text-[5px] text-purple-400 border-t border-zinc-800 pt-0.5 truncate">
          Vòng gọi vốn Seed: 1.5M USD
        </div>
      </div>
    `,
    slideData: {
      customColor: '#18181b',
      fabricJson: {
        objects: [
          { type: 'textbox', left: 80, top: 45, width: 800, text: 'GIẢI PHÁP TỰ ĐỘNG HÓA DOANH NGHIỆP THẾ HỆ MỚI', fontSize: 28, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 90, width: 800, text: 'Rút ngắn 80% thời gian xử lý dữ liệu và tiết kiệm 60% chi phí vận hành', fontSize: 15, fontFamily: 'Inter', fill: '#a1a1aa' },
          { type: 'rect', left: 80, top: 150, width: 380, height: 300, fill: '#27272a', rx: 12, ry: 12, stroke: '#ef4444', strokeWidth: 1.5 },
          { type: 'textbox', left: 105, top: 175, width: 330, text: 'VẤN ĐỀ THỊ TRƯỜNG (PROBLEM)\n\n• Quy trình thủ công mất từ 4 - 6 giờ mỗi ngày\n• Tỷ lệ sai sót dữ liệu người nhập lên đến 14%\n• Chi phí tuyển dụng và đào tạo nhân sự tăng cao\n• Khó khăn trong việc mở rộng quy mô kinh doanh', fontSize: 13, fontFamily: 'Inter', fill: '#fca5a5', lineHeight: 1.5 },
          { type: 'rect', left: 495, top: 150, width: 380, height: 300, fill: '#27272a', rx: 12, ry: 12, stroke: '#10b981', strokeWidth: 1.5 },
          { type: 'textbox', left: 520, top: 175, width: 330, text: 'GIẢI PHÁP ĐỘT PHÁ (SOLUTION)\n\n• Tự động hóa thông minh tích hợp AI đa phương thức\n• Tốc độ xử lý chỉ trong 10 giây với độ chính xác 99.8%\n• Kết nối trực tiếp vào mọi hệ thống ERP & CRM hiện có\n• Giúp doanh nghiệp sẵn sàng tăng trưởng gấp 10 lần', fontSize: 13, fontFamily: 'Inter', fill: '#86efac', lineHeight: 1.5 },
          { type: 'textbox', left: 80, top: 485, width: 800, text: 'Mục tiêu gọi vốn Vòng Seed: 1.500.000 USD phục vụ R&D và mở rộng thị trường Đông Nam Á.', fontSize: 12, fontFamily: 'Inter', fill: '#c084fc' }
        ]
      }
    }
  },
  {
    id: 'marketing-launch',
    title: 'Kế Hoạch Ra Mắt Sản Phẩm Mới',
    category: 'marketing',
    categoryName: 'Marketing',
    tags: ['marketing', 'tiep thi', 'launch', 'ra mat', 'san pham', 'campaign', 'chien dich', 'social', 'media'],
    bgGradient: 'linear-gradient(135deg, #3b0764 0%, #581c87 100%)',
    previewBadge: 'MARKETING',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #3b0764 0%, #581c87 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-pink-500 text-[8px] font-bold tracking-wider mb-1">CAMPAIGN 2026</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">KẾ HOẠCH RA MẮT</p>
          <p class="text-[7px] text-fuchsia-200 mt-0.5 truncate">Chiến dịch tiếp thị đa kênh phủ sóng thương hiệu</p>
        </div>
        <div class="grid grid-cols-3 gap-1 my-auto text-[6px]">
          <div class="bg-purple-950/70 p-1 rounded border border-pink-500/50">
            <span class="font-bold text-pink-300 block">Giai đoạn 1</span>
            <span class="text-slate-200 text-[5px]">Teaser & Hype</span>
          </div>
          <div class="bg-purple-900/80 p-1 rounded border border-pink-400">
            <span class="font-bold text-pink-200 block">Giai đoạn 2</span>
            <span class="text-white text-[5px]">Mega Launch</span>
          </div>
          <div class="bg-purple-950/70 p-1 rounded border border-pink-500/50">
            <span class="font-bold text-pink-300 block">Giai đoạn 3</span>
            <span class="text-slate-200 text-[5px]">Sustain & Scale</span>
          </div>
        </div>
        <div class="text-[5px] text-fuchsia-300 border-t border-purple-800 pt-0.5 truncate">
          Mục tiêu: Tiếp cận 10 triệu lượt xem trong 30 ngày
        </div>
      </div>
    `,
    slideData: {
      customColor: '#3b0764',
      fabricJson: {
        objects: [
          { type: 'textbox', left: 80, top: 45, width: 800, text: 'KẾ HOẠCH CHIẾN DỊCH RA MẮT SẢN PHẨM MỚI', fontSize: 30, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 90, width: 800, text: 'Chiến lược truyền thông đa kênh tập trung lan tỏa thương hiệu và chuyển đổi đơn hàng', fontSize: 15, fontFamily: 'Inter', fill: '#e9d5ff' },
          { type: 'rect', left: 80, top: 150, width: 245, height: 300, fill: '#581c87', rx: 12, ry: 12 },
          { type: 'textbox', left: 100, top: 175, width: 205, text: 'GIAI ĐOẠN 1: TEASER\n\n(Tuần 1 - 2)\n\n• Video viral gây tò mò\n• Đếm ngược ngày ra mắt\n• Mời trải nghiệm sớm (KOLs)\n• Minigame nhận quà độc quyền', fontSize: 13, fontFamily: 'Inter', fill: '#f3e8ff', lineHeight: 1.4 },
          { type: 'rect', left: 355, top: 145, width: 245, height: 310, fill: '#701a75', stroke: '#f43f5e', strokeWidth: 2, rx: 12, ry: 12 },
          { type: 'textbox', left: 375, top: 170, width: 205, text: 'GIAI ĐOẠN 2: BÙNG NỔ\n\n(Tuần 3 - 4)\n\n• Sự kiện ra mắt phát trực tiếp\n• Flash sale mở bán ưu đãi\n• Đánh giá từ 50+ chuyên gia\n• Phủ sóng quảng cáo đa nền tảng', fontSize: 13, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'rect', left: 630, top: 150, width: 245, height: 300, fill: '#581c87', rx: 12, ry: 12 },
          { type: 'textbox', left: 650, top: 175, width: 205, text: 'GIAI ĐOẠN 3: DUY TRÌ\n\n(Tuần 5 - 8)\n\n• Thu thập phản hồi khách hàng\n• Nội dung do người dùng tạo (UGC)\n• Chương trình khách hàng thân thiết\n• Tối ưu chi phí chuyển đổi (CPA)', fontSize: 13, fontFamily: 'Inter', fill: '#f3e8ff', lineHeight: 1.4 },
          { type: 'textbox', left: 80, top: 485, width: 800, text: 'KPI mục tiêu: 10.000 đơn hàng đầu tiên trong vòng 14 ngày kể từ thời điểm mở bán chính thức.', fontSize: 12, fontFamily: 'Inter', fill: '#f0abfc' }
        ]
      }
    }
  },
  {
    id: 'education-workshop',
    title: 'Lộ Trình Khóa Học & Workshop',
    category: 'education',
    categoryName: 'Giáo dục',
    tags: ['education', 'giao duc', 'khoa hoc', 'course', 'workshop', 'dao tao', 'hoc tap', 'training', 'giang day'],
    bgGradient: 'linear-gradient(135deg, #083344 0%, #155e75 100%)',
    previewBadge: 'GIÁO DỤC',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #083344 0%, #155e75 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-cyan-500 text-[8px] font-bold tracking-wider mb-1">EDUCATION</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">LỘ TRÌNH ĐÀO TẠO</p>
          <p class="text-[7px] text-cyan-200 mt-0.5 truncate">Học tập thực chiến từ cơ bản đến nâng cao</p>
        </div>
        <div class="space-y-1 my-auto text-[6px]">
          <div class="bg-cyan-950/80 p-1 rounded border border-cyan-700/60 flex justify-between">
            <span class="font-bold text-cyan-300">Module 1: Nền tảng tư duy</span>
            <span class="text-slate-300">2 Tuần</span>
          </div>
          <div class="bg-cyan-900/80 p-1 rounded border border-cyan-400 flex justify-between">
            <span class="font-bold text-cyan-200">Module 2: Thực hành dự án</span>
            <span class="text-white">4 Tuần</span>
          </div>
          <div class="bg-cyan-950/80 p-1 rounded border border-cyan-700/60 flex justify-between">
            <span class="font-bold text-cyan-300">Module 3: Đồ án tốt nghiệp</span>
            <span class="text-slate-300">2 Tuần</span>
          </div>
        </div>
        <div class="text-[5px] text-cyan-300 border-t border-cyan-800 pt-0.5 truncate">
          Cấp chứng chỉ hoàn thành khóa học chuẩn quốc tế
        </div>
      </div>
    `,
    slideData: {
      customColor: '#083344',
      fabricJson: {
        objects: [
          { type: 'textbox', left: 80, top: 45, width: 800, text: 'LỘ TRÌNH KHÓA HỌC THỰC CHIẾN 8 TUẦN', fontSize: 30, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 90, width: 800, text: 'Hệ thống hóa kiến thức bài bản, kết hợp thực hành trực tiếp trên các bài toán doanh nghiệp', fontSize: 15, fontFamily: 'Inter', fill: '#a5f3fc' },
          { type: 'rect', left: 80, top: 150, width: 245, height: 300, fill: '#155e75', rx: 12, ry: 12 },
          { type: 'textbox', left: 100, top: 175, width: 205, text: 'MODULE 1: NỀN TẢNG\n\n(Tuần 1 - 2)\n\n• Tư duy thiết kế bài thuyết trình\n• Nguyên lý màu sắc và bố cục\n• Typography & chọn phông chữ\n• Kỹ năng kể chuyện qua hình ảnh', fontSize: 13, fontFamily: 'Inter', fill: '#ecfeff', lineHeight: 1.4 },
          { type: 'rect', left: 355, top: 145, width: 245, height: 310, fill: '#0e7490', stroke: '#22d3ee', strokeWidth: 2, rx: 12, ry: 12 },
          { type: 'textbox', left: 375, top: 170, width: 205, text: 'MODULE 2: THỰC CHIẾN\n\n(Tuần 3 - 6)\n\n• Trực quan hóa dữ liệu biểu đồ\n• Thiết kế slide kinh doanh & pitch\n• Hoạt ảnh & hiệu ứng chuyển cảnh\n• Sửa bài 1:1 cùng chuyên gia', fontSize: 13, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'rect', left: 630, top: 150, width: 245, height: 300, fill: '#155e75', rx: 12, ry: 12 },
          { type: 'textbox', left: 650, top: 175, width: 205, text: 'MODULE 3: TỐT NGHIỆP\n\n(Tuần 7 - 8)\n\n• Thực hiện đồ án thực tế\n• Thuyết trình bảo vệ đồ án\n• Nhận chứng nhận tốt nghiệp\n• Kết nối cơ hội việc làm', fontSize: 13, fontFamily: 'Inter', fill: '#ecfeff', lineHeight: 1.4 },
          { type: 'textbox', left: 80, top: 485, width: 800, text: 'Hỗ trợ giải đáp thắc mắc 24/7 trong suốt quá trình học và 6 tháng sau tốt nghiệp.', fontSize: 12, fontFamily: 'Inter', fill: '#67e8f9' }
        ]
      }
    }
  },
  {
    id: 'creative-portfolio',
    title: 'Hồ Sơ Năng Lực & Dự Án',
    category: 'creative',
    categoryName: 'Sáng tạo',
    tags: ['creative', 'portfolio', 'ho so', 'nang luc', 'du an', 'thiet ke', 'ca nhan', 'profile', 'designer', 'agency'],
    bgGradient: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
    previewBadge: 'PORTFOLIO',
    previewHtml: `
      <div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%);">
        <div>
          <span class="inline-block px-1.5 py-0.5 rounded bg-amber-600 text-[8px] font-bold tracking-wider mb-1">CREATIVE PROFILE</span>
          <p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">HỒ SƠ NĂNG LỰC</p>
          <p class="text-[7px] text-stone-400 mt-0.5 truncate">Dự án thiết kế nhận diện & truyền thông tiêu biểu</p>
        </div>
        <div class="grid grid-cols-3 gap-1 my-auto text-[6px]">
          <div class="bg-stone-900 p-1 rounded border border-stone-700">
            <span class="font-bold text-amber-400 block">Dự án A</span>
            <span class="text-stone-300 text-[5px]">Brand Identity</span>
          </div>
          <div class="bg-stone-800 p-1 rounded border border-amber-500">
            <span class="font-bold text-amber-300 block">Dự án B</span>
            <span class="text-stone-200 text-[5px]">UI/UX Design</span>
          </div>
          <div class="bg-stone-900 p-1 rounded border border-stone-700">
            <span class="font-bold text-amber-400 block">Dự án C</span>
            <span class="text-stone-300 text-[5px]">Marketing Art</span>
          </div>
        </div>
        <div class="text-[5px] text-stone-400 border-t border-stone-800 pt-0.5 truncate">
          Liên hệ: portfolio@agency-creative.vn
        </div>
      </div>
    `,
    slideData: {
      customColor: '#1c1917',
      fabricJson: {
        objects: [
          { type: 'textbox', left: 80, top: 45, width: 800, text: 'HỒ SƠ NĂNG LỰC & CÁC DỰ ÁN TIÊU BIỂU', fontSize: 30, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
          { type: 'textbox', left: 80, top: 90, width: 800, text: 'Hơn 5 năm kinh nghiệm sáng tạo giải pháp thị giác cho hơn 120+ thương hiệu uy tín', fontSize: 15, fontFamily: 'Inter', fill: '#d6d3d1' },
          { type: 'rect', left: 80, top: 150, width: 245, height: 300, fill: '#292524', rx: 12, ry: 12 },
          { type: 'textbox', left: 100, top: 175, width: 205, text: 'DỰ ÁN 01: NHẬN DIỆN THƯƠNG HIỆU\n\n• Khách hàng: TechCorp Global\n• Lĩnh vực: Công nghệ tài chính\n• Hạng mục: Logo, Bộ nhận diện, Ấn phẩm truyền thông & Website\n• Kết quả: Tăng 200% độ nhận diện', fontSize: 13, fontFamily: 'Inter', fill: '#f5f5f4', lineHeight: 1.4 },
          { type: 'rect', left: 355, top: 145, width: 245, height: 310, fill: '#44403c', stroke: '#f59e0b', strokeWidth: 2, rx: 12, ry: 12 },
          { type: 'textbox', left: 375, top: 170, width: 205, text: 'DỰ ÁN 02: THIẾT KẾ UI/UX APP\n\n• Khách hàng: TravelGo Mobile\n• Lĩnh vực: Du lịch & Đặt vé\n• Hạng mục: Giao diện ứng dụng iOS & Android, Design System\n• Kết quả: 500k+ lượt tải về', fontSize: 13, fontFamily: 'Inter', fill: '#ffffff', lineHeight: 1.4 },
          { type: 'rect', left: 630, top: 150, width: 245, height: 300, fill: '#292524', rx: 12, ry: 12 },
          { type: 'textbox', left: 650, top: 175, width: 205, text: 'DỰ ÁN 03: CHIẾN DỊCH QUẢNG CÁO\n\n• Khách hàng: EcoLife Organic\n• Lĩnh vực: Tiêu dùng bền vững\n• Hạng mục: Poster, Video đồ họa, Key visual đa kênh\n• Kết quả: Đạt giải Best Campaign', fontSize: 13, fontFamily: 'Inter', fill: '#f5f5f4', lineHeight: 1.4 },
          { type: 'textbox', left: 80, top: 485, width: 800, text: 'Kết nối hợp tác: info@creative-studio.vn  |  Behance: behance.net/creativestudio', fontSize: 12, fontFamily: 'Inter', fill: '#fbbf24' }
        ]
      }
    }
  }
];

let currentTemplateCategory = 'all';
let currentTemplateSearchQuery = '';

function normalizeSearchStr(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

function initSystemTemplatesLibrary() {
  if (!templatesGridContainer) return;

  // Render lần đầu toàn bộ danh sách mẫu
  renderTemplatesGrid('', 'all');

  // Nạp kho mẫu động từ SQLite Database Backend nếu khả dụng
  fetch('/api/templates')
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      if (data && Array.isArray(data.templates) && data.templates.length > 0) {
        // Map database templates into SYSTEM_PPTX_TEMPLATES format
        const dynamicTemplates = data.templates.map(t => ({
          id: t.id,
          title: t.title,
          category: t.category,
          categoryName: t.category_name,
          tags: Array.isArray(t.tags) ? t.tags : [],
          bgGradient: t.bg_gradient || 'linear-gradient(135deg, #032030 0%, #004d73 100%)',
          previewBadge: t.preview_badge || (t.category_name || '').toUpperCase(),
          previewHtml: t.preview_html,
          slideData: t.slide_data || { customColor: '#032030', fabricJson: { objects: [] } }
        }));
        // Update in-memory array and re-render
        SYSTEM_PPTX_TEMPLATES.length = 0;
        SYSTEM_PPTX_TEMPLATES.push(...dynamicTemplates);
        renderTemplatesGrid(currentTemplateSearchQuery, currentTemplateCategory);
      }
    })
    .catch(err => {
      console.warn("Could not sync templates from server DB, using local cache:", err);
    });

  // Gắn sự kiện ô tìm kiếm drawerSearchInput
  if (drawerSearchInput) {
    let searchDebounceTimer = null;
    drawerSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        const query = e.target.value.trim();
        currentTemplateSearchQuery = query;

        // Nếu drawer đang đóng thì mở ra
        if (canvaDrawer && canvaDrawer.classList.contains('w-0')) {
          expandDrawer();
        }

        // Tự động chuyển sang tab "Mẫu" nếu đang ở tab khác
        const slidesTabBtn = document.querySelector('.nav-tab-btn[data-tab="tab-slides"]');
        const slidesPane = document.getElementById('pane-slides');
        if (slidesPane && slidesPane.classList.contains('hidden') && slidesTabBtn) {
          slidesTabBtn.click();
        }

        renderTemplatesGrid(currentTemplateSearchQuery, currentTemplateCategory);
      }, 120);
    });
  }

  // Gắn sự kiện các Filter Pills
  if (templateFilterPills) {
    templateFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-category') || 'all';
        currentTemplateCategory = cat;

        // Cập nhật giao diện pill active
        templateFilterPills.forEach(p => {
          p.classList.remove('bg-cyan-600', 'text-white');
          p.classList.add('bg-slate-800', 'text-slate-300');
        });
        pill.classList.remove('bg-slate-800', 'text-slate-300');
        pill.classList.add('bg-cyan-600', 'text-white');

        renderTemplatesGrid(currentTemplateSearchQuery, currentTemplateCategory);
      });
    });
  }

  // Nút xóa lọc tìm kiếm
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', resetTemplateFilters);
  }
  if (btnResetSearchFilters) {
    btnResetSearchFilters.addEventListener('click', resetTemplateFilters);
  }

  // Toggle phần Trang trong thiết kế này (Collapsible)
  if (btnToggleDeckSlidesSection && deckSlidesCollapsibleArea && deckSlidesSectionChevron) {
    btnToggleDeckSlidesSection.addEventListener('click', () => {
      const isHidden = deckSlidesCollapsibleArea.classList.contains('hidden');
      if (isHidden) {
        deckSlidesCollapsibleArea.classList.remove('hidden');
        deckSlidesSectionChevron.classList.remove('-rotate-90');
      } else {
        deckSlidesCollapsibleArea.classList.add('hidden');
        deckSlidesSectionChevron.classList.add('-rotate-90');
      }
    });
  }
}

function resetTemplateFilters() {
  currentTemplateSearchQuery = '';
  currentTemplateCategory = 'all';
  if (drawerSearchInput) drawerSearchInput.value = '';

  if (templateFilterPills) {
    templateFilterPills.forEach(p => {
      const isAll = p.getAttribute('data-category') === 'all';
      if (isAll) {
        p.classList.remove('bg-slate-800', 'text-slate-300');
        p.classList.add('bg-cyan-600', 'text-white');
      } else {
        p.classList.remove('bg-cyan-600', 'text-white');
        p.classList.add('bg-slate-800', 'text-slate-300');
      }
    });
  }

  renderTemplatesGrid('', 'all');
}

function renderTemplatesGrid(query = '', category = 'all') {
  if (!templatesGridContainer) return;
  templatesGridContainer.innerHTML = '';

  const normalizedQuery = normalizeSearchStr(query);

  const filtered = SYSTEM_PPTX_TEMPLATES.filter(tmpl => {
    // Lọc theo Category
    if (category !== 'all' && tmpl.category !== category) {
      return false;
    }

    // Lọc theo Từ khóa tìm kiếm
    if (normalizedQuery) {
      const titleNorm = normalizeSearchStr(tmpl.title);
      const catNorm = normalizeSearchStr(tmpl.categoryName);
      const tagsMatch = tmpl.tags.some(tag => normalizeSearchStr(tag).includes(normalizedQuery));
      const textMatch = titleNorm.includes(normalizedQuery) || catNorm.includes(normalizedQuery) || tagsMatch;
      if (!textMatch) return false;
    }

    return true;
  });

  // Cập nhật số lượng đếm và tiêu đề
  if (templatesCountBadge) {
    templatesCountBadge.textContent = `${filtered.length} mẫu`;
  }
  if (templatesSectionHeading) {
    if (query) {
      templatesSectionHeading.textContent = `Kết quả cho "${query}"`;
    } else if (category !== 'all') {
      const catObj = SYSTEM_PPTX_TEMPLATES.find(t => t.category === category);
      templatesSectionHeading.textContent = `Mẫu ${catObj ? catObj.categoryName : ''}`;
    } else {
      templatesSectionHeading.textContent = 'Mẫu trang có sẵn';
    }
  }

  // Hiển thị / Ẩn nút Xóa lọc
  if (clearSearchBtn) {
    if (query || category !== 'all') {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
  }

  // Xử lý Empty State
  if (filtered.length === 0) {
    templatesGridContainer.classList.add('hidden');
    if (templatesEmptyState) templatesEmptyState.classList.remove('hidden');
    return;
  }

  templatesGridContainer.classList.remove('hidden');
  if (templatesEmptyState) templatesEmptyState.classList.add('hidden');

  // Render từng thẻ mẫu theo phong cách mục Trang trong thiết kế
  filtered.forEach((tmpl, idx) => {
    const card = document.createElement('div');
    card.className = 'p-1.5 rounded-lg border border-slate-700/60 bg-slate-900/90 hover:border-cyan-400 hover:bg-cyan-950/20 active:scale-[0.98] cursor-pointer flex flex-col gap-1 relative group transition-all shadow-sm';
    card.title = `Nhấn để thêm vào danh sách trang: ${tmpl.title}`;

    // Thumbnail Preview Frame (16:9)
    const frame = document.createElement('div');
    frame.className = 'w-full aspect-video bg-black rounded overflow-hidden relative shadow-sm border border-slate-800 flex items-center justify-center select-none';

    // Nội dung preview: ưu tiên ảnh renderPngUrl từ file PPTX nếu có
    if (tmpl.slideData && tmpl.slideData.renderPngUrl) {
      const img = document.createElement('img');
      img.src = tmpl.slideData.renderPngUrl;
      img.alt = tmpl.title;
      img.className = 'w-full h-full object-contain pointer-events-none';
      img.loading = 'lazy';
      frame.appendChild(img);
    } else if (tmpl.previewHtml) {
      const previewWrapper = document.createElement('div');
      previewWrapper.className = 'w-full h-full pointer-events-none';
      previewWrapper.innerHTML = tmpl.previewHtml;
      frame.appendChild(previewWrapper);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'w-full h-full flex items-center justify-center text-[10px] font-bold text-white text-center p-1';
      placeholder.style.background = tmpl.bgGradient || '#0f172a';
      placeholder.textContent = tmpl.title;
      frame.appendChild(placeholder);
    }

    // Badge số thứ tự ở góc dưới bên trái (giống hệt mục Trang trong thiết kế)
    const badge = document.createElement('span');
    badge.className = 'absolute bottom-1 left-1 bg-black/80 text-[9px] text-white font-bold px-1 py-0.5 rounded pointer-events-none z-10';
    badge.textContent = idx + 1;
    frame.appendChild(badge);

    // Tiêu đề chữ in hoa bên dưới thẻ (giống mục Trang trong thiết kế)
    const titleP = document.createElement('p');
    titleP.className = 'text-[10px] font-bold text-slate-200 uppercase truncate px-0.5 group-hover:text-cyan-300 transition-colors';
    titleP.textContent = tmpl.title || `Trang ${idx + 1}`;

    card.appendChild(frame);
    card.appendChild(titleP);

    // Khi nhấn vào thì lập tức thêm vào danh sách trang, không cần nút nào cả
    card.addEventListener('click', () => {
      applyTemplateToDeck(tmpl, false);
    });

    templatesGridContainer.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function applyTemplateToDeck(template, replaceCurrent = false) {
  if (!currentDeck) {
    showToast("Vui lòng mở một bài thuyết trình trước khi áp dụng mẫu!", true);
    return;
  }
  const user = getCurrentUser();
  const perms = getDesignPermissions(currentDeck, user);
  if (!perms.canEdit) {
    showToast("Bài thiết kế đang ở chế độ Chỉ xem. Bạn không thể chỉnh sửa hoặc thêm slide.", true);
    return;
  }

  saveCurrentSlideState();

  const slideData = template.slideData || {};
  const clonedFabricJson = slideData.fabricJson ? JSON.parse(JSON.stringify(slideData.fabricJson)) : { objects: [] };
  const hasBgImg = !!slideData.renderPngUrl;

  if (replaceCurrent) {
    const targetSlide = currentDeck.slides[currentSlideIndex];
    if (!targetSlide) return;
    targetSlide.title = template.title;

    if (hasBgImg) {
      targetSlide.renderPngUrl = slideData.renderPngUrl;
      targetSlide.renderSvgUrl = slideData.renderSvgUrl || null;
      targetSlide.thumbnailUrl = slideData.renderPngUrl;
      targetSlide.elements = slideData.elements ? JSON.parse(JSON.stringify(slideData.elements)) : [];
      targetSlide.useCustomColor = false;
      targetSlide.customColor = null;
      targetSlide.fabricJson = clonedFabricJson;
      targetSlide.isEdited = false;
    } else {
      targetSlide.customColor = slideData.customColor || '#032030';
      targetSlide.useCustomColor = true;
      targetSlide.renderPngUrl = null;
      targetSlide.renderSvgUrl = null;
      targetSlide.thumbnailUrl = null;
      targetSlide.elements = [];
      targetSlide.fabricJson = clonedFabricJson;
      targetSlide.isEdited = true;
    }

    loadSlideToCanvas(currentSlideIndex);
    renderSlideThumbnails();
    saveDeck(currentDeck, true);
    showToast(`Đã áp dụng mẫu "${template.title}" cho trang hiện tại!`);
  } else {
    const newIdx = currentDeck.slides.length;
    const newSlide = {
      index: newIdx,
      title: template.title,
      width: slideData.width || 1920,
      height: slideData.height || 1080,
      renderPngUrl: hasBgImg ? slideData.renderPngUrl : null,
      renderSvgUrl: hasBgImg ? (slideData.renderSvgUrl || null) : null,
      thumbnailUrl: hasBgImg ? slideData.renderPngUrl : null,
      elements: (hasBgImg && slideData.elements) ? JSON.parse(JSON.stringify(slideData.elements)) : [],
      fabricJson: clonedFabricJson,
      isEdited: !hasBgImg,
      useCustomColor: !hasBgImg,
      customColor: !hasBgImg ? (slideData.customColor || '#032030') : null
    };

    currentDeck.slides.push(newSlide);
    if (slideTotalBadge) slideTotalBadge.textContent = currentDeck.slides.length;
    renderSlideThumbnails();
    loadSlideToCanvas(newIdx);
    saveDeck(currentDeck, true);
    showToast(`Đã thêm trang mẫu "${template.title}" vào thiết kế!`);
  }
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
  showLoader("Đang nạp bài thuyết trình mẫu...", "vietnam_travel_sample.pptx", "Đang bóc tách bố cục, hình ảnh vector và font chữ nhúng...");
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

  showLoader("Đang nạp bài thuyết trình...", file.name, "Hệ thống đang bóc tách slide, vector hóa hình ảnh và tối ưu font chữ. Vui lòng chờ trong giây lát.");
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

let isGlobalOperationInProgress = false;

function preventTabCloseDuringLoading(e) {
  if (isGlobalOperationInProgress) {
    e.preventDefault();
    e.returnValue = 'Quá trình nạp bài thuyết trình đang diễn ra. Bạn có chắc chắn muốn rời đi?';
    return e.returnValue;
  }
}

let loaderWatchdogTimer = null;

function showLoader(text, filename = null, subtitle = null) {
  if (loaderWatchdogTimer) {
    clearTimeout(loaderWatchdogTimer);
    loaderWatchdogTimer = null;
  }

  if (loaderText) loaderText.textContent = text;
  if (uploadLoader) uploadLoader.classList.remove('hidden');

  if (globalLoadingOverlay) {
    if (globalLoadingTitle) {
      globalLoadingTitle.textContent = text || "Đang nạp bài thuyết trình...";
    }
    if (globalLoadingFilename) {
      if (filename) {
        globalLoadingFilename.textContent = filename;
        globalLoadingFilename.classList.remove('hidden');
      } else {
        globalLoadingFilename.classList.add('hidden');
      }
    }
    if (globalLoadingSubtitle) {
      globalLoadingSubtitle.textContent = subtitle || "Hệ thống đang bóc tách slide, vector hóa hình ảnh và tối ưu font chữ...";
    }
    globalLoadingOverlay.classList.remove('hidden');
  }

  isGlobalOperationInProgress = true;
  window.addEventListener('beforeunload', preventTabCloseDuringLoading);

  // Watchdog an toàn: tự động ẩn loader sau tối đa 12 giây nếu bất kỳ tác vụ nào bị treo
  loaderWatchdogTimer = setTimeout(() => {
    hideLoader();
  }, 12000);

  if (window.lucide) lucide.createIcons();
}

function hideLoader() {
  if (loaderWatchdogTimer) {
    clearTimeout(loaderWatchdogTimer);
    loaderWatchdogTimer = null;
  }
  if (uploadLoader) uploadLoader.classList.add('hidden');
  if (globalLoadingOverlay) globalLoadingOverlay.classList.add('hidden');

  isGlobalOperationInProgress = false;
  window.removeEventListener('beforeunload', preventTabCloseDuringLoading);
}

// --- 3.5. ROLE-BASED ACCESS CONTROL (RBAC) ---
function getDesignPermissions(deck, user) {
  if (!deck) {
    return {
      isOwner: false,
      canEdit: false,
      canShare: false,
      isViewer: true,
      roleLabel: 'Khách xem',
      accessLevel: 'private',
      isDenied: false,
      memberRecord: null
    };
  }

  const userEmail = (user?.email || '').trim().toLowerCase();
  const userId = user?.id || user?.google_id || '';
  const ownerEmail = (deck.owner?.email || deck.ownerEmail || deck.owner_email || '').trim().toLowerCase();
  const ownerId = deck.owner?.id || deck.ownerId || deck.owner_id || '';

  // 1. Kiểm tra có phải Chủ sở hữu không
  let isOwner = false;
  if (userEmail && ownerEmail && userEmail === ownerEmail) {
    isOwner = true;
  } else if (userId && ownerId && userId === ownerId) {
    isOwner = true;
  } else if (!ownerEmail && userEmail) {
    isOwner = true;
    deck.owner = { id: userId, email: userEmail, name: user.name || userEmail.split('@')[0], picture: user.picture || '' };
    deck.ownerEmail = userEmail;
    deck.ownerName = user.name;
    deck.owner_email = userEmail;
    deck.owner_name = user.name;
    apiSaveDeck(deck, false);
  } else if (!ownerEmail && !userEmail) {
    isOwner = true;
  }

  // 2. Tìm trong danh sách cộng tác viên
  const sharedMembers = Array.isArray(deck.sharedMembers) ? deck.sharedMembers : [];
  const memberRecord = userEmail
    ? sharedMembers.find(m => (m.email || '').trim().toLowerCase() === userEmail)
    : null;

  const accessLevel = deck.shareAccessLevel || deck.share_access_level || 'private';

  // 3. Quyền Chỉnh sửa (canEdit)
  let canEdit = false;
  let roleLabel = 'Khách xem';

  if (isOwner) {
    canEdit = true;
    roleLabel = 'Chủ sở hữu';
  } else if (memberRecord && memberRecord.role === 'editor') {
    canEdit = true;
    roleLabel = 'Người chỉnh sửa';
  } else if (accessLevel === 'edit') {
    canEdit = true;
    roleLabel = 'Được phép chỉnh sửa';
  } else if (memberRecord && memberRecord.role === 'viewer') {
    canEdit = false;
    roleLabel = 'Người xem';
  } else if (accessLevel === 'view') {
    canEdit = false;
    roleLabel = 'Chỉ xem';
  } else {
    canEdit = false;
    roleLabel = 'Không có quyền';
  }

  const canShare = isOwner;
  const isDenied = !isOwner && !memberRecord && accessLevel === 'private';

  return {
    isOwner,
    canEdit,
    canShare,
    roleLabel,
    accessLevel,
    isDenied,
    memberRecord
  };
}

function applyPermissionsToUI(deck) {
  if (!deck) return;
  const user = getCurrentUser();
  const perms = getDesignPermissions(deck, user);

  // 1. Kiểm tra Access Denied
  if (perms.isDenied) {
    if (accessDeniedOverlay) accessDeniedOverlay.classList.remove('hidden');
  } else {
    if (accessDeniedOverlay) accessDeniedOverlay.classList.add('hidden');
  }

  // 2. Header Role Badge
  if (headerRoleBadge) {
    headerRoleBadge.classList.remove('hidden');
    if (perms.isOwner) {
      headerRoleBadge.textContent = "Chủ sở hữu";
      headerRoleBadge.className = "shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-500/40 shadow-sm";
    } else if (perms.canEdit) {
      headerRoleBadge.textContent = "Được sửa";
      headerRoleBadge.className = "shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-sm";
    } else {
      headerRoleBadge.textContent = "Chỉ xem";
      headerRoleBadge.className = "shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-sm";
    }
  }

  // 3. Khóa tiêu đề nếu không có quyền sửa
  if (deckTitleInput) {
    deckTitleInput.readOnly = !perms.canEdit;
    if (!perms.canEdit) {
      deckTitleInput.title = "Bạn đang ở chế độ Chỉ xem (không thể đổi tên bài)";
      deckTitleInput.classList.remove('hover:bg-white/10', 'focus:bg-white/20');
      deckTitleInput.classList.add('cursor-default');
    } else {
      deckTitleInput.title = "Nhấp để đổi tên bài thuyết trình";
      deckTitleInput.classList.add('hover:bg-white/10', 'focus:bg-white/20');
      deckTitleInput.classList.remove('cursor-default');
    }
  }

  // 4. Nút Sửa chữ trên slide
  if (btnToggleEditOverlay) {
    if (!perms.canEdit) {
      btnToggleEditOverlay.classList.add('hidden');
    } else {
      btnToggleEditOverlay.classList.remove('hidden');
    }
  }

  // 5. Nút thêm slide
  if (btnAddSlide) btnAddSlide.style.display = perms.canEdit ? '' : 'none';
  if (btnAddSlideBottom) btnAddSlideBottom.style.display = perms.canEdit ? '' : 'none';

  // 6. Fabric Canvas
  if (fabricCanvas) {
    fabricCanvas.selection = perms.canEdit;
    fabricCanvas.forEachObject(obj => {
      obj.selectable = perms.canEdit;
      obj.evented = perms.canEdit;
    });
    if (!perms.canEdit && typeof onObjectDeselected === 'function') {
      onObjectDeselected();
    }
    fabricCanvas.renderAll();
  }
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

  saveDeck(currentDeck, true);
  applyPermissionsToUI(currentDeck);

  deckTitleInput.value = (deck.filename || "Thiết kế không tên - Bài thuyết trình").replace(/\.(pptx|ppt)$/i, '');
  slideTotalBadge.textContent = deck.slideCount || deck.slides.length;
  bottomSlideCounter.textContent = `1 / ${deck.slideCount || deck.slides.length}`;

  if (!fabricCanvas) {
    initFabricCanvas();
  }

  loadCustomFonts(deck.customFonts || []);

  switchMainView('editor');

  renderSlideThumbnails();
  loadSlideToCanvas(0);

  if (toastMsgText) {
    showToast(toastMsgText);
  } else {
    showToast(`Đã mở bài thiết kế: ${currentDeck.designId}`);
  }

  // Khởi động Real-time Active Collaborators Presence
  startPresenceHeartbeat();

  // Đảm bảo ẩn mọi màn hình loader khi bài thiết kế đã khởi tạo xong
  hideLoader();

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

// Biến theo dõi trạng thái kéo thả slide
let draggedSlideIndex = null;
let isDraggingSlide = false;

// Hàm hoán đổi / di chuyển thứ tự trang trong bài thuyết trình
function reorderSlides(fromIndex, toIndex) {
  if (!currentDeck || !currentDeck.slides) return;
  if (fromIndex < 0 || fromIndex >= currentDeck.slides.length) return;
  if (toIndex < 0 || toIndex >= currentDeck.slides.length) return;
  if (fromIndex === toIndex) return;

  const user = getCurrentUser();
  const perms = getDesignPermissions(currentDeck, user);
  if (!perms.canEdit) {
    showToast("Bạn chỉ có quyền xem, không thể thay đổi thứ tự trang", true);
    return;
  }

  // 1. Lưu lại trạng thái slide hiện tại trên Canvas
  saveCurrentSlideState();

  // 2. Ghi nhớ slide đang active
  const activeSlide = currentDeck.slides[currentSlideIndex];

  // 3. Di chuyển phần tử trong mảng
  const [movedSlide] = currentDeck.slides.splice(fromIndex, 1);
  currentDeck.slides.splice(toIndex, 0, movedSlide);

  // 4. Đồng bộ lại index
  currentDeck.slides.forEach((s, i) => {
    s.index = i;
  });

  // 5. Cập nhật currentSlideIndex theo slide active
  const newActiveIndex = currentDeck.slides.indexOf(activeSlide);
  currentSlideIndex = newActiveIndex !== -1 ? newActiveIndex : toIndex;

  // 6. Cập nhật giao diện
  renderSlideThumbnails();
  loadSlideToCanvas(currentSlideIndex);

  // 7. Tự động lưu
  saveDeck(currentDeck, true);
  showToast(`Đã chuyển Trang ${fromIndex + 1} sang vị trí Trang ${toIndex + 1}`);
}

// --- 5. CANVA-STYLE SLIDE THUMBNAILS (2-COLUMN GRID) ---
function renderSlideThumbnails() {
  thumbnailContainer.innerHTML = '';
  if (!currentDeck || !currentDeck.slides) return;
  const user = getCurrentUser();
  const perms = getDesignPermissions(currentDeck, user);

  currentDeck.slides.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.id = `slide-thumb-${idx}`;
    card.className = `p-1.5 rounded-lg border border-slate-700/60 bg-slate-900/90 flex flex-col gap-1 relative group transition-all select-none ${
      idx === currentSlideIndex ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400' : 'hover:border-slate-500'
    } ${perms.canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`;
    card.title = perms.canEdit ? `Kéo thả để đổi thứ tự hoặc bấm để mở Trang ${idx + 1}: ${slide.title || ''}` : `Trang ${idx + 1}`;

    // Thumbnail Preview Frame
    const frame = document.createElement('div');
    frame.className = 'w-full aspect-video bg-black rounded overflow-hidden relative shadow-sm border border-slate-800';

    const img = document.createElement('img');
    img.id = `thumb-img-${idx}`;
    img.src = (slide.isEdited && slide.thumbnailUrl) ? slide.thumbnailUrl : (slide.renderPngUrl || slide.thumbnailUrl || '');
    img.alt = `Slide ${idx + 1}`;
    img.className = 'w-full h-full object-contain pointer-events-none';

    const badge = document.createElement('span');
    badge.className = 'absolute bottom-1 left-1 bg-black/80 text-[9px] text-white font-bold px-1 py-0.5 rounded pointer-events-none';
    badge.textContent = idx + 1;

    frame.appendChild(img);
    frame.appendChild(badge);

    // Title
    const titleP = document.createElement('p');
    titleP.className = 'text-[10px] font-medium text-slate-300 truncate px-0.5 pointer-events-none';
    titleP.textContent = slide.title || `Trang ${idx + 1}`;

    // Hover Action Buttons (Duplicate, Delete)
    const hoverActions = document.createElement('div');
    hoverActions.className = 'absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5 bg-slate-900/95 p-0.5 rounded border border-slate-700 z-10';

    const btnDup = document.createElement('button');
    btnDup.title = 'Nhân bản slide';
    btnDup.className = 'p-1 hover:text-cyan-400 text-slate-300 cursor-pointer';
    btnDup.innerHTML = '<i data-lucide="copy" class="w-3 h-3"></i>';
    btnDup.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateSlide(idx);
    });

    const btnDel = document.createElement('button');
    btnDel.title = 'Xóa slide';
    btnDel.className = 'p-1 hover:text-red-400 text-slate-300 cursor-pointer';
    btnDel.innerHTML = '<i data-lucide="trash-2" class="w-3 h-3"></i>';
    btnDel.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSlide(idx);
    });

    hoverActions.appendChild(btnDup);
    hoverActions.appendChild(btnDel);

    card.appendChild(frame);
    card.appendChild(titleP);
    if (perms.canEdit) {
      card.appendChild(hoverActions);
    }

    // Gắn sự kiện Kéo Thả (HTML5 Drag and Drop)
    if (perms.canEdit) {
      card.draggable = true;

      card.addEventListener('dragstart', (e) => {
        isDraggingSlide = true;
        draggedSlideIndex = idx;
        e.dataTransfer.setData('text/plain', idx.toString());
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('opacity-40', 'scale-95', 'border-dashed', 'border-cyan-400');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('opacity-40', 'scale-95', 'border-dashed', 'border-cyan-400');
        if (thumbnailContainer) {
          thumbnailContainer.querySelectorAll('[id^="slide-thumb-"]').forEach(el => {
            el.classList.remove('ring-2', 'ring-cyan-400', 'bg-cyan-950/50', 'scale-[1.02]');
          });
        }
        draggedSlideIndex = null;
        setTimeout(() => {
          isDraggingSlide = false;
        }, 100);
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      card.addEventListener('dragenter', (e) => {
        e.preventDefault();
        if (draggedSlideIndex !== null && draggedSlideIndex !== idx) {
          card.classList.add('ring-2', 'ring-cyan-400', 'bg-cyan-950/50', 'scale-[1.02]');
        }
      });

      card.addEventListener('dragleave', (e) => {
        if (!card.contains(e.relatedTarget)) {
          card.classList.remove('ring-2', 'ring-cyan-400', 'bg-cyan-950/50', 'scale-[1.02]');
        }
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('ring-2', 'ring-cyan-400', 'bg-cyan-950/50', 'scale-[1.02]');
        const fromIdx = draggedSlideIndex !== null ? draggedSlideIndex : parseInt(e.dataTransfer.getData('text/plain'));
        if (fromIdx !== null && !isNaN(fromIdx) && fromIdx !== idx) {
          reorderSlides(fromIdx, idx);
        }
      });
    }

    card.addEventListener('click', () => {
      if (isDraggingSlide) return;
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
  updateCurrentSlideThumbnail();
  saveDeck(currentDeck, true);
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

  const user = getCurrentUser();
  const perms = getDesignPermissions(currentDeck, user);

  // Restore user-added objects if any
  if (slide.fabricJson && slide.fabricJson.objects && slide.fabricJson.objects.length > 0) {
    fabric.util.enlivenObjects(slide.fabricJson.objects, (enlivenedObjects) => {
      enlivenedObjects.forEach((obj) => {
        obj.isSystemLoaded = true;
        obj.selectable = perms.canEdit;
        obj.evented = perms.canEdit;
        fabricCanvas.add(obj);
      });
      fabricCanvas.selection = perms.canEdit;
      fabricCanvas.renderAll();
    });
  } else {
    fabricCanvas.selection = perms.canEdit;
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
  saveDeck(currentDeck, true);
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
  saveDeck(currentDeck, true);
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
  saveDeck(currentDeck, true);
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

// Helper: Chuyển đổi mọi đường dẫn ảnh (URL hoặc relative path) sang Base64 Data URL chuẩn cho PptxGenJS
async function fetchImageAsBase64(url) {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;

  try {
    const fullUrl = url.startsWith('http') ? url : (window.location.origin + url);
    const response = await fetch(fullUrl);
    if (!response.ok) {
      console.warn(`Lỗi khi tải ảnh ${fullUrl}: ${response.status}`);
      return null;
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Lỗi chuyển đổi ảnh sang Base64:", url, err);
    return null;
  }
}

// --- 12. EXPORT ENGINE: EXPORT TO NATIVE .PPTX ---
btnExportPPTX.addEventListener('click', exportDeckToPPTX);
menuDownloadPPTX.addEventListener('click', exportDeckToPPTX);

async function exportDeckToPPTX() {
  if (!currentDeck || currentDeck.slides.length === 0) {
    showToast("Không có slide nào để xuất!", true);
    return;
  }

  saveCurrentSlideState();
  const totalSlides = currentDeck.slides.length;
  showToast(`Đang kết xuất ${totalSlides} slide sang PowerPoint...`);

  try {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    const filename = (deckTitleInput.value.trim() || "SlideCraft_Presentation") + ".pptx";

    for (let i = 0; i < totalSlides; i++) {
      const slide = currentDeck.slides[i];
      const pptxSlide = pptx.addSlide();

      // 1. Kết xuất nền slide
      if (slide.useCustomColor && slide.customColor) {
        pptxSlide.background = { color: slide.customColor.replace('#', '') };
      } else {
        // Lấy URL ảnh nền: ưu tiên renderPngUrl gốc để đảm bảo độ nét 100%
        let bgSourceUrl = slide.renderPngUrl;
        if (slide.isEdited && slide.thumbnailUrl && slide.thumbnailUrl.startsWith('data:')) {
          bgSourceUrl = slide.thumbnailUrl;
        }

        if (bgSourceUrl) {
          const base64Bg = await fetchImageAsBase64(bgSourceUrl);
          if (base64Bg) {
            pptxSlide.addImage({
              data: base64Bg,
              x: 0,
              y: 0,
              w: '100%',
              h: '100%',
            });
          }
        }
      }

      // 2. Kết xuất các đối tượng người dùng thêm vào (Text, Shape, Image...)
      if (slide.fabricJson && slide.fabricJson.objects && slide.fabricJson.objects.length > 0) {
        for (const obj of slide.fabricJson.objects) {
          if (obj.isExtractedOverlay) continue;

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
          } else if (obj.type === 'image' && obj.src) {
            const imgBase64 = await fetchImageAsBase64(obj.src);
            if (imgBase64) {
              pptxSlide.addImage({
                data: imgBase64,
                x: (obj.left / 960) * 13.333,
                y: (obj.top / 540) * 7.5,
                w: ((obj.width * (obj.scaleX || 1)) / 960) * 13.333,
                h: ((obj.height * (obj.scaleY || 1)) / 540) * 7.5,
              });
            }
          }
        }
      }
    }

    await pptx.writeFile({ fileName: filename });
    showToast(`Xuất trọn bộ ${totalSlides} slide sang file "${filename}" thành công!`);
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

if (btnHome) {
  btnHome.addEventListener('click', () => {
    if (getCurrentUser()) {
      openProjectsPage('editor');
    } else {
      openHomePage();
    }
  });
}

// --- 14.1 VIEW SWITCHER & NAVIGATION CONTROLLERS ---
// Quản lý chuyển đổi view tập trung - Đảm bảo chỉ duy nhất 1 view được hiển thị tại 1 thời điểm
function switchMainView(activeViewName) {
  // activeViewName: 'home' | 'upload' | 'editor' | 'projects' | 'account' | 'adminLogin' | 'adminDashboard'
  const views = {
    home: homeView,
    upload: uploadView,
    editor: editorView,
    projects: projectsPageView,
    account: accountPageView,
    adminLogin: adminLoginView,
    adminDashboard: adminDashboardView
  };

  Object.entries(views).forEach(([name, el]) => {
    if (!el) return;
    if (name === activeViewName) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Đóng các dropdown menu nếu đang mở
  if (uploadUserDropdownMenu) uploadUserDropdownMenu.classList.add('hidden');
  if (userDropdownMenu) userDropdownMenu.classList.add('hidden');

  if (window.lucide) lucide.createIcons();
}

function openHomePage() {
  if (editorView && !editorView.classList.contains('hidden')) {
    saveCurrentSlideState();
    stopPresenceHeartbeat();
  }
  
  switchMainView('home');

  if (window.location.pathname !== '/') {
    window.history.pushState({ page: 'home' }, '', '/');
  }

  renderHomeAuthCard();
}

function openImportPage() {
  if (editorView && !editorView.classList.contains('hidden')) {
    saveCurrentSlideState();
    stopPresenceHeartbeat();
  }
  
  switchMainView('upload');

  if (window.location.pathname !== '/import') {
    window.history.pushState({ page: 'import' }, '', '/import');
  }
}

function getLastLoggedOutUser() {
  try {
    const raw = localStorage.getItem('canva_last_logged_out_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function renderHomeAuthCard() {
  const currentUser = getCurrentUser();
  const lastUser = getLastLoggedOutUser();
  const activeUser = currentUser || lastUser;

  // Nếu có thông tin người dùng (đang đăng nhập hoặc đã logout có tài khoản lưu trước đó):
  // Hiển thị card "Jump back in!"
  if (activeUser) {
    if (homeAuthBlock) homeAuthBlock.classList.remove('hidden');
    if (homeGuestBlock) homeGuestBlock.classList.add('hidden');

    if (homeUserNameText) homeUserNameText.textContent = activeUser.name || 'Người dùng';
    if (homeUserEmailText) homeUserEmailText.textContent = activeUser.email || '';

    const initial = (activeUser.name || activeUser.email || 'T').trim().charAt(0).toUpperCase();
    if (homeUserAvatarLetter) homeUserAvatarLetter.textContent = initial;

    if (activeUser.picture && homeUserAvatarImg) {
      homeUserAvatarImg.src = activeUser.picture;
      homeUserAvatarImg.classList.remove('hidden');
      if (homeUserAvatarLetter) homeUserAvatarLetter.classList.add('hidden');
    } else {
      if (homeUserAvatarImg) homeUserAvatarImg.classList.add('hidden');
      if (homeUserAvatarLetter) homeUserAvatarLetter.classList.remove('hidden');
    }
  } else {
    // Khi lần đầu vào (chưa từng đăng nhập):
    // Cụ thể: logo ở trên, dưới là 1 dòng mô tả ngắn, dưới nữa là nút login, cuối cùng là nút đăng ký
    if (homeAuthBlock) homeAuthBlock.classList.add('hidden');
    if (homeGuestBlock) homeGuestBlock.classList.remove('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

deckTitleInput.addEventListener('change', () => {
  if (currentDeck) {
    currentDeck.filename = deckTitleInput.value.trim() || "Thiết kế không tên - Bài thuyết trình";
    saveDeck(currentDeck, true);
  }
});

// Helper sanitize HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Account page & dropdown state
let previousViewBeforeAccount = 'upload';

// Mở trang riêng Quản lý tài khoản
function openAccountPage(fromView) {
  const user = getCurrentUser();
  if (!user) {
    loginWithGoogle();
    return;
  }

  if (fromView) {
    previousViewBeforeAccount = fromView;
  } else if (editorView && !editorView.classList.contains('hidden')) {
    previousViewBeforeAccount = 'editor';
  } else if (projectsPageView && !projectsPageView.classList.contains('hidden')) {
    previousViewBeforeAccount = 'projects';
  } else if (homeView && !homeView.classList.contains('hidden')) {
    previousViewBeforeAccount = 'home';
  } else {
    previousViewBeforeAccount = 'upload';
  }

  // Chuyển view
  switchMainView('account');

  // Điền thông tin người dùng Google
  const avatarUrl = user.picture || 'https://www.gravatar.com/avatar?d=mp';
  if (accPageAvatar) accPageAvatar.src = avatarUrl;
  if (accPageName) accPageName.textContent = user.name || 'Người dùng Google';
  if (accPageEmail) accPageEmail.textContent = user.email || '';

  // Render danh sách bài thiết kế gần đây
  renderRecentDecksInAccountPage();

  // Đổi URL trên thanh địa chỉ sang /account
  if (window.location.pathname !== '/account') {
    window.history.pushState({ page: 'account' }, '', '/account');
  }
}

// Đóng trang riêng Quản lý tài khoản và quay lại view trước đó
function closeAccountPage() {
  if (previousViewBeforeAccount === 'editor' && currentDeck && currentDeck.designId) {
    switchMainView('editor');
    window.history.pushState({ designId: currentDeck.designId }, '', `/design/${currentDeck.designId}/${currentDeck.editToken}/edit`);
  } else if (previousViewBeforeAccount === 'projects') {
    openProjectsPage('account');
  } else if (previousViewBeforeAccount === 'import' || previousViewBeforeAccount === 'upload') {
    openImportPage();
  } else {
    openHomePage();
  }
}

// Hiển thị danh sách các bài trình chiếu trong trang quản lý tài khoản
async function renderRecentDecksInAccountPage() {
  if (!accountRecentDecksList) return;
  accountRecentDecksList.innerHTML = `
    <div class="p-6 text-center text-slate-400">
      <div class="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p class="text-xs text-slate-500">Đang đồng bộ danh sách thiết kế từ máy chủ...</p>
    </div>
  `;

  const user = getCurrentUser();
  const decksMap = new Map();

  // 1. Quét từ SQLite Database của server nếu người dùng đã đăng nhập
  if (user && user.email) {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(user.email)}/designs`);
      if (res.ok) {
        const data = await res.json();
        const dbDesigns = data.designs || [];
        dbDesigns.forEach(d => {
          decksMap.set(d.design_id, {
            id: d.design_id,
            token: d.edit_token || 'token',
            title: d.title || "Bài thuyết trình",
            slidesCount: d.slide_count || 1,
            badge: (currentDeck && currentDeck.designId === d.design_id) ? "Đang mở" : "Đám mây",
            badgeColor: (currentDeck && currentDeck.designId === d.design_id) ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700",
            fromDb: true
          });
        });
      }
    } catch (e) {
      console.warn("Failed to fetch user designs from DB:", e);
    }
  }

  // 2. Bài hiện tại (nếu có)
  if (currentDeck && currentDeck.designId) {
    if (!decksMap.has(currentDeck.designId)) {
      decksMap.set(currentDeck.designId, {
        id: currentDeck.designId,
        token: currentDeck.editToken || 'token',
        title: (deckTitleInput && deckTitleInput.value.trim()) || currentDeck.filename || "Bài thuyết trình hiện tại",
        slidesCount: (currentDeck.slides || []).length || 1,
        badge: "Đang mở",
        badgeColor: "bg-emerald-100 text-emerald-700",
        deckObj: currentDeck
      });
    }
  }

  // 3. Quét từ LocalStorage (bộ nhớ tạm của trình duyệt)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('canva_design_') || (key.startsWith('deck_') && !key.endsWith('_backup')))) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && item.designId && !decksMap.has(item.designId)) {
          decksMap.set(item.designId, {
            id: item.designId,
            token: item.editToken || 'token',
            title: item.filename || "Bài thuyết trình đã lưu",
            slidesCount: (item.slides || []).length || 1,
            badge: "Cục bộ",
            badgeColor: "bg-slate-100 text-slate-600",
            deckObj: item
          });
        }
      } catch (e) {}
    }
  }

  const decks = Array.from(decksMap.values());
  accountRecentDecksList.innerHTML = '';

  if (decks.length === 0) {
    accountRecentDecksList.innerHTML = `
      <div class="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <i data-lucide="folder-open" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
        <p class="font-semibold text-xs text-slate-600">Chưa có bài thiết kế nào</p>
        <p class="text-[11px] text-slate-400 mt-1">Tạo bài mới hoặc nạp file PowerPoint để bắt đầu sáng tạo</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  decks.forEach(d => {
    const itemEl = document.createElement('div');
    itemEl.className = "flex items-center justify-between p-3.5 bg-slate-50 hover:bg-purple-50/60 rounded-xl border border-slate-200 hover:border-purple-300 transition group cursor-pointer shadow-sm";
    itemEl.innerHTML = `
      <div class="flex items-center gap-3 overflow-hidden">
        <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
          <i data-lucide="presentation" class="w-5 h-5"></i>
        </div>
        <div class="overflow-hidden">
          <p class="font-bold text-slate-800 text-xs truncate group-hover:text-purple-700 transition">${escapeHtml(d.title)}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[11px] text-slate-500">${d.slidesCount} slide</span>
            <span class="text-slate-300">•</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-medium ${d.badgeColor}">${d.badge}</span>
          </div>
        </div>
      </div>
      <button class="px-3 py-1.5 text-xs font-semibold text-purple-600 hover:text-white hover:bg-purple-600 border border-purple-200 rounded-lg transition shrink-0 shadow-sm flex items-center gap-1.5">
        <span>Mở bài</span>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      </button>
    `;
    itemEl.addEventListener('click', async () => {
      closeAccountPage();
      if (d.deckObj) {
        setupDeck(d.deckObj, true, `Đã mở: ${d.title}`);
      } else {
        showLoader("Đang nạp bài thiết kế...", d.title, "Đang đồng bộ slide từ cơ sở dữ liệu máy chủ...");
        try {
          const res = await fetch(`/api/designs/${d.id}`);
          if (res.ok) {
            const dbData = await res.json();
            const deck = {
              id: dbData.design_id,
              designId: dbData.design_id,
              editToken: dbData.edit_token || d.token,
              filename: dbData.title,
              slides: dbData.slides || [],
              customFonts: dbData.customFonts || [],
              slideCount: dbData.slide_count || (dbData.slides ? dbData.slides.length : 1),
              shareAccessLevel: dbData.share_access_level || 'private',
              sharedMembers: dbData.sharedMembers || []
            };
            setupDeck(deck, true, `Đã mở: ${deck.filename}`);
          } else {
            showToast("Không tìm thấy bài thiết kế trên máy chủ", true);
          }
        } catch (err) {
          showToast("Lỗi khi tải bài: " + err.message, true);
        } finally {
          hideLoader();
        }
      }
    });
    accountRecentDecksList.appendChild(itemEl);
  });

  if (window.lucide) lucide.createIcons();
}

window.addEventListener('popstate', (e) => {
  const path = window.location.pathname;

  if (path === '/' || path === '') {
    openHomePage();
    return;
  }

  if (path === '/import' || path === '/import/') {
    openImportPage();
    return;
  }

  if (path === '/account' || path === '/account/') {
    const user = getCurrentUser();
    if (user) {
      openAccountPage('home');
      return;
    }
  }

  if (accountPageView && !accountPageView.classList.contains('hidden')) {
    closeAccountPage();
    return;
  }

  if (path === '/projects' || path === '/projects/') {
    openProjectsPage('home');
    return;
  }

  if (projectsPageView && !projectsPageView.classList.contains('hidden')) {
    closeProjectsPage();
    return;
  }

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

  // 0. Kiểm tra route /admin/login (Cổng đăng nhập Quản trị viên riêng biệt)
  if (path === '/admin/login' || path === '/admin/login/') {
    openAdminLoginPage();
    return;
  }

  // 0.1 Kiểm tra route /admin (Bảng điều khiển Quản trị viên)
  if (path === '/admin' || path === '/admin/' || path.startsWith('/admin/')) {
    openAdminDashboardPage();
    return;
  }

  // 1. Kiểm tra route /import (Trang nạp tệp PPTX mới tách)
  if (path === '/import' || path === '/import/') {
    openImportPage();
    return;
  }

  // 2. Kiểm tra route /projects
  if (path === '/projects' || path === '/projects/') {
    openProjectsPage('home');
    return;
  }

  // 3. Kiểm tra route /account
  if (path === '/account' || path === '/account/') {
    const user = getCurrentUser();
    if (user) {
      openAccountPage('home');
      return;
    } else {
      window.history.replaceState({}, '', '/');
    }
  }

  // 4. Match /design/:designId/:editToken/(edit|view)?
  const match = path.match(/^\/design\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)(?:\/(edit|view))?\/?$/);

  if (match) {
    const designId = match[1];
    const editToken = match[2];

    showLoader("Đang tải bài thiết kế từ máy chủ...");

    try {
      // Bước 1: Thử tải trực tiếp từ SQLite Database trung tâm
      try {
        const res = await fetch(`/api/designs/${designId}`);
        if (res.ok) {
          const dbData = await res.json();
          if (dbData && dbData.design_id) {
            const deck = {
              id: dbData.design_id,
              designId: dbData.design_id,
              editToken: dbData.edit_token || editToken,
              filename: dbData.title || "Thiết kế không tên - Bài thuyết trình",
              slides: dbData.slides || [],
              customFonts: dbData.customFonts || [],
              slideCount: dbData.slide_count || (dbData.slides ? dbData.slides.length : 1),
              shareAccessLevel: dbData.share_access_level || 'private',
              sharedMembers: dbData.sharedMembers || [],
              owner: {
                id: dbData.owner_id,
                name: dbData.owner_name,
                email: dbData.owner_email
              }
            };
            saveDeckToLocalStorage(deck);
            setupDeck(deck, false, `Đã mở bài thiết kế: ${deck.filename}`);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch design from server DB:", err);
      }

      // Bước 2: Thử lấy từ bộ nhớ LocalStorage của trình duyệt này
      const cachedDeck = getDeckFromLocalStorage(designId);
      if (cachedDeck) {
        cachedDeck.editToken = editToken;
        setupDeck(cachedDeck, false, `Đã mở lại bài thiết kế: ${designId}`);
        apiSaveDeck(cachedDeck, false);
        return;
      }

      // Bước 3: Nếu chưa có ở cả 2 nơi: Khởi tạo từ file demo mẫu và lưu ngay vào Database
      try {
        const res = await fetch('/api/demo/sample', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          data.designId = designId;
          data.editToken = editToken;
          setupDeck(data, false, `Đã mở bài thiết kế: ${designId}`);
          apiSaveDeck(data, false);
        } else {
          createNewBlankPresentation();
        }
      } catch (err) {
        createNewBlankPresentation();
      }
    } finally {
      hideLoader();
    }
    return;
  }

  // 5. Mặc định: Mở trang chủ Canva Welcome (Jump back in!)
  openHomePage();
}

// --- 15. GOOGLE AUTHENTICATION MODULE ---
function loginWithGoogle() {
  window.location.href = '/auth/google/login';
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('google_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('google_auth_user', JSON.stringify(user));
    localStorage.setItem('canva_last_logged_out_user', JSON.stringify(user));
    localStorage.removeItem('canva_is_logged_out');
  } else {
    localStorage.removeItem('google_auth_user');
  }
  renderAuthUI();
}

function logoutGoogle() {
  const prevUser = getCurrentUser();
  if (prevUser) {
    localStorage.setItem('canva_last_logged_out_user', JSON.stringify(prevUser));
  }
  localStorage.setItem('canva_is_logged_out', 'true');
  setCurrentUser(null);
  if (uploadUserDropdownMenu) uploadUserDropdownMenu.classList.add('hidden');
  if (userDropdownMenu) userDropdownMenu.classList.add('hidden');
  if (accountPageView && !accountPageView.classList.contains('hidden')) {
    closeAccountPage();
  }
  openHomePage();
  showToast("Đã đăng xuất tài khoản Google");
}

function renderAuthUI() {
  const user = getCurrentUser();
  const uploadBtnText = document.getElementById('googleBtnTextUpload');
  const uploadUserAvatar = document.getElementById('uploadUserAvatar');
  const uploadGoogleIcon = document.getElementById('uploadGoogleIcon');
  const uploadAccountChevron = document.getElementById('uploadAccountChevron');

  renderHomeAuthCard();

  if (user) {
    const avatarUrl = user.picture || 'https://www.gravatar.com/avatar?d=mp';

    // 1. Upload screen button
    if (uploadBtnText) uploadBtnText.textContent = user.name || user.email;
    if (uploadUserAvatar) {
      uploadUserAvatar.src = avatarUrl;
      uploadUserAvatar.classList.remove('hidden');
    }
    if (uploadGoogleIcon) uploadGoogleIcon.classList.add('hidden');
    if (uploadAccountChevron) uploadAccountChevron.classList.remove('hidden');

    // 2. Upload screen dropdown popup
    if (uploadDropdownAvatarImg) uploadDropdownAvatarImg.src = avatarUrl;
    if (uploadUserNameText) uploadUserNameText.textContent = user.name || 'Người dùng';
    if (uploadUserEmailText) uploadUserEmailText.textContent = user.email || '';

    // 3. Header button & avatar
    if (btnGoogleLoginHeader) btnGoogleLoginHeader.classList.add('hidden');
    if (userLoggedInMenu) userLoggedInMenu.classList.remove('hidden');
    if (userAvatarImg) userAvatarImg.src = avatarUrl;

    // 4. Header dropdown popup
    if (dropdownAvatarImg) dropdownAvatarImg.src = avatarUrl;
    if (userNameText) userNameText.textContent = user.name || 'Người dùng';
    if (userEmailText) userEmailText.textContent = user.email || '';

    // 5. Account page (nếu đang mở)
    if (accPageAvatar) accPageAvatar.src = avatarUrl;
    if (accPageName) accPageName.textContent = user.name || 'Người dùng';
    if (accPageEmail) accPageEmail.textContent = user.email || '';
  } else {
    if (uploadBtnText) uploadBtnText.textContent = "Đăng nhập Google";
    if (uploadUserAvatar) uploadUserAvatar.classList.add('hidden');
    if (uploadGoogleIcon) uploadGoogleIcon.classList.remove('hidden');
    if (uploadAccountChevron) uploadAccountChevron.classList.add('hidden');

    if (btnGoogleLoginHeader) btnGoogleLoginHeader.classList.remove('hidden');
    if (userLoggedInMenu) userLoggedInMenu.classList.add('hidden');
    if (userDropdownMenu) userDropdownMenu.classList.add('hidden');
    if (uploadUserDropdownMenu) uploadUserDropdownMenu.classList.add('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

function checkAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const authStatus = urlParams.get('auth_status');
  const userRaw = urlParams.get('user');
  const authError = urlParams.get('auth_error');

  if (authStatus === 'success' && userRaw) {
    try {
      const user = JSON.parse(decodeURIComponent(userRaw));
      setCurrentUser(user);
      showToast(`Xin chào ${user.name}! Đăng nhập Google thành công.`);
    } catch (e) {
      console.error("Lỗi phân tích thông tin user Google:", e);
    }
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
  } else if (authError) {
    showToast("Đăng nhập Google bị hủy hoặc thất bại", true);
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);
  }
}

// Click outside để đóng các Dropdown Menu
window.addEventListener('click', (e) => {
  if (uploadUserDropdownMenu && !uploadUserDropdownMenu.classList.contains('hidden')) {
    if (!uploadUserDropdownMenu.contains(e.target) && !btnGoogleLoginUpload.contains(e.target)) {
      uploadUserDropdownMenu.classList.add('hidden');
    }
  }
  if (userDropdownMenu && !userDropdownMenu.classList.contains('hidden')) {
    if (!userDropdownMenu.contains(e.target) && !userAvatarBtn.contains(e.target)) {
      userDropdownMenu.classList.add('hidden');
    }
  }
  if (shareDesignDropdown && !shareDesignDropdown.classList.contains('hidden')) {
    if (!shareDesignDropdown.contains(e.target) && !btnShareDesign.contains(e.target)) {
      shareDesignDropdown.classList.add('hidden');
      if (accessLevelMenu) accessLevelMenu.classList.add('hidden');
    }
  }
  if (accessLevelMenu && !accessLevelMenu.classList.contains('hidden')) {
    if (!accessLevelMenu.contains(e.target) && !accessLevelSelector.contains(e.target)) {
      accessLevelMenu.classList.add('hidden');
    }
  }
});

// Sự kiện click nút Auth trên màn hình khởi đầu (Upload)
if (btnGoogleLoginUpload) {
  btnGoogleLoginUpload.addEventListener('click', (e) => {
    e.stopPropagation();
    const user = getCurrentUser();
    if (user) {
      // Đã đăng nhập: Toggle dropdown menu chuẩn popup Canva
      if (uploadUserDropdownMenu) {
        uploadUserDropdownMenu.classList.toggle('hidden');
      }
    } else {
      // Chưa đăng nhập: Chuyển hướng sang Google Login
      loginWithGoogle();
    }
  });
}

// Nút Đăng nhập trên Header (khi chưa đăng nhập)
if (btnGoogleLoginHeader) {
  btnGoogleLoginHeader.addEventListener('click', loginWithGoogle);
}

// Nút Avatar trên Header (khi đã đăng nhập): Toggle dropdown menu popup
if (userAvatarBtn) {
  userAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (userDropdownMenu) {
      userDropdownMenu.classList.toggle('hidden');
    }
  });
}

// Sự kiện click "Quản lý tài khoản" trong dropdown popup
if (btnUploadGoToAccountPage) {
  btnUploadGoToAccountPage.addEventListener('click', (e) => {
    e.stopPropagation();
    openAccountPage('upload');
  });
}

if (btnGoToAccountPage) {
  btnGoToAccountPage.addEventListener('click', (e) => {
    e.stopPropagation();
    openAccountPage('editor');
  });
}

// Nút "Quay lại" trên trang Quản lý tài khoản
if (btnBackFromAccount) {
  btnBackFromAccount.addEventListener('click', closeAccountPage);
}

// Các nút Đăng xuất Google
if (btnUploadLogout) {
  btnUploadLogout.addEventListener('click', (e) => {
    e.stopPropagation();
    logoutGoogle();
  });
}

if (btnLogout) {
  btnLogout.addEventListener('click', (e) => {
    e.stopPropagation();
    logoutGoogle();
  });
}

if (btnAccountPageLogout) {
  btnAccountPageLogout.addEventListener('click', (e) => {
    e.stopPropagation();
    logoutGoogle();
  });
}

// Khởi chạy kiểm tra Auth
checkAuthCallback();
renderAuthUI();

// --- 16. CHIA SẺ THIẾT KẾ (CANVA SHARE MODULE) ---
function toggleShareDesignDropdown() {
  if (!shareDesignDropdown) return;
  const isHidden = shareDesignDropdown.classList.contains('hidden');

  if (isHidden) {
    if (userDropdownMenu) userDropdownMenu.classList.add('hidden');
    if (uploadUserDropdownMenu) uploadUserDropdownMenu.classList.add('hidden');
    renderShareModalUI();
    shareDesignDropdown.classList.remove('hidden');
  } else {
    shareDesignDropdown.classList.add('hidden');
    if (accessLevelMenu) accessLevelMenu.classList.add('hidden');
  }
  if (window.lucide) lucide.createIcons();
}

function renderShareModalUI() {
  if (!currentDeck) return;
  const user = getCurrentUser();
  const perms = getDesignPermissions(currentDeck, user);

  // 1. Role Status Banner
  if (shareRoleStatusBanner) {
    if (perms.isOwner) {
      shareRoleStatusBanner.className = "mb-3.5 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium bg-purple-50 border border-purple-200 text-purple-900";
      shareRoleStatusBanner.innerHTML = `
        <i data-lucide="crown" class="w-4 h-4 text-purple-600 shrink-0"></i>
        <span>Bạn là <strong>Chủ sở hữu</strong> bài thiết kế này (toàn quyền quản trị).</span>
      `;
    } else if (perms.canEdit) {
      shareRoleStatusBanner.className = "mb-3.5 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium bg-emerald-50 border border-emerald-200 text-emerald-900";
      shareRoleStatusBanner.innerHTML = `
        <i data-lucide="edit-3" class="w-4 h-4 text-emerald-600 shrink-0"></i>
        <span>Bạn có quyền <strong>Chỉnh sửa</strong> nội dung bài thiết kế này.</span>
      `;
    } else {
      shareRoleStatusBanner.className = "mb-3.5 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium bg-amber-50 border border-amber-200 text-amber-900";
      shareRoleStatusBanner.innerHTML = `
        <i data-lucide="eye" class="w-4 h-4 text-amber-600 shrink-0"></i>
        <span>Bạn đang xem bài thiết kế này ở chế độ <strong>Chỉ đọc</strong>.</span>
      `;
    }
  }

  // 2. Mời người (chỉ Chủ sở hữu mới được mời)
  if (shareInviteSection && shareGuestNotice) {
    if (perms.isOwner) {
      shareInviteSection.classList.remove('hidden');
      shareGuestNotice.classList.add('hidden');
    } else {
      shareInviteSection.classList.add('hidden');
      shareGuestNotice.classList.remove('hidden');
    }
  }

  // 3. Render danh sách thành viên chi tiết
  renderDetailedMembersList(perms);

  // 4. Cấp độ truy cập
  updateAccessLevelUI(perms.accessLevel, perms.isOwner);
  if (accessLevelMenu) accessLevelMenu.classList.add('hidden');

  if (window.lucide) lucide.createIcons();
}

function renderDetailedMembersList(perms) {
  if (!shareMembersDetailedList) return;
  shareMembersDetailedList.innerHTML = '';

  const owner = currentDeck.owner || {};
  const ownerName = owner.name || currentDeck.ownerName || currentDeck.owner_name || "Chủ sở hữu";
  const ownerEmail = owner.email || currentDeck.ownerEmail || currentDeck.owner_email || "";
  const ownerPic = owner.picture || "";
  const ownerInitial = (ownerName || ownerEmail || 'C').charAt(0).toUpperCase();

  const members = Array.isArray(currentDeck.sharedMembers) ? currentDeck.sharedMembers : [];
  if (shareMembersCountBadge) {
    shareMembersCountBadge.textContent = 1 + members.length;
  }

  // --- Dòng 1: CHỦ SỞ HỮU ---
  const ownerEl = document.createElement('div');
  ownerEl.className = "flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/60 transition";

  let ownerAvatarHtml = '';
  if (ownerPic) {
    ownerAvatarHtml = `<img src="${escapeHtml(ownerPic)}" class="w-8 h-8 rounded-full object-cover border border-white shadow-sm shrink-0" />`;
  } else {
    ownerAvatarHtml = `<div class="w-8 h-8 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center border border-white shadow-sm shrink-0">${escapeHtml(ownerInitial)}</div>`;
  }

  ownerEl.innerHTML = `
    <div class="flex items-center gap-2.5 overflow-hidden">
      ${ownerAvatarHtml}
      <div class="overflow-hidden">
        <p class="font-bold text-slate-800 text-xs truncate">${escapeHtml(ownerName)}</p>
        <p class="text-[10px] text-slate-400 truncate">${escapeHtml(ownerEmail || 'Tài khoản tạo bài')}</p>
      </div>
    </div>
    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 shrink-0">
      Chủ sở hữu
    </span>
  `;
  shareMembersDetailedList.appendChild(ownerEl);

  // --- Dòng 2..n: CỘNG TÁC VIÊN ĐƯỢC MỜI ---
  members.forEach((m, idx) => {
    const memberName = m.name || (m.email ? m.email.split('@')[0] : 'Cộng tác viên');
    const memberEmail = m.email || '';
    const initial = (memberName || '?').charAt(0).toUpperCase();
    const role = m.role || 'editor';

    const mEl = document.createElement('div');
    mEl.className = "flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-purple-200 transition";

    let roleControlHtml = '';
    if (perms.isOwner) {
      roleControlHtml = `
        <div class="flex items-center gap-1.5 shrink-0">
          <select class="member-role-select bg-slate-50 border border-slate-200 text-slate-700 text-[11px] rounded-lg px-2 py-1 outline-none font-medium focus:border-purple-400 cursor-pointer" data-index="${idx}">
            <option value="editor" ${role === 'editor' ? 'selected' : ''}>Chỉnh sửa</option>
            <option value="viewer" ${role === 'viewer' ? 'selected' : ''}>Chỉ xem</option>
          </select>
          <button class="remove-collab-btn p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Xóa quyền truy cập" data-index="${idx}">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
    } else {
      const badgeStyle = role === 'editor' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600';
      const roleText = role === 'editor' ? 'Chỉnh sửa' : 'Chỉ xem';
      roleControlHtml = `
        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeStyle} shrink-0">
          ${roleText}
        </span>
      `;
    }

    mEl.innerHTML = `
      <div class="flex items-center gap-2.5 overflow-hidden">
        <div class="w-8 h-8 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center border border-white shadow-sm shrink-0">
          ${escapeHtml(initial)}
        </div>
        <div class="overflow-hidden">
          <p class="font-bold text-slate-800 text-xs truncate">${escapeHtml(memberName)}</p>
          <p class="text-[10px] text-slate-400 truncate">${escapeHtml(memberEmail)}</p>
        </div>
      </div>
      ${roleControlHtml}
    `;

    if (perms.isOwner) {
      const select = mEl.querySelector('.member-role-select');
      if (select) {
        select.addEventListener('change', (e) => {
          e.stopPropagation();
          changeMemberRole(idx, select.value);
        });
      }
      const removeBtn = mEl.querySelector('.remove-collab-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeShareMember(idx);
        });
      }
    }

    shareMembersDetailedList.appendChild(mEl);
  });
}

function changeMemberRole(index, newRole) {
  if (!currentDeck || !currentDeck.sharedMembers || !currentDeck.sharedMembers[index]) return;
  currentDeck.sharedMembers[index].role = newRole;
  const memberEmail = currentDeck.sharedMembers[index].email;
  saveDeck(currentDeck, true);

  if (memberEmail) {
    fetch(`/api/designs/${currentDeck.designId}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: memberEmail,
        name: currentDeck.sharedMembers[index].name,
        role: newRole
      })
    }).then(() => {
      showToast(`Đã đổi quyền của ${memberEmail} sang: ${newRole === 'editor' ? 'Chỉnh sửa' : 'Chỉ xem'}`);
      renderShareModalUI();
    }).catch(err => {
      showToast("Lỗi khi cập nhật quyền: " + err.message, true);
    });
  }
}

function addShareMemberFromInput() {
  if (!inputShareMemberEmail) return;
  const value = inputShareMemberEmail.value.trim();
  if (!value) {
    showToast("Vui lòng nhập email người muốn thêm", true);
    inputShareMemberEmail.focus();
    return;
  }

  if (!currentDeck) {
    showToast("Vui lòng mở một bài thiết kế trước khi chia sẻ", true);
    return;
  }

  const role = selectShareRole ? selectShareRole.value : 'editor';
  currentDeck.sharedMembers = currentDeck.sharedMembers || [];

  const existsIdx = currentDeck.sharedMembers.findIndex(m => m.email && m.email.toLowerCase() === value.toLowerCase());
  if (existsIdx >= 0) {
    currentDeck.sharedMembers[existsIdx].role = role;
    showToast(`Đã cập nhật quyền của ${value} thành: ${role === 'editor' ? 'Chỉnh sửa' : 'Chỉ xem'}`);
  } else {
    currentDeck.sharedMembers.push({
      email: value,
      name: value.split('@')[0],
      role: role,
      addedAt: new Date().toISOString()
    });
    showToast(`Đã cấp quyền (${role === 'editor' ? 'Chỉnh sửa' : 'Chỉ xem'}) cho ${value}!`);
  }

  saveDeck(currentDeck, true);
  renderShareModalUI();
  inputShareMemberEmail.value = '';

  fetch(`/api/designs/${currentDeck.designId}/collaborators`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: value, name: value.split('@')[0], role: role })
  }).catch(() => {});
}

function removeShareMember(index) {
  if (!currentDeck || !currentDeck.sharedMembers) return;
  const removed = currentDeck.sharedMembers.splice(index, 1);
  saveDeck(currentDeck, true);
  renderShareModalUI();
  if (removed && removed[0]) {
    const memberEmail = removed[0].email || removed[0].name;
    showToast(`Đã thu hồi quyền truy cập của ${memberEmail}`);
    if (removed[0].email) {
      fetch(`/api/designs/${currentDeck.designId}/collaborators`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: removed[0].email })
      }).catch(() => {});
    }
  }
}

function updateAccessLevelUI(level, isOwner = true) {
  if (!accessLevelText || !accessLevelIcon) return;

  if (level === 'view') {
    accessLevelText.textContent = "Bất kỳ ai có liên kết đều có thể xem";
    if (accessLevelSubText) accessLevelSubText.textContent = "Không cần đăng nhập, chỉ xem chế độ trình chiếu";
    accessLevelIcon.setAttribute('data-lucide', 'eye');
    if (accessLevelIconWrapper) {
      accessLevelIconWrapper.className = "w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0";
    }
  } else if (level === 'edit') {
    accessLevelText.textContent = "Bất kỳ ai có liên kết đều có thể chỉnh sửa";
    if (accessLevelSubText) accessLevelSubText.textContent = "Mọi người có liên kết đều có toàn quyền sửa đổi";
    accessLevelIcon.setAttribute('data-lucide', 'edit-3');
    if (accessLevelIconWrapper) {
      accessLevelIconWrapper.className = "w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0";
    }
  } else {
    accessLevelText.textContent = "Chỉ bạn và người được thêm mới có quyền truy cập";
    if (accessLevelSubText) accessLevelSubText.textContent = "Chỉ thành viên được mời mới có thể mở liên kết này";
    accessLevelIcon.setAttribute('data-lucide', 'lock');
    if (accessLevelIconWrapper) {
      accessLevelIconWrapper.className = "w-8 h-8 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-700 shrink-0";
    }
  }

  if (accessLevelSelector) {
    if (isOwner) {
      accessLevelSelector.classList.remove('opacity-75', 'cursor-default');
      accessLevelSelector.classList.add('cursor-pointer');
      if (accessLevelChevron) accessLevelChevron.classList.remove('hidden');
      if (accessLevelDisabledNote) accessLevelDisabledNote.classList.add('hidden');
    } else {
      accessLevelSelector.classList.add('opacity-75', 'cursor-default');
      accessLevelSelector.classList.remove('cursor-pointer');
      if (accessLevelChevron) accessLevelChevron.classList.add('hidden');
      if (accessLevelDisabledNote) accessLevelDisabledNote.classList.remove('hidden');
    }
  }

  if (window.lucide) lucide.createIcons();
}

function setAccessLevel(level) {
  const user = getCurrentUser();
  const perms = getDesignPermissions(currentDeck, user);
  if (!perms.isOwner) {
    showToast("Chỉ chủ sở hữu mới có quyền thay đổi cấp độ truy cập này", true);
    return;
  }

  if (currentDeck) {
    currentDeck.shareAccessLevel = level;
    saveDeck(currentDeck, true);
    fetch(`/api/designs/${currentDeck.designId}/access-level`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessLevel: level })
    }).catch(() => {});
  }
  updateAccessLevelUI(level, true);
  if (accessLevelMenu) accessLevelMenu.classList.add('hidden');

  const labels = {
    'private': 'Chỉ bạn và người được thêm mới có quyền truy cập',
    'view': 'Bất kỳ ai có liên kết đều có thể xem',
    'edit': 'Bất kỳ ai có liên kết đều có thể chỉnh sửa'
  };
  showToast(`Cấp độ truy cập: ${labels[level] || level}`);
}

function copyShareLinkModal() {
  if (!currentDeck || !currentDeck.designId) {
    showToast("Chưa có bài thiết kế nào đang mở", true);
    return;
  }

  const level = (currentDeck && currentDeck.shareAccessLevel) ? currentDeck.shareAccessLevel : 'private';
  let shareUrl = `${window.location.origin}/design/${currentDeck.designId}/${currentDeck.editToken}/edit`;
  if (level === 'view') {
    shareUrl = `${window.location.origin}/design/${currentDeck.designId}/${currentDeck.editToken}/view`;
  }

  function triggerCopiedFeedback() {
    if (btnCopyShareLinkModal) {
      btnCopyShareLinkModal.classList.remove('bg-[#7d2ae8]', 'hover:bg-[#6c23cb]');
      btnCopyShareLinkModal.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
    }
    if (btnCopyShareLinkText) btnCopyShareLinkText.textContent = "✓ Đã sao chép liên kết";
    if (btnCopyShareLinkIcon) btnCopyShareLinkIcon.setAttribute('data-lucide', 'check');
    if (window.lucide) lucide.createIcons();
    showToast("Đã sao chép liên kết chia sẻ!");

    setTimeout(() => {
      if (btnCopyShareLinkModal) {
        btnCopyShareLinkModal.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
        btnCopyShareLinkModal.classList.add('bg-[#7d2ae8]', 'hover:bg-[#6c23cb]');
      }
      if (btnCopyShareLinkText) btnCopyShareLinkText.textContent = "Sao chép liên kết";
      if (btnCopyShareLinkIcon) btnCopyShareLinkIcon.setAttribute('data-lucide', 'link-2');
      if (window.lucide) lucide.createIcons();
    }, 2000);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      triggerCopiedFeedback();
    }).catch(() => {
      prompt("Sao chép liên kết chia sẻ bài thiết kế:", shareUrl);
    });
  } else {
    prompt("Sao chép liên kết chia sẻ bài thiết kế:", shareUrl);
  }
}

// Gắn sự kiện cho các thành phần Chia sẻ thiết kế
if (btnShareDesign) {
  btnShareDesign.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleShareDesignDropdown();
  });
}

if (btnAddShareMember) {
  btnAddShareMember.addEventListener('click', (e) => {
    e.stopPropagation();
    addShareMemberFromInput();
  });
}

if (inputShareMemberEmail) {
  inputShareMemberEmail.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addShareMemberFromInput();
    }
  });
}

if (accessLevelSelector) {
  accessLevelSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    const user = getCurrentUser();
    const perms = getDesignPermissions(currentDeck, user);
    if (!perms.isOwner) {
      showToast("Chỉ chủ sở hữu mới có quyền thay đổi cấp độ truy cập này", true);
      return;
    }
    if (accessLevelMenu) accessLevelMenu.classList.toggle('hidden');
  });
}

document.querySelectorAll('.access-level-option').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const level = btn.getAttribute('data-level');
    setAccessLevel(level);
  });
});

if (btnCopyShareLinkModal) {
  btnCopyShareLinkModal.addEventListener('click', (e) => {
    e.stopPropagation();
    copyShareLinkModal();
  });
}

// Access Denied Listeners
if (btnDeniedLoginGoogle) {
  btnDeniedLoginGoogle.addEventListener('click', () => {
    loginWithGoogle();
  });
}

if (btnDeniedGoHome) {
  btnDeniedGoHome.addEventListener('click', () => {
    window.location.href = '/';
  });
}

// --- 17. REAL-TIME MULTI-USER COLLABORATION PRESENCE ---
let presenceHeartbeatTimer = null;
let presenceBroadcastChannel = null;
let localCollaboratorsMap = new Map(); // Lưu trữ danh sách cộng tác viên từ BroadcastChannel

function getOrCreateTabSessionId() {
  let sId = sessionStorage.getItem('ppt_tab_session_id');
  if (!sId) {
    sId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36).slice(-4);
    sessionStorage.setItem('ppt_tab_session_id', sId);
  }
  return sId;
}

const currentTabSessionId = getOrCreateTabSessionId();

function getCollaboratorColor(seed) {
  const colors = [
    '#7d2ae8', '#00c4cc', '#f59e0b', '#10b981', '#ec4899',
    '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'
  ];
  if (!seed) return colors[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getMyPresencePayload() {
  const user = getCurrentUser();
  const userName = user ? (user.name || user.email) : `Khách (${currentTabSessionId.slice(-4)})`;
  const userEmail = user ? (user.email || '') : '';
  const userPic = user ? (user.picture || '') : '';
  const userColor = getCollaboratorColor(user ? (user.email || user.name) : currentTabSessionId);

  return {
    sessionId: currentTabSessionId,
    name: userName,
    email: userEmail,
    picture: userPic,
    color: userColor
  };
}

// Khởi tạo kênh BroadcastChannel giao tiếp tức thì giữa các tab/cửa sổ cùng trình duyệt
function initPresenceBroadcastChannel(designId) {
  if (presenceBroadcastChannel) {
    try { presenceBroadcastChannel.close(); } catch (e) {}
    presenceBroadcastChannel = null;
  }
  localCollaboratorsMap.clear();

  if (!window.BroadcastChannel) return;

  try {
    presenceBroadcastChannel = new BroadcastChannel('ppt_presence_channel_' + designId);
    presenceBroadcastChannel.onmessage = (event) => {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === 'ping') {
        // Tab khác vừa mở, gửi lại thông tin của mình
        if (data.sessionId !== currentTabSessionId) {
          presenceBroadcastChannel.postMessage({
            type: 'pong',
            user: getMyPresencePayload()
          });
        }
      } else if (data.type === 'pong' || data.type === 'heartbeat') {
        if (data.user && data.user.sessionId !== currentTabSessionId) {
          localCollaboratorsMap.set(data.user.sessionId, { ...data.user, lastSeen: Date.now() });
          refreshCollaboratorsUI();
        }
      } else if (data.type === 'leave') {
        if (data.sessionId) {
          localCollaboratorsMap.delete(data.sessionId);
          refreshCollaboratorsUI();
        }
      } else if (data.type === 'deck_data_sync') {
        if (data.designId === currentDeck?.designId && data.title) {
          if (deckTitleInput && deckTitleInput.value !== data.title) {
            deckTitleInput.value = data.title;
          }
        }
      }
    };

    // Vừa vào, phát ping và thông tin của mình
    presenceBroadcastChannel.postMessage({ type: 'ping', sessionId: currentTabSessionId });
    presenceBroadcastChannel.postMessage({ type: 'heartbeat', user: getMyPresencePayload() });
  } catch (err) {
    console.debug("BroadcastChannel error:", err);
  }
}

async function sendPresenceHeartbeat() {
  if (!currentDeck || !currentDeck.designId) return;

  const myData = getMyPresencePayload();

  // Phát tín hiệu qua BroadcastChannel cho các tab khác cùng máy nhận tức thì
  if (presenceBroadcastChannel) {
    try {
      presenceBroadcastChannel.postMessage({ type: 'heartbeat', user: myData });
    } catch (e) {}
  }

  // Dọn dẹp local collaborators quá 15 giây không ping
  const now = Date.now();
  for (const [sId, colab] of localCollaboratorsMap.entries()) {
    if (now - (colab.lastSeen || 0) > 15000) {
      localCollaboratorsMap.delete(sId);
    }
  }

  try {
    const res = await fetch('/api/presence/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        designId: currentDeck.designId,
        sessionId: currentTabSessionId,
        user: myData
      })
    });

    if (res.ok) {
      const data = await res.json();
      const serverUsers = data.activeUsers || [];
      // Hợp nhất server users vào local map
      serverUsers.forEach(su => {
        if (su.sessionId !== currentTabSessionId) {
          localCollaboratorsMap.set(su.sessionId, { ...su, lastSeen: Date.now() });
        }
      });
      refreshCollaboratorsUI();
    } else {
      refreshCollaboratorsUI();
    }
  } catch (err) {
    refreshCollaboratorsUI();
  }
}

function refreshCollaboratorsUI() {
  const usersList = Array.from(localCollaboratorsMap.values());
  renderActiveCollaborators(usersList);
}

function renderActiveCollaborators(otherUsersList) {
  if (!activeCollaboratorsStack) return;
  activeCollaboratorsStack.innerHTML = '';

  const user = getCurrentUser();
  const myData = getMyPresencePayload();

  if (btnGoogleLoginHeader) {
    if (user) {
      btnGoogleLoginHeader.classList.add('hidden');
    } else {
      btnGoogleLoginHeader.classList.remove('hidden');
    }
  }

  // 1. Luôn đưa Avatar của chính mình lên đầu tiên (Self Avatar)
  const allUsers = [
    { ...myData, isSelf: true },
    ...otherUsersList.map(u => ({ ...u, isSelf: false }))
  ];

  allUsers.forEach((u, index) => {
    const initial = (u.name || '?').charAt(0).toUpperCase();

    const wrapper = document.createElement('div');
    wrapper.className = "relative group select-none transition-transform hover:scale-110 hover:z-30 cursor-pointer";
    wrapper.style.zIndex = 30 - index;

    let avatarInner = '';
    if (u.picture) {
      avatarInner = `
        <img src="${escapeHtml(u.picture)}" alt="${escapeHtml(u.name)}" 
             class="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-md"
             style="box-shadow: 0 0 0 2px ${u.color};" />
      `;
    } else {
      avatarInner = `
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md"
             style="background-color: ${u.color}; box-shadow: 0 0 0 2px ${u.color};">
          ${escapeHtml(initial)}
        </div>
      `;
    }

    // Chấm xanh Online ở góc dưới avatar
    const onlineBadge = `
      <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
    `;

    // Tooltip tên người dùng khi hover (Canva Presence Tooltip)
    const tooltip = `
      <div class="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition duration-150 z-50 flex items-center gap-1.5 border border-slate-700/80">
        <span class="w-2 h-2 rounded-full" style="background-color: ${u.color}"></span>
        <span>${escapeHtml(u.name)}</span>
        <span class="text-slate-400 font-normal">${u.isSelf ? '(Bạn)' : '(Đang xem)'}</span>
      </div>
    `;

    wrapper.innerHTML = avatarInner + onlineBadge + tooltip;

    // Click vào Avatar
    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      if (u.isSelf) {
        if (user) {
          if (userDropdownMenu) userDropdownMenu.classList.toggle('hidden');
        } else {
          loginWithGoogle();
        }
      } else {
        showToast(`${u.name} đang cùng xem & chỉnh sửa bài thiết kế này`);
      }
    });

    activeCollaboratorsStack.appendChild(wrapper);
  });
}

function startPresenceHeartbeat() {
  // Chỉ xóa timer cũ, KHÔNG gửi leave
  if (presenceHeartbeatTimer) {
    clearInterval(presenceHeartbeatTimer);
    presenceHeartbeatTimer = null;
  }

  if (currentDeck && currentDeck.designId) {
    // Khởi tạo kênh BroadcastChannel thời gian thực tức thì cho design này
    initPresenceBroadcastChannel(currentDeck.designId);
  }

  // Render ngay tức thì avatar của chính mình để header không bao giờ bị rỗng
  refreshCollaboratorsUI();

  // Gửi heartbeat ngay lập tức
  sendPresenceHeartbeat();

  // Chu kỳ gửi lại mỗi 2 giây
  presenceHeartbeatTimer = setInterval(sendPresenceHeartbeat, 2000);
}

function stopPresenceHeartbeat() {
  if (presenceHeartbeatTimer) {
    clearInterval(presenceHeartbeatTimer);
    presenceHeartbeatTimer = null;
  }

  if (presenceBroadcastChannel) {
    try {
      presenceBroadcastChannel.postMessage({ type: 'leave', sessionId: currentTabSessionId });
      presenceBroadcastChannel.close();
    } catch (e) {}
    presenceBroadcastChannel = null;
  }

  if (currentDeck && currentDeck.designId) {
    const payload = JSON.stringify({ designId: currentDeck.designId, sessionId: currentTabSessionId });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/presence/leave', payload);
    } else {
      fetch('/api/presence/leave', { method: 'POST', body: payload, keepalive: true }).catch(() => {});
    }
  }
}

// Bắt sự kiện thoát tab/trình duyệt để dọn dẹp presence
window.addEventListener('beforeunload', stopPresenceHeartbeat);
window.addEventListener('pagehide', stopPresenceHeartbeat);

// --- 18. PROJECTS DASHBOARD MODULE (TRANG DỰ ÁN CANVA-STYLE) ---

// Định dạng thời gian thân thiện (Tiếng Việt)
function formatTimeAgoVi(dateInput) {
  if (!dateInput) return "Gần đây";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Gần đây";
  
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;
  
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// Mở trang Dự án
function openProjectsPage(fromView) {
  if (fromView) {
    previousViewBeforeProjects = fromView;
  } else if (editorView && !editorView.classList.contains('hidden')) {
    previousViewBeforeProjects = 'editor';
  } else if (homeView && !homeView.classList.contains('hidden')) {
    previousViewBeforeProjects = 'home';
  } else {
    previousViewBeforeProjects = 'upload';
  }

  if (editorView && !editorView.classList.contains('hidden')) {
    saveCurrentSlideState();
    stopPresenceHeartbeat();
  }

  // Chuyển view sang projects và ẩn toàn bộ các view khác (kể cả homeView)
  switchMainView('projects');

  // Cập nhật thông tin tài khoản trên header trang dự án
  const user = getCurrentUser();
  if (user) {
    if (projectsUserAvatar) projectsUserAvatar.src = user.picture || 'https://www.gravatar.com/avatar?d=mp';
    if (projectsUserName) projectsUserName.textContent = user.name || 'Người dùng';
  } else {
    if (projectsUserAvatar) projectsUserAvatar.src = 'https://lh3.googleusercontent.com/a/default-user';
    if (projectsUserName) projectsUserName.textContent = 'Khách';
  }

  // Đổi URL trên trình duyệt sang /projects
  if (window.location.pathname !== '/projects') {
    window.history.pushState({ page: 'projects' }, '', '/projects');
  }

  // Nạp dữ liệu dự án từ máy chủ SQLite và local
  loadProjectsData();
}

// Đóng trang Dự án và quay lại view trước đó
function closeProjectsPage() {
  if (previousViewBeforeProjects === 'editor' && currentDeck && currentDeck.designId) {
    switchMainView('editor');
    window.history.pushState({ designId: currentDeck.designId }, '', `/design/${currentDeck.designId}/${currentDeck.editToken}/edit`);
  } else if (previousViewBeforeProjects === 'upload') {
    openImportPage();
  } else {
    openHomePage();
  }
}

// Tải dữ liệu dự án từ SQLite server & LocalStorage
async function loadProjectsData() {
  if (projectsLoadingState) projectsLoadingState.classList.remove('hidden');
  if (projectsEmptyState) projectsEmptyState.classList.add('hidden');
  if (projectsGrid) projectsGrid.innerHTML = '';

  const user = getCurrentUser();
  const projectsMap = new Map();

  // 1. Quét từ SQLite Database qua API
  try {
    const url = user && user.email ? `/api/designs?user_email=${encodeURIComponent(user.email)}` : `/api/designs`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const serverDesigns = data.designs || [];
      serverDesigns.forEach(d => {
        projectsMap.set(d.design_id, {
          id: d.design_id,
          token: d.edit_token || 'token',
          title: d.title || 'Bài thuyết trình',
          slidesCount: d.slide_count || 1,
          updated_at: d.updated_at || d.created_at || new Date().toISOString(),
          created_by: d.created_by || '',
          user_role: d.user_role || (user && d.created_by === user.email ? 'owner' : (user ? 'editor' : 'viewer')),
          share_access_level: d.share_access_level || 'public_edit',
          thumbnail: d.thumbnail || null,
          fromDb: true
        });
      });
    }
  } catch (err) {
    console.warn("Không thể tải danh sách dự án từ máy chủ:", err);
  }

  // 2. Bài hiện tại đang mở trong phiên làm việc
  if (currentDeck && currentDeck.designId) {
    const isOwner = !currentDeck.ownerEmail || (user && currentDeck.ownerEmail === user.email);
    if (!projectsMap.has(currentDeck.designId)) {
      projectsMap.set(currentDeck.designId, {
        id: currentDeck.designId,
        token: currentDeck.editToken || 'token',
        title: (deckTitleInput && deckTitleInput.value.trim()) || currentDeck.filename || 'Bài thuyết trình hiện tại',
        slidesCount: (currentDeck.slides || []).length || 1,
        updated_at: new Date().toISOString(),
        created_by: currentDeck.ownerEmail || (user ? user.email : ''),
        user_role: isOwner ? 'owner' : (currentDeck.userRole || 'editor'),
        share_access_level: currentDeck.shareAccessLevel || 'public_edit',
        deckObj: currentDeck
      });
    } else {
      const existing = projectsMap.get(currentDeck.designId);
      existing.deckObj = currentDeck;
      if (deckTitleInput && deckTitleInput.value.trim()) {
        existing.title = deckTitleInput.value.trim();
      }
    }
  }

  // 3. Quét các bài lưu trong LocalStorage của trình duyệt
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('canva_design_') || (key.startsWith('deck_') && !key.endsWith('_backup')))) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && item.designId && !projectsMap.has(item.designId)) {
          projectsMap.set(item.designId, {
            id: item.designId,
            token: item.editToken || 'token',
            title: item.filename || 'Bài thuyết trình đã lưu',
            slidesCount: (item.slides || []).length || 1,
            updated_at: item.savedAt || new Date().toISOString(),
            created_by: item.ownerEmail || '',
            user_role: (user && item.ownerEmail === user.email) ? 'owner' : 'owner',
            share_access_level: item.shareAccessLevel || 'public_edit',
            deckObj: item
          });
        }
      } catch (e) {}
    }
  }

  cachedProjectsList = Array.from(projectsMap.values());

  // Cập nhật các huy hiệu số lượng
  const totalCount = cachedProjectsList.length;
  let mineCount = 0;
  let sharedCount = 0;

  cachedProjectsList.forEach(d => {
    if (d.user_role === 'owner' || (!d.user_role && (!d.created_by || (user && d.created_by === user.email)))) {
      mineCount++;
    } else {
      sharedCount++;
    }
  });

  if (projectsTotalCountBadge) projectsTotalCountBadge.textContent = totalCount;
  if (tabCountAll) tabCountAll.textContent = totalCount;
  if (tabCountMine) tabCountMine.textContent = mineCount;
  if (tabCountShared) tabCountShared.textContent = sharedCount;

  if (projectsLoadingState) projectsLoadingState.classList.add('hidden');

  renderProjectsGrid();
}

// Render lưới thẻ dự án
function renderProjectsGrid() {
  if (!projectsGrid) return;
  projectsGrid.innerHTML = '';

  const user = getCurrentUser();

  // 1. Áp dụng bộ lọc Tabs
  let filtered = cachedProjectsList.filter(d => {
    const isOwner = d.user_role === 'owner' || (!d.user_role && (!d.created_by || (user && d.created_by === user.email)));
    if (currentProjectsFilter === 'mine') return isOwner;
    if (currentProjectsFilter === 'shared') return !isOwner;
    return true; // 'all'
  });

  // 2. Áp dụng tìm kiếm
  if (currentProjectsSearch.trim()) {
    const q = currentProjectsSearch.toLowerCase().trim();
    filtered = filtered.filter(d => (d.title || '').toLowerCase().includes(q));
  }

  // 3. Sắp xếp
  filtered.sort((a, b) => {
    if (currentProjectsSort === 'recent') {
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    }
    if (currentProjectsSort === 'oldest') {
      return new Date(a.updated_at || 0) - new Date(b.updated_at || 0);
    }
    if (currentProjectsSort === 'name_asc') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (currentProjectsSort === 'name_desc') {
      return (b.title || '').localeCompare(a.title || '');
    }
    return 0;
  });

  // Kiểm tra rỗng
  if (filtered.length === 0) {
    if (projectsEmptyState) projectsEmptyState.classList.remove('hidden');
    projectsGrid.classList.add('hidden');
    if (window.lucide) lucide.createIcons();
    return;
  }

  if (projectsEmptyState) projectsEmptyState.classList.add('hidden');
  projectsGrid.classList.remove('hidden');

  // Render từng Card
  filtered.forEach((d, idx) => {
    const isOwner = d.user_role === 'owner' || (!d.user_role && (!d.created_by || (user && d.created_by === user.email)));
    const isCurrent = currentDeck && currentDeck.designId === d.id;
    const timeText = formatTimeAgoVi(d.updated_at);

    // Huy hiệu vai trò
    let roleBadgeHtml = '';
    if (isOwner) {
      roleBadgeHtml = `
        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm backdrop-blur-md">
          <i data-lucide="crown" class="w-3 h-3 text-emerald-400"></i>
          <span>Chủ sở hữu</span>
        </span>
      `;
    } else if (d.user_role === 'editor') {
      roleBadgeHtml = `
        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shadow-sm backdrop-blur-md">
          <i data-lucide="edit-3" class="w-3 h-3 text-indigo-400"></i>
          <span>Được sửa</span>
        </span>
      `;
    } else {
      roleBadgeHtml = `
        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600/40 flex items-center gap-1 shadow-sm backdrop-blur-md">
          <i data-lucide="eye" class="w-3 h-3 text-slate-400"></i>
          <span>Chỉ xem</span>
        </span>
      `;
    }

    // Card Element
    const card = document.createElement('div');
    card.className = "group relative bg-[#131b2e] hover:bg-[#18233d] border border-slate-800 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-purple-900/15 flex flex-col cursor-pointer";

    // Palette gradient ngẫu nhiên cho mockup preview slide
    const gradients = [
      'from-purple-900/50 via-indigo-950/40 to-slate-900',
      'from-blue-900/50 via-cyan-950/40 to-slate-900',
      'from-fuchsia-900/50 via-purple-950/40 to-slate-900',
      'from-emerald-900/50 via-teal-950/40 to-slate-900',
      'from-rose-900/50 via-slate-900 to-slate-900'
    ];
    const gradientClass = gradients[idx % gradients.length];

    card.innerHTML = `
      <!-- Thumbnail Preview Slide -->
      <div class="relative h-44 bg-gradient-to-tr ${gradientClass} border-b border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
        <!-- Background Grid Pattern -->
        <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <!-- Top Row: Badge & Current Status -->
        <div class="relative z-10 flex items-center justify-between">
          ${roleBadgeHtml}
          ${isCurrent ? `
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 animate-pulse flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              <span>Đang mở</span>
            </span>
          ` : ''}
        </div>

        <!-- Center: Slide Mini Mockup Content -->
        <div class="relative z-10 my-auto text-center px-4">
          <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2 shadow-inner group-hover:scale-110 transition duration-300">
            <i data-lucide="presentation" class="w-5 h-5"></i>
          </div>
          <p class="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-purple-200 transition">${escapeHtml(d.title)}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">${d.slidesCount} slide</p>
        </div>

        <!-- Hover Overlay with Open Button -->
        <div class="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-xs flex items-center justify-center gap-2 z-20">
          <button class="btn-card-open px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/40 flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition duration-200">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-current"></i>
            <span>Mở bài</span>
          </button>
        </div>
      </div>

      <!-- Card Footer Information -->
      <div class="p-3.5 flex items-center justify-between gap-3 bg-[#0f1626]/80">
        <div class="flex-1 min-w-0">
          <h3 class="text-xs font-bold text-white truncate group-hover:text-purple-300 transition" title="${escapeHtml(d.title)}">
            ${escapeHtml(d.title)}
          </h3>
          <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span>${d.slidesCount} trang</span>
            <span class="text-slate-600">•</span>
            <span>${timeText}</span>
          </div>
        </div>

        <!-- Action 3-dots Menu Button -->
        <div class="relative">
          <button class="btn-project-menu p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Thao tác khác">
            <i data-lucide="more-vertical" class="w-4 h-4"></i>
          </button>

          <!-- Dropdown Context Menu -->
          <div class="project-action-dropdown absolute right-0 bottom-full mb-1.5 w-44 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-40 hidden text-xs">
            <button class="action-item-open w-full text-left px-3.5 py-2 hover:bg-purple-500/20 hover:text-purple-300 text-slate-200 flex items-center gap-2.5 transition">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>Mở chỉnh sửa</span>
            </button>
            <button class="action-item-copylink w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition">
              <i data-lucide="link-2" class="w-3.5 h-3.5"></i>
              <span>Sao chép liên kết</span>
            </button>
            <button class="action-item-duplicate w-full text-left px-3.5 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2.5 transition">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Nhân bản bài này</span>
            </button>
            ${isOwner ? `
              <div class="my-1 border-t border-slate-800"></div>
              <button class="action-item-delete w-full text-left px-3.5 py-2 hover:bg-rose-500/20 text-rose-400 flex items-center gap-2.5 transition">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>Xóa bài này</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Click vào card để mở bài
    card.addEventListener('click', (e) => {
      // Bỏ qua nếu click vào nút 3 chấm hoặc menu dropdown
      if (e.target.closest('.btn-project-menu') || e.target.closest('.project-action-dropdown')) {
        return;
      }
      openSpecificProject(d);
    });

    // Mở popup 3 chấm
    const btnMenu = card.querySelector('.btn-project-menu');
    const dropdown = card.querySelector('.project-action-dropdown');

    if (btnMenu && dropdown) {
      btnMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        // Đóng các dropdown khác trước
        document.querySelectorAll('.project-action-dropdown').forEach(el => {
          if (el !== dropdown) el.classList.add('hidden');
        });
        dropdown.classList.toggle('hidden');
      });

      // Thao tác: Mở chỉnh sửa
      const btnActionOpen = dropdown.querySelector('.action-item-open');
      if (btnActionOpen) {
        btnActionOpen.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.add('hidden');
          openSpecificProject(d);
        });
      }

      // Thao tác: Sao chép link
      const btnActionCopy = dropdown.querySelector('.action-item-copylink');
      if (btnActionCopy) {
        btnActionCopy.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.add('hidden');
          const shareUrl = `${window.location.origin}/design/${d.id}/${d.token}/edit`;
          navigator.clipboard.writeText(shareUrl).then(() => {
            showToast("Đã sao chép liên kết bài thiết kế");
          }).catch(() => {
            showToast(shareUrl);
          });
        });
      }

      // Thao tác: Nhân bản bài này
      const btnActionDuplicate = dropdown.querySelector('.action-item-duplicate');
      if (btnActionDuplicate) {
        btnActionDuplicate.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.add('hidden');
          duplicateProjectAction(d);
        });
      }

      // Thao tác: Xóa bài
      const btnActionDelete = dropdown.querySelector('.action-item-delete');
      if (btnActionDelete) {
        btnActionDelete.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.add('hidden');
          openDeleteProjectConfirm(d);
        });
      }
    }

    projectsGrid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// Mở một bài thiết kế cụ thể từ Projects Grid
async function openSpecificProject(d) {
  if (d.deckObj) {
    setupDeck(d.deckObj, true, `Đã mở: ${d.title}`);
    return;
  }

  showLoader("Đang nạp bài thiết kế...", d.title, "Đang đồng bộ slide từ cơ sở dữ liệu máy chủ...");
  try {
    const res = await fetch(`/api/designs/${d.id}`);
    if (res.ok) {
      const dbData = await res.json();
      const deck = {
        id: dbData.design_id,
        designId: dbData.design_id,
        editToken: dbData.edit_token || d.token,
        filename: dbData.title || d.title,
        slides: dbData.slides || [],
        customFonts: dbData.customFonts || [],
        slideCount: dbData.slide_count || (dbData.slides ? dbData.slides.length : 1),
        shareAccessLevel: dbData.share_access_level || 'private',
        sharedMembers: dbData.sharedMembers || []
      };
      setupDeck(deck, true, `Đã mở: ${deck.filename}`);
    } else {
      showToast("Không tìm thấy bài thiết kế trên máy chủ", true);
    }
  } catch (err) {
    showToast("Lỗi kết nối máy chủ: " + err.message, true);
  } finally {
    hideLoader();
  }
}

// Nhân bản bài thiết kế
async function duplicateProjectAction(d) {
  showLoader(`Đang nhân bản "${d.title}"...`);
  try {
    const res = await fetch(`/api/designs/${d.id}/duplicate`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      const dupTitle = (data.design && data.design.title) || data.title || "Bản sao";
      showToast(`Đã tạo bản sao: ${dupTitle}`);
      await loadProjectsData();
    } else {
      showToast("Không thể nhân bản bài thiết kế", true);
    }
  } catch (err) {
    showToast("Lỗi khi nhân bản: " + err.message, true);
  } finally {
    hideLoader();
  }
}

// Mở modal xác nhận xóa bài thiết kế
function openDeleteProjectConfirm(d) {
  pendingDeleteProject = d;
  if (deleteProjectTargetTitle) deleteProjectTargetTitle.textContent = `"${d.title}"`;
  if (deleteProjectModal) deleteProjectModal.classList.remove('hidden');
}

function closeDeleteProjectConfirm() {
  pendingDeleteProject = null;
  if (deleteProjectModal) deleteProjectModal.classList.add('hidden');
}

// Xác nhận xóa bài thiết kế
async function executeDeleteProject() {
  if (!pendingDeleteProject) return;
  const targetId = pendingDeleteProject.id;
  const targetTitle = pendingDeleteProject.title;
  closeDeleteProjectConfirm();

  showLoader(`Đang xóa bài "${targetTitle}"...`);
  try {
    const res = await fetch(`/api/designs/${targetId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      // Xóa khỏi localStorage nếu có
      localStorage.removeItem(`canva_design_${targetId}`);
      localStorage.removeItem(`deck_${targetId}`);

      // Nếu đang mở chính bài này thì reset
      if (currentDeck && currentDeck.designId === targetId) {
        currentDeck = null;
      }

      showToast(`Đã xóa bài "${targetTitle}"`);
      await loadProjectsData();
    } else {
      showToast("Không thể xóa bài thiết kế khỏi máy chủ", true);
    }
  } catch (err) {
    showToast("Lỗi khi xóa bài: " + err.message, true);
  } finally {
    hideLoader();
  }
}

// Bắt sự kiện Modal Xác nhận Xóa
if (btnCancelDeleteProject) {
  btnCancelDeleteProject.addEventListener('click', closeDeleteProjectConfirm);
}
if (btnConfirmDeleteProject) {
  btnConfirmDeleteProject.addEventListener('click', executeDeleteProject);
}

// Đóng action dropdown khi click ra ngoài
document.addEventListener('click', () => {
  document.querySelectorAll('.project-action-dropdown').forEach(el => el.classList.add('hidden'));
});

// Bắt sự kiện chuyển sang trang Projects từ Upload screen & Editor header
if (btnGoToProjectsFromUpload) {
  btnGoToProjectsFromUpload.addEventListener('click', (e) => {
    e.stopPropagation();
    openProjectsPage('upload');
  });
}

if (btnGoToProjectsFromEditor) {
  btnGoToProjectsFromEditor.addEventListener('click', (e) => {
    e.stopPropagation();
    openProjectsPage('editor');
  });
}

if (btnUploadGoToProjects) {
  btnUploadGoToProjects.addEventListener('click', (e) => {
    e.stopPropagation();
    openProjectsPage('upload');
  });
}

if (btnMenuGoToProjects) {
  btnMenuGoToProjects.addEventListener('click', (e) => {
    e.stopPropagation();
    openProjectsPage('editor');
  });
}

// Nút quay lại từ trang Dự Án
if (btnProjectsBackHome) {
  btnProjectsBackHome.addEventListener('click', closeProjectsPage);
}

// Avatar người dùng trên trang Dự Án click để sang trang Tài Khoản
if (projectsUserBadge) {
  projectsUserBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    openAccountPage('projects');
  });
}

// Nút Refresh danh sách
if (btnProjectsRefresh) {
  btnProjectsRefresh.addEventListener('click', () => {
    loadProjectsData();
    showToast("Đã làm mới danh sách bài thiết kế");
  });
}

// Nút Tạo bài mới trên Projects Page
function triggerCreateNewFromProjects() {
  createNewBlankPresentation();
}

if (btnProjectsCreateNew) {
  btnProjectsCreateNew.addEventListener('click', triggerCreateNewFromProjects);
}
if (btnEmptyCreateNew) {
  btnEmptyCreateNew.addEventListener('click', triggerCreateNewFromProjects);
}

// Nút Nạp PPTX trên Projects Page: Mở hộp thoại chọn file nạp thẳng vào Editor mà không nhảy trang
function triggerImportPPTXFromProjects() {
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}

if (btnProjectsImportPPTX) {
  btnProjectsImportPPTX.addEventListener('click', triggerImportPPTXFromProjects);
}
if (btnEmptyImportPPTX) {
  btnEmptyImportPPTX.addEventListener('click', triggerImportPPTXFromProjects);
}

// Hỗ trợ kéo thả trực tiếp tệp .pptx lên trang Dự án
if (projectsPageView) {
  projectsPageView.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  projectsPageView.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.match(/\.(pptx|ppt)$/i)) {
        uploadPPTX(file);
      } else {
        showToast("Vui lòng tải lên tệp PowerPoint (.pptx)", true);
      }
    }
  });
}

// Tìm kiếm dự án (Debounced)
function handleProjectsSearch(value) {
  clearTimeout(projectsSearchDebounceTimer);
  projectsSearchDebounceTimer = setTimeout(() => {
    currentProjectsSearch = value;
    renderProjectsGrid();
  }, 250);
}

if (inputProjectsSearch) {
  inputProjectsSearch.addEventListener('input', (e) => {
    handleProjectsSearch(e.target.value);
  });
}
if (inputProjectsSearchMobile) {
  inputProjectsSearchMobile.addEventListener('input', (e) => {
    handleProjectsSearch(e.target.value);
  });
}

// Bộ lọc Tabs
function setupProjectTabs() {
  const tabs = [
    { btn: tabProjectsAll, filter: 'all' },
    { btn: tabProjectsMine, filter: 'mine' },
    { btn: tabProjectsShared, filter: 'shared' }
  ];

  tabs.forEach(({ btn, filter }) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      tabs.forEach(t => {
        if (!t.btn) return;
        t.btn.classList.remove('active', 'bg-purple-600/20', 'text-purple-300', 'border-purple-500/30');
        t.btn.classList.add('text-slate-400');
      });
      btn.classList.add('active', 'bg-purple-600/20', 'text-purple-300', 'border-purple-500/30');
      btn.classList.remove('text-slate-400');

      currentProjectsFilter = filter;
      renderProjectsGrid();
    });
  });
}
setupProjectTabs();

// Sắp xếp bài thiết kế
if (selectProjectsSort) {
  selectProjectsSort.addEventListener('change', (e) => {
    currentProjectsSort = e.target.value;
    renderProjectsGrid();
  });
}

// --- 19. HOME VIEW EVENT LISTENERS ---
// Nút "Continue" trên thẻ Jump back in (nếu đang đăng nhập -> vào trang dự án; nếu đã logout -> đăng nhập lại)
if (btnHomeContinue) {
  btnHomeContinue.addEventListener('click', () => {
    if (getCurrentUser()) {
      openProjectsPage('home');
    } else {
      loginWithGoogle();
    }
  });
}

// Nút "Continue with another account" (Mở Google Login chọn tài khoản khác)
if (btnHomeContinueAnother) {
  btnHomeContinueAnother.addEventListener('click', () => {
    loginWithGoogle();
  });
}

// Nút Login trên card lần đầu vào
if (btnHomeFirstLogin) {
  btnHomeFirstLogin.addEventListener('click', () => {
    loginWithGoogle();
  });
}

// Nút Đăng ký trên card lần đầu vào
if (btnHomeFirstSignup) {
  btnHomeFirstSignup.addEventListener('click', () => {
    loginWithGoogle();
  });
}

// Nút quay lại trang chủ từ trang Import (/import)
if (btnBackFromUploadToHome) {
  btnBackFromUploadToHome.addEventListener('click', () => {
    openHomePage();
  });
}

// ============================================================================
// ==================== MODULE QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) ==================
// ============================================================================

let adminCurrentActiveTab = 'dashboard';
let adminUsersCurrentPage = 1;

function getAdminToken() {
  return localStorage.getItem('slidecraft_admin_token') || '';
}

function setAdminToken(token) {
  localStorage.setItem('slidecraft_admin_token', token);
}

function removeAdminToken() {
  localStorage.removeItem('slidecraft_admin_token');
  localStorage.removeItem('slidecraft_admin_profile');
}

function getAdminProfile() {
  try {
    const raw = localStorage.getItem('slidecraft_admin_profile');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setAdminProfile(profile) {
  localStorage.setItem('slidecraft_admin_profile', JSON.stringify(profile));
}

async function authAdminFetch(url, options = {}) {
  const token = getAdminToken();
  const headers = Object.assign({}, options.headers || {}, {
    'X-Admin-Token': token,
    'Authorization': `Bearer ${token}`
  });
  const res = await fetch(url, Object.assign({}, options, { headers }));
  if (res.status === 401) {
    removeAdminToken();
    openAdminLoginPage();
    throw new Error('Phiên đăng nhập quản trị đã hết hạn hoặc không hợp lệ');
  }
  return res;
}

function openAdminLoginPage() {
  switchMainView('adminLogin');
  if (window.location.pathname !== '/admin/login') {
    window.history.pushState({ page: 'adminLogin' }, '', '/admin/login');
  }
  if (adminLoginErrorAlert) adminLoginErrorAlert.classList.add('hidden');
  if (adminLoginUsername) {
    adminLoginUsername.focus();
  }
}

async function openAdminDashboardPage() {
  const token = getAdminToken();
  if (!token) {
    openAdminLoginPage();
    return;
  }

  // Xác thực token qua backend
  try {
    const res = await authAdminFetch('/api/admin/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data && data.admin) {
        setAdminProfile(data.admin);
      }
    } else {
      openAdminLoginPage();
      return;
    }
  } catch (e) {
    openAdminLoginPage();
    return;
  }

  switchMainView('adminDashboard');
  if (window.location.pathname !== '/admin') {
    window.history.pushState({ page: 'adminDashboard' }, '', '/admin');
  }

  updateAdminProfileUI();
  setupAdminNavigation();
  switchAdminTab(adminCurrentActiveTab || 'dashboard');
}

function updateAdminProfileUI() {
  const profile = getAdminProfile();
  if (!profile) return;
  if (adminProfileName) adminProfileName.textContent = profile.full_name || profile.username || 'Admin';
  if (adminProfileRole) adminProfileRole.textContent = profile.role === 'super_admin' ? 'Super Admin' : (profile.role === 'editor' ? 'Editor' : 'Admin');
  if (adminProfileInitial) {
    const initial = (profile.full_name || profile.username || 'A').trim().charAt(0).toUpperCase();
    adminProfileInitial.textContent = initial;
  }
}

function setupAdminNavigation() {
  if (adminNavBtns) {
    adminNavBtns.forEach(btn => {
      btn.onclick = () => {
        const tab = btn.getAttribute('data-admin-tab');
        switchAdminTab(tab);
      };
    });
  }

  if (btnAdminRefreshData) {
    btnAdminRefreshData.onclick = () => {
      switchAdminTab(adminCurrentActiveTab);
      showToast('Đã làm mới dữ liệu quản trị!');
    };
  }

  if (btnAdminLogout) {
    btnAdminLogout.onclick = async () => {
      try {
        await authAdminFetch('/api/admin/auth/logout', { method: 'POST' });
      } catch (e) {}
      removeAdminToken();
      showToast('Đã đăng xuất khỏi tài khoản quản trị');
      openAdminLoginPage();
    };
  }

  if (btnAdminBackToEditor) {
    btnAdminBackToEditor.onclick = () => {
      openHomePage();
    };
  }

  if (btnAdminLoginBackHome) {
    btnAdminLoginBackHome.onclick = () => {
      openHomePage();
    };
  }
}

function switchAdminTab(targetTab) {
  adminCurrentActiveTab = targetTab;

  // Cập nhật giao diện nút Sidebar
  if (adminNavBtns) {
    adminNavBtns.forEach(b => {
      const tab = b.getAttribute('data-admin-tab');
      if (tab === targetTab) {
        b.className = 'admin-nav-btn w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold cursor-pointer';
      } else {
        b.className = 'admin-nav-btn w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-slate-400 hover:text-white hover:bg-slate-800/60 transition font-semibold cursor-pointer';
      }
    });
  }

  // Ẩn tất cả panes, mở pane tương ứng
  if (adminPanes) {
    adminPanes.forEach(p => p.classList.add('hidden'));
    const activePane = document.getElementById(`adminPane-${targetTab}`);
    if (activePane) activePane.classList.remove('hidden');
  }

  // Cập nhật tiêu đề trang
  const titles = {
    dashboard: 'Tổng quan hệ thống',
    users: 'Quản lý tài khoản người dùng',
    templates: 'Quản lý kho mẫu slide PPTX',
    admins: 'Quản lý Ban Quản Trị & Phân quyền'
  };
  if (adminCurrentTabTitle) {
    adminCurrentTabTitle.textContent = titles[targetTab] || 'Quản trị hệ thống';
  }

  // Nạp dữ liệu tương ứng của từng tab
  if (targetTab === 'dashboard') loadAdminDashboardStats();
  else if (targetTab === 'users') loadAdminUsers();
  else if (targetTab === 'templates') loadAdminTemplates();
  else if (targetTab === 'admins') loadAdminAdmins();

  if (window.lucide) lucide.createIcons();
}

// --- 1. XỬ LÝ ĐĂNG NHẬP ADMIN ---
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (adminLoginErrorAlert) adminLoginErrorAlert.classList.add('hidden');

    const username = adminLoginUsername ? adminLoginUsername.value.trim() : '';
    const password = adminLoginPassword ? adminLoginPassword.value : '';

    if (!username || !password) return;

    if (btnAdminLoginSubmit) {
      btnAdminLoginSubmit.disabled = true;
      btnAdminLoginSubmit.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Đang xác thực...</span>';
      if (window.lucide) lucide.createIcons();
    }

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setAdminToken(data.token);
        setAdminProfile(data.admin);
        showToast(`Xin chào, ${data.admin.full_name || data.admin.username}!`);
        openAdminDashboardPage();
      } else {
        if (adminLoginErrorAlert && adminLoginErrorText) {
          adminLoginErrorText.textContent = data.detail || 'Tên đăng nhập hoặc mật khẩu không chính xác';
          adminLoginErrorAlert.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (adminLoginErrorAlert && adminLoginErrorText) {
        adminLoginErrorText.textContent = 'Không thể kết nối đến máy chủ quản trị';
        adminLoginErrorAlert.classList.remove('hidden');
      }
    } finally {
      if (btnAdminLoginSubmit) {
        btnAdminLoginSubmit.disabled = false;
        btnAdminLoginSubmit.innerHTML = '<i data-lucide="log-in" class="w-4 h-4"></i><span>Đăng nhập Quản trị</span>';
        if (window.lucide) lucide.createIcons();
      }
    }
  });
}

// --- 2. TAB TỔNG QUAN (DASHBOARD STATS) ---
async function loadAdminDashboardStats() {
  try {
    const res = await authAdminFetch('/api/admin/stats');
    if (!res.ok) return;
    const json = await res.json();
    const stats = json.stats || {};

    if (statTotalUsers) statTotalUsers.textContent = stats.total_users || '0';
    if (statBannedUsers) statBannedUsers.textContent = stats.banned_users || '0';
    if (statTotalDesigns) statTotalDesigns.textContent = stats.total_designs || '0';
    if (statActiveTemplates) statActiveTemplates.textContent = stats.active_templates || '0';

    // Render Recent Users
    if (adminRecentUsersTableBody) {
      adminRecentUsersTableBody.innerHTML = '';
      const recentUsers = stats.recent_users || [];
      if (recentUsers.length === 0) {
        adminRecentUsersTableBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-slate-500">Chưa có người dùng nào</td></tr>';
      } else {
        recentUsers.forEach(u => {
          const tr = document.createElement('tr');
          const isBanned = u.is_active === 0;
          tr.innerHTML = `
            <td class="py-2.5">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-[10px] text-white">
                  ${u.picture ? `<img src="${u.picture}" class="w-full h-full object-cover"/>` : (u.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p class="font-bold text-white truncate max-w-[120px]">${u.name || 'Người dùng'}</p>
                  <p class="text-[10px] text-slate-400 truncate max-w-[120px]">${u.email}</p>
                </div>
              </div>
            </td>
            <td class="py-2.5 text-slate-400 text-[11px]">${(u.created_at || '').slice(0, 10)}</td>
            <td class="py-2.5 text-right">
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${isBanned ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
                ${isBanned ? 'Đã khóa' : 'Hoạt động'}
              </span>
            </td>
          `;
          adminRecentUsersTableBody.appendChild(tr);
        });
      }
    }

    // Render Recent Designs
    if (adminRecentDesignsTableBody) {
      adminRecentDesignsTableBody.innerHTML = '';
      const recentDesigns = stats.recent_designs || [];
      if (recentDesigns.length === 0) {
        adminRecentDesignsTableBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-slate-500">Chưa có bài thiết kế nào</td></tr>';
      } else {
        recentDesigns.forEach(d => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="py-2.5">
              <p class="font-bold text-white truncate max-w-[150px]">${d.title || 'Thiết kế không tên'}</p>
              <p class="text-[10px] text-slate-500">${(d.updated_at || '').slice(0, 16)}</p>
            </td>
            <td class="py-2.5 text-slate-300 text-[11px] truncate max-w-[100px]">${d.owner_name || d.owner_email || 'Chưa rõ'}</td>
            <td class="py-2.5 text-right font-bold text-purple-400">${d.slide_count || 1}</td>
          `;
          adminRecentDesignsTableBody.appendChild(tr);
        });
      }
    }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.warn("Could not load admin stats:", err);
  }
}

// --- 3. TAB QUẢN LÝ NGƯỜI DÙNG (USERS CRUD) ---
async function loadAdminUsers() {
  if (!adminUsersTableBody) return;
  adminUsersTableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-500"><i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400"></i>Đang tải danh sách người dùng...</td></tr>';
  if (window.lucide) lucide.createIcons();

  const query = adminUsersSearchInput ? adminUsersSearchInput.value.trim() : '';
  const status = adminUsersStatusFilter ? adminUsersStatusFilter.value : 'all';

  try {
    const res = await authAdminFetch(`/api/admin/users?query=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}&page=${adminUsersCurrentPage}&page_size=20`);
    if (!res.ok) return;
    const json = await res.json();
    const data = json.data || {};
    const users = data.users || [];

    if (adminUsersPaginationText) {
      adminUsersPaginationText.textContent = `Hiển thị ${users.length} trên tổng số ${data.total || 0} người dùng (Trang ${data.page}/${data.total_pages || 1})`;
    }
    if (btnAdminUsersPrevPage) btnAdminUsersPrevPage.disabled = adminUsersCurrentPage <= 1;
    if (btnAdminUsersNextPage) btnAdminUsersNextPage.disabled = adminUsersCurrentPage >= (data.total_pages || 1);

    adminUsersTableBody.innerHTML = '';
    if (users.length === 0) {
      adminUsersTableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-500">Không tìm thấy người dùng phù hợp</td></tr>';
      return;
    }

    users.forEach(u => {
      const tr = document.createElement('tr');
      const isBanned = u.is_active === 0;
      tr.className = 'hover:bg-slate-900/50 transition';
      tr.innerHTML = `
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-white text-xs border border-white/10 shrink-0">
              ${u.picture ? `<img src="${u.picture}" class="w-full h-full object-cover"/>` : (u.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div class="overflow-hidden">
              <p class="font-bold text-white truncate max-w-[180px]">${u.name || 'Người dùng'}</p>
              <p class="text-[10px] text-slate-500 truncate max-w-[180px]">ID: ${u.id}</p>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-slate-300 text-[11px]">${u.email}</td>
        <td class="py-3 px-4 text-slate-400 text-[11px]">${(u.created_at || '').slice(0, 10)}</td>
        <td class="py-3 px-4 text-center font-bold text-purple-400 text-xs">${u.designs_count || 0}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${isBanned ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}">
            ${isBanned ? 'Đã khóa' : 'Hoạt động'}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button
              class="btn-toggle-ban px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${isBanned ? 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40' : 'bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40'}"
              data-user-id="${u.id}"
              data-current-active="${u.is_active}"
            >
              <i data-lucide="${isBanned ? 'check' : 'lock'}" class="w-3 h-3"></i>
              <span>${isBanned ? 'Mở khóa' : 'Khóa'}</span>
            </button>
          </div>
        </td>
      `;

      // Gắn sự kiện khóa / mở khóa
      const btnToggle = tr.querySelector('.btn-toggle-ban');
      if (btnToggle) {
        btnToggle.addEventListener('click', async () => {
          const userId = btnToggle.getAttribute('data-user-id');
          const currentActive = parseInt(btnToggle.getAttribute('data-current-active'));
          const nextActive = currentActive === 1 ? 0 : 1;
          const confirmMsg = nextActive === 0 ? 'Bạn có chắc chắn muốn KHÓA tài khoản người dùng này?' : 'Bạn có muốn MỞ KHÓA tài khoản người dùng này?';
          if (!confirm(confirmMsg)) return;

          try {
            const updateRes = await authAdminFetch(`/api/admin/users/${userId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ is_active: nextActive })
            });
            if (updateRes.ok) {
              showToast(nextActive === 0 ? 'Đã khóa tài khoản thành công!' : 'Đã mở khóa tài khoản thành công!');
              loadAdminUsers();
            } else {
              showToast('Lỗi khi cập nhật trạng thái', true);
            }
          } catch (e) {
            showToast('Lỗi máy chủ', true);
          }
        });
      }

      adminUsersTableBody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    adminUsersTableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-red-400">Không thể tải danh sách người dùng</td></tr>';
  }
}

if (adminUsersSearchInput) {
  let searchTimer = null;
  adminUsersSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      adminUsersCurrentPage = 1;
      loadAdminUsers();
    }, 250);
  });
}

if (adminUsersStatusFilter) {
  adminUsersStatusFilter.addEventListener('change', () => {
    adminUsersCurrentPage = 1;
    loadAdminUsers();
  });
}

if (btnRefreshAdminUsers) {
  btnRefreshAdminUsers.addEventListener('click', () => {
    loadAdminUsers();
  });
}

if (btnAdminUsersPrevPage) {
  btnAdminUsersPrevPage.addEventListener('click', () => {
    if (adminUsersCurrentPage > 1) {
      adminUsersCurrentPage--;
      loadAdminUsers();
    }
  });
}

if (btnAdminUsersNextPage) {
  btnAdminUsersNextPage.addEventListener('click', () => {
    adminUsersCurrentPage++;
    loadAdminUsers();
  });
}

// --- 4. TAB KHO MẪU TRANG PPTX (TEMPLATES CRUD) ---
async function loadAdminTemplates() {
  if (!adminTemplatesGrid) return;
  adminTemplatesGrid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400"></i>Đang tải kho mẫu PPTX...</div>';
  if (window.lucide) lucide.createIcons();

  const category = adminTemplatesCategoryFilter ? adminTemplatesCategoryFilter.value : 'all';

  try {
    const res = await authAdminFetch(`/api/admin/templates?category=${encodeURIComponent(category)}`);
    if (!res.ok) return;
    const json = await res.json();
    const templates = json.templates || [];

    adminTemplatesGrid.innerHTML = '';
    if (templates.length === 0) {
      adminTemplatesGrid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500">Chưa có mẫu nào trong danh mục này</div>';
      return;
    }

    templates.forEach(t => {
      const card = document.createElement('div');
      const isActive = t.is_active === 1;
      card.className = `p-4 rounded-2xl bg-[#161b22] border transition flex flex-col justify-between ${isActive ? 'border-slate-800 hover:border-purple-500/60' : 'border-red-900/40 opacity-70 bg-red-950/10'}`;

      const tagsList = Array.isArray(t.tags) ? t.tags : [];

      card.innerHTML = `
        <div>
          <!-- Frame Preview -->
          <div class="w-full aspect-video rounded-xl overflow-hidden relative shadow-inner border border-slate-800 bg-slate-950 mb-3 select-none">
            ${t.preview_html || `<div class="w-full h-full flex items-center justify-center font-bold text-white" style="background: ${t.bg_gradient || '#0f172a'};">${t.title}</div>`}
            <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold ${isActive ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}">
              ${isActive ? 'Hoạt động' : 'Tạm ẩn'}
            </span>
          </div>

          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-purple-400 uppercase tracking-wider">${t.category_name || t.category}</span>
            <span class="text-[9px] text-slate-500 font-mono">ID: ${t.id}</span>
          </div>
          <h4 class="text-xs font-bold text-white mb-2 line-clamp-1">${t.title}</h4>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1 mb-4">
            ${tagsList.slice(0, 4).map(tag => `<span class="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 font-medium">#${tag}</span>`).join('')}
            ${tagsList.length > 4 ? `<span class="text-[9px] text-slate-500 self-center">+${tagsList.length - 4}</span>` : ''}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            class="btn-toggle-template-active flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${isActive ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white'}"
            data-template-id="${t.id}"
            data-current-active="${t.is_active}"
          >
            <i data-lucide="${isActive ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
            <span>${isActive ? 'Ẩn mẫu' : 'Bật mẫu'}</span>
          </button>

          <div class="flex items-center gap-1">
            <button
              class="btn-edit-template p-1.5 hover:bg-purple-600/20 text-slate-400 hover:text-purple-300 rounded-lg transition cursor-pointer"
              title="Chỉnh sửa thông tin mẫu"
            >
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button
              class="btn-delete-template p-1.5 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
              title="Xóa mẫu này"
              data-template-id="${t.id}"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;

      // Event toggle active
      const btnToggle = card.querySelector('.btn-toggle-template-active');
      if (btnToggle) {
        btnToggle.addEventListener('click', async () => {
          const tmplId = btnToggle.getAttribute('data-template-id');
          const curAct = parseInt(btnToggle.getAttribute('data-current-active'));
          const nextAct = curAct === 1 ? 0 : 1;
          try {
            const upRes = await authAdminFetch(`/api/admin/templates/${tmplId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ is_active: nextAct })
            });
            if (upRes.ok) {
              showToast(nextAct === 1 ? 'Đã kích hoạt mẫu!' : 'Đã ẩn mẫu khỏi kho!');
              loadAdminTemplates();
            }
          } catch (e) {
            showToast('Lỗi cập nhật', true);
          }
        });
      }

      // Event edit template
      const btnEdit = card.querySelector('.btn-edit-template');
      if (btnEdit) {
        btnEdit.addEventListener('click', () => {
          openEditTemplateModal(t);
        });
      }

      // Event delete template
      const btnDel = card.querySelector('.btn-delete-template');
      if (btnDel) {
        btnDel.addEventListener('click', async () => {
          if (!confirm(`Bạn có chắc chắn muốn xóa mẫu "${t.title}"?`)) return;
          try {
            const delRes = await authAdminFetch(`/api/admin/templates/${t.id}`, { method: 'DELETE' });
            if (delRes.ok) {
              showToast('Đã xóa mẫu thành công!');
              loadAdminTemplates();
            }
          } catch (e) {
            showToast('Lỗi khi xóa mẫu', true);
          }
        });
      }

      adminTemplatesGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    adminTemplatesGrid.innerHTML = '<div class="col-span-full py-12 text-center text-red-400">Không thể tải kho mẫu</div>';
  }
}

if (adminTemplatesCategoryFilter) {
  adminTemplatesCategoryFilter.addEventListener('change', () => {
    loadAdminTemplates();
  });
}

if (btnRefreshAdminTemplates) {
  btnRefreshAdminTemplates.addEventListener('click', () => {
    loadAdminTemplates();
  });
}


// Modal Thêm / Sửa Template
function openEditTemplateModal(tmpl = null) {
  if (!adminTemplateEditModal) return;
  const isEdit = !!tmpl;
  const modalTitle = document.getElementById('adminTemplateModalTitle');
  if (modalTitle) modalTitle.textContent = isEdit ? 'Chỉnh Sửa Mẫu Trang PPTX' : 'Thêm Mẫu Trang PPTX Mới';

  if (tmplEditId) tmplEditId.value = isEdit ? tmpl.id : '';
  if (tmplEditTitle) tmplEditTitle.value = isEdit ? tmpl.title : '';
  if (tmplEditCategory) tmplEditCategory.value = isEdit ? tmpl.category : 'travel';
  if (tmplEditCategoryName) tmplEditCategoryName.value = isEdit ? tmpl.category_name : 'Du lịch';
  if (tmplEditTags) {
    tmplEditTags.value = isEdit && Array.isArray(tmpl.tags) ? tmpl.tags.join(', ') : '';
  }
  const color = (isEdit && tmpl.slide_data && tmpl.slide_data.customColor) ? tmpl.slide_data.customColor : '#032030';
  if (tmplEditColorPicker) tmplEditColorPicker.value = color;
  if (tmplEditCustomColor) tmplEditCustomColor.value = color;
  if (tmplEditIsActive) tmplEditIsActive.value = isEdit ? tmpl.is_active : 1;

  adminTemplateEditModal.classList.remove('hidden');
}

if (tmplEditColorPicker && tmplEditCustomColor) {
  tmplEditColorPicker.addEventListener('input', (e) => {
    tmplEditCustomColor.value = e.target.value.toUpperCase();
  });
  tmplEditCustomColor.addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      tmplEditColorPicker.value = e.target.value;
    }
  });
}

let selectedAdminPptxFile = null;

function resetAdminImportPptxModal() {
  selectedAdminPptxFile = null;
  if (adminPptxFileInput) adminPptxFileInput.value = '';
  if (adminPptxDropzoneDefault) adminPptxDropzoneDefault.classList.remove('hidden');
  if (adminPptxFileInfo) adminPptxFileInfo.classList.add('hidden');
  if (adminPptxProgressBox) adminPptxProgressBox.classList.add('hidden');
  if (btnSubmitAdminImportPptx) {
    btnSubmitAdminImportPptx.disabled = false;
    btnSubmitAdminImportPptx.classList.remove('opacity-60', 'cursor-not-allowed');
  }
  if (adminPptxPrefixTitle) adminPptxPrefixTitle.value = '';
  if (adminPptxTags) adminPptxTags.value = '';
}

function openAdminImportPptxModal() {
  resetAdminImportPptxModal();
  if (adminImportPptxModal) {
    adminImportPptxModal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }
}

function handleSelectAdminPptx(file) {
  if (!file) return;
  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith('.pptx') && !lowerName.endsWith('.ppt')) {
    showToast('Vui lòng chọn tệp PowerPoint có định dạng .pptx hoặc .ppt', true);
    return;
  }
  selectedAdminPptxFile = file;
  if (adminPptxFileName) adminPptxFileName.textContent = file.name;
  if (adminPptxFileSize) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    adminPptxFileSize.textContent = `${sizeInMB} MB`;
  }
  if (adminPptxDropzoneDefault) adminPptxDropzoneDefault.classList.add('hidden');
  if (adminPptxFileInfo) adminPptxFileInfo.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

if (btnOpenCreateTemplateModal) {
  btnOpenCreateTemplateModal.addEventListener('click', () => {
    openAdminImportPptxModal();
  });
}

if (btnCloseAdminImportPptxModal) {
  btnCloseAdminImportPptxModal.addEventListener('click', () => {
    if (adminImportPptxModal) adminImportPptxModal.classList.add('hidden');
  });
}

if (btnCancelAdminImportPptxModal) {
  btnCancelAdminImportPptxModal.addEventListener('click', () => {
    if (adminImportPptxModal) adminImportPptxModal.classList.add('hidden');
  });
}

if (btnOpenManualTemplateCreate) {
  btnOpenManualTemplateCreate.addEventListener('click', () => {
    if (adminImportPptxModal) adminImportPptxModal.classList.add('hidden');
    openEditTemplateModal(null);
  });
}

if (adminPptxCategory && adminPptxCategoryName) {
  adminPptxCategory.addEventListener('change', () => {
    const opt = adminPptxCategory.options[adminPptxCategory.selectedIndex];
    const catName = opt ? opt.getAttribute('data-name') : 'Doanh nghiệp';
    if (catName) adminPptxCategoryName.value = catName;
  });
}

if (adminPptxDropzone && adminPptxFileInput) {
  adminPptxDropzone.addEventListener('click', (e) => {
    if (e.target.closest('#btnRemoveAdminPptxFile')) return;
    adminPptxFileInput.click();
  });

  adminPptxFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSelectAdminPptx(e.target.files[0]);
    }
  });

  adminPptxDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    adminPptxDropzone.classList.add('border-purple-400', 'bg-purple-950/20');
  });

  adminPptxDropzone.addEventListener('dragleave', () => {
    adminPptxDropzone.classList.remove('border-purple-400', 'bg-purple-950/20');
  });

  adminPptxDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    adminPptxDropzone.classList.remove('border-purple-400', 'bg-purple-950/20');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectAdminPptx(e.dataTransfer.files[0]);
    }
  });
}

if (btnRemoveAdminPptxFile) {
  btnRemoveAdminPptxFile.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedAdminPptxFile = null;
    if (adminPptxFileInput) adminPptxFileInput.value = '';
    if (adminPptxFileInfo) adminPptxFileInfo.classList.add('hidden');
    if (adminPptxDropzoneDefault) adminPptxDropzoneDefault.classList.remove('hidden');
  });
}

if (adminImportPptxForm) {
  adminImportPptxForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedAdminPptxFile) {
      showToast('Vui lòng chọn hoặc kéo thả một tệp .pptx để bóc tách mẫu!', true);
      return;
    }

    const category = adminPptxCategory ? adminPptxCategory.value : 'business';
    const categoryName = adminPptxCategoryName ? adminPptxCategoryName.value.trim() : 'Doanh nghiệp';
    const prefixTitle = adminPptxPrefixTitle ? adminPptxPrefixTitle.value.trim() : '';
    const tags = adminPptxTags ? adminPptxTags.value.trim() : '';

    const formData = new FormData();
    formData.append('file', selectedAdminPptxFile);
    formData.append('category', category);
    formData.append('category_name', categoryName);
    formData.append('tags', tags);
    formData.append('prefix_title', prefixTitle);

    if (adminPptxProgressBox) adminPptxProgressBox.classList.remove('hidden');
    if (btnSubmitAdminImportPptx) {
      btnSubmitAdminImportPptx.disabled = true;
      btnSubmitAdminImportPptx.classList.add('opacity-60', 'cursor-not-allowed');
    }
    if (window.lucide) lucide.createIcons();

    try {
      const res = await authAdminFetch('/api/admin/templates/import-pptx', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (res.ok && json.status === 'success') {
        showToast(`Đã bóc tách thành công ${json.importedCount} mẫu slide vào kho!`);
        if (adminImportPptxModal) adminImportPptxModal.classList.add('hidden');
        resetAdminImportPptxModal();
        loadAdminTemplates();

        // Tự động đồng bộ lại danh sách mẫu cho Canva Editor Drawer
        fetch('/api/templates')
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data && Array.isArray(data.templates)) {
              SYSTEM_PPTX_TEMPLATES.length = 0;
              SYSTEM_PPTX_TEMPLATES.push(...data.templates.map(t => ({
                id: t.id,
                title: t.title,
                category: t.category,
                categoryName: t.category_name,
                tags: t.tags || [],
                bgGradient: t.bg_gradient,
                previewBadge: t.preview_badge || (t.category_name || '').toUpperCase(),
                previewHtml: t.preview_html,
                slideData: t.slide_data || { customColor: '#032030', fabricJson: { objects: [] } }
              })));
              renderTemplatesGrid(currentTemplateSearchQuery, currentTemplateCategory);
            }
          })
          .catch(() => {});
      } else {
        showToast(json.detail || 'Lỗi khi bóc tách tệp PPTX', true);
      }
    } catch (err) {
      console.error('Import PPTX error:', err);
      showToast('Lỗi kết nối máy chủ khi tải lên tệp PPTX', true);
    } finally {
      if (adminPptxProgressBox) adminPptxProgressBox.classList.add('hidden');
      if (btnSubmitAdminImportPptx) {
        btnSubmitAdminImportPptx.disabled = false;
        btnSubmitAdminImportPptx.classList.remove('opacity-60', 'cursor-not-allowed');
      }
    }
  });
}

if (btnCloseAdminTemplateModal) {
  btnCloseAdminTemplateModal.addEventListener('click', () => {
    if (adminTemplateEditModal) adminTemplateEditModal.classList.add('hidden');
  });
}
if (btnCancelAdminTemplateModal) {
  btnCancelAdminTemplateModal.addEventListener('click', () => {
    if (adminTemplateEditModal) adminTemplateEditModal.classList.add('hidden');
  });
}

if (adminTemplateForm) {
  adminTemplateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = tmplEditId ? tmplEditId.value : '';
    const title = tmplEditTitle ? tmplEditTitle.value.trim() : '';
    const category = tmplEditCategory ? tmplEditCategory.value : 'travel';
    const category_name = tmplEditCategoryName ? tmplEditCategoryName.value.trim() : 'Du lịch';
    const tagsRaw = tmplEditTags ? tmplEditTags.value : '';
    const tags = tagsRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const customColor = tmplEditCustomColor ? tmplEditCustomColor.value : '#032030';
    const is_active = tmplEditIsActive ? parseInt(tmplEditIsActive.value) : 1;

    const payload = {
      title,
      category,
      category_name,
      tags,
      bg_gradient: `linear-gradient(135deg, ${customColor} 0%, #000000 100%)`,
      preview_badge: category_name.toUpperCase(),
      preview_html: `<div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: ${customColor};"><div><span class="inline-block px-1.5 py-0.5 rounded bg-cyan-500/80 text-[8px] font-bold tracking-wider mb-1">${category_name.toUpperCase()}</span><p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">${title}</p></div><div class="text-[5px] text-slate-400 border-t border-slate-700/60 pt-0.5 truncate">SlideCraft PPTX Template</div></div>`,
      slide_data: {
        customColor: customColor,
        fabricJson: {
          objects: [
            { type: 'textbox', left: 80, top: 60, width: 800, text: title, fontSize: 32, fontFamily: 'Inter', fontWeight: 'bold', fill: '#ffffff' },
            { type: 'textbox', left: 80, top: 110, width: 800, text: `Mẫu trình bày chuyên nghiệp thuộc danh mục ${category_name}`, fontSize: 16, fontFamily: 'Inter', fill: '#94a3b8' },
            { type: 'rect', left: 80, top: 180, width: 795, height: 260, fill: '#1e293b', rx: 12, ry: 12 },
            { type: 'textbox', left: 110, top: 210, width: 735, text: '• Nhấp đúp vào đây để chỉnh sửa nội dung đoạn văn bản\\n• Tùy biến màu sắc, phông chữ và kích thước theo sở thích\\n• Chèn thêm hình ảnh, bảng biểu hoặc các khối hình vẽ tiện lợi', fontSize: 15, fontFamily: 'Inter', fill: '#f1f5f9', lineHeight: 1.5 }
          ]
        }
      },
      is_active
    };

    try {
      let res;
      if (id) {
        res = await authAdminFetch(`/api/admin/templates/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await authAdminFetch('/api/admin/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast(id ? 'Đã cập nhật mẫu thành công!' : 'Đã thêm mẫu mới thành công!');
        if (adminTemplateEditModal) adminTemplateEditModal.classList.add('hidden');
        loadAdminTemplates();
      } else {
        showToast('Lỗi khi lưu mẫu', true);
      }
    } catch (err) {
      showToast('Lỗi kết nối máy chủ', true);
    }
  });
}

// --- 5. TAB BAN QUẢN TRỊ (ADMINS CRUD) ---
async function loadAdminAdmins() {
  if (!adminListTableBody) return;
  adminListTableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-500"><i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400"></i>Đang tải danh sách quản trị viên...</td></tr>';
  if (window.lucide) lucide.createIcons();

  try {
    const res = await authAdminFetch('/api/admin/admins');
    if (!res.ok) return;
    const json = await res.json();
    const admins = json.admins || [];
    const currentProfile = getAdminProfile() || {};

    adminListTableBody.innerHTML = '';
    if (admins.length === 0) {
      adminListTableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-slate-500">Chưa có quản trị viên nào</td></tr>';
      return;
    }

    admins.forEach(a => {
      const tr = document.createElement('tr');
      const isSelf = a.id === currentProfile.id;
      const isSuper = a.role === 'super_admin';
      const roleBadge = isSuper ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : (a.role === 'editor' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-700/50 text-slate-300 border border-slate-600/50');
      const roleText = isSuper ? 'Super Admin' : (a.role === 'editor' ? 'Editor' : 'Admin');

      tr.className = 'hover:bg-slate-900/50 transition';
      tr.innerHTML = `
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
              ${(a.full_name || a.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-bold text-white truncate max-w-[140px]">${a.full_name || a.username}${isSelf ? ' <span class="text-[9px] text-purple-400 font-normal">(Bạn)</span>' : ''}</p>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-slate-300 text-[11px]">${a.username}</td>
        <td class="py-3 px-4 text-slate-400 text-[11px] font-mono">${a.email}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleBadge}">
            ${roleText}
          </span>
        </td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Hoạt động
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          ${isSelf ? '<span class="text-[10px] text-slate-500 italic">Đang dùng</span>' : `
            <button
              class="btn-delete-admin p-1.5 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
              title="Xóa tài khoản admin"
              data-admin-id="${a.id}"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          `}
        </td>
      `;

      const btnDel = tr.querySelector('.btn-delete-admin');
      if (btnDel) {
        btnDel.addEventListener('click', async () => {
          if (!confirm(`Xóa tài khoản quản trị "${a.username}"?`)) return;
          try {
            const delRes = await authAdminFetch(`/api/admin/admins/${a.id}`, { method: 'DELETE' });
            if (delRes.ok) {
              showToast('Đã xóa quản trị viên thành công!');
              loadAdminAdmins();
            } else {
              showToast('Không thể xóa quản trị viên này', true);
            }
          } catch (e) {
            showToast('Lỗi máy chủ', true);
          }
        });
      }

      adminListTableBody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    adminListTableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-red-400">Không thể tải danh sách admin</td></tr>';
  }
}

if (btnOpenCreateAdminModal) {
  btnOpenCreateAdminModal.addEventListener('click', () => {
    if (adminCreateModal) adminCreateModal.classList.remove('hidden');
    if (adminNewFullName) adminNewFullName.focus();
  });
}
if (btnCloseAdminCreateModal) {
  btnCloseAdminCreateModal.addEventListener('click', () => {
    if (adminCreateModal) adminCreateModal.classList.add('hidden');
  });
}
if (btnCancelAdminCreateModal) {
  btnCancelAdminCreateModal.addEventListener('click', () => {
    if (adminCreateModal) adminCreateModal.classList.add('hidden');
  });
}

if (adminCreateForm) {
  adminCreateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const full_name = adminNewFullName ? adminNewFullName.value.trim() : '';
    const username = adminNewUsername ? adminNewUsername.value.trim() : '';
    const email = adminNewEmail ? adminNewEmail.value.trim().toLowerCase() : '';
    const password = adminNewPassword ? adminNewPassword.value : '';
    const role = adminNewRole ? adminNewRole.value : 'admin';

    if (!username || !email || !password) return;

    try {
      const res = await authAdminFetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, username, email, password, role })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(`Đã tạo tài khoản quản trị "${username}" thành công!`);
        if (adminCreateModal) adminCreateModal.classList.add('hidden');
        if (adminCreateForm) adminCreateForm.reset();
        loadAdminAdmins();
      } else {
        showToast(data.detail || 'Lỗi khi tạo admin', true);
      }
    } catch (err) {
      showToast('Lỗi kết nối', true);
    }
  });
}

// Khởi tạo Canva Nav Rail và kho mẫu slide khi toàn bộ định nghĩa đã sẵn sàng
setupCanvaNavRail();

// Khởi chạy kiểm tra định tuyến URL ban đầu khi toàn bộ DOM & Modules đã sẵn sàng
initAppRouting();
