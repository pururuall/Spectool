import React, { useState, useMemo } from 'react';
import {
  ModuleModel,
  LineSegment,
  ProfileBinding,
  Cell,
  CatalogProfileItem,
  CatalogHardwareItem,
  DependencyRule,
  BOMRow
} from './types';
import { createDefaultModule } from './data/defaultModule';
import { generateBOM } from './utils/bomEngine';
import { detectCellsFromLines } from './utils/cellDetector';
import { generateProfileMark } from './utils/namingService';
import { exportProjectFile, importProjectFile } from './utils/projectStorageService';
import { importSpecificationFromExcel } from './utils/excelImportService';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { ParametersBox } from './components/ParametersBox';
import { MaterialsTree } from './components/MaterialsTree';
import { HardwareDatabase } from './components/HardwareDatabase';
import { DependenciesPanel } from './components/DependenciesPanel';
import { SpecificationTable } from './components/SpecificationTable';
import { CustomProfileModal } from './components/CustomProfileModal';
import { NamingFormulaModal } from './components/NamingFormulaModal';
import { ProcessTemplatesModal } from './components/ProcessTemplatesModal';
import { StandaloneItemModal } from './components/StandaloneItemModal';
import { AgentFeedbackOverlay } from './components/AgentFeedbackOverlay';
import { ResizeDivider } from './components/ResizeDivider';
import { MenuBar } from './components/MenuBar';
import { DatabaseManagerModal } from './components/DatabaseManagerModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { ModuleTabBar } from './components/ModuleTabBar';
import { CellTemplatesModal } from './components/CellTemplatesModal';
import { ThemeManagerModal } from './components/ThemeManagerModal';
import { StandaloneItem, DimensionDisplayMode, CatalogMaterialItem, UserSettings } from './types';
import { getUserSettings } from './utils/userSettingsService';
import { normalizeCellFills, syncCellWithPrimaryFill } from './utils/cellTemplates';
import { exportToExcel } from './utils/bomEngine';
import { getActiveTheme, applyThemeToDocument, ThemeDefinition } from './utils/themeService';

const createNewModuleFromSettings = (settings = getUserSettings()): ModuleModel => ({
  id: `mod-${Date.now()}`,
  name: settings.defaultModuleName || 'Новый модуль',
  project: settings.defaultProjectCode || 'ПРОЕКТ',
  width: settings.defaultWidth || 1000,
  height: settings.defaultHeight || 2500,
  color: settings.defaultPrimaryColor || (settings.defaultColors[0] || ''),
  colors: [...settings.defaultColors],
  namingPattern: settings.defaultNamingPattern,
  lines: [],
  cells: [],
  standaloneItems: []
});

export const App: React.FC = () => {
  const [tabsState, setTabsState] = useState<{ modules: ModuleModel[]; activeModuleId: string }>(() => {
    const first = createNewModuleFromSettings();
    return { modules: [first], activeModuleId: first.id };
  });

  const modules = tabsState.modules;
  const activeModuleId = tabsState.activeModuleId;

  const module = useMemo(() => {
    return (
      tabsState.modules.find((m) => m.id === tabsState.activeModuleId) ||
      tabsState.modules[0] ||
      createNewModuleFromSettings()
    );
  }, [tabsState]);

  const setModule = (action: React.SetStateAction<ModuleModel>) => {
    setTabsState((prev) => {
      const nextModules = prev.modules.map((m) => {
        if (m.id !== prev.activeModuleId) return m;
        const nextVal = typeof action === 'function' ? action(m) : action;
        // Always preserve the tab's current ID so activeModuleId and tabs never desync!
        return { ...nextVal, id: m.id };
      });
      return { ...prev, modules: nextModules };
    });
  };

  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedFillId, setSelectedFillId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isCustomProfileModalOpen, setIsCustomProfileModalOpen] = useState(false);
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isCellTemplatesModalOpen, setIsCellTemplatesModalOpen] = useState(false);
  const [isThemeManagerOpen, setIsThemeManagerOpen] = useState(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [editingStandaloneItem, setEditingStandaloneItem] = useState<StandaloneItem | null>(null);

  const [currentTheme, setCurrentTheme] = useState<ThemeDefinition>(() => {
    const active = getActiveTheme();
    applyThemeToDocument(active);
    return active;
  });

  const handleThemeChanged = (newTheme: ThemeDefinition) => {
    setCurrentTheme(newTheme);
    applyThemeToDocument(newTheme);
  };

  // Desktop Menu & Dimension display mode
  const [dimensionDisplayMode, setDimensionDisplayMode] = useState<DimensionDisplayMode>(() => {
    try {
      const saved = localStorage.getItem('spectool_dim_mode');
      if (saved) return saved as DimensionDisplayMode;
    } catch (_) {}
    return getUserSettings().defaultDimensionMode || 'selection_inputs';
  });

  const handleSetDimensionMode = (mode: DimensionDisplayMode) => {
    setDimensionDisplayMode(mode);
    try {
      localStorage.setItem('spectool_dim_mode', mode);
    } catch (_) {}
  };

  const [isDatabaseManagerOpen, setIsDatabaseManagerOpen] = useState(false);
  const [dbManagerInitialTab, setDbManagerInitialTab] = useState<'materials' | 'hardware' | 'processes'>('materials');

  const [panelVisibility, setPanelVisibility] = useState<{
    params: boolean;
    materials: boolean;
    hardware: boolean;
    table: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('spectool_panel_visibility');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      params: true,
      materials: true,
      hardware: true,
      table: true
    };
  });

  const togglePanelVisibility = (panel: 'params' | 'materials' | 'hardware' | 'table') => {
    setPanelVisibility((prev) => {
      const updated = { ...prev, [panel]: !prev[panel] };
      try {
        localStorage.setItem('spectool_panel_visibility', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Layout panel dimensions with local persistence
  const [layoutSizes, setLayoutSizes] = useState<{
    canvasWidth: number;
    paramsWidth: number;
    materialsWidth: number;
    hardwareWidth: number;
    tableHeight: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('spectool_layout_sizes');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      canvasWidth: 480,
      paramsWidth: 320,
      materialsWidth: 280,
      hardwareWidth: 290,
      tableHeight: 260
    };
  });

  const updateLayoutSize = (key: keyof typeof layoutSizes, delta: number, min = 160, max = 1200) => {
    setLayoutSizes((prev) => {
      const current = prev[key];
      const next = Math.max(min, Math.min(max, current + delta));
      const updated = { ...prev, [key]: next };
      try {
        localStorage.setItem('spectool_layout_sizes', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  // Real-time reactive BOM calculation
  const bomRows = useMemo(() => generateBOM(module), [module]);

  const selectedCell = module.cells.find((c) => c.id === selectedCellId) || null;
  const selectedLine = selectedCell
    ? null
    : (selectedLineId ? module.lines.find((l) => l.id === selectedLineId) || null : null);


  // Keep active profile safely in sync with currently selected line
  const activeProfileId = useMemo(() => {
    if (selectedCellId) return null;
    if (selectedLine) {
      if (selectedProfileId && selectedLine.profileBindings.some((p) => p.id === selectedProfileId)) {
        return selectedProfileId;
      }
      return selectedLine.profileBindings[0]?.id || null;
    }
    return null;
  }, [selectedLine, selectedProfileId, selectedCellId]);

  // Target description for status banners and hardware bindings
  const targetDescription = useMemo(() => {
    if (activeProfileId && selectedLine) {
      const prof = selectedLine.profileBindings.find((p) => p.id === activeProfileId);
      return prof ? `Профиль: ${prof.name} (${prof.customMark || prof.article})` : `Линия: ${selectedLine.name}`;
    }
    if (selectedCell) {
      const fills = normalizeCellFills(selectedCell);
      const activeF = fills.find((f) => f.id === selectedFillId) || fills[0];
      return activeF ? `Слой: ${activeF.name} [${activeF.mark || 'без марки'}]` : `Проём: ${selectedCell.name || 'Область'}`;
    }
    return undefined;
  }, [activeProfileId, selectedLine, selectedCell, selectedFillId]);

  // Clear Canvas Completely (Полностью чистый холст для черчения с нуля на основе пользовательских настроек)
  const handleClearCanvas = () => {
    const settings = getUserSettings();
    setModule(createNewModuleFromSettings(settings));
    setSelectedLineId(null);
    setSelectedCellId(null);
    setSelectedFillId(null);
    setSelectedProfileId(null);
  };

  // Add Box Contour (Быстро начертить замкнутый прямоугольник модуля L x H)
  const handleAddBoxContour = (w: number, h: number) => {
    const l1: LineSegment = {
      id: `line-left-${Date.now()}`,
      name: 'Левая рама',
      role: 'n L',
      orderNumber: 1,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: h,
      length: h,
      profileBindings: []
    };
    const l2: LineSegment = {
      id: `line-right-${Date.now() + 1}`,
      name: 'Правая рама',
      role: 'n R',
      orderNumber: 2,
      x1: w,
      y1: 0,
      x2: w,
      y2: h,
      length: h,
      profileBindings: []
    };
    const l3: LineSegment = {
      id: `line-bottom-${Date.now() + 2}`,
      name: 'Нижняя рама',
      role: 'Down',
      orderNumber: 3,
      x1: 0,
      y1: 0,
      x2: w,
      y2: 0,
      length: w,
      profileBindings: []
    };
    const l4: LineSegment = {
      id: `line-top-${Date.now() + 3}`,
      name: 'Верхняя рама',
      role: 'Up',
      orderNumber: 4,
      x1: 0,
      y1: h,
      x2: w,
      y2: h,
      length: w,
      profileBindings: []
    };

    const initialBoxCell: Cell = {
      id: `cell-box-${Date.now()}`,
      x: 0,
      y: 0,
      width: w,
      height: h,
      fillType: 'glass',
      name: 'Стеклопакет СПО 32мм',
      mark: 'СП-1',
      linkType: 'комплектующие',
      hasMaterial: false,
      material: '',
      materialName: '',
      processTemplate: '',
      planGroup: 'Комплектующие',
      glassWidth: Math.max(0, w - 50),
      glassHeight: Math.max(0, h - 50),
      thickness: 32,
      color: '#e0f2fe',
      dependencies: [],
      fills: [
        {
          id: `fill-box-${Date.now()}`,
          fillType: 'glass',
          name: 'Стеклопакет СПО 32мм',
          mark: 'СП-1',
          linkType: 'комплектующие',
          hasMaterial: false,
          material: '',
          materialName: '',
          processTemplate: '',
          planGroup: 'Комплектующие',
          widthOffset: -50,
          heightOffset: -50,
          width: Math.max(0, w - 50),
          height: Math.max(0, h - 50),
          thickness: 32,
          color: '#e0f2fe',
          dependencies: []
        }
      ]
    };

    setModule((prev) => ({
      ...prev,
      width: w,
      height: h,
      lines: [l1, l2, l3, l4],
      cells: [initialBoxCell]
    }));
    setSelectedLineId(l1.id);
    setSelectedCellId(null);
    setSelectedProfileId(null);
    setSelectedRuleId(null);
  };

  // Automatically detect closed rectangular cells/areas from drawn lines
  const handleAutoDetectCells = () => {
    const detected = detectCellsFromLines(module.lines, module.cells);
    if (detected.length === 0) {
      alert('Замкнутых областей между линиями не найдено. Начертите замкнутый контур из стоек и ригелей!');
      return;
    }
    setModule((prev) => ({
      ...prev,
      cells: detected
    }));
    if (detected[0]) {
      setSelectedCellId(detected[0].id);
      setSelectedLineId(null);
      setSelectedProfileId(null);
    }
  };

  // Delete Cell
  const handleDeleteCell = (cellId: string) => {
    setModule((prev) => ({
      ...prev,
      cells: prev.cells.filter((c) => c.id !== cellId)
    }));
    if (selectedCellId === cellId) {
      setSelectedCellId(null);
    }
  };

  // Update Dimensions
  const handleUpdateDimensions = (newWidth: number, newHeight: number) => {
    setModule((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight
    }));
  };

  // Add a newly drawn line
  const handleAddLine = (line: LineSegment) => {
    const nextOrder = module.lines.length + 1;
    const lineWithOrder: LineSegment = {
      ...line,
      orderNumber: line.orderNumber ?? nextOrder
    };
    setModule((prev) => ({
      ...prev,
      lines: [...prev.lines, lineWithOrder]
    }));
    setSelectedLineId(lineWithOrder.id);
    setSelectedCellId(null);
  };

  // Update line (e.g. moved endpoints or length typed)
  const handleUpdateLine = (updatedLine: LineSegment) => {
    setModule((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === updatedLine.id ? updatedLine : l))
    }));
  };

  // Delete line
  const handleDeleteLine = (lineId: string) => {
    setModule((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.id !== lineId)
    }));
    if (selectedLineId === lineId) {
      setSelectedLineId(null);
    }
  };

  // Update Cell
  const handleUpdateCell = (updatedCell: Cell) => {
    setModule((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => (c.id === updatedCell.id ? updatedCell : c))
    }));
  };

  // Update Profile on Line
  const handleUpdateProfile = (lineId: string, updatedProfile: ProfileBinding) => {
    setModule((prev) => ({
      ...prev,
      lines: prev.lines.map((line) => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          profileBindings: line.profileBindings.map((p) =>
            p.id === updatedProfile.id ? updatedProfile : p
          )
        };
      })
    }));
  };

  // Delete Profile on Line
  const handleDeleteProfile = (lineId: string, profId: string) => {
    setModule((prev) => ({
      ...prev,
      lines: prev.lines.map((line) => {
        if (line.id !== lineId) return line;
        return {
          ...line,
          profileBindings: line.profileBindings.filter((p) => p.id !== profId)
        };
      })
    }));
    if (selectedProfileId === profId) {
      setSelectedProfileId(null);
    }
  };

  // Bind a profile from the MaterialsTree catalog to the currently selected line
  const handleBindProfileFromTree = (profileItem: CatalogProfileItem) => {
    const targetLine = selectedLine;

    if (!targetLine) {
      alert('Сначала кликните на нужную линию на чертеже слева, чтобы выбрать её!');
      return;
    }

    const calcLength = Math.max(0, targetLine.length - profileItem.defaultOffset);
    const orderNum = targetLine.orderNumber ?? (targetLine.profileBindings?.[0]?.orderNumber || 1);
    const customMark = generateProfileMark(module.project, profileItem.article, targetLine.length, orderNum);

    const newProf: ProfileBinding = {
      id: `prof-${Date.now()}`,
      lineId: targetLine.id,
      role: targetLine.role,
      orderNumber: orderNum,
      article: profileItem.article,
      name: profileItem.name,
      customMark: customMark,
      company: profileItem.company,
      category: profileItem.category === 'frame_horizontal' ? 'transom' : 'profile',
      material: profileItem.article,
      materialName: 'Профиль алюминиевый',
      unit: 'шт',
      startOffset: profileItem.defaultOffset > 0 ? profileItem.defaultOffset / 2 : 0,
      endOffset: profileItem.defaultOffset > 0 ? profileItem.defaultOffset / 2 : 0,
      calculatedLength: calcLength,
      color: module.color || '',
      miterLeft: 90,
      miterRight: 90,
      planGroup: 'Профиль Алюминиевый',
      dependencies: []
    };

    setModule((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => {
        if (l.id !== targetLine.id) return l;
        return {
          ...l,
          profileBindings: [...l.profileBindings, newProf]
        };
      })
    }));

    setSelectedProfileId(newProf.id);
  };

  // Bind a material from the MaterialsTree catalog to the currently selected cell/fill
  const handleBindMaterialToSelectedCell = (item: CatalogMaterialItem) => {
    if (!selectedCellId) return;
    setModule((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => {
        if (c.id !== selectedCellId) return c;
        const fills = normalizeCellFills(c);
        const targetFillId = selectedFillId || fills[0]?.id;
        const updatedFills = fills.map((f) => {
          if (f.id === targetFillId) {
            return {
              ...f,
              hasMaterial: true,
              material: item.article,
              materialName: item.name,
              thickness: item.thickness || f.thickness || 1,
              linkType: 'деталь' as const,
              planGroup: 'Детали ЦМК'
            };
          }
          return f;
        });
        return syncCellWithPrimaryFill(c, updatedFills);
      })
    }));
  };

  const handleResetLayoutSizes = () => {
    const defaults = {
      canvasWidth: 480,
      paramsWidth: 320,
      materialsWidth: 300,
      hardwareWidth: 290,
      tableHeight: 260
    };
    setLayoutSizes(defaults);
    setPanelVisibility({
      params: true,
      materials: true,
      hardware: true,
      table: true
    });
    try {
      localStorage.setItem('spectool_layout_sizes', JSON.stringify(defaults));
      localStorage.removeItem('spectool_panel_visibility');
    } catch (_) {}
  };

  // Attach Material as Accessory (e.g. EF100.1901, MacTex rubber, insulation)
  const handleBindMaterialAsAccessory = (mat: CatalogMaterialItem) => {
    const isProfileTarget = !!(activeProfileId && selectedLine);
    const isCellTarget = !!selectedCell;

    if (!isProfileTarget && !isCellTarget) {
      alert('Сначала выберите профиль или ячейку на холсте для привязки комплектующего');
      return;
    }

    const isLinear = mat.unit === 'п.м.' || mat.unit === 'м';
    const activeFill = selectedCell
      ? (selectedCell.fills?.find((f) => f.id === selectedFillId) || selectedCell.fills?.[0])
      : null;
    const targetL = selectedLine
      ? selectedLine.length
      : (activeFill ? (activeFill.height || selectedCell?.height || 1000) : 1000);

    const newDep: DependencyRule = {
      id: `dep-${Date.now()}`,
      article: mat.code || mat.article,
      name: mat.name,
      type: mat.category === 'sheet' ? 'insulation' : 'gasket',
      unit: isLinear ? 'м' : ((mat.unit as any) || 'шт'),
      calcType: isLinear ? 'formula' : 'fixed',
      quantity: 1,
      formula: isLinear ? 'L / 1000' : undefined,
      evaluatedQty: isLinear ? Math.round((targetL / 1000) * 100) / 100 : 1
    };

    handleAddDependencyRule(newDep);
  };

  // Attach Hardware from HardwareDatabase
  const handleSelectHardwareFromDB = (item: CatalogHardwareItem) => {
    const isScrew = item.name.toLowerCase().includes('винт') || item.name.toLowerCase().includes('самонарез');
    const isGasket =
      item.type.toLowerCase().includes('уплотнитель') ||
      item.type.toLowerCase().includes('резина') ||
      item.type.toLowerCase().includes('шнур') ||
      item.length === 'м';

    const newDep: DependencyRule = {
      id: `dep-${Date.now()}`,
      article: item.article,
      name: item.name,
      type: isScrew ? 'fastener' : isGasket ? 'gasket' : 'hardware',
      unit: isGasket ? 'м' : 'шт',
      calcType: isScrew ? 'step' : isGasket ? 'formula' : 'fixed',
      quantity: 2,
      stepMm: isScrew ? 200 : undefined,
      formula: isScrew ? 'ROUNDUP(L / 200, 0) + 1' : isGasket ? 'ROUNDUP(L * 1.05 / 1000, 1)' : undefined,
      evaluatedQty: 2
    };

    handleAddDependencyRule(newDep);
  };

  // Add dependency rule (attaches to active profile or selected layer of cell)
  const handleAddDependencyRule = (rule: DependencyRule) => {
    if (selectedLineId && activeProfileId) {
      setModule((prev) => ({
        ...prev,
        lines: prev.lines.map((l) => {
          if (l.id !== selectedLineId) return l;
          return {
            ...l,
            profileBindings: l.profileBindings.map((p) => {
              if (p.id !== activeProfileId) return p;
              return {
                ...p,
                dependencies: [...p.dependencies, rule]
              };
            })
          };
        })
      }));
    } else if (selectedCellId) {
      setModule((prev) => ({
        ...prev,
        cells: prev.cells.map((c) => {
          if (c.id !== selectedCellId) return c;
          const fills = normalizeCellFills(c);
          const targetFillId = selectedFillId || fills[0]?.id;
          const updatedFills = fills.map((f) => {
            if (f.id === targetFillId) {
              return {
                ...f,
                dependencies: [...(f.dependencies || []), rule]
              };
            }
            return f;
          });
          return syncCellWithPrimaryFill(c, updatedFills);
        })
      }));
    } else if (selectedLineId) {
      // Line is selected, but no profile selected yet: bind to first profile or prompt
      const targetL = module.lines.find((l) => l.id === selectedLineId);
      if (targetL && targetL.profileBindings.length > 0) {
        const firstProf = targetL.profileBindings[0];
        setSelectedProfileId(firstProf.id);
        setModule((prev) => ({
          ...prev,
          lines: prev.lines.map((l) => {
            if (l.id !== selectedLineId) return l;
            return {
              ...l,
              profileBindings: l.profileBindings.map((p) => {
                if (p.id !== firstProf.id) return p;
                return {
                  ...p,
                  dependencies: [...p.dependencies, rule]
                };
              })
            };
          })
        }));
      } else {
        alert('К этой линии ещё не привязан профиль. Сначала кликните на профиль в колонке «БД: Профили»!');
      }
    } else {
      alert('Сначала выберите на чертеже деталь или линию!');
    }
  };

  // Remove dependency rule from profile or cell fill
  const handleRemoveDependency = (ruleId: string) => {
    setModule((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => ({
        ...l,
        profileBindings: l.profileBindings.map((p) => ({
          ...p,
          dependencies: (p.dependencies || []).filter((d) => d.id !== ruleId)
        }))
      })),
      cells: prev.cells.map((c) => {
        const fills = normalizeCellFills(c);
        const updatedFills = fills.map((f) => ({
          ...f,
          dependencies: (f.dependencies || []).filter((d) => d.id !== ruleId)
        }));
        return syncCellWithPrimaryFill({
          ...c,
          dependencies: (c.dependencies || []).filter((d) => d.id !== ruleId)
        }, updatedFills);
      })
    }));
  };

  // Update existing dependency rule in profile or cell fill
  const handleUpdateDependency = (updatedRule: DependencyRule) => {
    setModule((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => ({
        ...l,
        profileBindings: l.profileBindings.map((p) => ({
          ...p,
          dependencies: (p.dependencies || []).map((d) => (d.id === updatedRule.id ? updatedRule : d))
        }))
      })),
      cells: prev.cells.map((c) => {
        const fills = normalizeCellFills(c);
        const updatedFills = fills.map((f) => ({
          ...f,
          dependencies: (f.dependencies || []).map((d) => (d.id === updatedRule.id ? updatedRule : d))
        }));
        return syncCellWithPrimaryFill({
          ...c,
          dependencies: (c.dependencies || []).map((d) => (d.id === updatedRule.id ? updatedRule : d))
        }, updatedFills);
      })
    }));
  };

  // Two-way editing from the bottom Excel table (All 19 columns interactive)
  const handleUpdateBOMCell = (rowId: string, field: keyof BOMRow, value: any) => {
    const targetRow = bomRows.find((r) => r.id === rowId);
    if (!targetRow) return;

    if (targetRow.sourceType === 'profile') {
      for (const line of module.lines) {
        const prof = line.profileBindings.find((p) => p.id === targetRow.sourceId);
        if (prof) {
          const updatedProf = { ...prof };
          if (field === 'mark') updatedProf.customMark = value;
          else if (field === 'name') updatedProf.name = value;
          else if (field === 'materialMark') updatedProf.material = value;
          else if (field === 'materialName') updatedProf.materialName = value;
          else if (field === 'vgbL' || field === 'lengthMm') {
            const numVal = parseFloat(value) || 0;
            const newOffset = Math.max(0, line.length - numVal);
            updatedProf.startOffset = newOffset;
            updatedProf.calculatedLength = numVal;
          } else if (field === 'vgbColor') {
            updatedProf.color = value;
          } else if (field === 'processTemplate' || field === 'vgbPlanGroup') {
            updatedProf.planGroup = value;
          } else if (field === 'vgpLeft') {
            updatedProf.miterLeft = parseFloat(value) || undefined;
          } else if (field === 'vgpRight') {
            updatedProf.miterRight = parseFloat(value) || undefined;
          } else if (field === 'vgpLeft2') {
            updatedProf.miterLeft2 = parseFloat(value) || undefined;
          } else if (field === 'vgpRight2') {
            updatedProf.miterRight2 = parseFloat(value) || undefined;
          }
          handleUpdateProfile(line.id, updatedProf);
          break;
        }
      }
    } else if (targetRow.sourceType === 'cell') {
      const cell = module.cells.find((c) => c.id === targetRow.sourceId);
      if (cell) {
        const fillId = targetRow.id.replace(`bom-${cell.id}-`, '');
        const updatedFills = (cell.fills || []).map((f) => {
          if (f.id === fillId) {
            const u = { ...f };
            if (field === 'mark') u.mark = value;
            else if (field === 'name') u.name = value;
            else if (field === 'materialMark') u.material = value;
            else if (field === 'materialName') u.materialName = value;
            else if (field === 'processTemplate') u.processTemplate = value;
            else if (field === 'linkType') u.linkType = value;
            else if (field === 'vgbL') u.height = parseFloat(value) || u.height;
            else if (field === 'vgbB') u.width = parseFloat(value) || u.width;
            else if (field === 'vgbColor') u.color = value;
            return u;
          }
          return f;
        });

        const updatedCell: Cell = {
          ...cell,
          fills: updatedFills.length > 0 ? updatedFills : undefined,
          mark: field === 'mark' ? value : cell.mark,
          name: field === 'name' ? value : cell.name,
          material: field === 'materialMark' ? value : cell.material,
          materialName: field === 'materialName' ? value : cell.materialName,
          processTemplate: field === 'processTemplate' ? value : cell.processTemplate,
          linkType: field === 'linkType' ? value : cell.linkType,
          glassHeight: field === 'vgbL' ? parseFloat(value) || cell.glassHeight : cell.glassHeight,
          glassWidth: field === 'vgbB' ? parseFloat(value) || cell.glassWidth : cell.glassWidth,
          color: field === 'vgbColor' ? value : cell.color
        };
        handleUpdateCell(updatedCell);
      }
    } else if (targetRow.sourceType === 'accessory' || targetRow.sourceType === 'hardware') {
      // Find dependency in lines or cells
      setModule((prev) => ({
        ...prev,
        lines: prev.lines.map((l) => ({
          ...l,
          profileBindings: l.profileBindings.map((p) => ({
            ...p,
            dependencies: p.dependencies.map((d) => {
              if (d.id === targetRow.sourceId) {
                const updated = { ...d };
                if (field === 'mark') updated.article = value;
                if (field === 'name') updated.name = value;
                if (field === 'specQty') {
                  updated.quantity = parseFloat(value) || 1;
                  updated.evaluatedQty = updated.quantity;
                  updated.calcType = 'fixed';
                }
                if (field === 'specUnit' || field === 'materialUnit') updated.unit = value;
                return updated;
              }
              return d;
            })
          }))
        })),
        cells: prev.cells.map((c) => ({
          ...c,
          dependencies: (c.dependencies || []).map((d) => {
            if (d.id === targetRow.sourceId) {
              const updated = { ...d };
              if (field === 'mark') updated.article = value;
              if (field === 'name') updated.name = value;
              if (field === 'specQty') {
                updated.quantity = parseFloat(value) || 1;
                updated.evaluatedQty = updated.quantity;
                updated.calcType = 'fixed';
              }
              if (field === 'specUnit' || field === 'materialUnit') updated.unit = value;
              return updated;
            }
            return d;
          }),
          fills: (c.fills || []).map((f) => ({
            ...f,
            dependencies: (f.dependencies || []).map((d) => {
              if (d.id === targetRow.sourceId) {
                const updated = { ...d };
                if (field === 'mark') updated.article = value;
                if (field === 'name') updated.name = value;
                if (field === 'specQty') {
                  updated.quantity = parseFloat(value) || 1;
                  updated.evaluatedQty = updated.quantity;
                  updated.calcType = 'fixed';
                }
                if (field === 'specUnit' || field === 'materialUnit') updated.unit = value;
                return updated;
              }
              return d;
            })
          }))
        }))
      }));
    } else if (targetRow.sourceType === 'standalone') {
      setModule((prev) => ({
        ...prev,
        standaloneItems: (prev.standaloneItems || []).map((item) => {
          if (item.id !== targetRow.sourceId) return item;
          const updated = { ...item };
          if (field === 'mark') updated.mark = value;
          if (field === 'name') updated.name = value;
          if (field === 'materialMark') updated.material = value;
          if (field === 'materialName') updated.materialName = value;
          if (field === 'processTemplate') updated.processTemplate = value;
          if (field === 'linkType') updated.linkType = value;
          if (field === 'specQty') updated.quantity = parseFloat(value) || 1;
          if (field === 'specUnit') updated.unit = value;
          if (field === 'vgbPlanGroup') updated.planGroup = value;
          if (field === 'vgbL' || field === 'lengthMm') updated.lengthMm = parseFloat(value) || undefined;
          if (field === 'vgbB' || field === 'widthMm') updated.widthMm = parseFloat(value) || undefined;
          if (field === 'vgbColor') updated.color = value;
          if (field === 'vgpLeft') updated.miterLeft = parseFloat(value) || undefined;
          if (field === 'vgpRight') updated.miterRight = parseFloat(value) || undefined;
          return updated;
        })
      }));
    }
  };

  // Standalone Items Handlers
  const handleSaveStandaloneItem = (item: StandaloneItem) => {
    setModule((prev) => {
      const items = prev.standaloneItems || [];
      const exists = items.some((it) => it.id === item.id);
      return {
        ...prev,
        standaloneItems: exists
          ? items.map((it) => (it.id === item.id ? item : it))
          : [...items, item]
      };
    });
    setEditingStandaloneItem(null);
  };

  const handleDeleteStandaloneItem = (id: string) => {
    setModule((prev) => ({
      ...prev,
      standaloneItems: (prev.standaloneItems || []).filter((it) => it.id !== id)
    }));
  };

  // Export / Import Projects & Specifications
  const handleExportProject = () => {
    exportProjectFile(module);
  };

  const handleImportFile = async (file: File) => {
    try {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.spectool') || lowerName.endsWith('.json')) {
        const imported = await importProjectFile(file);
        setModule(imported);
        if (imported.lines.length > 0) {
          setSelectedLineId(imported.lines[0].id);
          setSelectedProfileId(imported.lines[0].profileBindings[0]?.id || null);
        }
        alert(`Проект "${file.name}" успешно загружен!`);
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        const spec = await importSpecificationFromExcel(file);
        setModule((prev) => ({
          ...prev,
          width: spec.width || prev.width,
          height: spec.height || prev.height,
          project: spec.projectName || prev.project,
          name: spec.moduleName || prev.name,
          color: spec.color || prev.color,
          standaloneItems: [
            ...(prev.standaloneItems || []),
            ...spec.standaloneItems
          ]
        }));
        alert(
          `Спецификация "${file.name}" импортирована!\n` +
          `Габариты модуля: L = ${spec.width || 'сохранено'} мм, H = ${spec.height || 'сохранено'} мм\n` +
          `Добавлено позиций: ${spec.standaloneItems.length} (кронштейны, закладные, узлы)`
        );
      }
    } catch (err) {
      alert(`Ошибка импорта файла: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSelectLine = (id: string | null) => {
    setSelectedLineId(id);
    if (id) {
      setSelectedCellId(null);
      setSelectedFillId(null);
      const l = module.lines.find((line) => line.id === id);
      if (l && l.profileBindings && l.profileBindings.length > 0) {
        setSelectedProfileId(l.profileBindings[0].id);
      } else {
        setSelectedProfileId(null);
      }
    } else {
      setSelectedProfileId(null);
    }
  };

  const handleSelectCell = (id: string | null) => {
    setSelectedCellId(id);
    if (id) {
      setSelectedLineId(null);
      setSelectedProfileId(null);
      const targetCell = module.cells.find((c) => c.id === id);
      if (targetCell) {
        const fills = normalizeCellFills(targetCell);
        if (!selectedFillId || !fills.some((f) => f.id === selectedFillId)) {
          setSelectedFillId(fills[0]?.id || null);
        }
      }
    } else {
      setSelectedFillId(null);
    }
  };

  const handleSelectRow = (sourceType: string, sourceId: string, fillId?: string) => {
    if (sourceType === 'profile') {
      for (const l of module.lines) {
        if (l.profileBindings.some((p) => p.id === sourceId)) {
          setSelectedLineId(l.id);
          setSelectedProfileId(sourceId);
          setSelectedCellId(null);
          setSelectedFillId(null);
          break;
        }
      }
    } else if (sourceType === 'cell') {
      setSelectedCellId(sourceId);
      setSelectedFillId(fillId || null);
      setSelectedLineId(null);
      setSelectedProfileId(null);
    } else if (sourceType === 'accessory') {
      for (const l of module.lines) {
        const parentProf = l.profileBindings.find((p) =>
          p.dependencies.some((d) => d.id === sourceId)
        );
        if (parentProf) {
          setSelectedLineId(l.id);
          setSelectedProfileId(parentProf.id);
          setSelectedCellId(null);
          setSelectedFillId(null);
          setSelectedRuleId(sourceId);
          return;
        }
      }
      for (const c of module.cells) {
        const fills = normalizeCellFills(c);
        for (const f of fills) {
          if ((f.dependencies || []).some((d) => d.id === sourceId)) {
            setSelectedCellId(c.id);
            setSelectedFillId(f.id);
            setSelectedLineId(null);
            setSelectedProfileId(null);
            setSelectedRuleId(sourceId);
            return;
          }
        }
        if (c.dependencies.some((d) => d.id === sourceId)) {
          setSelectedCellId(c.id);
          setSelectedFillId(fills[0]?.id || null);
          setSelectedLineId(null);
          setSelectedProfileId(null);
          setSelectedRuleId(sourceId);
          return;
        }
      }
    } else if (sourceType === 'standalone') {
      const found = (module.standaloneItems || []).find((it) => it.id === sourceId);
      if (found) {
        setEditingStandaloneItem(found);
        setIsStandaloneModalOpen(true);
      }
    }
  };

  const handleLoadPreset = () => {
    const def = createDefaultModule();
    setModule(def);
    const selLine = def.lines.find((l) => l.id === 'line-right') || def.lines[0];
    setSelectedLineId(selLine?.id || null);
    setSelectedCellId(null);
    setSelectedFillId(null);
    setSelectedProfileId(selLine?.profileBindings[0]?.id || null);
  };

  // Module Tabs Management
  const handleSelectModule = (id: string) => {
    setTabsState((prev) => ({ ...prev, activeModuleId: id }));
    setSelectedLineId(null);
    setSelectedCellId(null);
    setSelectedFillId(null);
    setSelectedProfileId(null);
  };

  const handleNewModuleTab = () => {
    const settings = getUserSettings();
    const tabNum = tabsState.modules.length + 1;
    const newMod: ModuleModel = {
      ...createNewModuleFromSettings(settings),
      id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `Модуль ${tabNum}`
    };
    setTabsState((prev) => ({
      modules: [...prev.modules, newMod],
      activeModuleId: newMod.id
    }));
    setSelectedLineId(null);
    setSelectedCellId(null);
    setSelectedFillId(null);
    setSelectedProfileId(null);
  };

  const handleDuplicateModuleTab = (id: string) => {
    setTabsState((prev) => {
      const target =
        prev.modules.find((m) => m.id === id) ||
        prev.modules.find((m) => m.id === prev.activeModuleId) ||
        prev.modules[0];
      if (!target) return prev;
      const cloned: ModuleModel = {
        ...JSON.parse(JSON.stringify(target)),
        id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: `${target.name || 'Модуль'} (Копия)`
      };
      return {
        modules: [...prev.modules, cloned],
        activeModuleId: cloned.id
      };
    });
    setSelectedLineId(null);
    setSelectedCellId(null);
    setSelectedFillId(null);
    setSelectedProfileId(null);
  };

  const handleCloseModuleTab = (id: string) => {
    setTabsState((prev) => {
      if (prev.modules.length <= 1) return prev;
      const nextModules = prev.modules.filter((m) => m.id !== id);
      const nextActiveId =
        prev.activeModuleId === id
          ? nextModules[nextModules.length - 1].id
          : prev.activeModuleId;
      return { modules: nextModules, activeModuleId: nextActiveId };
    });
    setSelectedLineId(null);
    setSelectedCellId(null);
    setSelectedFillId(null);
    setSelectedProfileId(null);
  };

  const handleLoadPresetTab = () => {
    const def = createDefaultModule();
    const newPresetMod: ModuleModel = {
      ...def,
      id: `mod-${Date.now()}`,
      name: `${def.name} (Копия)`
    };
    setTabsState((prev) => ({
      modules: [...prev.modules, newPresetMod],
      activeModuleId: newPresetMod.id
    }));
    const selLine = newPresetMod.lines.find((l) => l.id === 'line-right') || newPresetMod.lines[0];
    setSelectedLineId(selLine?.id || null);
    setSelectedCellId(null);
    setSelectedFillId(null);
    setSelectedProfileId(selLine?.profileBindings[0]?.id || null);
  };

  const handleRenameModule = (id: string, newName: string) => {
    setTabsState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === id ? { ...m, name: newName } : m))
    }));
  };

  const handleApplyUserSettings = (newSettings: UserSettings) => {
    setDimensionDisplayMode(newSettings.defaultDimensionMode);
    setModule((prev) => ({
      ...prev,
      project: prev.project === 'ПРОЕКТ' ? newSettings.defaultProjectCode : prev.project,
      color: prev.color || newSettings.defaultPrimaryColor,
      colors: prev.colors && prev.colors.length > 0 ? prev.colors : [...newSettings.defaultColors]
    }));
  };

  // Listen to native Electron Application Menu actions
  React.useEffect(() => {
    if (!window.electronAPI?.onMenuAction) return;
    const cleanup = window.electronAPI.onMenuAction((action) => {
      switch (action) {
        case 'menu-new':
        case 'menu-new-tab':
          handleNewModuleTab();
          break;
        case 'menu-duplicate-tab':
          handleDuplicateModuleTab(activeModuleId);
          break;
        case 'menu-close-tab':
          handleCloseModuleTab(activeModuleId);
          break;
        case 'menu-open-themes':
          setIsThemeManagerOpen(true);
          break;
        case 'menu-open-cell-templates':
          setIsCellTemplatesModalOpen(true);
          break;
        case 'menu-import': {
          const inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = '.xlsx, .xls, .spectool, .json';
          inp.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleImportFile(file);
          };
          inp.click();
          break;
        }
        case 'menu-save':
          handleExportProject();
          break;
        case 'menu-export-excel':
          exportToExcel(module, bomRows);
          break;
        case 'menu-load-example':
          handleLoadPreset();
          break;
        case 'menu-clear':
          handleClearCanvas();
          break;
        case 'menu-add-outer-frame':
          handleAddBoxContour(module.width, module.height);
          break;
        case 'menu-add-standalone':
          setEditingStandaloneItem(null);
          setIsStandaloneModalOpen(true);
          break;
        case 'menu-open-numbering': {
          const btn = document.querySelector('button[title*="Таблица порядковых номеров"]') as HTMLButtonElement;
          btn?.click();
          break;
        }
        case 'menu-dim-inputs':
          handleSetDimensionMode('selection_inputs');
          break;
        case 'menu-dim-chains':
          handleSetDimensionMode('outer_chains');
          break;
        case 'menu-dim-all':
          handleSetDimensionMode('all_lines');
          break;
        case 'menu-dim-hidden':
          handleSetDimensionMode('hidden');
          break;
        case 'menu-toggle-params':
          togglePanelVisibility('params');
          break;
        case 'menu-toggle-materials':
          togglePanelVisibility('materials');
          break;
        case 'menu-toggle-hardware':
          togglePanelVisibility('hardware');
          break;
        case 'menu-toggle-table':
          togglePanelVisibility('table');
          break;
        case 'menu-open-user-settings':
          setIsUserSettingsOpen(true);
          break;
        case 'menu-open-db':
          setIsDatabaseManagerOpen(true);
          break;
        case 'menu-open-colors': {
          const btn = document.querySelector('button[title*="Настроить цвета проекта"]') as HTMLButtonElement;
          btn?.click();
          break;
        }
        case 'menu-open-naming':
          setIsNamingModalOpen(true);
          break;
        case 'menu-open-process':
          setIsProcessModalOpen(true);
          break;
        case 'menu-reset-layout':
          handleResetLayoutSizes();
          break;
        case 'menu-about':
          alert('Spectool v2.1.2 — Инженерный CAD/BIM-конструктор фасадных модулей и BOM-спецификаций.');
          break;
      }
    });
    return cleanup;
  }, [module, bomRows]);

  return (
    <div
      className="h-screen w-screen flex flex-col font-sans overflow-hidden transition-colors duration-200"
      style={{
        background: 'var(--app-bg, #f8fafc)',
        color: 'var(--text-main, #0f172a)'
      }}
    >
      {/* 1. Desktop Application Menu Bar (rendered when in web mode; Electron uses native top menu bar) */}
      {!window.electronAPI?.isElectron && (
        <MenuBar
          dimensionMode={dimensionDisplayMode}
          onChangeDimensionMode={handleSetDimensionMode}
          onNewEmptyModule={handleClearCanvas}
          onLoadPreset={handleLoadPreset}
          onImportClick={() => {
            const inp = document.createElement('input');
            inp.type = 'file';
            inp.accept = '.xlsx, .xls, .spectool, .json';
            inp.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleImportFile(file);
            };
            inp.click();
          }}
          onExportProject={handleExportProject}
          onExportExcel={() => exportToExcel(module, bomRows)}
          onClearCanvas={handleClearCanvas}
          onAddBoxContour={() => handleAddBoxContour(module.width, module.height)}
          onOpenDatabaseManager={(tab) => {
            setDbManagerInitialTab(tab || 'materials');
            setIsDatabaseManagerOpen(true);
          }}
          onOpenUserSettings={() => setIsUserSettingsOpen(true)}
          onOpenColorManager={() => {
            const btn = document.querySelector('button[title*="Настроить цвета проекта"]') as HTMLButtonElement;
            btn?.click();
          }}
          onOpenNamingModal={() => setIsNamingModalOpen(true)}
          onOpenProcessTemplatesModal={() => setIsProcessModalOpen(true)}
          onOpenCellTemplatesModal={() => setIsCellTemplatesModalOpen(true)}
          onOpenStandaloneModal={() => {
            setEditingStandaloneItem(null);
            setIsStandaloneModalOpen(true);
          }}
          onOpenNumberingPopover={() => {
            const btn = document.querySelector('button[title*="Таблица порядковых номеров"]') as HTMLButtonElement;
            btn?.click();
          }}
          onResetLayout={handleResetLayoutSizes}
          onOpenAboutModal={() => {
            alert('Spectool v2.1.4 — Инженерный CAD/BIM-конструктор фасадных модулей и BOM-спецификаций.');
          }}
          onOpenThemeManager={() => setIsThemeManagerOpen(true)}
          activeThemeName={currentTheme.name}
          panelVisibility={panelVisibility}
          onTogglePanel={togglePanelVisibility}
        />
      )}

      {/* 2. Multi-Module Tabs Bar */}
      <ModuleTabBar
        modules={modules}
        activeModuleId={activeModuleId}
        onSelectModule={handleSelectModule}
        onNewEmptyModule={handleNewModuleTab}
        onDuplicateModule={handleDuplicateModuleTab}
        onCloseModule={handleCloseModuleTab}
        onLoadPreset={handleLoadPresetTab}
        onRenameModule={handleRenameModule}
      />

      {/* 3. Top Header bar */}
      <Header
        module={module}
        bomRows={bomRows}
        selectedLineId={selectedLineId}
        onSelectLine={handleSelectLine}
        onUpdateLines={(lines) => setModule((m) => ({ ...m, lines }))}
        onUpdateColor={(color) => setModule((m) => ({ ...m, color }))}
        onUpdateColorsList={(colors) => setModule((m) => ({ ...m, colors }))}
        onUpdateModuleName={(name) => setModule((m) => ({ ...m, name }))}
        onUpdateProjectName={(project) => setModule((m) => ({ ...m, project }))}
        onUpdateDimensions={handleUpdateDimensions}
        onNewEmptyModule={handleClearCanvas}
        onLoadPreset={handleLoadPreset}
        onOpenNamingModal={() => setIsNamingModalOpen(true)}
        onOpenProcessTemplatesModal={() => setIsProcessModalOpen(true)}
        onOpenStandaloneItemModal={() => {
          setEditingStandaloneItem(null);
          setIsStandaloneModalOpen(true);
        }}
        onExportProject={handleExportProject}
        onImportFile={handleImportFile}
      />

      {/* Main Upper Workspace with 5 organized panels and interactive column splitters */}
      <div
        className="flex-1 flex overflow-x-auto p-2.5 gap-1 min-h-0"
        style={{ background: 'transparent' }}
      >
        {/* Column 1: Interactive Canvas for Drawing Lines with mouse */}
        <Canvas
          module={module}
          selectedLineId={selectedLineId}
          selectedCellId={selectedCellId}
          dimensionDisplayMode={dimensionDisplayMode}
          onChangeDimensionMode={handleSetDimensionMode}
          theme={currentTheme}
          width={layoutSizes.canvasWidth}
          onSelectLine={handleSelectLine}
          onSelectCell={handleSelectCell}
          onAddLine={handleAddLine}
          onUpdateLine={handleUpdateLine}
          onDeleteLine={handleDeleteLine}
          onClearCanvas={handleClearCanvas}
          onAddBoxContour={handleAddBoxContour}
          onDetectCells={handleAutoDetectCells}
        />

        {/* Resizable Divider 1-2 */}
        {panelVisibility.params && (
          <>
            <ResizeDivider
              direction="vertical"
              onResize={(dx) => updateLayoutSize('canvasWidth', dx, 320, 950)}
              title="Потяните для изменения ширины холста"
            />

            {/* Column 2: "Окно параметров" (ParametersBox) right next to canvas */}
            <ParametersBox
              allLines={module.lines}
              allCells={module.cells}
              selectedLine={selectedLine}
              selectedCell={selectedCell}
              selectedProfileId={activeProfileId}
              selectedFillId={selectedFillId}
              width={layoutSizes.paramsWidth}
              projectCode={module.project}
              projectColors={module.colors && module.colors.length > 0 ? module.colors : [module.color || 'RAL 7012']}
              onSelectLine={handleSelectLine}
              onSelectCell={handleSelectCell}
              onSelectFill={setSelectedFillId}
              onUpdateLine={handleUpdateLine}
              onDeleteLine={handleDeleteLine}
              onUpdateCell={handleUpdateCell}
              onDeleteCell={handleDeleteCell}
              onUpdateProfile={handleUpdateProfile}
              onDeleteProfile={handleDeleteProfile}
              onSelectProfile={setSelectedProfileId}
              onAddDependencyToTarget={handleAddDependencyRule}
              onRemoveDependency={handleRemoveDependency}
              onOpenCellTemplatesModal={() => setIsCellTemplatesModalOpen(true)}
            />
          </>
        )}

        {/* Resizable Divider 2-3 */}
        {panelVisibility.materials && (
          <>
            <ResizeDivider
              direction="vertical"
              onResize={(dx) => updateLayoutSize('paramsWidth', dx, 240, 600)}
              title="Потяните для изменения ширины окна параметров"
            />

            {/* Column 3: БД: Материалы и Профили */}
            <MaterialsTree
              selectedLineId={selectedLineId}
              selectedProfileId={activeProfileId}
              selectedCellId={selectedCellId}
              width={layoutSizes.materialsWidth}
              onBindProfileToSelectedLine={handleBindProfileFromTree}
              onBindAsCellMaterial={handleBindMaterialToSelectedCell}
              onBindAsAccessory={handleBindMaterialAsAccessory}
              onOpenDatabaseManager={() => {
                setDbManagerInitialTab('materials');
                setIsDatabaseManagerOpen(true);
              }}
              onAddCustomProfile={() => setIsCustomProfileModalOpen(true)}
            />
          </>
        )}

        {/* Resizable Divider 3-4 */}
        {panelVisibility.hardware && (
          <>
            <ResizeDivider
              direction="vertical"
              onResize={(dx) => updateLayoutSize('materialsWidth', dx, 200, 550)}
              title="Потяните для изменения ширины базы профилей"
            />

            {/* Column 4: БД: Метизы и Комплектующие */}
            <HardwareDatabase
              selectedLineId={selectedLineId}
              selectedProfileId={activeProfileId}
              selectedCellId={selectedCellId}
              selectedFillId={selectedFillId}
              targetDescription={targetDescription}
              width={layoutSizes.hardwareWidth}
              onSelectHardware={handleSelectHardwareFromDB}
              onOpenDatabaseManager={() => {
                setDbManagerInitialTab('hardware');
                setIsDatabaseManagerOpen(true);
              }}
            />
          </>
        )}

        {/* Resizable Divider 4-5 */}
        <ResizeDivider
          direction="vertical"
          onResize={(dx) => updateLayoutSize('hardwareWidth', dx, 200, 550)}
          title="Потяните для изменения ширины базы метизов"
        />

        {/* Column 5: Привязки и Зависимости */}
        <DependenciesPanel
          selectedLine={selectedLine}
          selectedProfileId={activeProfileId}
          selectedCell={selectedCell}
          selectedFillId={selectedFillId}
          selectedRuleId={selectedRuleId}
          onAddDependency={handleAddDependencyRule}
          onUpdateDependency={handleUpdateDependency}
          onRemoveDependency={handleRemoveDependency}
        />
      </div>

      {/* Horizontal Resizable Divider between Upper Workspace and Bottom Table */}
      {panelVisibility.table && (
        <>
          <ResizeDivider
            direction="horizontal"
            onResize={(dy) => updateLayoutSize('tableHeight', dy, 140, 650)}
            title="Потяните вверх/вниз для изменения высоты таблицы спецификации"
          />

          {/* Bottom Live BOM Table (Full Width 19-Column Excel-like Sheet) */}
          <SpecificationTable
            module={module}
            bomRows={bomRows}
            selectedSourceId={activeProfileId || selectedCellId || selectedLineId}
            selectedFillId={selectedFillId}
            height={layoutSizes.tableHeight}
            onSelectRow={handleSelectRow}
            onUpdateBOMCell={handleUpdateBOMCell}
            onAddStandaloneItem={() => {
              setEditingStandaloneItem(null);
              setIsStandaloneModalOpen(true);
            }}
            onEditStandaloneItem={(item) => {
              setEditingStandaloneItem(item);
              setIsStandaloneModalOpen(true);
            }}
            onDeleteStandaloneItem={handleDeleteStandaloneItem}
          />
        </>
      )}

      {/* Add Custom Profile Modal */}
      <CustomProfileModal
        isOpen={isCustomProfileModalOpen}
        onClose={() => setIsCustomProfileModalOpen(false)}
        onAddProfile={(newP) => {
          handleBindProfileFromTree(newP);
        }}
      />

      {/* Naming Formula Configuration Modal */}
      <NamingFormulaModal
        isOpen={isNamingModalOpen}
        onClose={() => setIsNamingModalOpen(false)}
        projectCode={module.project}
        onPatternChanged={(pat) => {
          setModule((m) => ({
            ...m,
            namingPattern: pat,
            lines: m.lines.map((l) => ({
              ...l,
              profileBindings: l.profileBindings.map((p) => {
                const cutL = p.calculatedLength !== undefined ? p.calculatedLength : l.length;
                return {
                  ...p,
                  customMark: generateProfileMark(m.project, p.article, l.length, p.orderNumber || 1, cutL, pat)
                };
              })
            }))
          }));
        }}
      />

      {/* Technological Process Templates DB Modal */}
      <ProcessTemplatesModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
      />

      {/* Unified Database Manager Modal */}
      <DatabaseManagerModal
        isOpen={isDatabaseManagerOpen}
        initialTab={dbManagerInitialTab}
        onClose={() => setIsDatabaseManagerOpen(false)}
      />

      {/* Standalone Part / Assembly Modal (Кронштейны, закладные) */}
      <StandaloneItemModal
        isOpen={isStandaloneModalOpen}
        initialItem={editingStandaloneItem}
        projectCode={module.project}
        defaultColor={module.color || 'RAL 7012'}
        onClose={() => {
          setIsStandaloneModalOpen(false);
          setEditingStandaloneItem(null);
        }}
        onSave={handleSaveStandaloneItem}
      />

      {/* User Default Settings & Preferences Modal */}
      <UserSettingsModal
        isOpen={isUserSettingsOpen}
        onClose={() => setIsUserSettingsOpen(false)}
        onApplySettings={handleApplyUserSettings}
        onOpenCellTemplatesModal={() => setIsCellTemplatesModalOpen(true)}
      />

      {/* Cell Fill Templates Configuration Modal */}
      <CellTemplatesModal
        isOpen={isCellTemplatesModalOpen}
        onClose={() => setIsCellTemplatesModalOpen(false)}
      />

      {/* Theme Manager and Theme Constructor Modal */}
      <ThemeManagerModal
        isOpen={isThemeManagerOpen}
        onClose={() => setIsThemeManagerOpen(false)}
        onThemeChanged={handleThemeChanged}
      />

      {/* Floating Agent UI Feedback & Review Tool */}
      <AgentFeedbackOverlay />
    </div>
  );
};
