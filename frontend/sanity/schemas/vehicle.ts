// frontend/sanity/schemas/vehicle.ts

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'vehicle',
  title: 'Vehicle Reviews (Bike/Car)',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Vehicle Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Bike', value: 'bike' },
          { title: 'Scooter', value: 'scooter' },
          { title: 'Car', value: 'car' },
          { title: 'EV', value: 'ev' },
        ],
      },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'price',
      title: 'Market Price (NPR)',
      type: 'string',
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
    }),
    defineField({
      name: 'mileage',
      title: 'Mileage / Range',
      type: 'string',
    }),
    defineField({
      name: 'engine',
      title: 'Engine / Battery Capacity',
      type: 'string',
    }),
    defineField({
      name: 'features',
      title: 'Key Features (Bullet Points)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'description',
      title: 'Detailed Review',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    // SEO Fields
    defineField({
      name: 'seoTitle',
      title: 'SEO Title (Meta Title)',
      type: 'string',
      description: 'Best 150cc Bike in Nepal | Pulsar 150 Price & Review',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
    }),
  ],
})