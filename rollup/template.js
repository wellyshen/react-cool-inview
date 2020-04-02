// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default ({ files }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">
      <link rel="manifest" href="assets/site.webmanifest">
      <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">
      <link rel="stylesheet" href=${files.css[0].fileName}>
      <title>React Cool Inview</title>
      <meta property="og:title" content="React Cool Inview" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://react-cool-inview.netlify.com/assets/og_image.png" />
      <meta property="og:description" content="React hook to monitor an element enters or exists the viewport (or another element)." />
      <meta property="og:url" content="https://react-cool-inview.netlify.com" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@react-cool-inview" />
      <meta name="twitter:creator" content="@wellyshen" />
    </head>
    <body>
      <div id="app"></div>
      <script type="text/javascript" src=${files.js[0].fileName}></script>
    </body>
  </html>
`;
