$httpClient.get('https://223.5.5.5/resolve?name=' + $domain + '&type=28&short=1', function(error, response, data){
  if (error) {
    $done({}); // Fallback to standard DNS query
  } else {
    $done({addresses: JSON.parse(data), ttl: 600});
  }
});
