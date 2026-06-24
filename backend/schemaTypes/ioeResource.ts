import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'ioeResource',
  title: 'IOE/Engineering Resources',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Batch Title',
      type: 'string',
      description: 'Ex: Computer 1st Sem All Notes',
    }),
    defineField({
      name: 'university',
      title: 'University',
      type: 'string',
      options: {
        list: [
          { title: 'Tribhuvan University (TU)', value: 'tu' },
          { title: 'Pokhara University (PU)', value: 'pu' },
        ],
      },
    }),
    defineField({
      name: 'type',
      title: 'Resource Type',
      type: 'string',
      options: {
        list: [
          { title: 'Notes', value: 'notes' },
          { title: 'Syllabus', value: 'syllabus' },
          { title: 'Question Bank', value: 'question' },
        ],
      },
    }),
    // Mega List with Video
    defineField({
      name: 'subjects',
      title: 'Subjects List',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Subject',
          fields: [
            { name: 'subjectName', type: 'string', title: 'Subject Name' },
            {
              name: 'targets',
              title: 'Applicable For',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'faculty',
                      title: 'Faculty',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Computer', value: 'computer' },
                          { title: 'Civil', value: 'civil' },
                          { title: 'Electronics', value: 'electronics' },
                          { title: 'Electrical', value: 'electrical' },
                          { title: 'Architecture', value: 'architecture' },
                        ]
                      }
                    },
                    {
                      name: 'semester',
                      title: 'Semester',
                      type: 'string',
                      options: { list: ['1', '2', '3', '4', '5', '6', '7', '8'] }
                    }
                  ],
                }
              ]
            },
            {
              name: 'materials',
              title: 'Files / Links / Videos',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'title', type: 'string', title: 'Title (e.g. Chapter 1)' },
                    { name: 'file', type: 'file', title: 'Upload PDF' },
                    { name: 'externalLink', type: 'url', title: 'Drive/Web Link' },
                    { name: 'videoLink', type: 'url', title: 'YouTube Link' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }),
  ],
})