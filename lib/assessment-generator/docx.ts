import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import type {
  AssessmentDocument,
  AssessmentTask,
} from "@/lib/assessment-generator/types";

const borders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "B7C0CF" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "B7C0CF" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "B7C0CF" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "B7C0CF" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "B7C0CF" },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "B7C0CF" },
};

function text(value: string, bold = false) {
  return new Paragraph({
    children: [
      new TextRun({
        text: value,
        bold,
        size: 22,
        font: "Arial",
      }),
    ],
    spacing: {
      after: 80,
    },
  });
}

function heading(value: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text: value,
        bold: true,
        size: 26,
        font: "Arial",
      }),
    ],
    spacing: {
      before: 160,
      after: 100,
    },
  });
}

function bullet(value: string) {
  return new Paragraph({
    bullet: {
      level: 0,
    },
    children: [
      new TextRun({
        text: value,
        size: 22,
        font: "Arial",
      }),
    ],
    spacing: {
      after: 40,
    },
  });
}

function cell(value: string, bold = false) {
  return new TableCell({
    borders,
    children: [text(value, bold)],
  });
}

function taskParagraphs(task: AssessmentTask) {
  return [
    heading(`${task.number}. ${task.title} (${task.points} балл)`),
    text(task.prompt),
    text("Жауап: __________________________________________________________"),
    text(""),
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [
            cell("Дескриптор", true),
            cell("Балл", true),
          ],
        }),
        ...task.descriptors.map(
          (descriptor) =>
            new TableRow({
              children: [
                cell(descriptor.text),
                cell(String(descriptor.points)),
              ],
            })
        ),
      ],
    }),
  ];
}

export async function createAssessmentDocx(document: AssessmentDocument) {
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: document.title,
          bold: true,
          size: 30,
          font: "Arial",
        }),
      ],
      spacing: {
        after: 200,
      },
    }),

    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [cell("Құжат түрі", true), cell(document.type.toUpperCase())],
        }),
        new TableRow({
          children: [cell("Сынып", true), cell(String(document.grade))],
        }),
        new TableRow({
          children: [cell("Тоқсан", true), cell(document.term)],
        }),
        new TableRow({
          children: [cell("Бөлім", true), cell(document.section)],
        }),
        new TableRow({
          children: [
            cell("Орындау уақыты", true),
            cell(`${document.durationMinutes} минут`),
          ],
        }),
        new TableRow({
          children: [
            cell("Жалпы балл", true),
            cell(String(document.totalPoints)),
          ],
        }),
      ],
    }),

    heading("Оқу мақсаттары"),
    ...document.learningObjectives.map(bullet),

    heading("Бағалау критерийлері"),
    ...document.assessmentCriteria.map(bullet),

    heading("Ойлау дағдыларының деңгейлері"),
    ...document.thinkingSkills.map(bullet),

    heading("Нұсқаулық"),
    ...document.instructions.map(bullet),
  ];

  if (document.type === "tjb" && document.specification.length > 0) {
    children.push(
      heading("ТЖБ спецификациясы"),
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              cell("Бөлім", true),
              cell("Оқу мақсаттары", true),
              cell("Ойлау дағдылары", true),
              cell("Тапсырмалар", true),
              cell("Түрі", true),
              cell("Уақыт", true),
              cell("Балл", true),
            ],
          }),
          ...document.specification.map(
            (row) =>
              new TableRow({
                children: [
                  cell(row.section),
                  cell(row.learningObjectives),
                  cell(row.thinkingSkills),
                  cell(`${row.taskNumbers} (${row.taskCount})`),
                  cell(row.taskTypes),
                  cell(`${row.durationMinutes} мин`),
                  cell(String(row.points)),
                ],
              })
          ),
        ],
      })
    );
  }

  children.push(
    heading("Тапсырмалар"),
    ...document.tasks.flatMap(taskParagraphs),

    heading(`Жалпы балл: ${document.totalPoints}`),

    heading("Жауаптар және балл қою кестесі"),
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [
            cell("№", true),
            cell("Жауап", true),
            cell("Балл", true),
            cell("Қосымша ақпарат", true),
          ],
        }),
        ...document.answerKey.map(
          (row) =>
            new TableRow({
              children: [
                cell(row.taskNumber),
                cell(row.answer),
                cell(String(row.points)),
                cell(row.notes),
              ],
            })
        ),
      ],
    }),

    heading("Ата-аналарға ақпарат ұсынуға арналған рубрика"),
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [
            cell("Бағалау критерийі", true),
            cell("Төмен деңгей", true),
            cell("Орташа деңгей", true),
            cell("Жоғары деңгей", true),
          ],
        }),
        ...document.rubric.map(
          (row) =>
            new TableRow({
              children: [
                cell(row.criterion),
                cell(row.low),
                cell(row.medium),
                cell(row.high),
              ],
            })
        ),
      ],
    })
  );

  const file = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(file);
}
