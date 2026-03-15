import http from 'http';

http.get('http://localhost:3000/', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  res.resume();
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
});
