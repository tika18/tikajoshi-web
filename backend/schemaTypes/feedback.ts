import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'feedback',
  title: 'User Feedback',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'User Name', type: 'string' }),
    defineField({ name: 'message', title: 'Message/Suggestion', type: 'text' }),
    defineField({ name: 'rating', title: 'Rating (1-5)', type: 'number' }),
  ],
})