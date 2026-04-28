// sanity/schemas/studyMaterial.ts
// Smart schema — shared subjects एकै ठाउँमा, multiple streams/semesters tag गर्न मिल्छ

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'studyMaterial',
  title: 'Study Materials',
  type: 'document',
  groups: [
    { name: 'subject', title: 'Subject Info' },
    { name: 'files', title: 'Files & Links' },
    { name: 'targeting', title: 'Targeting (Sem/Stream)' },
  ],
  fields: [
    // ── Subject Info ──
    defineField({
      name: 'subjectName',
      title: 'Subject Name',
      type: 'string',
      group: 'subject',
      description: 'e.g. Engineering Mathematics I, Object Oriented Programming',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subjectCode',
      title: 'Subject Code (optional)',
      type: 'string',
      group: 'subject',
      description: 'e.g. SH 401, CT 601',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'subject',
      options: {
        list: [
          { title: 'IOE / Engineering', value: 'ioe' },
          { title: 'Loksewa', value: 'loksewa' },
          { title: 'NEB Class 11/12', value: 'neb' },
          { title: 'License Exam (NEC/NMC)', value: 'license' },
          { title: 'General / Shared', value: 'general' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'resourceType',
      title: 'Resource Type',
      type: 'string',
      group: 'subject',
      options: {
        list: [
          { title: 'Notes', value: 'notes' },
          { title: 'Question Bank / PYQ', value: 'question' },
          { title: 'Syllabus', value: 'syllabus' },
          { title: 'Reference Book', value: 'book' },
          { title: 'Video Lecture', value: 'video' },
          { title: 'Lab Manual', value: 'lab' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // ── SMART TARGETING — overlap handle गर्छ ──
    // एउटै subject multiple streams/semesters मा tag गर्न मिल्छ
    defineField({
      name: 'targets',
      title: 'Applicable To (Stream + Semester)',
      type: 'array',
      group: 'targeting',
      description: 'एउटै subject धेरै streams/semesters मा छ भने सबै थप्नुस्',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'university',
              title: 'University',
              type: 'string',
              options: {
                list: [
                  { title: 'TU (Tribhuvan)', value: 'tu' },
                  { title: 'PU (Pokhara)', value: 'pu' },
                  { title: 'Both TU & PU', value: 'both' },
                  { title: 'Not Applicable', value: 'na' },
                ],
              },
            },
            {
              name: 'stream',
              title: 'Stream / Faculty',
              type: 'string',
              options: {
                list: [
                  { title: 'Computer Engineering', value: 'computer' },
                  { title: 'Civil Engineering', value: 'civil' },
                  { title: 'Electrical Engineering', value: 'electrical' },
                  { title: 'Electronics Engineering', value: 'electronics' },
                  { title: 'Mechanical Engineering', value: 'mechanical' },
                  { title: 'Architecture', value: 'architecture' },
                  { title: 'All Engineering Streams', value: 'all' },
                  { title: 'Not Applicable', value: 'na' },
                ],
              },
            },
            {
              name: 'semester',
              title: 'Semester',
              type: 'string',
              options: {
                list: [
                  '1','2','3','4','5','6','7','8',
                  'entrance', 'all'
                ].map(s => ({ title: s === 'all' ? 'All Semesters' : s === 'entrance' ? 'Entrance' : `Semester ${s}`, value: s })),
              },
            },
          ],
          preview: {
            select: { university: 'university', stream: 'stream', semester: 'semester' },
            prepare: ({ university, stream, semester }: any) => ({
              title: `${university?.toUpperCase()} | ${stream} | Sem ${semester}`,
            }),
          },
        },
      ],
    }),

    // ── Files & Links ──
    defineField({
      name: 'materials',
      title: 'Materials (Files / Links)',
      type: 'array',
      group: 'files',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() },
            {
              name: 'pdfFile',
              title: 'PDF / Document File',
              type: 'file',
              options: { accept: '.pdf,.doc,.docx,.ppt,.pptx' },
            },
            { name: 'videoLink', title: 'YouTube / Video Link', type: 'url' },
            { name: 'externalLink', title: 'External Link (Drive/Docs)', type: 'url' },
            {
              name: 'description',
              title: 'Short Description',
              type: 'string',
            },
          ],
          preview: {
            select: { title: 'title', file: 'pdfFile', video: 'videoLink' },
            prepare: ({ title, file, video }: any) => ({
              title,
              subtitle: video ? '📹 Video' : file ? '📄 PDF' : '🔗 Link',
            }),
          },
        },
      ],
    }),

    // ── Extra Info ──
    defineField({
      name: 'description',
      title: 'Description / Notes',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'isShared',
      title: 'Shared Subject? (appears in multiple streams)',
      type: 'boolean',
      description: 'Maths, Physics जस्ता subjects जो धेरै streams मा हुन्छन्',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'subjectName',
      category: 'category',
      resourceType: 'resourceType',
      code: 'subjectCode',
    },
    prepare: ({ title, category, resourceType, code }: any) => ({
      title: `${title}${code ? ` (${code})` : ''}`,
      subtitle: `${category?.toUpperCase()} | ${resourceType}`,
    }),
  },
  orderings: [
    { title: 'Subject Name', name: 'subjectName', by: [{ field: 'subjectName', direction: 'asc' }] },
    { title: 'Category', name: 'category', by: [{ field: 'category', direction: 'asc' }] },
  ],
})