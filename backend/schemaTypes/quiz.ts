import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'quiz',
  title: 'Daily Quiz Question',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
    }),
    defineField({
      name: 'options',
      title: 'Options (4 items)',
      type: 'array',
      of: [{ type: 'string' }],
      validation: Rule => Rule.length(4).error('You must provide exactly 4 options'),
    }),
    defineField({
      name: 'correctOption',
      title: 'Correct Option Number (0-3)',
      type: 'number',
      description: '0 for 1st option, 1 for 2nd option...',
      validation: Rule => Rule.min(0).max(3),
    }),
    defineField({
      name: 'date',
      title: 'Quiz Date',
      type: 'date',
      options: { dateFormat: 'YYYY-MM-DD' }
    }),
  ],
})