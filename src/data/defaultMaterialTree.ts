import { MaterialFolderNode } from '../types';

export const defaultMaterialTree: MaterialFolderNode[] = [
  {
    id: 'f_sheet',
    name: 'Лист',
    subfolders: [
      {
        id: 'f_sheet_black',
        name: 'Сталь чёрная',
        parentId: 'f_sheet',
        subfolders: [
          {
            id: 'f_sheet_c245',
            name: 'С245',
            parentId: 'f_sheet_black',
            subfolders: [],
            items: [
              {
                id: 'mat_c245_04',
                section: 'Лист',
                subsection: 'Сталь чёрная / С245',
                folderPath: ['Лист', 'Сталь чёрная', 'С245'],
                article: 'С245 04мм',
                code: 'С245 04мм',
                name: 'Лист 4 С245 ГОСТ 19903-2015',
                material: 'Сталь С245',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 4,
                weight: 31.4,
                category: 'sheet'
              },
              {
                id: 'mat_c245_06',
                section: 'Лист',
                subsection: 'Сталь чёрная / С245',
                folderPath: ['Лист', 'Сталь чёрная', 'С245'],
                article: 'С245 06мм',
                code: 'С245 06мм',
                name: 'Лист 6 С245 ГОСТ 19903-2015',
                material: 'Сталь С245',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 6,
                weight: 47.1,
                category: 'sheet'
              },
              {
                id: 'mat_c245_08',
                section: 'Лист',
                subsection: 'Сталь чёрная / С245',
                folderPath: ['Лист', 'Сталь чёрная', 'С245'],
                article: 'С245 08мм',
                code: 'С245 08мм',
                name: 'Лист 8 С245 ГОСТ 19903-2015',
                material: 'Сталь С245',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 8,
                weight: 62.8,
                category: 'sheet'
              },
              {
                id: 'mat_c245_10',
                section: 'Лист',
                subsection: 'Сталь чёрная / С245',
                folderPath: ['Лист', 'Сталь чёрная', 'С245'],
                article: 'С245 10мм',
                code: 'С245 10мм',
                name: 'Лист 10 С245 ГОСТ 19903-2015',
                material: 'Сталь С245',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 10,
                weight: 78.5,
                category: 'sheet'
              }
            ]
          },
          {
            id: 'f_sheet_c255',
            name: 'С255',
            parentId: 'f_sheet_black',
            subfolders: [],
            items: [
              {
                id: 'mat_c255_04',
                section: 'Лист',
                subsection: 'Сталь чёрная / С255',
                folderPath: ['Лист', 'Сталь чёрная', 'С255'],
                article: 'С255 04мм',
                code: 'С255 04мм',
                name: 'Лист 4 С255 ГОСТ 19903-2015',
                material: 'Сталь С255',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 4,
                weight: 31.4,
                category: 'sheet'
              },
              {
                id: 'mat_c255_06',
                section: 'Лист',
                subsection: 'Сталь чёрная / С255',
                folderPath: ['Лист', 'Сталь чёрная', 'С255'],
                article: 'С255 06мм',
                code: 'С255 06мм',
                name: 'Лист 6 С255 ГОСТ 19903-2015',
                material: 'Сталь С255',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 6,
                weight: 47.1,
                category: 'sheet'
              },
              {
                id: 'mat_c255_08',
                section: 'Лист',
                subsection: 'Сталь чёрная / С255',
                folderPath: ['Лист', 'Сталь чёрная', 'С255'],
                article: 'С255 08мм',
                code: 'С255 08мм',
                name: 'Лист 8 С255 ГОСТ 19903-2015',
                material: 'Сталь С255',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 8,
                weight: 62.8,
                category: 'sheet'
              }
            ]
          },
          {
            id: 'f_sheet_c345',
            name: 'С345',
            parentId: 'f_sheet_black',
            subfolders: [],
            items: [
              {
                id: 'mat_c345_04',
                section: 'Лист',
                subsection: 'Сталь чёрная / С345',
                folderPath: ['Лист', 'Сталь чёрная', 'С345'],
                article: 'С345 04мм',
                code: 'С345 04мм',
                name: 'Лист 4 С345 ГОСТ 19903-2015',
                material: 'Сталь С345 (09Г2С)',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 4,
                weight: 31.4,
                category: 'sheet'
              },
              {
                id: 'mat_c345_06',
                section: 'Лист',
                subsection: 'Сталь чёрная / С345',
                folderPath: ['Лист', 'Сталь чёрная', 'С345'],
                article: 'С345 06мм',
                code: 'С345 06мм',
                name: 'Лист 6 С345 ГОСТ 19903-2015',
                material: 'Сталь С345 (09Г2С)',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 6,
                weight: 47.1,
                category: 'sheet'
              },
              {
                id: 'mat_c345_08',
                section: 'Лист',
                subsection: 'Сталь чёрная / С345',
                folderPath: ['Лист', 'Сталь чёрная', 'С345'],
                article: 'С345 08мм',
                code: 'С345 08мм',
                name: 'Лист 8 С345 ГОСТ 19903-2015',
                material: 'Сталь С345 (09Г2С)',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 8,
                weight: 62.8,
                category: 'sheet'
              }
            ]
          },
          {
            id: 'f_sheet_c390',
            name: 'С390',
            parentId: 'f_sheet_black',
            subfolders: [],
            items: [
              {
                id: 'mat_c390_06',
                section: 'Лист',
                subsection: 'Сталь чёрная / С390',
                folderPath: ['Лист', 'Сталь чёрная', 'С390'],
                article: 'С390 06мм',
                code: 'С390 06мм',
                name: 'Лист 6 С390 ГОСТ 19903-2015',
                material: 'Сталь С390',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 6,
                weight: 47.1,
                category: 'sheet'
              },
              {
                id: 'mat_c390_08',
                section: 'Лист',
                subsection: 'Сталь чёрная / С390',
                folderPath: ['Лист', 'Сталь чёрная', 'С390'],
                article: 'С390 08мм',
                code: 'С390 08мм',
                name: 'Лист 8 С390 ГОСТ 19903-2015',
                material: 'Сталь С390',
                standard: 'ГОСТ 19903-2015',
                unit: 'м2',
                thickness: 8,
                weight: 62.8,
                category: 'sheet'
              }
            ]
          }
        ],
        items: []
      },
      {
        id: 'f_sheet_galv',
        name: 'Сталь оцинкованная',
        parentId: 'f_sheet',
        subfolders: [],
        items: [
          {
            id: 'mat_galv_055',
            section: 'Лист',
            subsection: 'Сталь оцинкованная',
            folderPath: ['Лист', 'Сталь оцинкованная'],
            article: 'Оц 0.55мм',
            code: 'Оц 0.55мм',
            name: 'Лист 0.55 Оц сталь ГОСТ 14918-80',
            material: 'Сталь 08пс оцинкованная',
            standard: 'ГОСТ 14918-80',
            unit: 'м2',
            thickness: 0.55,
            weight: 4.32,
            category: 'sheet'
          },
          {
            id: 'mat_galv_070',
            section: 'Лист',
            subsection: 'Сталь оцинкованная',
            folderPath: ['Лист', 'Сталь оцинкованная'],
            article: 'Оц 0.70мм',
            code: 'Оц 0.70мм',
            name: 'Лист 0.70 Оц сталь ГОСТ 14918-80',
            material: 'Сталь 08пс оцинкованная',
            standard: 'ГОСТ 14918-80',
            unit: 'м2',
            thickness: 0.7,
            weight: 5.5,
            category: 'sheet'
          },
          {
            id: 'mat_galv_090',
            section: 'Лист',
            subsection: 'Сталь оцинкованная',
            folderPath: ['Лист', 'Сталь оцинкованная'],
            article: 'Оц 0.90мм',
            code: 'Оц 0.90мм',
            name: 'Лист 0.90 Оц сталь ГОСТ 14918-80',
            material: 'Сталь 08пс оцинкованная',
            standard: 'ГОСТ 14918-80',
            unit: 'м2',
            thickness: 0.9,
            weight: 7.07,
            category: 'sheet'
          },
          {
            id: 'mat_galv_120',
            section: 'Лист',
            subsection: 'Сталь оцинкованная',
            folderPath: ['Лист', 'Сталь оцинкованная'],
            article: 'Оц 1.20мм',
            code: 'Оц 1.20мм',
            name: 'Лист 1.20 Оц сталь ГОСТ 14918-80',
            material: 'Сталь 08пс оцинкованная',
            standard: 'ГОСТ 14918-80',
            unit: 'м2',
            thickness: 1.2,
            weight: 9.42,
            category: 'sheet'
          },
          {
            id: 'mat_galv_150',
            section: 'Лист',
            subsection: 'Сталь оцинкованная',
            folderPath: ['Лист', 'Сталь оцинкованная'],
            article: 'Оц 1.50мм',
            code: 'Оц 1.50мм',
            name: 'Лист 1.50 Оц сталь ГОСТ 14918-80',
            material: 'Сталь 08пс оцинкованная',
            standard: 'ГОСТ 14918-80',
            unit: 'м2',
            thickness: 1.5,
            weight: 11.78,
            category: 'sheet'
          },
          {
            id: 'mat_galv_200',
            section: 'Лист',
            subsection: 'Сталь оцинкованная',
            folderPath: ['Лист', 'Сталь оцинкованная'],
            article: 'Оц 2.00мм',
            code: 'Оц 2.00мм',
            name: 'Лист 2.00 Оц сталь ГОСТ 14918-80',
            material: 'Сталь 08пс оцинкованная',
            standard: 'ГОСТ 14918-80',
            unit: 'м2',
            thickness: 2.0,
            weight: 15.7,
            category: 'sheet'
          }
        ]
      },
      {
        id: 'f_sheet_al',
        name: 'Алюминий',
        parentId: 'f_sheet',
        subfolders: [],
        items: [
          {
            id: 'mat_al_15',
            section: 'Лист',
            subsection: 'Алюминий',
            folderPath: ['Лист', 'Алюминий'],
            article: 'АМг2М 1.5мм',
            code: 'АМг2М 1.5мм',
            name: 'Лист 1.5 АМг2М ГОСТ 21631-76',
            material: 'АМг2М',
            standard: 'ГОСТ 21631-76',
            unit: 'м2',
            thickness: 1.5,
            weight: 4.05,
            category: 'sheet'
          },
          {
            id: 'mat_al_20',
            section: 'Лист',
            subsection: 'Алюминий',
            folderPath: ['Лист', 'Алюминий'],
            article: 'АМг2М 2.0мм',
            code: 'АМг2М 2.0мм',
            name: 'Лист 2.0 АМг2М ГОСТ 21631-76',
            material: 'АМг2М',
            standard: 'ГОСТ 21631-76',
            unit: 'м2',
            thickness: 2.0,
            weight: 5.4,
            category: 'sheet'
          },
          {
            id: 'mat_al_30',
            section: 'Лист',
            subsection: 'Алюминий',
            folderPath: ['Лист', 'Алюминий'],
            article: 'АМг2М 3.0мм',
            code: 'АМг2М 3.0мм',
            name: 'Лист 3.0 АМг2М ГОСТ 21631-76',
            material: 'АМг2М',
            standard: 'ГОСТ 21631-76',
            unit: 'м2',
            thickness: 3.0,
            weight: 8.1,
            category: 'sheet'
          }
        ]
      },
      {
        id: 'f_sheet_nonmetal',
        name: 'Неметаллы',
        parentId: 'f_sheet',
        subfolders: [],
        items: [
          {
            id: 'mat_nonmetal_paronit',
            section: 'Лист',
            subsection: 'Неметаллы',
            folderPath: ['Лист', 'Неметаллы'],
            article: 'Паронит 2.0мм',
            code: 'Паронит 2.0мм',
            name: 'Паронит ПОН-Б 2.0мм ГОСТ 481-80',
            material: 'Паронит',
            standard: 'ГОСТ 481-80',
            unit: 'м2',
            thickness: 2.0,
            weight: 3.6,
            category: 'sheet'
          },
          {
            id: 'mat_nonmetal_rubber',
            section: 'Лист',
            subsection: 'Неметаллы',
            folderPath: ['Лист', 'Неметаллы'],
            article: 'Резина 4.0мм',
            code: 'Резина 4.0мм',
            name: 'Пластина резиновая ТМКЩ 4.0мм ГОСТ 7338-90',
            material: 'Резина ТМКЩ',
            standard: 'ГОСТ 7338-90',
            unit: 'м2',
            thickness: 4.0,
            weight: 5.2,
            category: 'sheet'
          }
        ]
      },
      {
        id: 'f_sheet_other_metal',
        name: 'Иные металлы',
        parentId: 'f_sheet',
        subfolders: [],
        items: [
          {
            id: 'mat_copper_10',
            section: 'Лист',
            subsection: 'Иные металлы',
            folderPath: ['Лист', 'Иные металлы'],
            article: 'Медь М1 1.0',
            code: 'Медь М1 1.0',
            name: 'Лист 1.0 М1 ГОСТ 1173-2006',
            material: 'Медь М1',
            standard: 'ГОСТ 1173-2006',
            unit: 'м2',
            thickness: 1.0,
            weight: 8.9,
            category: 'sheet'
          }
        ]
      },
      {
        id: 'f_sheet_stainless',
        name: 'Сталь нержавеющая',
        parentId: 'f_sheet',
        subfolders: [],
        items: [
          {
            id: 'mat_aisi304_10',
            section: 'Лист',
            subsection: 'Сталь нержавеющая',
            folderPath: ['Лист', 'Сталь нержавеющая'],
            article: 'AISI 304 1.0',
            code: 'AISI 304 1.0',
            name: 'Лист 1.0 AISI 304 (08Х18Н10)',
            material: 'AISI 304',
            unit: 'м2',
            thickness: 1.0,
            weight: 7.93,
            category: 'sheet'
          },
          {
            id: 'mat_aisi304_15',
            section: 'Лист',
            subsection: 'Сталь нержавеющая',
            folderPath: ['Лист', 'Сталь нержавеющая'],
            article: 'AISI 304 1.5',
            code: 'AISI 304 1.5',
            name: 'Лист 1.5 AISI 304 (08Х18Н10)',
            material: 'AISI 304',
            unit: 'м2',
            thickness: 1.5,
            weight: 11.9,
            category: 'sheet'
          }
        ]
      }
    ],
    items: []
  },
  {
    id: 'f_paint',
    name: 'Краска',
    subfolders: [],
    items: [
      {
        id: 'mat_paint_7012',
        section: 'Краска',
        subsection: 'Порошковая',
        folderPath: ['Краска'],
        article: 'RAL 7012',
        code: 'RAL 7012',
        name: 'Порошковая полиэфирная RAL 7012 Basalt Grey',
        material: 'Порошковая краска',
        unit: 'кг',
        weight: 1.0,
        category: 'other'
      },
      {
        id: 'mat_paint_9005',
        section: 'Краска',
        subsection: 'Порошковая',
        folderPath: ['Краска'],
        article: 'RAL 9005',
        code: 'RAL 9005',
        name: 'Порошковая полиэфирная RAL 9005 Jet Black глубокоматовая',
        material: 'Порошковая краска',
        unit: 'кг',
        weight: 1.0,
        category: 'other'
      },
      {
        id: 'mat_paint_9006',
        section: 'Краска',
        subsection: 'Порошковая',
        folderPath: ['Краска'],
        article: 'RAL 9006',
        code: 'RAL 9006',
        name: 'Порошковая полиэфирная RAL 9006 White Aluminium',
        material: 'Порошковая краска',
        unit: 'кг',
        weight: 1.0,
        category: 'other'
      },
      {
        id: 'mat_paint_primer',
        section: 'Краска',
        subsection: 'Грунты',
        folderPath: ['Краска'],
        article: 'Грунт цинковый',
        code: 'Грунт цинковый',
        name: 'Эпоксидно-цинковый грунт для кронштейнов',
        material: 'Эпоксидный грунт',
        unit: 'кг',
        weight: 1.0,
        category: 'other'
      }
    ]
  },
  {
    id: 'f_profile',
    name: 'Профиль',
    subfolders: [
      {
        id: 'f_prof_schueco',
        name: 'Schueco',
        parentId: 'f_profile',
        subfolders: [],
        items: [
          {
            id: 'mat_sch_fws50_mullion',
            section: 'Профиль',
            subsection: 'Schueco',
            folderPath: ['Профиль', 'Schueco'],
            article: '388500',
            code: 'FWS 50.SI Стойка',
            name: 'Стойка фасадная Schueco FWS 50.SI 125мм',
            material: 'АД31Т1',
            unit: 'п.м.',
            weight: 3.82,
            company: 'Schueco',
            system: 'FWS 50',
            category: 'frame_vertical'
          },
          {
            id: 'mat_sch_fws50_transom',
            section: 'Профиль',
            subsection: 'Schueco',
            folderPath: ['Профиль', 'Schueco'],
            article: '388600',
            code: 'FWS 50.SI Ригель',
            name: 'Ригель промежуточный Schueco FWS 50.SI 105мм',
            material: 'АД31Т1',
            unit: 'п.м.',
            weight: 3.15,
            company: 'Schueco',
            system: 'FWS 50',
            category: 'transom'
          }
        ]
      },
      {
        id: 'f_prof_alutech',
        name: 'Alutech',
        parentId: 'f_profile',
        subfolders: [
          {
            id: 'f_alutech_ef100',
            name: 'EF100',
            parentId: 'f_prof_alutech',
            subfolders: [],
            items: [
              {
                id: 'mat_alutech_ef100_0101',
                section: 'Профиль',
                subsection: 'Alutech / EF100',
                folderPath: ['Профиль', 'Alutech', 'EF100'],
                article: 'AYPC.EF100.0101',
                code: 'AYPC.EF100.0101',
                name: 'Стойка фасадная модульная Alutech EF100',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 4.85,
                company: 'Alutech',
                system: 'EF100',
                category: 'frame_vertical'
              },
              {
                id: 'mat_alutech_ef100_0201',
                section: 'Профиль',
                subsection: 'Alutech / EF100',
                folderPath: ['Профиль', 'Alutech', 'EF100'],
                article: 'AYPC.EF100.0201',
                code: 'AYPC.EF100.0201',
                name: 'Ригель промежуточный Alutech EF100',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 3.75,
                company: 'Alutech',
                system: 'EF100',
                category: 'transom'
              },
              {
                id: 'mat_alutech_ef100_1901',
                section: 'Профиль',
                subsection: 'Alutech / EF100',
                folderPath: ['Профиль', 'Alutech', 'EF100'],
                article: 'AYPC.EF100.1901',
                code: 'AYPC.EF100.1901',
                name: 'Уплотнитель резиновый термомоста EF100 (комплектующее)',
                material: 'EPDM',
                unit: 'п.м.',
                weight: 0.08,
                company: 'Alutech',
                system: 'EF100',
                category: 'other'
              }
            ]
          },
          {
            id: 'f_alutech_ef100_40',
            name: 'EF100.40',
            parentId: 'f_prof_alutech',
            subfolders: [],
            items: [
              {
                id: 'mat_alutech_ef100_40_0101',
                section: 'Профиль',
                subsection: 'Alutech / EF100.40',
                folderPath: ['Профиль', 'Alutech', 'EF100.40'],
                article: 'AYPC.EF100.40.0101',
                code: 'AYPC.EF100.40.0101',
                name: 'Стойка фасадная модульная (стойка)',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 4.5,
                company: 'Alutech',
                system: 'EF100.40',
                category: 'frame_vertical'
              },
              {
                id: 'mat_alutech_ef100_40_0102',
                section: 'Профиль',
                subsection: 'Alutech / EF100.40',
                folderPath: ['Профиль', 'Alutech', 'EF100.40'],
                article: 'AYPC.EF100.40.0102',
                code: 'AYPC.EF100.40.0102',
                name: 'Ригель модульный (ригель)',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 3.5,
                company: 'Alutech',
                system: 'EF100.40',
                category: 'frame_horizontal'
              }
            ]
          },
          {
            id: 'f_alutech_f50',
            name: 'F50',
            parentId: 'f_prof_alutech',
            subfolders: [],
            items: [
              {
                id: 'mat_alutech_f50_0101',
                section: 'Профиль',
                subsection: 'Alutech / F50',
                folderPath: ['Профиль', 'Alutech', 'F50'],
                article: 'AYPC.F50.0101',
                code: 'AYPC.F50.0101',
                name: 'Стойка стоечно-ригельного фасада Alutech F50 150мм',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 4.25,
                company: 'Alutech',
                system: 'F50',
                category: 'frame_vertical'
              },
              {
                id: 'mat_alutech_f50_0201',
                section: 'Профиль',
                subsection: 'Alutech / F50',
                folderPath: ['Профиль', 'Alutech', 'F50'],
                article: 'AYPC.F50.0201',
                code: 'AYPC.F50.0201',
                name: 'Ригель промежуточный Alutech F50 100мм',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 2.85,
                company: 'Alutech',
                system: 'F50',
                category: 'transom'
              },
              {
                id: 'mat_alutech_f50_0401',
                section: 'Профиль',
                subsection: 'Alutech / F50',
                folderPath: ['Профиль', 'Alutech', 'F50'],
                article: 'AYPC.F50.0401',
                code: 'AYPC.F50.0401',
                name: 'Планка прижимная Alutech F50 50мм',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 0.65,
                company: 'Alutech',
                system: 'F50',
                category: 'clamp'
              },
              {
                id: 'mat_alutech_f50_0501',
                section: 'Профиль',
                subsection: 'Alutech / F50',
                folderPath: ['Профиль', 'Alutech', 'F50'],
                article: 'AYPC.F50.0501',
                code: 'AYPC.F50.0501',
                name: 'Крышка декоративная Alutech F50 50мм',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 0.42,
                company: 'Alutech',
                system: 'F50',
                category: 'cap'
              }
            ]
          },
          { id: 'f_alutech_c48', name: 'C48', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_ef65', name: 'EF65', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_w62', name: 'W62', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_w72', name: 'W72', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_vr26', name: 'VR26', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_ef90', name: 'EF90', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_p101', name: 'P101', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_p00', name: 'P00', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_f60', name: 'F60', parentId: 'f_prof_alutech', subfolders: [], items: [] },
          { id: 'f_alutech_ef100_4', name: 'EF100.4', parentId: 'f_prof_alutech', subfolders: [], items: [] }
        ],
        items: []
      },
      {
        id: 'f_prof_mactex',
        name: 'MacTex',
        parentId: 'f_profile',
        subfolders: [
          {
            id: 'f_mactex_beregovoy',
            name: 'Береговой',
            parentId: 'f_prof_mactex',
            subfolders: [],
            items: [
              {
                id: 'mat_mactex_ber_01',
                section: 'Профиль',
                subsection: 'MacTex / Береговой',
                folderPath: ['Профиль', 'MacTex', 'Береговой'],
                article: 'MacTex-B-01',
                code: 'MacTex-B-01',
                name: 'Профиль примыкания Береговой MacTex',
                material: 'АД31Т1',
                unit: 'п.м.',
                weight: 1.15,
                category: 'profile'
              }
            ]
          },
          {
            id: 'f_mactex_rezina',
            name: 'Резина',
            parentId: 'f_prof_mactex',
            subfolders: [],
            items: [
              {
                id: 'mat_epdm_g01',
                section: 'Профиль',
                subsection: 'MacTex / Резина',
                folderPath: ['Профиль', 'MacTex', 'Резина'],
                article: 'EPDM-G-01',
                code: 'EPDM-G-01',
                name: 'Уплотнитель наружный EPDM MacTex (комплектующее)',
                material: 'EPDM',
                unit: 'п.м.',
                weight: 0.09,
                category: 'other'
              },
              {
                id: 'mat_epdm_g02',
                section: 'Профиль',
                subsection: 'MacTex / Резина',
                folderPath: ['Профиль', 'MacTex', 'Резина'],
                article: 'EPDM-G-02',
                code: 'EPDM-G-02',
                name: 'Уплотнитель внутренний EPDM MacTex (комплектующее)',
                material: 'EPDM',
                unit: 'п.м.',
                weight: 0.07,
                category: 'other'
              }
            ]
          }
        ],
        items: []
      },
      {
        id: 'f_prof_inicial',
        name: 'inicial',
        parentId: 'f_profile',
        subfolders: [],
        items: [
          {
            id: 'mat_inicial_if50',
            section: 'Профиль',
            subsection: 'inicial',
            folderPath: ['Профиль', 'inicial'],
            article: 'IF 50.01',
            code: 'IF 50.01',
            name: 'Стойка фасадная Inicial IF 50',
            material: 'АД31Т1',
            unit: 'п.м.',
            weight: 3.4,
            category: 'frame_vertical'
          }
        ]
      },
      {
        id: 'f_prof_realit',
        name: 'Realit',
        parentId: 'f_profile',
        subfolders: [],
        items: [
          {
            id: 'mat_realit_rf50',
            section: 'Профиль',
            subsection: 'Realit',
            folderPath: ['Профиль', 'Realit'],
            article: 'RF 50.01',
            code: 'RF 50.01',
            name: 'Стойка фасадная Realit RF 50',
            material: 'АД31Т1',
            unit: 'п.м.',
            weight: 3.35,
            category: 'frame_vertical'
          }
        ]
      },
      {
        id: 'f_prof_other',
        name: 'Иные',
        parentId: 'f_profile',
        subfolders: [],
        items: [
          {
            id: 'mat_other_aux',
            section: 'Профиль',
            subsection: 'Иные',
            folderPath: ['Профиль', 'Иные'],
            article: 'ПР-ВСП-01',
            code: 'ПР-ВСП-01',
            name: 'Профиль вспомогательный монтажный',
            material: 'АД31Т1',
            unit: 'п.м.',
            weight: 1.2,
            category: 'profile'
          }
        ]
      }
    ],
    items: []
  },
  {
    id: 'f_std_profiles',
    name: 'Стандартные профиля',
    subfolders: [
      {
        id: 'f_std_aluminum',
        name: 'Алюминиевый',
        parentId: 'f_std_profiles',
        subfolders: [
          {
            id: 'f_al_tube',
            name: 'Труба',
            parentId: 'f_std_aluminum',
            subfolders: [
              {
                id: 'f_al_tube_al',
                name: 'Алюминиевая',
                parentId: 'f_al_tube',
                subfolders: [],
                items: [
                  {
                    id: 'mat_al_pipe_40x40',
                    section: 'Стандартные профиля',
                    subsection: 'Алюминиевый / Труба / Алюминиевая',
                    folderPath: ['Стандартные профиля', 'Алюминиевый', 'Труба', 'Алюминиевая'],
                    article: 'Труба АД31 40х40х2',
                    code: 'Труба АД31 40х40х2',
                    name: 'Труба профильная алюминиевая 40х40х2.0 АД31Т1',
                    material: 'АД31Т1',
                    unit: 'п.м.',
                    weight: 0.82,
                    category: 'profile'
                  },
                  {
                    id: 'mat_al_pipe_50x50',
                    section: 'Стандартные профиля',
                    subsection: 'Алюминиевый / Труба / Алюминиевая',
                    folderPath: ['Стандартные профиля', 'Алюминиевый', 'Труба', 'Алюминиевая'],
                    article: 'Труба АД31 50х50х3',
                    code: 'Труба АД31 50х50х3',
                    name: 'Труба профильная алюминиевая 50х50х3.0 АД31Т1',
                    material: 'АД31Т1',
                    unit: 'п.м.',
                    weight: 1.52,
                    category: 'profile'
                  },
                  {
                    id: 'mat_al_pipe_60x40',
                    section: 'Стандартные профиля',
                    subsection: 'Алюминиевый / Труба / Алюминиевая',
                    folderPath: ['Стандартные профиля', 'Алюминиевый', 'Труба', 'Алюминиевая'],
                    article: 'Труба АД31 60х40х2',
                    code: 'Труба АД31 60х40х2',
                    name: 'Труба профильная алюминиевая 60х40х2.0 АД31Т1',
                    material: 'АД31Т1',
                    unit: 'п.м.',
                    weight: 1.04,
                    category: 'profile'
                  }
                ]
              },
              {
                id: 'f_al_tube_galv',
                name: 'Оцинкованная',
                parentId: 'f_al_tube',
                subfolders: [],
                items: [
                  {
                    id: 'mat_galv_pipe_40x40',
                    section: 'Стандартные профиля',
                    subsection: 'Алюминиевый / Труба / Оцинкованная',
                    folderPath: ['Стандартные профиля', 'Алюминиевый', 'Труба', 'Оцинкованная'],
                    article: 'Труба Оц 40х40х2',
                    code: 'Труба Оц 40х40х2',
                    name: 'Труба квадратная тонкостенная оцинкованная 40х40х2.0',
                    material: 'Сталь Оц',
                    unit: 'п.м.',
                    weight: 2.38,
                    category: 'profile'
                  }
                ]
              }
            ],
            items: []
          },
          {
            id: 'f_al_angle',
            name: 'Уголок',
            parentId: 'f_std_aluminum',
            subfolders: [],
            items: [
              {
                id: 'mat_al_angle_40x40',
                section: 'Стандартные профиля',
                subsection: 'Алюминиевый / Уголок',
                folderPath: ['Стандартные профиля', 'Алюминиевый', 'Уголок'],
                article: 'Уголок АД31 40х40х3',
                code: 'Уголок АД31 40х40х3',
                name: 'Уголок равнополочный 40х40х3.0 АД31Т1 ГОСТ 13737-90',
                material: 'АД31Т1',
                standard: 'ГОСТ 13737-90',
                unit: 'п.м.',
                weight: 0.62,
                category: 'profile'
              },
              {
                id: 'mat_al_angle_50x50',
                section: 'Стандартные профиля',
                subsection: 'Алюминиевый / Уголок',
                folderPath: ['Стандартные профиля', 'Алюминиевый', 'Уголок'],
                article: 'Уголок АД31 50х50х4',
                code: 'Уголок АД31 50х50х4',
                name: 'Уголок равнополочный 50х50х4.0 АД31Т1 ГОСТ 13737-90',
                material: 'АД31Т1',
                standard: 'ГОСТ 13737-90',
                unit: 'п.м.',
                weight: 1.04,
                category: 'profile'
              }
            ]
          },
          {
            id: 'f_al_strip',
            name: 'Полоса',
            parentId: 'f_std_aluminum',
            subfolders: [],
            items: [
              {
                id: 'mat_al_strip_40x4',
                section: 'Стандартные профиля',
                subsection: 'Алюминиевый / Полоса',
                folderPath: ['Стандартные профиля', 'Алюминиевый', 'Полоса'],
                article: 'Полоса АД31 40х4',
                code: 'Полоса АД31 40х4',
                name: 'Полоса (шина) алюминиевая 40х4.0 АД31Т1 ГОСТ 15176-89',
                material: 'АД31Т1',
                standard: 'ГОСТ 15176-89',
                unit: 'п.м.',
                weight: 0.43,
                category: 'profile'
              }
            ]
          },
          {
            id: 'f_al_rod',
            name: 'Пруток',
            parentId: 'f_std_aluminum',
            subfolders: [],
            items: [
              {
                id: 'mat_al_rod_d12',
                section: 'Стандартные профиля',
                subsection: 'Алюминиевый / Пруток',
                folderPath: ['Стандартные профиля', 'Алюминиевый', 'Пруток'],
                article: 'Пруток АД31 d12',
                code: 'Пруток АД31 d12',
                name: 'Пруток круглый d12 АД31Т1 ГОСТ 21488-97',
                material: 'АД31Т1',
                standard: 'ГОСТ 21488-97',
                unit: 'п.м.',
                weight: 0.31,
                category: 'profile'
              }
            ]
          }
        ],
        items: []
      },
      {
        id: 'f_std_steel',
        name: 'Стальные',
        parentId: 'f_std_profiles',
        subfolders: [
          {
            id: 'f_steel_sq_tube',
            name: 'Труба квадратная',
            parentId: 'f_std_steel',
            subfolders: [],
            items: [
              {
                id: 'mat_st_tube_40x40x3',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Труба квадратная',
                folderPath: ['Стандартные профиля', 'Стальные', 'Труба квадратная'],
                article: 'Труба 40х40х3',
                code: 'Труба 40х40х3',
                name: 'Труба 40х40х3 ГОСТ 8639-82 / Ст3сп',
                material: 'Ст3сп',
                standard: 'ГОСТ 8639-82',
                unit: 'п.м.',
                weight: 3.32,
                category: 'profile'
              },
              {
                id: 'mat_st_tube_50x50x4',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Труба квадратная',
                folderPath: ['Стандартные профиля', 'Стальные', 'Труба квадратная'],
                article: 'Труба 50х50х4',
                code: 'Труба 50х50х4',
                name: 'Труба 50х50х4 ГОСТ 8639-82 / 09Г2С',
                material: '09Г2С',
                standard: 'ГОСТ 8639-82',
                unit: 'п.м.',
                weight: 5.45,
                category: 'profile'
              },
              {
                id: 'mat_st_tube_60x60x4',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Труба квадратная',
                folderPath: ['Стандартные профиля', 'Стальные', 'Труба квадратная'],
                article: 'Труба 60х60х4',
                code: 'Труба 60х60х4',
                name: 'Труба 60х60х4 ГОСТ 8639-82 / 09Г2С',
                material: '09Г2С',
                standard: 'ГОСТ 8639-82',
                unit: 'п.м.',
                weight: 6.71,
                category: 'profile'
              },
              {
                id: 'mat_st_tube_80x80x5',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Труба квадратная',
                folderPath: ['Стандартные профиля', 'Стальные', 'Труба квадратная'],
                article: 'Труба 80х80х5',
                code: 'Труба 80х80х5',
                name: 'Труба 80х80х5 ГОСТ 8639-82 / 09Г2С',
                material: '09Г2С',
                standard: 'ГОСТ 8639-82',
                unit: 'п.м.',
                weight: 11.25,
                category: 'profile'
              }
            ]
          },
          {
            id: 'f_steel_rect_tube',
            name: 'Труба прямоугольная',
            parentId: 'f_std_steel',
            subfolders: [],
            items: [
              {
                id: 'mat_st_rect_60x40x3',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Труба прямоугольная',
                folderPath: ['Стандартные профиля', 'Стальные', 'Труба прямоугольная'],
                article: 'Труба 60х40х3',
                code: 'Труба 60х40х3',
                name: 'Труба 60х40х3 ГОСТ 8645-68 / Ст3сп',
                material: 'Ст3сп',
                standard: 'ГОСТ 8645-68',
                unit: 'п.м.',
                weight: 4.26,
                category: 'profile'
              },
              {
                id: 'mat_st_rect_80x40x3',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Труба прямоугольная',
                folderPath: ['Стандартные профиля', 'Стальные', 'Труба прямоугольная'],
                article: 'Труба 80х40х3',
                code: 'Труба 80х40х3',
                name: 'Труба 80х40х3 ГОСТ 8645-68 / 09Г2С',
                material: '09Г2С',
                standard: 'ГОСТ 8645-68',
                unit: 'п.м.',
                weight: 5.2,
                category: 'profile'
              },
              {
                id: 'mat_st_rect_100x50x4',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Труба прямоугольная',
                folderPath: ['Стандартные профиля', 'Стальные', 'Труба прямоугольная'],
                article: 'Труба 100х50х4',
                code: 'Труба 100х50х4',
                name: 'Труба 100х50х4 ГОСТ 8645-68 / 09Г2С',
                material: '09Г2С',
                standard: 'ГОСТ 8645-68',
                unit: 'п.м.',
                weight: 8.59,
                category: 'profile'
              }
            ]
          },
          {
            id: 'f_steel_round_tube',
            name: 'Труба круглая',
            parentId: 'f_std_steel',
            subfolders: [],
            items: [
              {
                id: 'mat_st_round_42x3',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Труба круглая',
                folderPath: ['Стандартные профиля', 'Стальные', 'Труба круглая'],
                article: 'Труба 42х3',
                code: 'Труба 42х3',
                name: 'Труба электросварная 42х3.0 ГОСТ 10704-91',
                material: 'Ст3',
                standard: 'ГОСТ 10704-91',
                unit: 'п.м.',
                weight: 2.89,
                category: 'profile'
              }
            ]
          },
          {
            id: 'f_steel_angle',
            name: 'Уголок',
            parentId: 'f_std_steel',
            subfolders: [],
            items: [
              {
                id: 'mat_st_angle_50x50x5',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Уголок',
                folderPath: ['Стандартные профиля', 'Стальные', 'Уголок'],
                article: 'Уголок 50х50х5',
                code: 'Уголок 50х50х5',
                name: 'Уголок равнополочный 50х50х5 ГОСТ 8509-93 / Ст3сп',
                material: 'Ст3сп',
                standard: 'ГОСТ 8509-93',
                unit: 'п.м.',
                weight: 3.77,
                category: 'profile'
              },
              {
                id: 'mat_st_angle_63x63x5',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Уголок',
                folderPath: ['Стандартные профиля', 'Стальные', 'Уголок'],
                article: 'Уголок 63х63х5',
                code: 'Уголок 63х63х5',
                name: 'Уголок равнополочный 63х63х5 ГОСТ 8509-93 / 09Г2С',
                material: '09Г2С',
                standard: 'ГОСТ 8509-93',
                unit: 'п.м.',
                weight: 4.81,
                category: 'profile'
              }
            ]
          },
          {
            id: 'f_steel_channel',
            name: 'Швеллер',
            parentId: 'f_std_steel',
            subfolders: [],
            items: [
              {
                id: 'mat_st_ch_10p',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Швеллер',
                folderPath: ['Стандартные профиля', 'Стальные', 'Швеллер'],
                article: 'Швеллер 10П',
                code: 'Швеллер 10П',
                name: 'Швеллер стальной горячекатаный 10П ГОСТ 8240-97',
                material: 'Ст3',
                standard: 'ГОСТ 8240-97',
                unit: 'п.м.',
                weight: 8.59,
                category: 'profile'
              }
            ]
          },
          {
            id: 'f_steel_round_bar',
            name: 'Круг',
            parentId: 'f_std_steel',
            subfolders: [],
            items: [
              {
                id: 'mat_st_round_16',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Круг',
                folderPath: ['Стандартные профиля', 'Стальные', 'Круг'],
                article: 'Круг 16',
                code: 'Круг 16',
                name: 'Круг горячекатаный d16 ГОСТ 2590-2006 / Ст3',
                material: 'Ст3',
                standard: 'ГОСТ 2590-2006',
                unit: 'п.м.',
                weight: 1.58,
                category: 'profile'
              }
            ]
          },
          { id: 'f_steel_sq_bar', name: 'Квадрат', parentId: 'f_std_steel', subfolders: [], items: [] },
          { id: 'f_steel_hex', name: 'Шестигранник', parentId: 'f_std_steel', subfolders: [], items: [] },
          { id: 'f_steel_rod', name: 'Пруток', parentId: 'f_std_steel', subfolders: [], items: [] },
          {
            id: 'f_steel_beam',
            name: 'Двутавры',
            parentId: 'f_std_steel',
            subfolders: [],
            items: [
              {
                id: 'mat_st_beam_12b1',
                section: 'Стандартные профиля',
                subsection: 'Стальные / Двутавры',
                folderPath: ['Стандартные профиля', 'Стальные', 'Двутавры'],
                article: 'Двутавр 12Б1',
                code: 'Двутавр 12Б1',
                name: 'Двутавр стальной нормальный 12Б1 СТО АСЧМ 20-93',
                material: '09Г2С',
                standard: 'СТО АСЧМ 20-93',
                unit: 'п.м.',
                weight: 10.4,
                category: 'profile'
              }
            ]
          }
        ],
        items: []
      },
      {
        id: 'f_std_pnd',
        name: 'ПНД',
        parentId: 'f_std_profiles',
        subfolders: [],
        items: [
          {
            id: 'mat_pnd_pipe_32',
            section: 'Стандартные профиля',
            subsection: 'ПНД',
            folderPath: ['Стандартные профиля', 'ПНД'],
            article: 'Труба ПНД d32',
            code: 'Труба ПНД d32',
            name: 'Труба техническая ПНД SDR17 d32',
            material: 'ПНД',
            unit: 'п.м.',
            weight: 0.22,
            category: 'profile'
          }
        ]
      },
      {
        id: 'f_std_pvc',
        name: 'ПВХ',
        parentId: 'f_std_profiles',
        subfolders: [],
        items: [
          {
            id: 'mat_pvc_plate_5',
            section: 'Стандартные профиля',
            subsection: 'ПВХ',
            folderPath: ['Стандартные профиля', 'ПВХ'],
            article: 'Пластина ПВХ 5.0',
            code: 'Пластина ПВХ 5.0',
            name: 'Пластина винипласт ПВХ 5.0мм листовой',
            material: 'Винипласт ПВХ',
            unit: 'м2',
            thickness: 5,
            weight: 7.0,
            category: 'sheet'
          }
        ]
      }
    ],
    items: []
  },
  {
    id: 'f_wood',
    name: 'Дерево',
    subfolders: [],
    items: [
      {
        id: 'mat_wood_timber_60x120',
        section: 'Дерево',
        subsection: 'Брус',
        folderPath: ['Дерево'],
        article: 'Брус 60х120',
        code: 'Брус 60х120',
        name: 'Брус клееный сосна 60х120',
        material: 'Сосна',
        unit: 'п.м.',
        weight: 3.6,
        category: 'profile'
      },
      {
        id: 'mat_plywood_12',
        section: 'Дерево',
        subsection: 'Фанера',
        folderPath: ['Дерево'],
        article: 'Фанера ФСФ 12',
        code: 'Фанера ФСФ 12',
        name: 'Фанера березовая влагостойкая ФСФ 12мм ГОСТ 3916.1-96',
        material: 'Береза ФСФ',
        standard: 'ГОСТ 3916.1-96',
        unit: 'м2',
        thickness: 12,
        weight: 8.4,
        category: 'sheet'
      }
    ]
  },
  {
    id: 'f_decor',
    name: 'Декор',
    subfolders: [],
    items: [
      {
        id: 'mat_decor_lamel',
        section: 'Декор',
        subsection: 'Ламели',
        folderPath: ['Декор'],
        article: 'Ламель ДЕК-01',
        code: 'Ламель ДЕК-01',
        name: 'Ламель солнцезащитная алюминиевая 150мм',
        material: 'АД31Т1',
        unit: 'п.м.',
        weight: 1.85,
        category: 'profile'
      },
      {
        id: 'mat_acp_4',
        section: 'Декор',
        subsection: 'Композит',
        folderPath: ['Декор'],
        article: 'АКП 4.0/0.4',
        code: 'АКП 4.0/0.4',
        name: 'Алюминиевая композитная панель (АКП) 4.0мм FR',
        material: 'АКП',
        unit: 'м2',
        thickness: 4,
        weight: 7.4,
        category: 'sheet'
      }
    ]
  }
];

