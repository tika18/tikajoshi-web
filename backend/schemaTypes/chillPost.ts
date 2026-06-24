import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'chillPost',
  title: 'Chill Zone Posts',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Caption / Title', type: 'string' }),
    defineField({ name: 'author', title: 'Uploaded By', type: 'string' }),
    defineField({ name: 'isGuest', title: 'Is Guest User?', type: 'boolean', initialValue: false }),
    defineField({ name: 'category', title: 'Tag', type: 'string', options: { list: ['Ride 🏍️', 'Travel 🏔️', 'Food 🍜', 'Tech 💻', 'Meme 😂'] } }),
    // Multiple Images Support
    defineField({
      name: 'images',
      title: 'Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({ name: 'publishedAt', title: 'Date', type: 'datetime' }),
  ],
})