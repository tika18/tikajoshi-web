// backend/schemaTypes/studyMaterial.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'studyMaterial',
  title: 'Study Material (PDF)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Loksewa', value: 'loksewa' },
          { title: 'Korean (EPS)', value: 'korean' },
          { title: 'Class 12', value: 'class12' },
          { title: 'Others', value: 'others' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
    }),
    defineField({
      name: 'file',
      title: 'Upload PDF',
      type: 'file',
      options: {
        accept: '.pdf',
      },
    }),
  ],
})