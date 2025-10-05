import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';



const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:PREVIEW',
        'POSTMAN', // Allow Postman specifically
        'curl*', // Allow curl requests
        'Insomnia*', // Allow Insomnia API client
        'Thunder Client*' // Allow Thunder Client
      ],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: 5
    })
  ],
});


export default aj;