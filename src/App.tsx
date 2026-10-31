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
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { ParametersBox } from './components/ParametersBox';
import { MaterialsTree } from './components/MaterialsTree';
import { HardwareDatabase } from './components/HardwareDatabase';
import { DependenciesPanel } from './components/DependenciesPanel';
import { SpecificationTable } from './components/SpecificationTable';
import { CustomProfileModal } from './components/CustomProfileModal';
import { AgentFeedbackOverlay } from './components/AgentFeedbackOverlay';
import { ResizeDivider } from './components/ResizeDivider';

export const App: React.FC = () => {
  const [module, setModule] = useState<ModuleModel>(createDefaultModule);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(() => {
    const def = createDefaultModule();
    return def.lines.find((l) => l.id === 'line-right')?.id || def.lines[0]?.id || null;
  });
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(() => {
    const def = createDefaultModule();
    const r = def.lines.find((l) => l.id === 'line-right') || def.lines[0];
    return r?.profileBindings[0]?.id || null;
  });
  const [isCustomProfileModalOpen, setIsCustomProfileModalOpen] = useState(false);

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

  // Clear Canvas Completely (Полностью чистый холст для черчения с нуля)
  const handleClearCanvas = () => {
    setModule((prev) => ({
      ...prev,
      lines: [],
      cells: []
    }));
    setSelectedLineId(null);
    setSelectedCellId(null);
    setSelectedProfileId(null);
  };

  // Add Box Contour (Быстро начертить замкнутый прямоугольник модуля L x H)
  const handleAddBoxContour = (w: number, h: number) => {
    const l1: LineSegment = {
      id: `line-left-${Date.now()}`,
      name: 'Левая рама',
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
      dependencies: []
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
    setModule((prev) => ({
      ...prev,
      lines: [...prev.lines, line]
    }));
    setSelectedLineId(line.id);
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

    const newProf: ProfileBinding = {
      id: `prof-${Date.now()}`,
      lineId: targetLine.id,
      article: profileItem.article,
      name: profileItem.name,
      customMark: `${module.project || 'А1187'} ${profileItem.article.slice(-4)}-${calcLength}`,
      company: profileItem.company,
      category: profileItem.category === 'frame_horizontal' ? 'transom' : 'profile',
      material: profileItem.article,
      materialName: 'Профиль алюминиевый',
      unit: 'шт',
      startOffset: profileItem.defaultOffset > 0 ? profileItem.defaultOffset / 2 : 0,
      endOffset: profileItem.defaultOffset > 0 ? profileItem.defaultOffset / 2 : 0,
      calculatedLength: calcLength,
      color: module.color || 'RAL 7012',
      miterLeft: 500,
      miterRight: 500,
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

  // Add dependency rule
  const handleAddDependencyRule = (rule: DependencyRule) => {
    if (selectedLineId && selectedProfileId) {
      setModule((prev) => ({
        ...prev,
        lines: prev.lines.map((l) => {
          if (l.id !== selectedLineId) return l;
          return {
            ...l,
            profileBindings: l.profileBindings.map((p) => {
              if (p.id !== selectedProfileId) return p;
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
          return {
            ...c,
            dependencies: [...c.dependencies, rule]
          };
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

  // Remove dependency rule
  const handleRemoveDependency = (ruleId: string) => {
    setModule((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => ({
        ...l,
        profileBindings: l.profileBindings.map((p) => ({
          ...p,
          dependencies: p.dependencies.filter((d) => d.id !== ruleId)
        }))
      })),
      cells: prev.cells.map((c) => ({
        ...c,
        dependencies: c.dependencies.filter((d) => d.id !== ruleId)
      }))
    }));
  };

  // Update existing dependency rule
  const handleUpdateDependency = (updatedRule: DependencyRule) => {
    setModule((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => ({
        ...l,
        profileBindings: l.profileBindings.map((p) => ({
          ...p,
          dependencies: p.dependencies.map((d) => (d.id === updatedRule.id ? updatedRule : d))
        }))
      })),
      cells: prev.cells.map((c) => ({
        ...c,
        dependencies: c.dependencies.map((d) => (d.id === updatedRule.id ? updatedRule : d))
      }))
    }));
  };

  // Two-way editing from the bottom Excel table
  const handleUpdateBOMCell = (rowId: string, field: keyof BOMRow, value: any) => {
    const targetRow = bomRows.find((r) => r.id === rowId);
    if (!targetRow) return;

    if (targetRow.sourceType === 'profile') {
      for (const line of module.lines) {
        const prof = line.profileBindings.find((p) => p.id === targetRow.sourceId);
        if (prof) {
          if (field === 'mark') {
            handleUpdateProfile(line.id, { ...prof, customMark: value });
          } else if (field === 'name') {
            handleUpdateProfile(line.id, { ...prof, name: value });
          } else if (field === 'vgbL' || field === 'lengthMm') {
            const numVal = parseFloat(value) || 0;
            const newOffset = Math.max(0, line.length - numVal);
            handleUpdateProfile(line.id, { ...prof, startOffset: newOffset, calculatedLength: numVal });
          }
          break;
        }
      }
    } else if (targetRow.sourceType === 'cell') {
      const cell = module.cells.find((c) => c.id === targetRow.sourceId);
      if (cell) {
        if (field === 'mark') handleUpdateCell({ ...cell, mark: value });
        if (field === 'name') handleUpdateCell({ ...cell, name: value });
      }
    }
  };

  const handleSelectLine = (id: string | null) => {
    setSelectedLineId(id);
    if (id) {
      setSelectedCellId(null);
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
    }
  };

  const handleSelectRow = (sourceType: string, sourceId: string) => {
    if (sourceType === 'profile') {
      for (const l of module.lines) {
        if (l.profileBindings.some((p) => p.id === sourceId)) {
          setSelectedLineId(l.id);
          setSelectedProfileId(sourceId);
          setSelectedCellId(null);
          break;
        }
      }
    } else if (sourceType === 'cell') {
      setSelectedCellId(sourceId);
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
          setSelectedRuleId(sourceId);
          return;
        }
      }
      for (const c of module.cells) {
        if (c.dependencies.some((d) => d.id === sourceId)) {
          setSelectedCellId(c.id);
          setSelectedLineId(null);
          setSelectedProfileId(null);
          setSelectedRuleId(sourceId);
          return;
        }
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* Header bar */}
      <Header
        module={module}
        bomRows={bomRows}
        onUpdateModuleName={(name) => setModule((m) => ({ ...m, name }))}
        onUpdateProjectName={(project) => setModule((m) => ({ ...m, project }))}
        onUpdateDimensions={handleUpdateDimensions}
        onNewEmptyModule={handleClearCanvas}
        onLoadPreset={() => {
          const def = createDefaultModule();
          setModule(def);
          const selLine = def.lines.find((l) => l.id === 'line-right') || def.lines[0];
          setSelectedLineId(selLine?.id || null);
          setSelectedCellId(null);
          setSelectedProfileId(selLine?.profileBindings[0]?.id || null);
        }}
        onImportExcel={(imp) => setModule((m) => ({ ...m, ...imp }))}
      />

      {/* Main Upper Workspace with 5 organized panels and interactive column splitters */}
      <div className="flex-1 flex overflow-x-auto p-2.5 gap-1 min-h-0 bg-slate-100/60">
        {/* Column 1: Interactive Canvas for Drawing Lines with mouse */}
        <Canvas
          module={module}
          selectedLineId={selectedLineId}
          selectedCellId={selectedCellId}
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
          width={layoutSizes.paramsWidth}
          onSelectLine={handleSelectLine}
          onSelectCell={handleSelectCell}
          onUpdateLine={handleUpdateLine}
          onDeleteLine={handleDeleteLine}
          onUpdateCell={handleUpdateCell}
          onDeleteCell={handleDeleteCell}
          onUpdateProfile={handleUpdateProfile}
          onDeleteProfile={handleDeleteProfile}
          onSelectProfile={setSelectedProfileId}
          onOpenFastenerModal={() => {}}
        />

        {/* Resizable Divider 2-3 */}
        <ResizeDivider
          direction="vertical"
          onResize={(dx) => updateLayoutSize('paramsWidth', dx, 240, 600)}
          title="Потяните для изменения ширины окна параметров"
        />

        {/* Column 3: БД: Материалы и Профили */}
        <MaterialsTree
          selectedLineId={selectedLineId}
          width={layoutSizes.materialsWidth}
          onBindProfileToSelectedLine={handleBindProfileFromTree}
          onAddCustomProfile={() => setIsCustomProfileModalOpen(true)}
        />

        {/* Resizable Divider 3-4 */}
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
          width={layoutSizes.hardwareWidth}
          onSelectHardware={handleSelectHardwareFromDB}
        />

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
          selectedRuleId={selectedRuleId}
          onAddDependency={handleAddDependencyRule}
          onUpdateDependency={handleUpdateDependency}
          onRemoveDependency={handleRemoveDependency}
        />
      </div>

      {/* Horizontal Resizable Divider between Upper Workspace and Bottom Table */}
      <ResizeDivider
        direction="horizontal"
        onResize={(dy) => updateLayoutSize('tableHeight', dy, 140, 650)}
        title="Потяните вверх/вниз для изменения высоты таблицы спецификации"
      />

      {/* Bottom Live BOM Table (Full Width 19-Column Excel-like Sheet) */}
      <SpecificationTable
        module={module}
        bomRows={bomRows}
        selectedSourceId={selectedProfileId || selectedCellId || selectedLineId}
        height={layoutSizes.tableHeight}
        onSelectRow={handleSelectRow}
        onUpdateBOMCell={handleUpdateBOMCell}
      />

      {/* Add Custom Profile Modal */}
      <CustomProfileModal
        isOpen={isCustomProfileModalOpen}
        onClose={() => setIsCustomProfileModalOpen(false)}
        onAddProfile={(newP) => {
          handleBindProfileFromTree(newP);
        }}
      />

      {/* Floating Agent UI Feedback & Review Tool */}
      <AgentFeedbackOverlay />
    </div>
  );
};
