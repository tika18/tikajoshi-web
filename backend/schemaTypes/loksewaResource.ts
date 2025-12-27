import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'loksewaResource',
  title: 'Loksewa Materials',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Ex: Kharidar GK Set 1',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Kharidar', value: 'kharidar' },
          { title: 'Nayab Subba', value: 'nasu' },
          { title: 'Section Officer', value: 'officer' },
          { title: 'Banking (NRB/RBB)', value: 'banking' },
          { title: 'Security (Police/Army)', value: 'security' },
        ],
      },
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Syllabus', value: 'syllabus' },
          { title: 'Notes (PDF)', value: 'notes' },
          { title: 'Old Questions', value: 'questions' },
        ],
      },
    }),
    defineField({
      name: 'file',
      title: 'Upload File',
      type: 'file',
      options: { accept: '.pdf' },
    }),
  ],
})