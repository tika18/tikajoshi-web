// backend/schemaTypes/market.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'market',
  title: 'Daily Market Rate',
  type: 'document',
  fields: [
    defineField({ name: 'date', title: 'Date (YYYY-MM-DD)', type: 'date' }),
    defineField({ name: 'gold', title: 'Gold Price (per tola)', type: 'string' }),
    defineField({ name: 'silver', title: 'Silver Price (per tola)', type: 'string' }),
    defineField({ name: 'dollar', title: 'US Dollar (Buy Rate)', type: 'string' }),
  ],
})