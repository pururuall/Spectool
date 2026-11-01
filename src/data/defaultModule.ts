import { ModuleModel } from '../types';

export const createDefaultModule = (): ModuleModel => {
  const width = 1000;
  const height = 2555;
  const transomY = 1855;

  return {
    id: 'mod-1',
    name: 'М507_Модуль Жукова',
    project: 'А1187',
    width,
    height,
    color: 'RAL 7012',
    colors: ['RAL 7012', 'RAL 9005', 'RAL 9006'],
    lines: [
      {
        id: 'line-left',
        name: 'Рама левая (осевая)',
        role: 'n L',
        orderNumber: 512,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: height,
        length: height,
        profileBindings: [
          {
            id: 'prof-l-1',
            lineId: 'line-left',
            role: 'n L',
            orderNumber: 512,
            article: 'AYPC.EF100.40.0101',
            name: 'Рама левая',
            customMark: 'А1187 0101-2555-512',
            company: 'Alutech',
            category: 'profile',
            material: 'AYPC.EF100.40.0101',
            materialName: 'Рама боковая',
            unit: 'шт',
            startOffset: 40,
            endOffset: 0,
            calculatedLength: height - 40, // 2515
            color: 'RAL 7012',
            miterLeft: 90,
            miterRight: 90,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-l-1',
                article: 'EF100.1901',
                name: 'Уплотнитель межмодульный 35мм',
                type: 'gasket',
                unit: 'м',
                calcType: 'formula',
                formula: 'ROUNDUP(L * 1.05 / 1000, 1)',
                evaluatedQty: 2.7
              },
              {
                id: 'dep-l-2',
                article: 'FRK307',
                name: 'Резина межмодульная (цех)',
                type: 'gasket',
                unit: 'м',
                calcType: 'formula',
                formula: 'ROUNDUP(L * 1.05 * 2 / 1000, 1)',
                evaluatedQty: 5.3
              }
            ]
          },
          {
            id: 'prof-l-clamp',
            lineId: 'line-left',
            article: 'AYPC.EF100.0601',
            name: 'Прижим 40мм (вертикальный)',
            customMark: 'А1187 0601-у45-2527-у45',
            company: 'Alutech',
            category: 'clamp',
            material: 'AYPC.EF100.0601',
            materialName: 'Прижим рамный',
            unit: 'шт',
            startOffset: 28,
            endOffset: 0,
            calculatedLength: height - 28, // 2527
            color: 'RAL 7012',
            miterLeft: 45,
            miterRight: 45,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-l-clamp-screw',
                article: 'ВС 4,8х16, DIN7981, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'step',
                stepMm: 200,
                formula: 'ROUNDUP(L / 200, 0) + 1',
                evaluatedQty: 14
              },
              {
                id: 'dep-l-clamp-gasket',
                article: 'FRK316',
                name: 'Уплотнитель в прижим 4мм',
                type: 'gasket',
                unit: 'м',
                calcType: 'formula',
                formula: 'ROUNDUP(L * 1.05 / 1000, 1)',
                evaluatedQty: 2.7
              }
            ]
          },
          {
            id: 'prof-l-cap',
            lineId: 'line-left',
            article: 'AYPC.EF100.0501',
            name: 'Крышка 40мм (вертикальная)',
            customMark: 'А1187 0501-у45-2531-у45-RAL 7012',
            company: 'Alutech',
            category: 'cap',
            material: 'AYPC.EF100.0501',
            materialName: 'Крышка рамная',
            unit: 'шт',
            startOffset: 24,
            endOffset: 0,
            calculatedLength: height - 24, // 2531
            color: 'RAL 7012',
            miterLeft: 45,
            miterRight: 45,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-l-cap-screw',
                article: 'ВС 3,9х13, DIN7982, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 2,
                evaluatedQty: 2
              }
            ]
          }
        ]
      },
      {
        id: 'line-right',
        name: 'Рама правая (осевая)',
        role: 'n R',
        orderNumber: 522,
        x1: width,
        y1: 0,
        x2: width,
        y2: height,
        length: height,
        profileBindings: [
          {
            id: 'prof-r-1',
            lineId: 'line-right',
            role: 'n R',
            orderNumber: 522,
            article: 'AYPC.EF100.40.0101',
            name: 'Рама правая',
            customMark: 'А1187 0101-2555-522',
            company: 'Alutech',
            category: 'profile',
            material: 'AYPC.EF100.40.0101',
            materialName: 'Рама боковая',
            unit: 'шт',
            startOffset: 40,
            endOffset: 0,
            calculatedLength: height - 40, // 2515
            color: 'RAL 7012',
            miterLeft: 90,
            miterRight: 90,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-r-1',
                article: 'EF100.1901',
                name: 'Уплотнитель межмодульный 35мм',
                type: 'gasket',
                unit: 'м',
                calcType: 'formula',
                formula: 'ROUNDUP(L * 1.05 / 1000, 1)',
                evaluatedQty: 2.7
              },
              {
                id: 'dep-r-2',
                article: 'FRK307',
                name: 'Резина межмодульная (цех)',
                type: 'gasket',
                unit: 'м',
                calcType: 'formula',
                formula: 'ROUNDUP(L * 1.05 * 2 / 1000, 1)',
                evaluatedQty: 5.3
              }
            ]
          }
        ]
      },
      {
        id: 'line-bottom',
        name: 'Рама нижняя (осевая)',
        role: 'Down',
        orderNumber: 500,
        x1: 0,
        y1: 0,
        x2: width,
        y2: 0,
        length: width,
        profileBindings: [
          {
            id: 'prof-b-1',
            lineId: 'line-bottom',
            role: 'Down',
            orderNumber: 500,
            article: 'AYPC.EF100.40.0102',
            name: 'Рама нижняя',
            customMark: 'А1187 0102-1000-500',
            company: 'Alutech',
            category: 'profile',
            material: 'AYPC.EF100.40.0102',
            materialName: 'Рама нижняя',
            unit: 'шт',
            startOffset: 60,
            endOffset: 0,
            calculatedLength: width - 60, // 940
            color: 'RAL 7012',
            miterLeft: 90,
            miterRight: 90,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-b-screw-1',
                article: 'ВС 5,5х32, ISO14585, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 12,
                evaluatedQty: 12
              },
              {
                id: 'dep-b-screw-2',
                article: 'ВС 4,2х32, ISO14585, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 2,
                evaluatedQty: 2
              },
              {
                id: 'dep-b-screw-3',
                article: 'Alu Спецвинт 3,9х10, ТХ, А2',
                name: 'Спецвинт',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 2,
                evaluatedQty: 2
              },
              {
                id: 'dep-b-cord',
                article: 'SL160.0948',
                name: 'Шнур уплотнительный ф2,5мм',
                type: 'gasket',
                unit: 'м',
                calcType: 'formula',
                formula: 'ROUNDUP(L * 1.05 / 1000, 1)',
                evaluatedQty: 1.0
              }
            ]
          }
        ]
      },
      {
        id: 'line-top',
        name: 'Рама верхняя (осевая)',
        role: 'Up',
        orderNumber: 500,
        x1: 0,
        y1: height,
        x2: width,
        y2: height,
        length: width,
        profileBindings: [
          {
            id: 'prof-t-1',
            lineId: 'line-top',
            role: 'Up',
            orderNumber: 500,
            article: 'AYPC.EF100.40.0104',
            name: 'Рама верхняя',
            customMark: 'А1187 0104-1000-500',
            company: 'Alutech',
            category: 'profile',
            material: 'AYPC.EF100.40.0104',
            materialName: 'Рама верхняя',
            unit: 'шт',
            startOffset: 20,
            endOffset: 0,
            calculatedLength: width - 20, // 980
            color: 'RAL 7012',
            miterLeft: 90,
            miterRight: 90,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-t-screw-1',
                article: 'ВС 5,5х32, ISO14585, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 6,
                evaluatedQty: 6
              },
              {
                id: 'dep-t-screw-2',
                article: 'ВС 4,2х32, ISO14585, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 2,
                evaluatedQty: 2
              },
              {
                id: 'dep-t-cord',
                article: 'SL160.0948',
                name: 'Шнур уплотнительный ф2,5мм',
                type: 'gasket',
                unit: 'м',
                calcType: 'formula',
                formula: 'ROUNDUP(L * 1.05 / 1000, 1)',
                evaluatedQty: 1.1
              }
            ]
          }
        ]
      },
      {
        id: 'line-transom-1',
        name: 'Ригель промежуточный (осевая)',
        role: 'Middle 1',
        orderNumber: 500,
        x1: 0,
        y1: transomY,
        x2: width,
        y2: transomY,
        length: width,
        profileBindings: [
          {
            id: 'prof-tr-1',
            lineId: 'line-transom-1',
            role: 'Middle 1',
            orderNumber: 500,
            article: 'AYPC.EF100.40.0202',
            name: 'Импост горизонтальный (ригель)',
            customMark: 'А1187 0202-1000-500',
            company: 'Alutech',
            category: 'transom',
            material: 'AYPC.EF100.40.0202',
            materialName: 'Импост горизонтальный',
            unit: 'шт',
            startOffset: 60,
            endOffset: 0,
            calculatedLength: width - 60, // 940
            color: 'RAL 7012',
            miterLeft: 90,
            miterRight: 90,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-tr-screw-1',
                article: 'ВС 5,5х32, ISO14585, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 8,
                evaluatedQty: 8
              },
              {
                id: 'dep-tr-screw-2',
                article: 'ВС 4,2х32, ISO14585, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 4,
                evaluatedQty: 4
              },
              {
                id: 'dep-tr-screw-3',
                article: 'Alu Спецвинт 3,9х10, ТХ, А2',
                name: 'Спецвинт',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 4,
                evaluatedQty: 4
              }
            ]
          },
          {
            id: 'prof-tr-clamp',
            lineId: 'line-transom-1',
            article: 'AYPC.EF100.0602',
            name: 'Прижим 60мм (горизонтальный)',
            customMark: 'А1187 0602-90-892-90',
            company: 'Alutech',
            category: 'clamp',
            material: 'AYPC.EF100.0602',
            materialName: 'Прижим рамный',
            unit: 'шт',
            startOffset: 108,
            endOffset: 0,
            calculatedLength: width - 108, // 892
            color: 'RAL 7012',
            miterLeft: 90,
            miterRight: 90,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-tr-clamp-screw',
                article: 'ВС 4,8х16, DIN7981, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'step',
                stepMm: 200,
                formula: 'ROUNDUP(L / 200, 0) + 1',
                evaluatedQty: 6
              },
              {
                id: 'dep-tr-clamp-gasket',
                article: 'FRK316',
                name: 'Уплотнитель в прижим 4мм',
                type: 'gasket',
                unit: 'м',
                calcType: 'formula',
                formula: 'ROUNDUP(L * 2.05 / 1000, 1)',
                evaluatedQty: 1.9
              }
            ]
          },
          {
            id: 'prof-tr-cap',
            lineId: 'line-transom-1',
            article: 'AYPC.EF100.0502',
            name: 'Крышка 60мм (горизонтальная)',
            customMark: 'А1187 0502-90-896-90-RAL 7012',
            company: 'Alutech',
            category: 'cap',
            material: 'AYPC.EF100.0502',
            materialName: 'Крышка рамная',
            unit: 'шт',
            startOffset: 104,
            endOffset: 0,
            calculatedLength: width - 104, // 896
            color: 'RAL 7012',
            miterLeft: 90,
            miterRight: 90,
            planGroup: 'Профиль Алюминиевый',
            dependencies: [
              {
                id: 'dep-tr-cap-screw',
                article: 'ВС 3,9х13, DIN7982, А2',
                name: 'Винт самонарезающий',
                type: 'fastener',
                unit: 'шт',
                calcType: 'fixed',
                quantity: 1,
                evaluatedQty: 1
              }
            ]
          }
        ]
      }
    ],
    cells: [
      {
        id: 'cell-top',
        x: 0,
        y: transomY,
        width,
        height: height - transomY, // 700 мм
        fillType: 'spandrel',
        name: 'Короб Оц 0,9мм',
        mark: 'А1187 К1080-1000',
        material: 'Оц 0,9мм',
        materialName: 'Лист 0,9 Оц сталь ГОСТ 14918-80',
        glassWidth: 786.5,
        glassHeight: 1091.5,
        thickness: 150,
        color: '#fef3c7',
        dependencies: [
          {
            id: 'dep-span-top-screw',
            article: 'ВС 3,9х16, DIN7981, А2',
            name: 'Винт самонарезающий с полуцилиндрической головкой',
            type: 'fastener',
            unit: 'шт',
            calcType: 'formula',
            formula: '(ROUNDUP((L / 90 + W / 90), 0) + 2) * 3',
            evaluatedQty: 69
          },
          {
            id: 'dep-span-top-isolon',
            article: 'ISOLON TAPE 3',
            name: 'Изолон 3х30мм',
            type: 'gasket',
            unit: 'м',
            calcType: 'formula',
            formula: 'ROUNDUP((L + W) * 2.05 / 1000, 1)',
            evaluatedQty: 3.9
          },
          {
            id: 'dep-span-top-insul',
            article: 'RookWool 150мм 90 кг/м3',
            name: 'Утеплитель минераловатный',
            type: 'insulation',
            unit: 'м3',
            calcType: 'formula',
            formula: 'ROUNDUP(Area * 0.15, 2)',
            evaluatedQty: 0.13
          },
          {
            id: 'dep-span-top-nail',
            article: 'Гвоздь приварной 3,2х165 в комплекте с тарелкой',
            name: 'Гвоздь приварной омедненный в комплекте с тарелкой',
            type: 'fastener',
            unit: 'шт',
            calcType: 'formula',
            formula: 'ROUNDUP(Area * 6, 0)',
            evaluatedQty: 6
          }
        ]
      },
      {
        id: 'cell-bottom',
        x: 0,
        y: 0,
        width,
        height: transomY, // 1855 мм
        fillType: 'spandrel',
        name: 'Короб Оц 0,9мм',
        mark: 'А1187 К4090-1000',
        material: 'Оц 0,9мм',
        materialName: 'Лист 0,9 Оц сталь ГОСТ 14918-80',
        glassWidth: 1091.5,
        glassHeight: 1991.5,
        thickness: 150,
        color: '#fef3c7',
        dependencies: [
          {
            id: 'dep-span-bot-screw',
            article: 'ВС 3,9х16, DIN7981, А2',
            name: 'Винт самонарезающий с полуцилиндрической головкой',
            type: 'fastener',
            unit: 'шт',
            calcType: 'formula',
            formula: '(ROUNDUP((L / 90 + W / 90), 0) + 2) * 3',
            evaluatedQty: 111
          },
          {
            id: 'dep-span-bot-isolon',
            article: 'ISOLON TAPE 3',
            name: 'Изолон 3х30мм',
            type: 'gasket',
            unit: 'м',
            calcType: 'formula',
            formula: 'ROUNDUP((L + W) * 2.05 / 1000, 1)',
            evaluatedQty: 6.4
          },
          {
            id: 'dep-span-bot-insul',
            article: 'RookWool 150мм 90 кг/м3',
            name: 'Утеплитель минераловатный',
            type: 'insulation',
            unit: 'м3',
            calcType: 'formula',
            formula: 'ROUNDUP(Area * 0.15, 2)',
            evaluatedQty: 0.33
          },
          {
            id: 'dep-span-bot-nail',
            article: 'Гвоздь приварной 3,2х165 в комплекте с тарелкой',
            name: 'Гвоздь приварной омедненный в комплекте с тарелкой',
            type: 'fastener',
            unit: 'шт',
            calcType: 'formula',
            formula: 'ROUNDUP(Area * 6, 0)',
            evaluatedQty: 14
          }
        ]
      }
    ]
  };
};
